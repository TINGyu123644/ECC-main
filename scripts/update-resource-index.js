#!/usr/bin/env node
/**
 * 一键脚本：跑 baseline 对比生成 SKILLS.md + AGENTS.md → 同步到本机 Claude Code 目录。
 *
 * 设计理念：
 *   - 不存任何 state 文件
 *   - "新加" = 当前 manifest 里不在 ECC_BASELINE.json 的项
 *   - 跨设备靠 git pull 同步 manifest + baseline
 *   - 同步目标可通过 ECC_SYNC_DIR env / ecc.config.json 配置
 *
 * 优先级（从高到低）：
 *   1. ECC_SYNC_DIR 环境变量
 *   2. ecc.config.json 的 syncDir 字段
 *   3. 自动探测：plugins > custom-rules > config/claude
 *
 * 用法（在仓库根目录跑）：
 *   node scripts/update-resource-index.js
 *   ECC_SYNC_DIR=~/.claude/custom-rules node scripts/update-resource-index.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');

function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { cwd: REPO, encoding: 'utf-8', ...opts });
  } catch (e) {
    return (e.stdout || '') + (e.stderr || '');
  }
}

// 解析同步目标路径
function resolveSyncDir() {
  // 1. 环境变量优先
  if (process.env.ECC_SYNC_DIR) {
    return { path: process.env.ECC_SYNC_DIR, source: 'env:ECC_SYNC_DIR' };
  }

  // 2. 项目根目录的 ecc.config.json
  const cfgPath = path.join(REPO, 'ecc.config.json');
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (cfg.syncDir) {
        return { path: cfg.syncDir, source: 'ecc.config.json' };
      }
    } catch (e) {
      console.error('  [!] ecc.config.json 解析失败:', e.message);
    }
  }

  // 3. 自动探测（plugins > custom-rules > config/claude）
  const home = process.env.HOME || process.env.USERPROFILE;
  const candidates = [
    path.join(home, '.claude', 'plugins'),
    path.join(home, '.claude', 'custom-rules'),
    path.join(home, '.config', 'claude', 'custom-rules'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return { path: dir, source: 'auto-detected' };
    }
  }

  // 4. 全部不存在 → 用默认
  return { path: path.join(home, '.claude', 'custom-rules'), source: 'default' };
}

// 展开 ~ / $HOME / %USERPROFILE% 等
function expandPath(p) {
  if (p.startsWith('~/')) {
    return path.join(process.env.HOME || process.env.USERPROFILE, p.slice(2));
  }
  if (p.startsWith('$HOME/')) {
    return path.join(process.env.HOME || process.env.USERPROFILE, p.slice(6));
  }
  if (process.platform === 'win32' && p.startsWith('%USERPROFILE%\\')) {
    return path.join(process.env.USERPROFILE, p.slice(15));
  }
  return p;
}

function main() {
  const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

  console.log(`\n=== [${stamp}] ECC 资源索引更新 ===\n`);

  // 解析同步目标
  const target = resolveSyncDir();
  const expandedPath = expandPath(target.path);
  console.log(`同步目标: ${expandedPath}`);
  console.log(`  来源: ${target.source}\n`);

  // 1. 跑 SKILLS 生成器
  console.log('[1/3] 跑 SKILLS 生成器 ...');
  const sOut = run('node scripts/generate-skills-readme.js', { stdio: 'pipe' });
  console.log(sOut.trim().split('\n').slice(-2).join(' | '));

  // 2. 跑 AGENTS 生成器
  console.log('\n[2/3] 跑 AGENTS 生成器 ...');
  const aOut = run('node scripts/generate-agents-readme.js', { stdio: 'pipe' });
  console.log(aOut.trim().split('\n').slice(-2).join(' | '));

  // 3. 同步到本机
  console.log('\n[3/3] 同步到 ' + expandedPath + ' ...');
  const targets = [
    { src: 'skills/SKILLS.md', dst: path.join(expandedPath, 'skills', 'SKILLS.md') },
    { src: 'agents/AGENTS.md', dst: path.join(expandedPath, 'agents', 'AGENTS.md') },
    { src: 'skills/ppt-generator/SKILL.md', dst: path.join(expandedPath, 'skills', 'ppt-generator', 'SKILL.md') },
    { src: 'skills/ppt-generator/references/color-schemes.md', dst: path.join(expandedPath, 'skills', 'ppt-generator', 'references', 'color-schemes.md') },
    { src: 'skills/ppt-generator/references/styles.md', dst: path.join(expandedPath, 'skills', 'ppt-generator', 'references', 'styles.md') },
    { src: 'skills/macro-monitor/SKILL.md', dst: path.join(expandedPath, 'skills', 'macro-monitor', 'SKILL.md') },
    { src: 'skills/self-improvement/SKILL.md', dst: path.join(expandedPath, 'skills', 'self-improvement', 'SKILL.md') },
    { src: 'agents/stock-analyst.md', dst: path.join(expandedPath, 'agents', 'stock-analyst.md') },
    { src: 'agents/self-improver.md', dst: path.join(expandedPath, 'agents', 'self-improver.md') },
  ];
  targets.forEach(t => {
    const srcAbs = path.join(REPO, t.src);
    const dstAbs = t.dst;
    if (!fs.existsSync(srcAbs)) return;
    fs.mkdirSync(path.dirname(dstAbs), { recursive: true });
    fs.copyFileSync(srcAbs, dstAbs);
    console.log('  同步:', t.src, '→', dstAbs);
  });

  console.log('\n=== 完成 ===\n');
  console.log(`目标目录: ${expandedPath}\n`);
}

main();