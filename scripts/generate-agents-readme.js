#!/usr/bin/env node
/**
 * Regenerate agents/README.md from agents/ directory.
 *
 * Run after adding a new agent:
 *   node scripts/generate-agents-readme.js
 *
 * - Reads each agents/<name>.md
 * - Groups by category (heuristic from name keyword)
 * - Honors agents/zh-labels.json for Chinese labels
 *
 * Usage:
 *   node scripts/generate-agents-readme.js
 *   # 自动用 baseline 对比，无需任何参数
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const AGENTS_DIR = path.join(REPO, 'agents');
const OUTPUT = path.join(AGENTS_DIR, 'AGENTS.md');
const LABELS_MAP = path.join(AGENTS_DIR, 'zh-labels.json');
const BASELINE = path.join(REPO, 'ECC_BASELINE.json');

const NOW = new Date().toISOString().slice(0, 10);
const { execSync } = require('child_process');

// 用 ECC_BASELINE.json 对比当前 manifest/skill-mappings.json：
//   - 不在 baseline 的 → 用户新加
//   - 在 baseline 的 → 原 ECC，不标
function loadBaselineAgents() {
  try {
    if (!fs.existsSync(BASELINE)) return new Set();
    const b = JSON.parse(fs.readFileSync(BASELINE, 'utf-8'));
    return new Set((b.agents || []).filter(s => !s.startsWith('_')));
  } catch (e) { return new Set(); }
}
function loadBaselineBindings() {
  try {
    if (!fs.existsSync(BASELINE)) return {};
    const b = JSON.parse(fs.readFileSync(BASELINE, 'utf-8'));
    return (b.bindings && typeof b.bindings === 'object') ? b.bindings : {};
  } catch (e) { return {}; }
}

// --- 新加检测（无 state，实时算） ---
function computeNewAgents() {
  const baseline = loadBaselineAgents();
  if (baseline.size === 0) return [];
  const newAgents = [];
  if (!fs.existsSync(AGENTS_DIR)) return [];
  const allAgentFiles = fs.readdirSync(AGENTS_DIR)
    .filter(f => f.endsWith('.md') && !['README.md', 'AGENTS.md'].includes(f));
  allAgentFiles.forEach(f => {
    const name = f.replace(/\.md$/, '');
    if (!baseline.has(name)) newAgents.push(name);
  });
  return newAgents;
}

function computeNewBindings() {
  // 返回 {agentName: {skillName: NOW}} —— 当前 mapping 不在 baseline 的 binding
  const baselineBindings = loadBaselineBindings();
  const newBindings = {};
  const mapFile = path.join(AGENTS_DIR, 'skill-mappings.json');
  if (!fs.existsSync(mapFile)) return {};
  try {
    const curMap = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
    Object.keys(curMap).forEach(agentName => {
      if (agentName.startsWith('_')) return;
      const baseSkills = new Set(baselineBindings[agentName] || []);
      const curSkills = curMap[agentName] || [];
      curSkills.forEach(skillName => {
        if (!baseSkills.has(skillName)) {
          if (!newBindings[agentName]) newBindings[agentName] = {};
          newBindings[agentName][skillName] = NOW;
        }
      });
    });
  } catch (e) { /* ignore */ }
  return newBindings;
}

function readAgentDescription(name) {
  try {
    const content = fs.readFileSync(path.join(AGENTS_DIR, name + '.md'), 'utf-8');
    const fm = content.match(/^---\n([\s\S]*?)\n---/);
    if (!fm) return { desc: '', model: '' };
    const descMatch = fm[1].match(/description:\s*(.+)/);
    const modelMatch = fm[1].match(/model:\s*(.+)/);
    return {
      desc: descMatch ? descMatch[1].trim() : '',
      model: modelMatch ? modelMatch[1].trim() : ''
    };
  } catch (e) {
    return { desc: '', model: '' };
  }
}

function readAgentLabel(name) {
  try {
    if (fs.existsSync(LABELS_MAP)) {
      const map = JSON.parse(fs.readFileSync(LABELS_MAP, 'utf-8'));
      if (map[name]) return map[name];
    }
  } catch (e) { /* ignore */ }
  try {
    const content = fs.readFileSync(path.join(AGENTS_DIR, name + '.md'), 'utf-8');
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
    return extractZh(h1Text) || extractZh(desc) || '';
  } catch (e) {
    return '';
  }
}

function findRelatedSkills(agentName) {
  // 1) 优先读 agents/skill-mappings.json 手动维护
  try {
    const mapPath = path.join(AGENTS_DIR, 'skill-mappings.json');
    if (fs.existsSync(mapPath)) {
      const map = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
      if (map[agentName]) return map[agentName];
    }
  } catch (e) { /* ignore */ }

  // 2) fallback：扫 agent .md 内容，匹配 skill 目录名
  try {
    const content = fs.readFileSync(path.join(AGENTS_DIR, agentName + '.md'), 'utf-8');
    const skillNames = fs.existsSync(path.join(REPO, 'skills'))
      ? fs.readdirSync(path.join(REPO, 'skills')).filter(n => !n.startsWith('zh-') && !n.endsWith('.md'))
      : [];
    const found = new Set();
    skillNames.forEach(sn => {
      // 匹配：反引号包围、或裸 skill 名（避免误匹配，过滤短名）
      if (sn.length < 3) return;
      const re = new RegExp('`' + sn + '`|skills/' + sn + '\\b', 'g');
      if (re.test(content)) found.add(sn);
    });
    return Array.from(found);
  } catch (e) {
    return [];
  }
}

function categorizeByDescription(desc) {
  if (!desc) return null;
  const d = desc.toLowerCase();
  // 关键词 → 现有类别。每个 regex 必须把 alternatives 包在 () 里
  // 让 \b 正确作用于所有备选项（避免 "spec" 误匹配 "specialised" 这类 false positive）
  const rules = [
    [/\b(review|audit|critique)\b/, 'review'],
    [/\b(security|threat|vulnerab|exploit|hardening|attack|malware)\b/, 'security'],
    [/\b(test|tdd|verify|validate)\b/, 'test'],
    [/\b(plan|architect|structure)\b/, 'plan'],
    [/\b(refactor|simplif|harden)\b/, 'refactor'],
    [/\b(build|compile|resolve)\b/, 'build-fix'],
    [/\b(document|readme|comment)\b/, 'docs'],
    [/\b(monitor|observ|track|metric)\b/, 'monitor'],
    [/\b(network|connect|route|tcp|dns)\b/, 'network'],
    // data 类用精确短语（避免 "extract learnings" 误触发）
    [/(data\s+(extract|scrap|fetch|parse|pipeline|warehouse|lake|mining)|etl|sql|database)\b/, 'data'],
    [/\b(marketing|seo|content|campaign)\b/, 'marketing'],
    [/\b(stock|trading|finance|analyst)\b/, 'domain-analyst'],
    [/\b(opensource|fork|sanitiz)\b/, 'opensource'],
    [/\b(health|medical|clinical|phi)\b/, 'healthcare'],
    [/\b(loop|harness|continuous)\b/, 'loop'],
    [/\b(gan|adversarial)\b/, 'gan'],
    // meta 类：反思、知识管理、学习、模式识别
    [/\b(meta|retrospect|insights?|learnings?|knowledge|memory|pattern)\b/, 'meta'],
  ];
  for (const [re, cat] of rules) {
    if (re.test(d)) return cat;
  }
  return null;
}

function categorize(name) {
  if (name.includes('reviewer') || name === 'security-reviewer' || name === 'silent-failure-hunter') return 'review';
  if (name.includes('build-resolver') || name === 'harmonyos-app-resolver') return 'build-fix';
  if (name.includes('architect') || name === 'planner' || name === 'homelab-architect') return 'plan';
  if (name.includes('test') || name === 'tdd-guide' || name === 'e2e-runner' || name === 'pr-test-analyzer' || name === 'agent-evaluator') return 'test';
  if (name === 'code-simplifier' || name === 'refactor-cleaner' || name === 'comment-analyzer' || name === 'code-explorer') return 'refactor';
  if (name === 'spec-miner' || name === 'type-design-analyzer') return 'design';
  if (name.startsWith('gan-')) return 'gan';
  if (name.startsWith('opensource-')) return 'opensource';
  if (name === 'marketing-agent' || name === 'seo-specialist') return 'marketing';
  if (name === 'doc-updater' || name === 'docs-lookup') return 'docs';
  if (name.startsWith('loop-') || name === 'harness-optimizer' || name === 'loop-operator') return 'loop';
  if (name.includes('network')) return 'network';
  if (name === 'stock-analyst' || name === 'mle-reviewer') return 'domain-analyst';
  if (name === 'self-improver' || name === 'chief-of-staff' || name === 'conversation-analyzer') return 'meta';

  // 第 2 层：description 关键词匹配 → 复用已有大类
  //   比如 data-scraper-agent 名字没匹配，但 description 含 "scrape" → 归入 data 类
  const descObj = readAgentDescription(name);
  const byDesc = categorizeByDescription(descObj.desc);
  if (byDesc) return byDesc;

  // 第 3 层：没命中 → 从 agent 名自动派生类别（去角色后缀）
  //    永远不返回 'other'
  const roleSuffixes = [
    '-improver', '-reviewer', '-analyzer', '-resolver',
    '-evaluator', '-designer', '-generator', '-auditor',
    '-tester', '-monitor', '-builder', '-planner',
    '-er', '-or',
  ];
  for (const suf of roleSuffixes) {
    if (name.endsWith(suf)) return name.slice(0, -suf.length);
  }
  return name; // agent 名本身就是类别
}

const CATEGORIES = {
  'review': '代码评审',
  'build-fix': '构建修复',
  'plan': '规划架构',
  'test': '测试与评估',
  'refactor': '重构',
  'gan': 'GAN 评估',
  'opensource': '开源工具',
  'loop': '循环与 Harness',
  'network': '网络诊断',
  'marketing': '营销与 SEO',
  'docs': '文档与查询',
  'meta': '反思与知识管理',
  'domain-analyst': '领域分析',
  'design': '类型设计',
};

function main() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error('FATAL: agents/ not found');
    process.exit(1);
  }
  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'AGENTS.md' && f !== 'zh-labels.json' && f !== 'skill-mappings.json');
  const agentNames = files.map(f => f.replace(/\.md$/, ''));

  const recentAgents = {}; // {agentName: NOW} 仅用于渲染，不存盘
  computeNewAgents().forEach(n => { recentAgents[n] = NOW; });
  const recentBindings = computeNewBindings(); // {agentName: {skillName: NOW}}
  const recentAgentNames = Object.keys(recentAgents);
  const recentBindingAgents = Object.keys(recentBindings);

  const byCat = {};
  agentNames.forEach(n => {
    const cat = categorize(n);
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(n);
  });

  const out = [];
  out.push('# ECC Agents Index');
  out.push('');
  out.push(`> 自动生成 · 最近更新：${NOW}`);
  out.push(`> 数据源：\`agents/\` · 共 ${agentNames.length} 个 agent / ${Object.keys(byCat).length} 个类别`);
  out.push('');
  // 🆕 顶部摘要：本次新增（数字自动算，类别自动分类）
  const newAgentCount = recentAgentNames.length;
  const newBindingCount = recentBindingAgents.reduce((s, a) => s + Object.keys(recentBindings[a] || {}).length, 0);
  if (newAgentCount > 0 || newBindingCount > 0) {
    out.push('## 🆕 本次新增摘要');
    out.push('');
    if (newAgentCount > 0) {
      out.push(`**${newAgentCount} 个 agent 是新加的**（不在 \`ECC_BASELINE.json\` 里）：`);
      out.push('');
      out.push('| 资源名 | 类别 |');
      out.push('|---|---|');
      recentAgentNames.slice().sort().forEach(name => {
        const cat = categorize(name);
        out.push(`| \`${name}\` | ${cat}（${CATEGORIES[cat] || '—'}）|`);
      });
      out.push('');
    }
    if (newBindingCount > 0) {
      out.push(`**${newBindingCount} 个 binding 是新加的**：`);
      out.push('');
      out.push('| Agent | 绑定的 skill |');
      out.push('|---|---|');
      recentBindingAgents.slice().sort().forEach(agentName => {
        const skills = Object.keys(recentBindings[agentName] || {});
        skills.slice().sort().forEach(skillName => {
          out.push(`| \`${agentName}\` | \`${skillName}\` |`);
        });
      });
      out.push('');
    }
    out.push(`**总览**：${agentNames.length} 个 agent / ${Object.keys(byCat).length} 个类别 / **${newAgentCount} 个新 agent + ${newBindingCount} 个新 binding**`);
    out.push('');
  } else {
    out.push(`**总览**：${agentNames.length} 个 agent / ${Object.keys(byCat).length} 个类别 / 0 个新加`);
    out.push('');
  }
  out.push('## 使用说明');
  out.push('');
  out.push('1. 在 `agents/<name>.md` 下新建 agent');
  out.push('2. agents 整体由 manifest 注册（`agents-core` 模块，`paths: ["agents"]`），**无需逐个登记**');
  out.push('3. 跑 `node scripts/generate-agents-readme.js` 重新生成本索引');
  out.push('4. cp 到本机：`cp agents/<name>.md ~/.claude/custom-rules/agents/<name>.md`');
  out.push('');
  out.push('## Agent ↔ Skill 映射');
  out.push('');
  out.push('自动扫描 agent .md 内容匹配 skill 目录名（反引号或 `skills/<name>` 形式）。');
  out.push('手动补充：编辑 `agents/skill-mappings.json`，key = agent 名，value = skill 名数组。');
  out.push('优先级：手动映射表 > 自动扫描。');
  out.push('');

  out.push('## 类别清单');
  out.push('');
  out.push('| # | 类别 | agent 数 | 主题 |');
  out.push('|---|------|---------|------|');
  Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length).forEach((cat, i) => {
    out.push(`| ${i + 1} | ${cat} | ${byCat[cat].length} | ${CATEGORIES[cat] || '—'} |`);
  });
  out.push('');
  out.push(`**合计**：${agentNames.length} 个 agent / ${Object.keys(byCat).length} 个类别`);
  out.push('');

  out.push('---');
  out.push('');
  out.push('## 详细列表（按类别）');
  out.push('');

  Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length).forEach(cat => {
    out.push(`### ${cat}（${byCat[cat].length} 个）— ${CATEGORIES[cat]}`);
    out.push('');
    byCat[cat].sort().forEach(name => {
      const { desc, model } = readAgentDescription(name);
      const zh = readAgentLabel(name);
      const recent = recentAgentNames.includes(name) ? ' 🟢 **新加**' : '';
      const label = zh ? `${name} — ${zh}` : name;
      const descSnippet = desc ? `: ${desc.slice(0, 60)}${desc.length > 60 ? '...' : ''}` : '';
      const modelTag = model ? ` [${model}]` : '';
      out.push(`- ${label}${recent}${descSnippet}${modelTag}`);
      // 关联 skill 映射
      const related = findRelatedSkills(name);
      if (related.length > 0) {
        const newSkillsForThisAgent = recentBindings[name] || {};
        const relatedZh = related.map(sn => {
          const lbl = (function() {
            try {
              const mp = path.join(REPO, 'skills', 'zh-labels.json');
              if (fs.existsSync(mp)) {
                const m = JSON.parse(fs.readFileSync(mp, 'utf-8'));
                if (m[sn]) return `${sn}（${m[sn]}）`;
              }
            } catch (e) { /* ignore */ }
            return sn;
          })();
          const isNew = newSkillsForThisAgent[sn] ? ' 🟢 **新加**' : '';
          return `${lbl}${isNew}`;
        });
        out.push(`  - 关联 skill: ${relatedZh.join(', ')}`);
      }
    });
    out.push('');
  });

  if (recentAgentNames.length > 0 || recentBindingAgents.length > 0) {
    out.push('---');
    out.push('');
    out.push('## 🆕 新增清单（最近添加）');
    out.push('');
    out.push('最近一次或近期新增的资源在主列表中以 🟢 **新加** 标注，并集中列在此处方便快速回顾。');
    out.push('');

    if (recentAgentNames.length > 0) {
      out.push('### Agent 新增');
      out.push('');
      out.push('| 资源名 | 类别 | 描述（来自 description） | 加入日期 |');
      out.push('|---|---|---|---|');
      recentAgentNames.slice().sort().forEach(name => {
        const { desc } = readAgentDescription(name);
        const cat = categorize(name);
        out.push(`| \`${name}\` | ${cat}（${CATEGORIES[cat] || '—'}） | ${desc.slice(0, 80)}${desc.length > 80 ? '...' : ''} | ${recentAgents[name]} |`);
      });
      out.push('');
    } else {
      out.push('### Agent 新增');
      out.push('');
      out.push('（暂无新加 agent）');
      out.push('');
    }

    if (recentBindingAgents.length > 0) {
      out.push('### Agent ↔ Skill 绑定更新');
      out.push('');
      out.push('| Agent | 新增绑定的 skill | 日期 |');
      out.push('|---|---|---|');
      recentBindingAgents.slice().sort().forEach(agentName => {
        const skills = recentBindings[agentName];
        Object.keys(skills).sort().forEach(skillName => {
          out.push(`| \`${agentName}\` | \`${skillName}\` | ${skills[skillName]} |`);
        });
      });
      out.push('');
    }

    out.push('> 💡 提示：新增 agent / binding = 当前 manifest / skill-mappings.json 里**不在 `ECC_BASELINE.json`** 的。git pull 自动同步，无 state 文件，跨设备一致。');
    out.push('');
  }

  fs.writeFileSync(OUTPUT, out.join('\n'));
  console.log(`OK: ${OUTPUT}`);
  console.log(`    ${agentNames.length} agents across ${Object.keys(byCat).length} categories`);
  if (recentAgentNames.length > 0 || recentBindingAgents.length > 0) {
    const userBindingCount = recentBindingAgents.reduce((s, a) => s + Object.keys(recentBindings[a] || {}).length, 0);
    console.log(`    🟢 ${recentAgentNames.length} 个新 agent + ${userBindingCount} 个新 binding（manifest - baseline 实时算）`);
  }
}

main();