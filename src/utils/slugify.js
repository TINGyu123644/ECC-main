'use strict';

/**
 * 将任意输入字符串转成 URL 友好的 slug 形式。
 *
 * 规则（顺序固定）:
 *   1. lowercase
 *   2. 任意空白（含连续）→ '-'
 *   3. 仅保留 a-z / 0-9 / '-' / CJK 基本区（一-鿿）
 *   4. 合并连续 '-'
 *   5. 去首尾 '-'
 *
 * 非 string 入参返回 ''（与 AC5 "空入空出" 一致；防御 null / undefined / 数字）。
 *
 * @param {string} input 原始字符串
 * @returns {string} slug
 */
function slugify(input) {
  if (typeof input !== 'string') return '';
  return input
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-一-鿿]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

module.exports = { slugify };
