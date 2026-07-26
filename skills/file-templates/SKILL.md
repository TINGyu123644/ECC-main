---
name: file-templates
description: "Skill/Agent/Hook 文件模板和 frontmatter 规范。引用 sop-updated.md Step 1。新建资源时调用此 skill 选模板。"
metadata:
  origin: ECC
  version: 1.0.0
  category: workflow-quality
  triggers: [写文件, 模板, frontmatter, path, 文件结构]
---

# File Templates Skill

按 sop-updated.md §Step 1 提供文件模板。

## Skill 模板（强耦合）

```markdown
---
name: <skill-name>
description: <description>. 由「<skill-name>」skill 驱动。触发关键词：...
metadata:
  origin: ECC
  version: 1.0.0
---

# <Skill Title>

> 调用模板：`Agent(subagent_type="<agent-name>")`

## 概述

<description>

## 触发条件

- 触发 1
- 触发 2

## 步骤

### Step 0 — 总是先调用 skill
Before doing any work yourself, **invoke `Skill('<this-skill>')`**.

### Step 1 — <自定义业务>
<内容>

### Step 2 — <自定义业务>
<内容>
```

## Skill 模板（弱耦合）

去掉 `## Operator` 章节，agent description 写通用职责。

## Agent 模板

```markdown
---
name: <agent-name>
description: "<agent 职责>. 不绑定特定 skill，根据 context 决定使用哪些工具。触发关键词：..."
metadata:
  origin: ECC
  version: 1.0.0
  tools: [Read, Write, Edit, Grep, Glob, Bash]
  model: sonnet
  triggers: [...]
---

# <Agent Title>

> 调用 `Agent(subagent_type="<this-agent>")` 触发

## When to Invoke

- 触发 1
- 触发 2

## 行为

<说明>
```

## Hook 模板

```json
{
  "matcher": "Edit|Write|MultiEdit",
  "hooks": [{
    "type": "command",
    "command": "node \"path/to/script.js\""
  }]
}
```

## 路径速查

| 资源 | 路径 |
|---|---|
| Skill | `skills/<name>/SKILL.md` |
| Skill references | `skills/<name>/references/<file>.md` |
| Agent | `agents/<name>.md` |
| Command | `commands/<name>.md` |
| Hook | `hooks/<name>.json` |
| Compiled script | `scripts/<name>.js` |

## frontmatter 必填字段

| 资源 | 必填 | 可选 |
|---|---|---|
| Skill | name, description, triggers | origin, version, metadata |
| Agent | name, description, tools, model | origin, version, triggers |
| Command | description | argument-hint |
| Hook | matcher, hooks | type |

详细见 sop-updated.md §Step 1。