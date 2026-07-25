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
 *   RECENT="my-new-agent" node scripts/generate-agents-readme.js
 */

const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const AGENTS_DIR = path.join(REPO, 'agents');
const OUTPUT = path.join(AGENTS_DIR, 'AGENTS.md');
const LABELS_MAP = path.join(AGENTS_DIR, 'zh-labels.json');
const STATE_DIR = path.join(__dirname, 'state');
const STATE_FILE = path.join(STATE_DIR, 'recent-agents.json');
const STATE_BINDINGS_FILE = path.join(STATE_DIR, 'recent-bindings.json');

const RECENT = (process.env.RECENT || '').split(/\s+/).filter(Boolean);
const CLEAR_RECENT = process.argv.includes('--clear-recent');
const NOW = new Date().toISOString().slice(0, 10);

// --- 持久化 "新加" 状态 ---
function loadJson(p, fallback) {
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) { /* ignore */ }
  return fallback;
}

function saveJson(p, data) {
  try {
    if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  } catch (e) {
    console.error('WARN: failed to write', p, e.message);
  }
}

function loadRecentAgents() {
  const state = loadJson(STATE_FILE, {});
  if (CLEAR_RECENT) { saveJson(STATE_FILE, {}); return {}; }
  RECENT.forEach(name => { state[name] = NOW; });
  // --auto 模式：自动检测新加的 agent（不在 _known 列表里的）
  if (process.argv.includes('--auto') && fs.existsSync(AGENTS_DIR)) {
    const known = new Set(state._known || []);
    const isFirstRun = !state._known;
    const allAgentFiles = fs.readdirSync(AGENTS_DIR)
      .filter(f => f.endsWith('.md') && !['README.md', 'AGENTS.md'].includes(f));
    const current = [];
    allAgentFiles.forEach(f => {
      const name = f.replace(/\.md$/, '');
      current.push(name);
      if (!isFirstRun && !known.has(name) && !state[name]) state[name] = NOW;
    });
    state._known = current;
  }
  saveJson(STATE_FILE, state);
  return state;
}

function loadRecentBindings() {
  // RECENT_BINDINGS 用 env: RECENT_BINDINGS="marketing-agent:ppt-generator"
  const fromEnv = (process.env.RECENT_BINDINGS || '').split(/\s+/).filter(Boolean);
  const state = loadJson(STATE_BINDINGS_FILE, {});
  if (CLEAR_RECENT) { saveJson(STATE_BINDINGS_FILE, {}); return {}; }
  fromEnv.forEach(pair => {
    const [agent, skill] = pair.split(':');
    if (agent && skill) {
      if (!state[agent]) state[agent] = {};
      state[agent][skill] = NOW;
    }
  });
  // --auto 模式：自动检测 skill-mappings.json 里新加的 binding（不在 _known 列表里的）
  if (process.argv.includes('--auto')) {
    const isFirstRun = !state._known;
    const knownBindings = new Set();
    Object.keys(state._known || {}).forEach(agentName => {
      Object.keys((state._known || {})[agentName] || {}).forEach(skillName => {
        knownBindings.add(`${agentName}::${skillName}`);
      });
    });
    const currentMap = {};
    try {
      const map = JSON.parse(fs.readFileSync(path.join(AGENTS_DIR, 'skill-mappings.json'), 'utf-8'));
      Object.keys(map).forEach(agentName => {
        if (agentName.startsWith('_')) return;
        const skills = map[agentName] || [];
        currentMap[agentName] = {};
        skills.forEach(skillName => {
          currentMap[agentName][skillName] = true;
          if (!isFirstRun && !knownBindings.has(`${agentName}::${skillName}`)) {
            if (!state[agentName]) state[agentName] = {};
            if (!state[agentName][skillName]) state[agentName][skillName] = NOW;
          }
        });
      });
    } catch (e) { /* ignore */ }
    state._known = currentMap;
  }
  saveJson(STATE_BINDINGS_FILE, state);
  return state;
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

function categorize(name) {
  if (name.includes('reviewer') || name === 'code-reviewer') return 'review';
  if (name.includes('build-resolver') || name === 'build-error-resolver') return 'build-fix';
  if (name.includes('architect') || name === 'planner') return 'plan';
  if (name.includes('test') || name === 'tdd-guide') return 'test';
  if (name.includes('security') || name === 'silent-failure-hunter') return 'security';
  if (name === 'spec-miner' || name === 'type-design-analyzer') return 'design';
  if (name.startsWith('gan-')) return 'gan';
  if (name === 'refactor-cleaner' || name === 'code-simplifier' || name === 'comment-analyzer') return 'refactor';
  if (name === 'doc-updater' || name === 'docs-lookup') return 'docs';
  if (name === 'marketing-agent' || name === 'seo-specialist') return 'marketing';
  if (name === 'stock-analyst' || name === 'mle-reviewer') return 'domain-analyst';
  if (name.startsWith('opensource-')) return 'opensource';
  if (name.includes('network') || name === 'homelab-architect') return 'network';
  if (name.includes('healthcare')) return 'healthcare';
  if (name.startsWith('loop-') || name === 'harness-optimizer' || name === 'loop-operator') return 'loop';
  return 'other';
}

const CATEGORIES = {
  'review': '代码评审',
  'build-fix': '构建修复',
  'plan': '规划架构',
  'test': '测试',
  'security': '安全',
  'design': '设计',
  'gan': 'GAN Harness',
  'refactor': '重构',
  'docs': '文档',
  'marketing': '营销',
  'domain-analyst': '领域分析',
  'opensource': '开源',
  'network': '网络',
  'healthcare': '医疗',
  'loop': '循环 / Harness',
  'other': '其他',
};

function main() {
  if (!fs.existsSync(AGENTS_DIR)) {
    console.error('FATAL: agents/ not found');
    process.exit(1);
  }
  const files = fs.readdirSync(AGENTS_DIR).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'AGENTS.md' && f !== 'zh-labels.json' && f !== 'skill-mappings.json');
  const agentNames = files.map(f => f.replace(/\.md$/, ''));

  const recentAgents = loadRecentAgents(); // {agentName: "YYYY-MM-DD"}
  const recentBindings = loadRecentBindings(); // {agentName: {skillName: "YYYY-MM-DD"}}
  const recentAgentNames = Object.keys(recentAgents).filter(k => k !== '_known');
  const recentBindingAgents = Object.keys(recentBindings).filter(k => k !== '_known');

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

    out.push('> 💡 提示：用 `RECENT="<新agent名>" node scripts/generate-agents-readme.js` 把新 agent 标为 🟢 **新加**。');
    out.push('> 用 `RECENT_BINDINGS="<agent>:<skill>" node scripts/generate-agents-readme.js` 标记新绑定（如 `RECENT_BINDINGS="marketing-agent:ppt-generator"`）。');
    out.push('> 用 `node scripts/generate-agents-readme.js --clear-recent` 清空所有"新加"标记。');
    out.push('');
  }

  fs.writeFileSync(OUTPUT, out.join('\n'));
  console.log(`OK: ${OUTPUT}`);
  console.log(`    ${agentNames.length} agents across ${Object.keys(byCat).length} categories`);
  if (recentAgentNames.length > 0 || recentBindingAgents.length > 0) {
    const userBindingCount = recentBindingAgents.reduce((s, a) => s + Object.keys(recentBindings[a] || {}).length, 0);
    console.log(`    🟢 ${recentAgentNames.length} 个 agent + ${userBindingCount} 个绑定已保留到 state`);
  }
}

main();