#!/usr/bin/env node
/**
 * post-edit-verify.js
 *
 * Claude Code PostToolUse hook. Run after Write | Edit | MultiEdit.
 * Detects the file's language, runs the cheapest deterministic check
 * available, and emits structured JSON back to the agent on stderr.
 *
 * Contract: exits 0 always (PostToolUse is observability, not a gate),
 * but writes a machine-readable summary to stdout that Claude Code
 * feeds back into the agent's context.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

let input = '';
try {
  input = fs.readFileSync(0, 'utf8');
} catch (_) {
  process.exit(0);
}

let payload;
try {
  payload = JSON.parse(input);
} catch (_) {
  process.exit(0);
}

const toolName = payload?.tool_name || '';
const filePath =
  payload?.tool_input?.file_path ||
  payload?.tool_input?.path ||
  payload?.tool_input?.notebook_path ||
  '';

if (!filePath) process.exit(0);
if (!/^(Write|Edit|MultiEdit|NotebookEdit)$/.test(toolName)) process.exit(0);

const ext = path.extname(filePath).toLowerCase();
if (!ext) process.exit(0);

const checks = [];

function run(cmd, cwd) {
  try {
    const res = spawnSync(cmd, {
      cwd,
      shell: true,
      encoding: 'utf8',
      timeout: 20_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {
      ok: res.status === 0,
      stdout: (res.stdout || '').slice(0, 1500),
      stderr: (res.stderr || '').slice(0, 1500),
      code: res.status ?? -1,
    };
  } catch (err) {
    return { ok: false, stdout: '', stderr: String(err), code: -1 };
  }
}

function detectProjectRoot(start) {
  let dir = path.dirname(path.resolve(start));
  for (let i = 0; i < 8; i++) {
    if (
      fs.existsSync(path.join(dir, 'package.json')) ||
      fs.existsSync(path.join(dir, 'pyproject.toml')) ||
      fs.existsSync(path.join(dir, 'go.mod')) ||
      fs.existsSync(path.join(dir, 'Cargo.toml')) ||
      fs.existsSync(path.join(dir, 'pom.xml'))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.dirname(path.resolve(start));
}

const root = detectProjectRoot(filePath);

if (ext === '.js' || ext === '.cjs' || ext === '.mjs') {
  checks.push(run('node --check "' + filePath + '"', root));
}
if (ext === '.ts' || ext === '.tsx') {
  checks.push(run('node --check "' + filePath + '"', root));
  if (fs.existsSync(path.join(root, 'tsconfig.json'))) {
    checks.push(run('npx --no-install tsc --noEmit -p "' + root + '"', root));
  }
}
if (ext === '.py') {
  checks.push(run('python -m py_compile "' + filePath + '"', root));
}
if (ext === '.go') {
  checks.push(run('gofmt -l "' + filePath + '"', root));
}

const results = checks.filter((c) => c !== undefined);
const failed = results.filter((c) => !c.ok);

if (failed.length === 0) {
  if (results.length > 0) {
    console.log(
      GREEN + '[post-edit-verify] ' + path.basename(filePath) + ' OK (' +
      results.length + ' check' + (results.length > 1 ? 's' : '') + ')' + RESET
    );
  } else {
    console.log(
      YELLOW + '[post-edit-verify] no checks defined for ' + ext + RESET
    );
  }
  process.exit(0);
}

console.error(RED + '[post-edit-verify] CHECKS FAILED on ' + filePath + RESET);
for (const r of failed) {
  console.error('--- exit ' + r.code + ' ---');
  if (r.stderr) console.error(r.stderr);
  else if (r.stdout) console.error(r.stdout);
}

const block = {
  hook: 'post-edit-verify',
  file: filePath,
  ext,
  failed: failed.length,
  total: results.length,
  outputs: failed.map((r) => ({
    code: r.code,
    stderr: r.stderr,
    stdout: r.stdout,
  })),
};

try {
  fs.writeFileSync(
    path.join(root, '.claude', '.last-post-edit.json'),
    JSON.stringify(block, null, 2)
  );
} catch (_) { /* best effort */ }

process.exit(0);
