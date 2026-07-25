#!/usr/bin/env node
/**
 * PostToolUse hook: when a file under skills/ or agents/ is written/edited,
 * auto-regenerate SKILLS.md and AGENTS.md so that newly-added resources
 * are marked 🟢 新加 and listed in the bottom 新增清单 automatically.
 *
 * Triggered by PostToolUse matcher "Edit|Write|MultiEdit" — same matcher as
 * the existing post-edit-manifest hook. We use a path-based check inside
 * to avoid running for unrelated file edits.
 *
 * Usage (added to ~/.claude/settings.local.json):
 *   {
 *     "matcher": "Edit|Write|MultiEdit",
 *     "hooks": [{ "type": "command",
 *       "command": "node \"<REPO>/scripts/hooks/post-edit-resource-index.js\"" }]
 *   }
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Resolve repo root from this script's location (scripts/hooks/ → ../..)
const REPO = path.resolve(__dirname, '..', '..');

function readStdinSync() {
  try { return fs.readFileSync(0, 'utf-8'); } catch (e) { return ''; }
}

function detectTouchedPaths(input) {
  const out = new Set();
  if (!input) return out;
  let parsed;
  try { parsed = JSON.parse(input); } catch (e) { return out; }

  const candidates = [];
  const toolName = parsed.tool_name || parsed.tool || '';
  if (['Edit', 'Write', 'MultiEdit'].includes(toolName)) {
    const fields = ['file_path', 'filePath', 'notebook_path', 'path'];
    for (const f of fields) {
      if (parsed[f]) candidates.push(parsed[f]);
    }
    if (Array.isArray(parsed.edits)) {
      for (const e of parsed.edits) {
        if (e && e.file_path) candidates.push(e.file_path);
      }
    }
    if (parsed.tool_input) {
      const ti = parsed.tool_input;
      for (const f of fields) {
        if (ti[f]) candidates.push(ti[f]);
      }
      if (Array.isArray(ti.edits)) {
        for (const e of ti.edits) {
          if (e && e.file_path) candidates.push(e.file_path);
        }
      }
    }
  }

  for (const p of candidates) {
    if (typeof p === 'string') out.add(p);
  }
  return out;
}

function isInRepo(p) {
  if (!p) return false;
  try {
    const abs = path.resolve(p);
    const rel = path.relative(REPO, abs);
    return !rel.startsWith('..') && !path.isAbsolute(rel);
  } catch (e) {
    return false;
  }
}

function relFromRepo(p) {
  return path.relative(REPO, path.resolve(p)).replace(/\\/g, '/');
}

function isRelevant(rel) {
  return rel.startsWith('skills/') || rel.startsWith('agents/');
}

function main() {
  const input = readStdinSync();
  const paths = detectTouchedPaths(input);

  let touchedRelevant = false;
  const touchedList = [];
  for (const p of paths) {
    if (!isInRepo(p)) continue;
    const rel = relFromRepo(p);
    if (isRelevant(rel)) {
      touchedRelevant = true;
      touchedList.push(rel);
    }
  }

  if (!touchedRelevant) {
    // Not a skill/agent file → do nothing, exit 0 fast.
    process.exit(0);
  }

  // Run both generators with --auto so the 🟢 markers and 底部清单
  // stay in sync. --auto uses state file to know what's new.
  const cmds = [
    `node "${path.join(REPO, 'scripts', 'generate-skills-readme.js')}" --auto`,
    `node "${path.join(REPO, 'scripts', 'generate-agents-readme.js')}" --auto`,
  ];

  let skillsOut = '';
  let agentsOut = '';
  try {
    skillsOut = execSync(cmds[0], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
  } catch (e) {
    skillsOut = `ERR: ${(e.stderr || e.message || '').slice(0, 200)}`;
  }
  try {
    agentsOut = execSync(cmds[1], { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf-8' });
  } catch (e) {
    agentsOut = `ERR: ${(e.stderr || e.message || '').slice(0, 200)}`;
  }

  // Compact log line so it shows in transcript without flooding.
  const lines = [
    `[post-edit-resource-index] touched: ${touchedList.join(', ')}`,
    skillsOut.trim().split('\n').slice(-2).join(' | '),
    agentsOut.trim().split('\n').slice(-2).join(' | '),
  ];
  process.stderr.write(lines.join('\n') + '\n');
  process.exit(0);
}

main();