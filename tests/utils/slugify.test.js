'use strict';

/**
 * Tests for src/utils/slugify.js
 *
 * Run with: node tests/utils/slugify.test.js
 *
 * 输出严格匹配 "Passed: <N>" / "Failed: <N>" 各一行,
 * 以便被 tests/run-all.js 的 spawnSync+regex 抓取.
 */

const assert = require('assert');
const path = require('path');
const { slugify } = require(path.join(__dirname, '..', '..', 'src', 'utils', 'slugify'));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed += 1;
  } catch (err) {
    console.log(`  ✗ ${name}`);
    console.log(`    Error: ${err.message}`);
    failed += 1;
  }
}

// ── 用户给的 5 个 AC ──────────────────────────────────

test('AC1: "Hello World" → "hello-world"', () => {
  assert.strictEqual(slugify('Hello World'), 'hello-world');
});

test('AC2: 多个空格与首尾空格 → 单个 -', () => {
  assert.strictEqual(slugify('  Hello   World  '), 'hello-world');
});

test('AC3: 中文保留 + ABC → 小写', () => {
  assert.strictEqual(slugify('中文测试 ABC'), '中文测试-abc');
});

test('AC4: 标点去除', () => {
  assert.strictEqual(slugify('Hello, World!'), 'hello-world');
});

test('AC5: 空字符串入 → 空字符串出', () => {
  assert.strictEqual(slugify(''), '');
});

// ── 防御用例 ──────────────────────────────────────────

test('AC6: 中英混排 + 多标点', () => {
  assert.strictEqual(slugify('你好, 世界! @#$'), '你好-世界');
});

test('AC7: 非 string 入参返回 ""', () => {
  assert.strictEqual(slugify(null), '');
  assert.strictEqual(slugify(undefined), '');
  assert.strictEqual(slugify(123), '');
});

console.log(`\nPassed: ${passed}`);
console.log(`Failed: ${failed}`);
process.exit(failed > 0 ? 1 : 0);
