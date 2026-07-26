# ECC 插件开发 6 步标准操作清单

> 本文档是 ECC 插件开发 6 步标准操作清单的 **v2.0 源文件**（旧 sop.pdf 已删除）。**Step 0** 的"是否需要 agent"判定大幅扩展。  
> 如需 PDF 分发：`pandoc sop-updated.md -o sop-dist.pdf`（生成的 PDF 应该是临时分发物，不入 git）

---

## 整体说明

本文为 ECC 新增 Skill / Agent / Command / Hook 统一标准化落地流程，唯一官方最终操作版本，可直接作为日常开发落地清单、自查清单，替代所有零散步骤。

全套流程分为：
**Step0 分类判定** → **Step1 写文件** → **Step2 注册清单** → **Step3 校验CI** → **Step4 加载路径** → **Step5 落地核验**

> **主要变更**：
> - Step 0 加 agent 的判定逻辑展开（"需要 agent" vs "不需要 agent" vs "skill+agent 联动"）

### 6 步 ↔ 对应 skill / agent 映射

| 步 | 做什么 | 调用的 skill | 调用的 agent | 关联文件 |
|---|---|---|---|---|
| Step 0 | 分类 + 耦合判定 | `coupling-decider`（判定强/弱耦合）| `ecc-plugin-dev-agent`（orchestrator）| `Agent-Skill-耦合方式决策知识库.md` |
| Step 1 | 写文件 + 模板 | `file-templates`（选模板）| `ecc-plugin-dev-agent` | sop-updated.md §Step 1 |
| Step 2 | 注册 manifest | `ecc-plugin-dev-sop`（主流程）| `ecc-plugin-dev-agent` | `manifests/install-modules.json` |
| Step 3 | 跑 CI | `ecc-plugin-dev-sop` | - | `scripts/ci/validate-*.js` |
| Step 4 | 同步本机 | `ecc-plugin-dev-sop` | - | `WINDOWS-SETUP.md` / `scripts/update-resource-index.js` |
| Step 5 | 自检 | `verify-checklist`（8 项核验）| - | `~/.claude/custom-rules/` / `~/.claude/plugins/` |

**主入口 skill**：`ecc-plugin-dev-sop`（主流程 spec）
**主入口 agent**：`ecc-plugin-dev-agent`（orchestrator，引导用户走 6 步）
**辅助 skill**：`coupling-decider`、`file-templates`、`verify-checklist`

---

## Step 0 — Classify 类型判定（前置核心）

通过 **3 个问题**（外加**是否加 agent 的判定**），唯一确定本次开发的 Kind，杜绝做错文件、多做/漏做步骤。

### 三个核心问题

1. **加什么资源？** 可选：`skill / agent / command / hook`
2. **是否存在主观判断、独立思考输出？**  
   有 → 需要 Agent  
   无纯规则 / 纯流程 → 不需要 Agent
3. **是否触动 Manifest 注册？**  
   Skill 必改 manifest  
   Agent / Command / Hook 为整体目录注册，无需改 manifest

### 加 agent 的判定逻辑（v2.0 扩展，引用 [`../Agent-Skill-耦合方式决策知识库.md`](../Agent-Skill-耦合方式决策知识库.md)）

判定 agent 之前，先看是否需要 agent。需要的话，**再判定耦合度**（强 vs 弱）。本节是精简版，完整标准见独立知识库。

| 情况 | 资源类型 | 示例 |
|---|---|---|
| **纯规则 / 纯流程**：决定无歧义，按预定规则执行 | **skill-only** | `code-review`、`stock-analyzer`、`ppt-generator` |
| **存在主观判断 + 强耦合**（流程固定，>5 步）：skill 是操作规程，agent 严格执行 | **skill + agent 联动（强）** | `stock-analyzer` ↔ `stock-analyst`、`macro-monitor`、`tdd-workflow` |
| **存在主观判断 + 弱耦合**（场景多变，agent 自主判断）：skill 是参考 | **skill + agent 联动（弱）** | `self-improvement` ↔ `self-improver`、`ppt-generator`、`coding-standards` |
| **独立人格 / 决策体**：用户可独立调用 | **agent-only** | `marketing-agent`（独立营销人格）|
| **触发器 / 钩子**：事件驱动的工具 | **command / hook** | PostToolUse hook、git hook |

#### 详细判定流程

```
1. 这个资源是"标准操作"还是"需要判断"？
   ├─ 标准操作（如：跑测试、生成报告、按规则打分）
   │  → skill-only（skill 是 spec，agent 是 operator）
   │
   └─ 需要判断（如：什么时候记、记什么、归到哪）
      │
      ├─ 这个判断是 spec 里写死的，还是 agent 动态决定？
      │  ├─ Spec 写死 → skill-only
      │  └─ 动态决定 → **skill + agent 联动**
      │
      └─ 这是一个有独立人格的角色吗？（如"营销大师"、"代码审查员"）
         ├─ 是 → agent-only
         └─ 否 → skill-only 或 skill+agent
```

#### 何时需要 agent（具体判断标准）

| 触发模式 | 是否需要 agent | 原因 |
|---|:-:|---|
| 死规则 / 固定流程 | ❌ 不需要 | 没判断空间 |
| 读用户输入，按 description 模板填充输出 | ❌ 不需要 | 生成式但无选择 |
| 根据 context 决定"做不做" | ✅ 需要 | 主观判断"做不做" |
| 从多个候选中选一个 | ✅ 需要 | 主观选择 |
| 归类 / 分类（哪些 entry 写到哪个文件） | ✅ 需要 | 主观归类 |
| 模式识别（Recurrence-Count ≥ 3 时晋升） | ✅ 需要 | 判断模式 |
| 错误重试 / 自我修复 | ✅ 需要 | 运行时决策 |

#### Skill + Agent 联动模式（标准模板）

按 SOP 要求实现联动：

**1. SKILL.md 新增委派步骤**：
```markdown
## Operator: <agent-name> Agent
This skill is the **specification**. The actual work is done by the
**`<agent-name>` agent** (`agents/<agent-name>.md`), which:
- <agent 负责什么>
- 用什么工具
- 触发条件
```

**2. Agent description 强制标注来源**：
```yaml
description: "<agent 做什么>. 由「<skill-name>」skill 驱动。当用户触发对应场景时，承接专项子任务执行。"
```

**3. Agent 委派子 agent 复盘（强联动）**：
```js
Agent(
  subagent_type: "<agent-name>",
  prompt: <JSON payload>
)
```

---

## Agent-Skill 耦合度判定（v2.0 新增）

如果 Step 0 判定"需要 Agent"，**还要进一步判定耦合度**：这个 skill 和 agent 是**强耦合**（一对一）还是**弱耦合**（一对多）？

### 为什么需要判定？

耦合度决定：
- 资源数量（强耦合 1 对 1，弱耦合 1 对 N）
- agent description 写法（强耦合要标 skill 名，弱耦合标通用职责）
- `skill-mappings.json` 维护方式（强耦合可以一对一，弱耦合要列所有关联 skill）
- 后续删除/重构策略（强耦合要同时改，弱耦合可以单独改）

### 强耦合 vs 弱耦合

| 维度 | 强耦合 | 弱耦合 |
|---|---|---|
| 关系 | skill 专为这个 agent 设计 | skill 是通用工具，多个 agent 都用 |
| 数量 | 1 个 skill ↔ 1 个 agent | 1 个 skill ↔ N 个 agent，或 1 个 agent ↔ N 个 skill |
| 命名 | 名字相近（root 词相同）| 名字独立 |
| 删除 | 删一个，另一个失去存在意义 | 删一个，另一个可以独立工作 |
| 例子 | `stock-analyzer` ↔ `stock-analyst`（执行型固定流程）、`tdd-workflow`（执行型固定流程） | `self-improvement` ↔ `self-improver`（判断型/场景多）、`coding-standards`（被多个 agent 共用）|

### 判定流程

1. **看 skill 名和 agent 名**：
   - 名字 root 词相同（如 stock-analyzer / stock-analyst）→ 强耦合
   - 名字独立（如 coding-standards / code-reviewer）→ 弱耦合

2. **看 skill 的设计意图**：
   - `SKILL.md` 里有 "## Operator: <agent-name> Agent" 章节 → 强耦合
   - `SKILL.md` 是通用工具，无特定 agent → 弱耦合

3. **看 agent 的 description**（辅助判定，不是主要依据）：
   - description 以 "由「<skill>」skill 驱动" 结尾 → 倾向强耦合
   - description 是通用职责 → 倾向弱耦合
   - ⚠️ 这只是辅助，**主要看 SKILL 本身的设计**（任务类型 + 步骤数 + 流程固定性）

4. **看项目中的实际映射**（`agents/skill-mappings.json`）：
   - **1 个 skill 被多个 agent 引用**（如 `verification-loop` 被 `code-reviewer` 和 `tdd-guide` 都用）→ 弱耦合（1:N）
   - ⚠️ **1:1 映射不等于强耦合**！要结合 SKILL 的任务类型判断

### 当前项目映射分析（按 **SKILL 任务类型**判定）

按 [`Agent-Skill-耦合方式决策知识库.md`](../Agent-Skill-耦合方式决策知识库.md) §3 决策流程：

| Skill | 任务类型 | 步骤数 | 固定性 | 耦合度 |
|---|---|---|---|---|
| `stock-analyzer` | 执行型 | 7 步 | 固定 | **强** |
| `macro-monitor` | 执行型 | 5+ 步 | 固定 | **强** |
| `self-improvement` | 判断型 | 灵活 | 灵活 | **弱** |
| `ppt-generator` | 判断型/灵活 | 灵活 | 灵活 | **弱** |
| `coding-standards` | 通用参考 | N/A | 灵活 | **弱** |
| `verification-loop` | 评审型 | 灵活 | 灵活 | **弱** |
| `tdd-workflow` | 执行型 | 固定 | 固定 | **强** |
| `security-review` / `security-scan` / `gateguard` | 参考/通用 | N/A | 灵活 | **弱** |
| `plan-canvas` / `plan-orchestrate` / `ecc-guide` | 参考/通用 | N/A | 灵活 | **弱** |
| `architecture-decision-records` / `agentic-patterns` | 参考/通用 | N/A | 灵活 | **弱** |
| `market-research` / `deep-research` | 通用参考 | N/A | 灵活 | **弱** |
| `marketing-campaign` / `content-engine` / `seo` | 通用参考 | N/A | 灵活 | **弱** |
| `verification-loop`（被 2 个 agent 共用）| 参考 | N/A | 灵活 | **弱**（1:N）|
| `content-engine`（被 2 个 agent 共用）| 参考 | N/A | 灵活 | **弱**（1:N）|

**结论**：
- **强耦合 4 个**：`stock-analyzer`、`macro-monitor`、`tdd-workflow`、（其他可类推）—— 都是"执行型 + 固定流程"
- **弱耦合其余**：判断型/灵活任务 或 通用参考
- **1:1 映射不等于强耦合**：看 SKILL 的任务类型

> ⚠️ **本项目自查**：当前 `skill-mappings.json` 中 `tdd-workflow` 等可能标错（如被归入"通用"实际应是"强耦合执行型"）。维护时按本表重判。

### 不同耦合度的实现差异

#### 强耦合（1:1）

**`SKILL.md` 加委派步骤**（必须在）：
```markdown
## Operator: <agent-name> Agent
This skill is the **specification**. The actual work is done by
the `<agent-name>` agent (`agents/<agent-name>.md`), which:
- <agent 负责什么>
- 用什么工具
- 触发条件

Use `Agent(subagent_type="<agent-name>")` to invoke.
```

**Agent description 强制标注来源**：
```yaml
description: "<agent 做什么>. 由「<skill-name>」skill 驱动。当用户触发对应场景时，承接专项子任务执行。"
```

**`skill-mappings.json`**：
```json
{
  "<agent-name>": ["<skill-name>"]
}
```

#### 弱耦合（1:N）

**`SKILL.md` 不强制加委派步骤**（可以加，但不必须）。

**Agent description 不强制标 skill 源**（通用职责）：
```yaml
description: "<agent 通用职责>. 不绑定特定 skill，根据 context 决定使用哪些工具。"
```

**`skill-mappings.json`**：
```json
{
  "<agent-name>": ["<skill-1>", "<<skill-2>>", "<skill-3>"]
}
```

### 实际项目示例

#### 强耦合：stock-analyst ↔ stock-analyzer

```yaml
# agents/stock-analyst.md
description: "三维股票分析（基本面 / 新闻面 / 资金面）代理由 `stock-analyzer` skill 驱动。覆盖 A股 / 港股 / 美股及东方财富支持的全部市场。"

# skills/stock-analyzer/SKILL.md 有 7 步固定流程
# skills/stock-analyzer/SKILL.md frontmatter
metadata:
  required: true
```

```json
# agents/skill-mappings.json
{
  "stock-analyst": ["stock-analyzer"]
}
```

**特征**：skill 有 7 步固定流程 + 强 Output 一致性要求 + agent description 标"由 <skill> 驱动"。

#### 弱耦合：self-improver ↔ self-improvement

```yaml
# agents/self-improver.md
description: "反思当前会话、抽取学习点，按 spec 灵活决定。通用 agent 角色。"

# skills/self-improvement/SKILL.md
# Step 0: invoke 技能
# Step 1-3: 由 agent 自主决定 log 什么、归到哪
```

```json
# agents/skill-mappings.json
{
  "self-improver": ["self-improvement"]
}
```

**特征**：skill 是判断型 / 场景多，agent 自主灵活适配（不强求固定流程）。

---

## Step 1 — Author 规范写文件（必填格式）

所有资源严格固定路径 + 固定 Frontmatter 必填项，不可缺项。

| 资源类型 | 仓库文件位置 | Frontmatter 必填字段 |
|---|---|---|
| Skill | `<repo>/skills/<name>/SKILL.md` | name、description（inline），可选：origin、version |
| Agent | `<repo>/agents/<name>.md` | name、description、tools、model |
| Command | `<repo>/commands/<name>.md` | description，可选：argument-hint |
| Hook | `<repo>/hooks/<name>.json` | 标准 JSON 配置（无 frontmatter，合规结构即可） |

> 补充：所有路径都基于 **REPO 根目录**（`git rev-parse --show-toplevel`），不再写绝对路径。

---

## Step 2 — Manifest 注册（仅 Skill 需要）

Agent / Command / Hook 全程跳过此步骤，仅 Skill 需要手动注册模块路径。

### 2.1 模块主题匹配表（精准对应）

| 业务主题 | 对应模块 ID |
|---|---|
| 业务 / 金融 / 办公内容 | `business-content` |
| AI / 机器学习 | `machine-learning` |
| 安全审计 | `security` |
| 运维 / 部署 | `devops-infra` |
| 数据库 | `database` |
| 编程语言 / 框架 | `framework-language` |
| 测试 / 工作流质量 | `workflow-quality` |
| 任务编排 | `orchestration` |
| 智能体模式 | `agentic-patterns` |

### 2.2 注册操作

打开：`manifests/install-modules.json`

在对应模块的 `paths` 数组内新增一行：

```json
"skills/<your-name>"
```

> 补充：注册名要跟 `skills/<name>/` 目录名一致（区分大小写）。

---

## Step 3 — CI 合法性校验（必跑，防报错）

进入项目根目录，执行两条官方校验脚本，无 ERROR 即为通过，WARN 可忽略。

```bash
cd <repo>
node scripts/ci/validate-skills.js
node scripts/ci/validate-install-manifests.js
```

---

## Step 4 — Sync 本机同步

本步骤把仓库里**所有**用户资源同步到本机 Claude Code 能识别的目录。

### 4.1 模板（用环境变量 / 配置文件指定目标）

不同 Claude Code 配置可能用不同目录。**目标路径不再硬编码**，通过以下两种方式任选其一指定：

#### 方式 A：环境变量（推荐）

在终端跑脚本前，先设环境变量：

| 平台 | 命令 |
|---|---|
| **CMD (Windows)** | `set ECC_SYNC_DIR=%USERPROFILE%\.claude\custom-rules` |
| **PowerShell** | `$env:ECC_SYNC_DIR = "$env:USERPROFILE\.claude\custom-rules"` |
| **bash / zsh (macOS/Linux)** | `export ECC_SYNC_DIR="$HOME/.claude/custom-rules"` |

#### 方式 B：项目根目录的 `ecc.config.json`（多机共享）

在 ECC 仓库根目录建一个 `ecc.config.json`：

```json
{
  "syncDir": "~/.claude/custom-rules"
}
```

可能的值（按 Claude Code 实际位置选）：

| 值 | 适用 |
|---|---|
| `~/.claude/custom-rules` | 通用 Claude Code（默认） |
| `~/.claude/plugins` | Claude Code 插件模式 |
| `~/.config/claude/custom-rules` | Linux 某些发行版 |
| `%APPDATA%\claude\custom-rules` | Windows 某些版本 |
| 自定义路径 | 任何目录 |

### 4.2 默认行为（不配置时）

如果既没设环境变量，也没 `ecc.config.json`，按以下优先级推断：

1. `~/.claude/plugins`（插件模式，**优先**）
2. `~/.claude/custom-rules`（传统 custom-rules）
3. `~/.config/claude/custom-rules`

第一个存在的目录被自动采用。

### 4.3 同步命令

按上面模板配置好后，跑：

```bash
# 一键同步（根据配置自动决定目标）
node scripts/update-resource-index.js

# 或手动 cp（按配置的目标）
cp -r skills/<name>/ <ECC_SYNC_DIR>/skills/<name>/
cp agents/<name>.md <ECC_SYNC_DIR>/agents/<name>.md
cp -r skills/<name>/references/ <ECC_SYNC_DIR>/skills/<name>/references/
```

### 4.4 验证

```bash
# 检查同步结果
ls <ECC_SYNC_DIR>/skills/<name>/
cat <ECC_SYNC_DIR>/agents/<name>.md
```

> ⚠️ Step 4 的"成功标志"：所有用户资源（skills / agents / 引用文件）都出现在目标目录。
>
> 💡 **AI 辅助引导**（可选）：如果你不想手动跑这些命令，**直接告诉 Claude「帮我把 ECC 链接到本机 / 帮我加入本机」**，Claude 会按 Step 4.1 配置 + Step 4.3 命令一步步引导你完成。这是辅助方式，**不是替代手动流程**。

## Step 5 — Verify 全维度落地核验（最终自检清单）

全部打勾才算完成开发。

- ✅ 文件创建路径完全规范、无错目录
- ✅ Skill 已添加 manifest 注册条目（非 Skill 跳过）
- ✅ validate-skills.js 校验通过
- ✅ validate-install-manifests.js 校验通过
- ✅ 重启 Claude Code，开启全新会话
- ✅ Skill 关键词自动触发测试正常
- ✅ 含 Agent 场景：Agent(subagent_type=...) 调用测试正常

---

## 四类开发模式（全覆盖）—— v2.0 扩展

| 模式 | 触发条件 | 资源类型 | 落地清单 |
|---|---|---|---|
| **skill-only** | 纯规则 / 纯流程，无主观判断 | Skill | SKILL.md + manifest + 1 行 |
| **skill + agent 联动** | 有主观判断，按 spec 但 agent 动态决定 | Skill + Agent | SKILL.md + agent.md + manifest + 1 行（共 2 项）|
| **agent-only** | 独立人格 / 决策体 | Agent | agent.md 单文件 |
| **command / hook** | 触发器 / 钩子 | Command / Hook | 单文件 |

---

## Skill + Agent 标准联动规范（Standard 级）

### 1. SKILL.md 新增委派步骤

```markdown
## Operator: <agent-name> Agent
This skill is the **specification** (format, categories, promotion rules).
The actual logging work is done by the **`<agent-name>` agent**
(`agents/<agent-name>.md`), which:
- Reads recent context and decides what's worth logging
- Picks the correct file (LEARNINGS / ERRORS / FEATURE_REQUESTS)
- Applies the format spec below
- Generates IDs (TYPE-YYYYMMDD-XXX)
- Links related entries via See Also
- Suggests promotions when patterns repeat

Use `Agent(subagent_type="<agent-name>")` to invoke.
```

### 2. Agent description 强制标注来源

```yaml
description: "<agent 做什么>. 由「<skill-name>」skill 驱动。当用户触发对应场景时，承接专项子任务执行。"
```

### 3. Agent 委派子 agent 复盘

```js
Agent(
  subagent_type: "<agent-name>",
  prompt: <JSON payload>
)
```

---

## 各类资源改动总览表（终极对账）

| 开发类型 | 仓库改动内容 | 本机加载 |
|---|---|---|
| skill only | 仓库 → 本机 cp 同步 |
| agent only | 仓库 → 本机 cp 同步 |
| command only | 仓库 → 本机 cp 同步 |
| hook only | 仓库 → 本机 cp 同步 |
| **skill + agent 联动** | 仓库 → 本机 cp 同步 |

---

## 核心终极结论

1. **Skill 是唯一需要改 manifest 的资源**
2. **Agent/Command/Hook 均为目录全局注册，无需清单配置**
3. **联动核心**：Skill 作为调度入口，主动代码调用 Agent 子智能体
4. **所有开发必须经过**：分类→写文件→注册→CI→加载路径→核验 6 步闭环
5. **加载路径**：用 cp 同步到本机，跨设备靠 git pull
6. **agent 判定**：先看是否有主观判断，再决定 skill-only / skill+agent / agent-only

---

## 异常处理与故障排查（v2.0 新增）

按步骤做不会出错，但出错时怎么排查？本节覆盖 4 个常见异常场景。

### 1. CI 脚本报错排查

| 报错 | 原因 | 解决 |
|---|---|---|
| `Validating N skill directories` 然后卡住 | `validate-skills.js` 在解析某个 SKILL.md 卡住 | 找到哪个 SKILL.md 没有正确 frontmatter，修 YAML |
| `validate-skills.js: unexpected token` | SKILL.md 的 frontmatter 格式错（缺 `---` 闭合、缩进错）| 重新检查 frontmatter 必须是 `---` 开头闭合 |
| `validate-install-manifests.js: duplicated` | manifest 中同一 skill 重复注册 | grep 找重复项删除 |
| `validate-install-manifests.js: skill not referenced` | manifest 注册了 skill 但 `skills/<name>/` 不存在 | 二选一：删 manifest 注册 / 创建 skill 目录 |
| `node not found` | 当前目录不是仓库根 | cd 到能看到 `skills/` 的目录 |

### 2. 同步文件冲突处理

`scripts/update-resource-index.js` 同步到 `~/.claude/custom-rules/` 时可能冲突：

| 场景 | 处理 |
|---|---|
| **目标目录不存在** | 自动 `mkdir -p`（无需手动） |
| **目标已有同名文件** | 直接覆盖（**会丢失你本地的改动**）|
| **想保留本地版本** | 同步前先 `cp -r ~/.claude/custom-rules/skills/<name>/ skills/<name>/.bak` |
| **想跳过某些 skill** | 改 wrapper 脚本，注释掉对应行 |
| **想换同步目录** | 设 `ECC_SYNC_DIR` 环境变量 |

**建议**：同步前先 `git status` 看看 `.claude/custom-rules/` 有没有未提交改动。

### 3. 删除 / 重构旧 Skill/Agent 操作规范

**禁止**直接 `rm -rf` 删除 skill/agent 目录！这样会导致：
- 其他设备 `git pull` 后 references 全失效
- 历史 commit 无法恢复
- `--auto` 检测会再次标为"新加"

**正确删除流程**（4 步）：

1. **先在 manifest 移除注册**（`manifests/install-modules.json`）
2. **commit** 这次改动
3. **再删除目录**（`git rm -r skills/<name>/`）
4. **更新 baseline**（`ECC_BASELINE.json` 里也删掉，确认这是"已废弃"而非"未跟踪"）

**重构（改名）** 同样流程：
1. 新建 `skills/<new-name>/`（内容复制）
2. 更新 manifest
3. commit
4. 旧目录 `git rm`
5. 同步 baseline

### 4. 耦合关系变更后的迁移流程

当 agent 与 skill 的耦合度变化时（如强 → 弱）：

1. **更新 agent 描述**：去掉 "由「<skill>」skill 驱动" 句
2. **更新 skill frontmatter**：`metadata.required: true` → `metadata.optional: true`
3. **更新 `skill-mappings.json`**：1:1 改成 1:N（加其它关联 skill）
4. **SKILL.md 删 Operator 章节**（强耦合特有）
5. **commit 一次**（一个 PR 含所有变更）
6. **更新 `ECC_BASELINE.json`**（如果是原版资源）
7. **更新 `Agent-Skill-耦合方式决策知识库.md`** 的 §6 实际案例

---

## 版本迭代与兼容规范（v2.0 新增）

资源 version 字段怎么写？旧资源怎么废弃？新版本怎么发布？本节定义统一规则。

### 1. `version` 字段命名规范（SemVer）

格式：**`MAJOR.MINOR.PATCH`**（语义化版本）

| 位置 | 版本含义 | 示例 |
|---|---|---|
| `MAJOR` | 不兼容的 API / 行为变更 | 1.x.x → 2.0.0 |
| `MINOR` | 向下兼容的新功能 | 1.0.x → 1.1.0 |
| `PATCH` | 向下兼容的 bugfix | 1.0.0 → 1.0.1 |

**当前 baseline**：`ECC_BASELINE.json` 是 v1.0（首次发布）

### 2. 新旧资源兼容策略

新加 skill/agent 时：

- **新资源**：直接 commit，v1.0.0
- **修改现有资源（向下兼容）**：MINOR++
- **重写现有资源（不兼容）**：MAJOR++

**具体例子**：
- 加 `ppt-generator`（v1.0.0）：新增
- 改 `ppt-generator` 加新模板（v1.1.0）：功能增强
- 改 `ppt-generator` 改调用方式（v2.0.0）：破坏性

### 3. 废弃资源下线流程（Deprecation）

当某个 skill/agent 决定废弃时：

1. **第一阶段：标记废弃**（保留 3 个月）
   - frontmatter 加 `metadata.deprecated: "2026-12-31"`
   - description 加 "⚠️ DEPRECATED: 用 <new-name> 替代"
   - 仍可调用，但有警告

2. **第二阶段：删除**（3 个月后）
   - manifest 移除注册
   - 目录删除
   - 同步删除 `skill-mappings.json` 引用
   - 更新 `ECC_BASELINE.json`（标记为废弃而非"新加"）

3. **Git history 保留**：废弃 ≠ 删除 commit
   - 用 `git rm` 后 commit，保留历史
   - 需要找回可 `git log --diff-filter=D -- '*<name>*'`

### 4. 跨版本兼容

| 旧版本用户升级到新版本 | 操作 |
|---|---|
| v1.0 → v1.1（小版本） | 拉取即可，自动向后兼容 |
| v1.x → v2.0（大版本） | 看 CHANGELOG 检查 breaking changes，可能需手动迁移 |
| 旧 skill 不再被新 wrapper 引用 | 看 `skill-mappings.json` 调整 |

**CHANGELOG 位置**：项目根目录 `CHANGELOG.md`（v2.1+ 强制要求），按 semver 章节组织。

---

## 怎么重新生成 PDF

```bash
# 用 pandoc
pandoc sop-updated.md -o sop.pdf

# 或用 Typora / Obsidian / VSCode 的 md→pdf 扩展
# 然后把生成的 PDF 替换原 sop.pdf
```

---

**版本**：v2.0（cp 同步）  
**更新日期**：2026-07-25  
**主要变更**：Step 0 agent 判定扩展、Step 4 回到 cp 同步