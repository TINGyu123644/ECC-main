#!/usr/bin/env node
/**
 * Hook: regenerate SKILLS.md / AGENTS.md when relevant files are edited.
 *
 * Wired via ~/.claude/settings.local.json -> hooks.PostToolUse.
 * Reads Claude Code stdin (JSON: { tool_name, tool_input: { file_path } }).
 *
 * Triggers:
 *   - Edit manifests/install-modules.json  → regenerate skills/SKILLS.md
 *   - Create/edit agents/<name>.md          → regenerate agents/AGENTS.md
 *   - Create/edit skills/<name>/SKILL.md    → regenerate skills/SKILLS.md
 *   - Edit agents/skill-mappings.json       → regenerate agents/AGENTS.md
 *
 * Silently exits otherwise. Never blocks the calling tool.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPO = path.resolve(__dirname, '..', '..');

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const tool = data.tool_name;
    const filePath = (data.tool_input && data.tool_input.file_path) ? data.tool_input.file_path : '';

    if (!['Edit', 'Write', 'MultiEdit'].includes(tool)) return;

    let scriptToRun = null;
    let trigger = '';

    if (filePath.endsWith('manifests/install-modules.json')) {
      scriptToRun = 'node scripts/generate-skills-readme.js';
      trigger = 'manifest edit';
    } else if (filePath.match(/[/\\]agents[/\\][^/\\]+\.md$/)) {
      const fname = path.basename(filePath);
      if (fname === 'AGENTS.md' || fname === 'README.md' || fname === 'zh-labels.json' || fname === 'skill-mappings.json') return;
      scriptToRun = 'node scripts/generate-agents-readme.js';
      trigger = `agent edit: ${fname}`;
    } else if (filePath.match(/[/\\]agents[/\\]skill-mappings\.json$/)) {
      scriptToRun = 'node scripts/generate-agents-readme.js';
      trigger = 'skill-mappings.json edit';
    } else if (filePath.match(/[/\\]skills[/\\]zh-labels\.json$/)) {
      scriptToRun = 'node scripts/generate-skills-readme.js';
      trigger = 'zh-labels.json edit';
    } else if (filePath.match(/[/\\]skills[/\\][^/\\]+[/\\]SKILL\.md$/)) {
      scriptToRun = 'node scripts/generate-skills-readme.js';
      trigger = 'new SKILL.md';
    }

    if (!scriptToRun) return;

    console.error(`[post-edit-manifest] regenerating (${trigger})`);

    execSync(scriptToRun, {
      cwd: REPO,
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('[post-edit-manifest] failed:', e.message);
    // Never throw — hooks must not block the calling tool.
  }
});