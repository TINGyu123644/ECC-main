---
name: ecc-plugin-dev-sop
description: "完整 ECC 插件开发 6 步 SOP（v2.0）。开发者新增/改造 Skill/Agent/Hook 时的完整流程规范。引用 sop-updated.md 作为权威源，提供 Step 0-5 的判定标准、模板、错误处理。当用户说'我要加个 skill'、'我要加个 agent'、'怎么加 hook'、'新资源怎么注册'时调用。"
metadata:
  origin: ECC
  version: 2.0.0
  category: workflow-quality
  triggers: [plugin-dev, 加skill, 加agent, 加hook, 新资源, 注册资源]
---

# ECC 插件开发 6 步 SOP

> 本 skill 是 [`../../sop-updated.md`](../../sop-updated.md) 的精简调用版。完整内容见那个文件，本 skill 只保留调用契约。

## 6 步流程

```
Step 0  分类 + 耦合判定
Step 1  写文件（路径 + frontmatter）
Step 2  注册 manifest
Step 3  跑 CI
Step 4  同步本机
Step 5  8 项自检
```

## Step 0 — 分类

调用 `coupling-decider` skill 完成。

资源类型判断（3 问）：
1. 加什么？skill / agent / command / hook
2. 是否需要 agent？依据：是否有主观判断
3. 触动 manifest？只有 skill 必改

耦合度判断（依据 `Agent-Skill-耦合方式决策知识库.md`）：
- 任务类型 + 步骤数 + 流程固定性 → 强 / 弱

## Step 1 — 写文件

依据耦合度选模板：
- 强耦合（1:1）→ SKILL.md 加 `## Operator: <agent> Agent` + agent 写明"由 <skill> skill 驱动"
- 弱耦合（1:N）→ SKILL.md 可选 Operator + agent 写通用职责

路径固定：
- `skills/<name>/SKILL.md`（必含 references/ 如果有）
- `agents/<name>.md`
- `commands/<name>.md`
- `hooks/<name>.json`

frontmatter 必填：name, description, origin/version 可选。

## Step 2 — 注册 manifest

打开 `manifests/install-modules.json`，加一行到对应模块的 `paths` 数组。

模块选错会装不上！

## Step 3 — 跑 CI

```bash
node scripts/ci/validate-skills.js
node scripts/ci/validate-install-manifests.js
```

两个脚本都必须无 ERROR。WARN 可忽略。

## Step 4 — 同步本机

3 种方式（按优先级）：
1. 软链接到 `~/.claude/plugins/<name>/`（推荐）
2. 环境变量 `ECC_SYNC_DIR=...`
3. 手动 cp 到 `~/.claude/custom-rules/`

调用 `update-resource-index.js` 一次性同步。

## Step 5 — 自检

8 项必须打勾（详见 sop-updated.md §Step 5）。

## 异常处理（速查）

| 报错 | 解决 |
|---|---|
| validate-skills 卡住 | 找 SKILL.md frontmatter 格式错 |
| manifest duplicated | 删重复行 |
| skill not referenced | 补 `skills/<name>/` 或删 manifest 注册 |
| hook 不触发 | 检查 matcher / 路径 |
| 软链接 broken | 项目真身移位了，重新建 |

## 引用关系

- 主 SOP 文档：[`../../sop-updated.md`](../../sop-updated.md)
- 耦合判定：`coupling-decider` skill + `Agent-Skill-耦合方式决策知识库.md`
- 速查表：`SKILLS.md` / `AGENTS.md`
- 项目改动记录：`PROJECT-CHANGES.md`

---

**最终**：本 skill 是主流程入口。具体步骤用对应 skill 或 sop-updated.md 详细内容。