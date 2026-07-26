---
name: verify-checklist
description: "Step 5 8 项自检清单（sop-updated.md §Step 5）。新增资源后用此 skill 跑 checklist 确认所有项打勾。"
metadata:
  origin: ECC
  version: 1.0.0
  category: workflow-quality
  triggers: [verify, checklist, 自检, 核验, validate]
---

# Verify Checklist Skill

照搬 sop-updated.md §Step 5 的 8 项自检。

## 8 项清单

| # | 检查项 | 验证方法 |
|:-:|---|---|
| 1 | 文件创建路径完全规范、无错目录 | `ls skills/<name>/` 存在 |
| 2 | Skill 已添加 manifest 注册条目 | `grep "skills/<name>" manifests/install-modules.json` |
| 3 | `validate-skills.js` 校验通过 | `node scripts/ci/validate-skills.js` 输出 OK |
| 4 | `validate-install-manifests.js` 校验通过 | `node scripts/ci/validate-install-manifests.js` 输出 OK |
| 5 | 软链接在位 | `test -L ~/.claude/plugins/<name>` 退出码 0 |
| 6 | settings.local.json hook 路径对 | `grep "<name>/" ~/.claude/settings.local.json` |
| 7 | git hooks 路径用 plugin 根 | `head -2 .git/hooks/post-*` |
| 8 | 重启 Claude Code 验证 | 关闭 + 打开 Claude Code |

## 一键运行

```bash
# 8 项自动验证（自定义脚本，可选）
node scripts/verify-resource.js <name>

# 或手动逐项检查
ls skills/<name>/                       # 1
grep "<name>" manifests/install-modules.json  # 2
node scripts/ci/validate-skills.js        # 3
node scripts/ci/validate-install-manifests.js  # 4
test -L ~/.claude/plugins/<name>         # 5
grep "<name>/" ~/.claude/settings.local.json  # 6
head -1 .git/hooks/post-commit            # 7
# 8: 重启 Claude Code（手动）
```

## 异常处理对照

| 自检项失败 | 看 |
|---|---|
| 1 失败 | 文件路径错（不是 `skills/<name>/SKILL.md`）|
| 2 失败 | manifest 没注册 或 路径错 |
| 3 失败 | SKILL.md frontmatter 格式错（缺 `---` 闭合、缩进错、YAML 错）|
| 4 失败 | 找重复项 或 缺 `skills/<name>/` |
| 5 失败 | 没建软链接（参考 `WINDOWS-SETUP.md`）|
| 6 失败 | `settings.local.json` 路径写错 |
| 7 失败 | git hooks 路径没更新 |
| 8 失败 | 软链接问题 或 hook 没触发 |

详细错误处理见 sop-updated.md §异常处理与故障排查。