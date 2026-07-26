---
name: coupling-decider
description: "根据 md 知识库的 §3 决策流程和 §4 精准判断表，帮助开发者判定新 Skill/Agent 对的耦合度（强 vs 弱）。基于任务类型 + 步骤数 + 流程固定性 + 描述内容综合判定。当用户说'这个 skill 和 agent 是强耦合还是弱耦合'、'耦合方式怎么判定'、'加个新 skill 怎么写 frontmatter'时调用。"
metadata:
  origin: ECC
  version: 1.0.0
  category: workflow-quality
  triggers: [耦合, 强耦合, 弱耦合, 耦合方式, decoupling, coupling]
---

# Coupling Decider Skill

判定 Skill 与 Agent 的耦合方式（强 / 弱）。

## 完整标准

见 [`../../Agent-Skill-耦合方式决策知识库.md`](../../Agent-Skill-耦合方式决策知识库.md)（8 章 ~320 行权威标准）。

本 skill 是**调用器**，知识库是**权威源**。

## 判定流程

按知识库 §3 决策流程图：

1. **判定任务类型**：
   - 执行型（落地做事、产出固定结果）
   - 判断型 / 评审型 / 咨询型

2. **检查步骤数与流程固定性**：
   - 步骤 ≥5 + 顺序固定 → 强耦合
   - 步骤少 / 流程灵活 → 弱耦合
   - 判断型 + 灵活 → 弱耦合
   - 判断型 + 强制全量校验 → 强耦合

3. **看 SKILL.md 是否有 `## Operator: <agent> Agent` 章节**：
   - 有 → 强耦合倾向
   - 无 → 弱耦合

4. **看 agent description**：
   - 以 "由「<skill>」skill 驱动" 结尾 → 强耦合
   - 通用职责描述 → 弱耦合

5. **看 skill-mappings.json 实际映射**：
   - 该 skill 被 1 个 agent 引用 → 强耦合（1:1）
   - 该 skill 被多个 agent 引用 → 弱耦合（1:N）

## 当前 ECC 项目典型分类

| Skill | 任务类型 | 耦合度 |
|---|---|---|
| `stock-analyzer` | 执行型 | 强 |
| `macro-monitor` | 执行型 | 强 |
| `tdd-workflow` | 执行型 | 强 |
| `self-improvement` | 判断型 | 弱 |
| `ppt-generator` | 判断型/灵活 | 弱 |
| `coding-standards` | 通用参考 | 弱 |
| `verification-loop` | 评审型 | 弱 |

## 输出

调用此 skill 后，agent 应输出：
- 判定结果（强 / 弱）
- 判定依据（按哪几条 §4.1 / §4.2 标准）
- 推荐的写法（强/弱对应模板）
- `skill-mappings.json` 应该写什么

---

**重要**：本 skill 只判定耦合度，不做其他事。完整开发流程用 `ecc-plugin-dev-sop`。