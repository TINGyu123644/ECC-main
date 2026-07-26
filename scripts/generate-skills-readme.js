#!/usr/bin/env node
/**
 * Regenerate skills/README.md from manifest install-modules.json.
 *
 * Run this after adding a new skill (or modifying any module's paths):
 *   node scripts/generate-skills-readme.js
 *
 * Output: skills/README.md (overwritten)
 *
 * Usage:
 *   node scripts/generate-skills-readme.js
 *   # 自动用 baseline 对比，无需任何参数
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const MANIFEST = path.join(REPO, 'manifests', 'install-modules.json');
const SKILLS_DIR = path.join(REPO, 'skills');
const OUTPUT = path.join(SKILLS_DIR, 'SKILLS.md');
const BASELINE = path.join(REPO, 'ECC_BASELINE.json');

const NOW = new Date().toISOString().slice(0, 10);

// 用 ECC_BASELINE.json 对比：当前 manifest 减去 baseline = 用户新加。
// 不存任何 state 文件（git pull 天然跨设备同步）。
function loadBaselineSkills() {
  try {
    if (!fs.existsSync(BASELINE)) return new Set();
    const b = JSON.parse(fs.readFileSync(BASELINE, 'utf-8'));
    return new Set((b.skills || []).filter(s => !s.startsWith('_')));
  } catch (e) { return new Set(); }
}

// --- 新加检测（无 state，实时算） ---
// 直接读 baseline 对比当前 manifest：差集 = 用户新加。
// 不存任何 state 文件 —— git pull 天然跨设备同步。
function computeNewSkills() {
  const baseline = loadBaselineSkills();
  if (baseline.size === 0) return []; // 无 baseline 时不标（避免全量标记 bug）
  const newSkills = [];
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf-8'));
    manifest.modules.filter(m => m.kind === 'skills').forEach(mod => {
      mod.paths.forEach(p => {
        const name = p.replace(/^skills\//, '');
        if (!baseline.has(name)) newSkills.push(name);
      });
    });
  } catch (e) { /* ignore */ }
  return newSkills;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function skillExists(name) {
  return fs.existsSync(path.join(SKILLS_DIR, name, 'SKILL.md'));
}

// 优先从 skills/zh-labels.json 读中文标签；fallback 到 SKILL.md 自动提取
function readSkillLabel(name) {
  // 1) 优先：维护式映射表
  try {
    const mapPath = path.join(SKILLS_DIR, 'zh-labels.json');
    if (fs.existsSync(mapPath)) {
      const map = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
      if (map[name]) return map[name];
    }
  } catch (e) { /* ignore */ }
  // 2) fallback：从 SKILL.md frontmatter / H1 提取
  try {
    const content = fs.readFileSync(path.join(SKILLS_DIR, name, 'SKILL.md'), 'utf-8');
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    let desc = '';
    if (fm) {
      const m = fm[1].match(/description:\s*(.+)/);
      if (m) desc = m[1].trim();
    }
    const h1 = content.match(/^#\s+(.+)$/m);
    const h1Text = h1 ? h1[1].trim() : '';
    const extractZh = (s) => {
      const m = s.match(/[一-鿿][一-鿿\s，。、：；！？《》（）—\-+]{0,40}/);
      return m ? m[0].trim().replace(/\s+/g, ' ') : '';
    };
    const zhFromH1 = extractZh(h1Text);
    const zhFromDesc = extractZh(desc);
    return zhFromH1 || zhFromDesc || '';
  } catch (e) {
    return '';
  }
}

// 从 SKILL.md 提取中文标签：保留 fallback 逻辑
// （zh-labels.json 优先版本在文件上方已定义）

const themes = {
  'framework-language': '编程语言规范',
  'database': '数据库',
  'workflow-quality': '工作流质量',
  'optimization-workflows': '性能优化',
  'security': '安全 / 合规',
  'research-apis': '科研 / 检索 API',
  'business-content': '业务 / 办公 / 金融',
  'operator-workflows': '运维工作流',
  'prediction-market-skills': '预测市场',
  'social-distribution': '社交分发',
  'media-generation': '媒体生成',
  'swift-apple': 'Apple 生态',
  'agentic-patterns': 'Agent 模式 / 编排',
  'devops-infra': 'DevOps / 网络 / K8s',
  'machine-learning': 'ML 工程',
  'supply-chain-domain': '供应链',
  'document-processing': '文档处理',
};

function main() {
  if (!fs.existsSync(MANIFEST)) {
    console.error('FATAL: manifest not found:', MANIFEST);
    process.exit(1);
  }
  const manifest = readJson(MANIFEST);
  const skillMods = manifest.modules.filter(m => m.kind === 'skills');
  const totalSkills = skillMods.reduce((s, m) => s + m.paths.length, 0);

  const newSkillNames = computeNewSkills(); // 实时算：manifest - baseline
  const recentMap = {}; // {name: NOW} 用于渲染（不存盘）
  newSkillNames.forEach(n => { recentMap[n] = NOW; });
  const recentNames = newSkillNames;

  const out = [];
  out.push('# ECC Skills Index');
  out.push('');
  out.push(`> 自动生成 · 最近更新：${NOW}`);
  out.push(`> 数据源：\`manifests/install-modules.json\` · 共 ${totalSkills} 个 skill / ${skillMods.length} 个模块`);
  out.push('');
  // 🆕 顶部摘要：本次新增（数字自动算，类别自动分类）
  const newCount = recentNames.length;
  if (newCount > 0) {
    out.push('## 🆕 本次新增摘要');
    out.push('');
    out.push(`**${newCount} 个 skill 是新加的**（不在 \`ECC_BASELINE.json\` 里）：`);
    out.push('');
    out.push('| 资源名 | 所属模块 |');
    out.push('|---|---|');
    recentNames.slice().sort().forEach(name => {
      let modId = '';
      for (const mod of skillMods) {
        if (mod.paths.includes(`skills/${name}`)) { modId = mod.id; break; }
      }
      out.push(`| \`${name}\` | \`${modId}\` |`);
    });
    out.push('');
    out.push(`**总览**：${totalSkills} 个 skill / ${skillMods.length} 个模块 / **${newCount} 个新加**`);
    out.push('');
  } else {
    out.push(`**总览**：${totalSkills} 个 skill / ${skillMods.length} 个模块 / 0 个新加`);
    out.push('');
  }
  out.push('## 使用说明');
  out.push('');
  out.push('1. 在 `skills/<name>/` 下新建 SKILL.md');
  out.push('2. 在 `manifests/install-modules.json` 对应模块的 `paths` 数组加 `"skills/<name>"`');
  out.push('3. 跑 `node scripts/generate-skills-readme.js` 重新生成本索引');
  out.push('4. 跑 CI: `node scripts/ci/validate-skills.js && node scripts/ci/validate-install-manifests.js`');
  out.push('5. cp 到本机：`cp -r skills/<name>/ ~/.claude/custom-rules/skills/<name>/`');
  out.push('');

  out.push('## 模块清单');
  out.push('');
  out.push('| # | 模块 | skill 数 | 主题 |');
  out.push('|---|------|---------|------|');
  skillMods.forEach((mod, i) => {
    out.push(`| ${i + 1} | \`${mod.id}\` | ${mod.paths.length} | ${themes[mod.id] || '—'} |`);
  });
  out.push('');
  out.push(`**合计**：${totalSkills} 个 skill / ${skillMods.length} 个模块`);
  out.push('');

  out.push('---');
  out.push('');
  out.push('## 详细列表（按模块）');
  out.push('');
  skillMods.forEach(mod => {
    out.push(`### ${mod.id}（${mod.paths.length} 个）`);
    out.push('');
    mod.paths.forEach(p => {
      const name = p.replace(/^skills\//, '');
      const ok = skillExists(name);
      const recent = recentNames.includes(name) ? ' 🟢 **新加**' : '';
      const zh = ok ? readSkillLabel(name) : '';
      const label = zh ? `${name} — ${zh}` : name;
      out.push(`- ${label}${ok ? ' ✅' : ' ❌ (missing SKILL.md)'}${recent}`);
    });
    out.push('');
  });

  if (recentNames.length > 0) {
    out.push('---');
    out.push('');
    out.push('## 🆕 新增清单（最近添加）');
    out.push('');
    out.push('最近一次或近期新增的 skill 在主列表中以 🟢 **新加** 标注，并集中列在此处方便快速回顾。');
    out.push('');
    out.push('| 资源名 | 所属模块 | 触发词（来自 description） | 加入日期 |');
    out.push('|---|---|---|---|');
    recentNames.slice().sort().forEach(name => {
      const addedDate = recentMap[name] || NOW;
      // 找归属模块
      let modId = '';
      let modTheme = '';
      for (const mod of skillMods) {
        if (mod.paths.includes(`skills/${name}`)) {
          modId = mod.id;
          modTheme = themes[mod.id] || '';
          break;
        }
      }
      // 抓 description 作为触发词
      let triggers = '';
      try {
        const content = fs.readFileSync(path.join(SKILLS_DIR, name, 'SKILL.md'), 'utf-8');
        const fm = content.match(/^---\n([\s\S]*?)\n---/);
        if (fm) {
          const m = fm[1].match(/description:\s*(.+)/);
          if (m) {
            const desc = m[1].trim();
            // 抓 "触发词：xxx" 那一段
            const tm = desc.match(/触发词[：:]\s*([^。]+)/);
            triggers = tm ? tm[1].trim().slice(0, 80) : desc.slice(0, 60);
          }
        }
      } catch (e) { /* ignore */ }
      out.push(`| \`${name}\` | \`${modId}\`${modTheme ? `（${modTheme}）` : ''} | ${triggers} | ${addedDate} |`);
    });
    out.push('');
    out.push('> 💡 提示：新增 skill = 当前 manifest 里**不在 `ECC_BASELINE.json`** 的。git pull 自动同步，无 state 文件，跨设备一致。');
    out.push('');
  }

  fs.writeFileSync(OUTPUT, out.join('\n'));
  console.log(`OK: ${OUTPUT}`);
  console.log(`    ${totalSkills} skills across ${skillMods.length} modules`);
  if (recentNames.length > 0) console.log(`    🟢 ${recentNames.length} 个新加 skill（manifest - baseline 实时算，无需 state 文件）`);
}

main();