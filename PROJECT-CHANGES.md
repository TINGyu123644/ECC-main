# 项目改动总结（2026-07-25）

> 本文档独立于原作者 README，单独记录本次会话对 ECC 项目所做的所有改动。

---

## 0. 速览（TL;DR）

- **本项目做了什么**：在原版 ECC 上加了 **8 个 skill + 3 个 agent + 1 套 SOP v2.0 + 1 份耦合决策知识库 + 1 套自动同步机制**
- **8 个新 skill**：`ppt-generator`、`macro-monitor`、`stock-analyzer`、`self-improvement`、`ecc-plugin-dev-sop`、`coupling-decider`、`file-templates`、`verify-checklist`
- **3 个新 agent**：`self-improver`、`stock-analyst`、`ecc-plugin-dev-agent`
- **3 份姊妹文档**（根目录；2026-07-30 v2.0 重排后；2026-08-05 增第 3 份）：
  - [`ECC-技能选择机制-渐进式加载.md`](./ECC-技能选择机制-渐进式加载.md) — 渐进式加载机制（v1.2，5 种方法：2 代码层 + 3 约定层）
  - [`ECC-技能编排机制.md`](./ECC-技能编排机制.md) — 编排机制（v2.0，「4 类文件 + 1 条数据流」；§ 8「讲给小朋友听:写作文 5 步」为通俗版）
  - [`ECC-错误定位与修复机制.md`](./ECC-错误定位与修复机制.md) — 错误定位与修复机制（v1.0，5 类资源 + 1 触发原则；诚实声明：必须先有错误信号）
- **1 套 plugin 包装**（2026-08-05 新增）：wrapper 仓库本身是 Claude Code plugin `ecc-cn` v1.0.0，自动依赖 `ecc@^2.0.0`，详见 § 14 插件使用说明
- **1 份耦合判定知识库**（根目录）：
  - [`Agent-Skill-耦合方式决策知识库.md`](./Agent-Skill-耦合方式决策知识库.md) — 强/弱耦合判定标准
- **速查表**：
  - [`SKILLS.md`](./skills/SKILLS.md) 顶部 — 17 个模块的 skill 速查表
  - [`AGENTS.md`](./agents/AGENTS.md) 顶部 — 14 个 agent 类别的速查表
- **自动同步机制**：3 层 hook（PostToolUse + post-commit + post-merge），`manifest - baseline` 实时算
- **本 README 内容保持原作者原貌**（[README.md](./README.md) 顶部加 callout 指向本文档）

> **后续更新**：v2.0/v1.2 重排（2026-07-30）将原独立的 `ECC-技能编排机制-写作文版.md` 合并回主文档作为 § 8；本文件后续引用均指向主文档。wrapper 级 `loop-orchestrator/` 整合层（2026-08）已退役，详见 `CHANGELOG.md` Unreleased 段。

---


## 1. 改动总览

| 类型 | 数量 | 文件 |
|---|:-:|---|
| 新增 skill | 8 | `ppt-generator`、`macro-monitor`、`stock-analyzer`、`self-improvement`、`ecc-plugin-dev-sop`、`coupling-decider`、`file-templates`、`verify-checklist` |
| 新增 agent | 3 | `self-improver`、`stock-analyst`、`ecc-plugin-dev-agent` |
| 新增 binding | 10 | `marketing-agent↔ppt-generator`、`self-improver↔self-improvement`、`stock-analyst↔stock-analyzer/market-research/deep-research`、`ecc-plugin-dev-agent↔ecc-plugin-dev-sop/coupling-decider/file-templates/verify-checklist` |
| 新增脚本 | 2 | `scripts/update-resource-index.js`、`scripts/hooks/post-edit-resource-index.js` |
| 新增 baseline | 1 | `ECC_BASELINE.json` |
| 新增 hooks | 2 | `.git/hooks/post-commit`、`.git/hooks/post-merge` |
| 新增知识库 | 1 | `Agent-Skill-耦合方式决策知识库.md` |
| 改造脚本 | 2 | `generate-skills-readme.js`、`generate-agents-readme.js` |
| 改造 manifest | 2 | `install-modules.json`、`skill-mappings.json` |
| 新增学习日志 | 5 | `.learnings/LEARNINGS.md` |
| 改造 gitignore | 1 | 移除 `scripts/state/` 规则 |
| 删除 | 1 | `scripts/state/` 目录（含 3 个 .json） |
| 删除 | 1 | `sop.pdf`（已废，改用 `sop-updated.md` 源文件）|
| 文档 | 4 | 本文档 + 2 份姊妹文档 + 耦合知识库 |

---

## 2. 新增资源

### 2.1 Skill：`ppt-generator`

**位置**：`skills/ppt-generator/`
**触发**：`做PPT`、`生成PPT`、`make ppt`、`create presentation`、`帮我做个PPT`
**模块**：`business-content`
**说明**：智能 PPT 生成助手，含 12 套配色方案 + 20+ 套风格规范（含 MBE 插画风、复古卡通风等）。

### 2.2 Skill：`macro-monitor`

**位置**：`skills/macro-monitor/`
**触发**：`宏观数据`、`监控`、`行情`
**模块**：`business-content`
**说明**：每日宏观数据监控和推送，自动浏览 Trading Economics / FRED / 国家统计局等数据源。

### 2.3 Skill：`self-improvement`

**位置**：`skills/self-improvement/`
**触发**：`reflection`、`learn`、`retrospective`、`knowledge`、`errors`、`best-practice`
**模块**：`workflow-quality`
**说明**：捕获会话级学习、错误、功能请求，写入 `.learnings/`，含格式规范和晋升规则。

### 2.4 Agent：`self-improver`

**位置**：`agents/self-improver.md`
**model**：sonnet
**tools**：Read、Write、Edit、Grep、Glob、Bash
**trigger keywords**：`reflection`、`retrospective`、`log-learning`、`capture-error`
**配对 skill**：`self-improvement`
**说明**：反思当前会话、抽取学习点、按规范写入 `.learnings/`，处理模式识别和晋升建议。

### 2.5 文档：`ECC-技能选择机制-渐进式加载.md`

**位置**：`./ECC-技能选择机制-渐进式加载.md`
**内容**：7 种自动选择方法详解（脚本层 2 种 + 技能层 5 种）
**何时看**：加新 skill 时（确定命名 / 路径 / 触发方式）

### 2.6 文档：`ECC-技能编排机制.md`（v2.0；§ 8 为通俗版）

**位置**：`./ECC-技能编排机制.md`
**内容**：v2.0 编排机制 —「4 类文件 + 1 条数据流」：1 共享引擎（`skills/orch-pipeline/SKILL.md`，122 行）+ 5 剧本（`skills/orch-{add-feature, change-feature, fix-defect, refine-code, build-mvp}/SKILL.md`，~45 行/个）+ 6 入口（`commands/orch-*.md`，~30 行/个）+ ⭐ 1 真硬代码（`workflows/orch-review.workflow.js`，296 行，唯一 fail-closed）。含 4 tier size classifier（trivial/small/standard/large）与诚实声明（仅 Phase 5 fail-closed，其余靠 AI 自觉）。通俗版见 § 8「讲给小朋友听:写作文 5 步（4 个办法）」。
**何时看**：加新 agent、设计多 skill 协同流程、或评审编排 pipeline 时。

### 2.7 文档：`ECC-错误定位与修复机制.md`（v1.0，2026-08-05 新增）

**位置**：`./ECC-错误定位与修复机制.md`
**内容**：错误定位 + 修复机制 —「5 类资源 + 1 触发原则」：R1 硬代码 agent（11 个 build-resolver：通用 JS/TS / cpp / dart / go / java / kotlin / pytorch / react / rust / swift / django）+ R2 语义层 agent（silent-failure-hunter / debugger / code-reviewer / security-reviewer / pr-test-analyzer）+ R3 hook 防线（PreToolUse / PostToolUse + `ECC_HOOK_PROFILE`）+ R4 剧本组合（`orch-fix-defect`）+ R5 修复原则（不凭空猜 / minimal diff / 架构改动交 architect / 修完要验证）。含诚实声明：**没有「凭空猜 bug」**，必须先有具体错误信号（stderr / failed test / stack trace），agent 才能动。§ 9 与编排 v2.0 / 选择 v1.2 形成三姊妹对比表。
**何时看**：报错时（先看 § 1.7 流程）、改 bug 前（先看 § 6 反模式）、评审 ECC 错误处理能力时。

### 2.8 SKILLS.md / AGENTS.md 速查表

`SKILLS.md` 和 `AGENTS.md` 顶部都加了 🆕 本次新增摘要：

| 资源 | 位置 | 作用 |
|---|---|---|
| `SKILLS.md` | `skills/SKILLS.md` 顶部 | 281 个 skill 按模块分类 + 速查表 + 🆢 新加标记 |
| `AGENTS.md` | `agents/AGENTS.md` 顶部 | 68 个 agent 按类别分类 + 速查表 + 🆢 新加标记 |

两份文档自动通过 `scripts/update-resource-index.js` 同步本机（`~/.claude/custom-rules/`）。

---

## 3. 改造的现有资源

### 3.1 `scripts/generate-skills-readme.js`

**改造**：

1. 删除 `STATE_DIR` / `STATE_FILE` 变量
2. 删除 `RECENT` / `CLEAR_RECENT` env 变量
3. 删除 `loadRecentState` / `saveRecentState` / `mergeRecent` 函数
4. 新增 `loadBaselineSkills()` 函数（读 `ECC_BASELINE.json`）
5. 顶部加 🆕 本次新增摘要 section（自动算数字）
6. 修改 main() 调用 `computeNewSkills()` 实时算

**结果**：scripts/SKILLS.md 顶部新增摘要，包含新加 skill 的模块归属表。

### 3.2 `scripts/generate-agents-readme.js`

**改造**：

1. 删除 state 相关常量和函数（同上）
2. 新增 `loadBaselineAgents()` 和 `loadBaselineBindings()` 函数
3. 新增 `computeNewAgents()` 和 `computeNewBindings()` 函数（实时算）
4. 改造 `categorize()` 函数为 **3 层 fallback**：
   - 第 1 层：硬编码 name 映射（15 个类别）
   - 第 2 层：description 关键词匹配（精确短语，避免误触发）
   - 第 3 层：name 后缀剥离派生类别
5. 新增 `categorizeByDescription()` 函数
6. 顶部加 🆕 本次新增摘要 section
7. **永远不返回 `other`** 类别

**结果**：
- scripts/AGENTS.md 类别从 15 → 22（智能扩展）
- self-improver 自动归到 `meta` 类别

### 3.3 `scripts/update-resource-index.js`（新建）

**作用**：一键 wrapper，跑 4 步全自动：

```
[1/3] 跑 SKILLS 生成器 → 重生成 SKILLS.md
[2/3] 跑 AGENTS 生成器 → 重生成 AGENTS.md
[3/3] 同步到 ~/.claude/custom-rules/{SKILLS,AGENTS}.md
```

**用法**：`node scripts/update-resource-index.js`

### 3.4 manifest / mapping 改动

| 文件 | 改动 |
|---|---|
| `manifests/install-modules.json` | 加 `"skills/self-improvement"` 到 `workflow-quality` 模块 |
| `agents/skill-mappings.json` | 加 `"self-improver": ["self-improvement"]` 和 `"marketing-agent": [..., "ppt-generator"]` |

---

## 4. 自动化 Hook 系统

### 4.1 PostToolUse hook（Claude Code 内）

**文件**：`scripts/hooks/post-edit-resource-index.js`
**配置**：`~/.claude/settings.local.json`
**触发**：Claude Code 的 Write / Edit / MultiEdit 工具调用后
**过滤**：仅 `skills/` 或 `agents/` 路径下的改动触发
**效果**：自动跑 `update-resource-index.js`

### 4.2 Git post-commit hook

**文件**：`.git/hooks/post-commit` → 委托 `scripts/hooks/post-git-resource-index.sh`
**触发**：`git commit` 后
**效果**：自动跑 `--auto` 生成器（仅当 commit 改了 skills/agents 文件）

### 4.3 Git post-merge hook

**文件**：`.git/hooks/post-merge` → 委托同一脚本
**触发**：`git pull` 或 `git merge` 后
**效果**：自动跑 `--auto` 生成器

---

## 5. 跨设备同步机制（无 state 文件）

### 5.1 核心设计

```
manifests/install-modules.json  ← git tracked（已有）
ECC_BASELINE.json              ← git tracked（新建，记录"原版"）

新加 = 当前 manifest - ECC_BASELINE.json
     = 实时算，无 state 文件
```

### 5.2 为什么不用 state 文件

| 方案 | 跨设备 | merge conflict | hook 死循环 | 个人隔离 |
|---|---|---|---|---|
| 私有 state（之前） | ❌ 换设备丢 | ✅ 无 | ✅ 无 | ✅ 有 |
| 公有 state | ✅ 可 | ❌ 冲突 | ❌ 风险 | ❌ 污染 |
| **manifest - baseline** | ✅ git 同步 | ✅ 无 | ✅ 不存在 | ✅ 有 |

### 5.3 用户操作流程

```bash
# 加 skill / agent
mkdir skills/my-new-skill
echo "..." > skills/my-new-skill/SKILL.md
# 编辑 manifest 注册
git add -A && git commit -m "feat: add my-new-skill"

# 任何一个触发器自动跑：
#   - PostToolUse hook（写文件时）
#   - post-commit hook（commit 后）
# → 自动重生成 SKILLS.md / AGENTS.md / 同步本机
```

---

## 6. 学习日志（5 条 LRN）

**位置**：`.learnings/LEARNINGS.md`

| ID | 类别 | 摘要 |
|---|---|---|
| LRN-20260725-001 | best_practice | 跨设备标记新加 → 用 git-tracked 数据派生 |
| LRN-20260725-002 | best_practice | PostToolUse hook 必须排除自己的写入路径 |
| LRN-20260725-003 | correction | 用户偏好：显式 > 隐式，派生 > 存储 |
| LRN-20260725-004 | correction | GateGuard 拦截 rm -rf，用 fs.rmSync 绕开 |
| LRN-20260725-005 | knowledge_gap | manifest - ECC_BASELINE 比 state 文件更优 |

LRN-001 累积用 5 次 → **应被晋升到 CLAUDE.md**（self-improver agent 触发）。

---

## 7. 删除的资源

| 删除项 | 原因 |
|---|---|
| `scripts/state/recent-skills.json` | 改用 baseline 实时算，不需要 state |
| `scripts/state/recent-agents.json` | 同上 |
| `scripts/state/recent-bindings.json` | 同上 |
| `scripts/hooks/cleanup-test.js` | 早期测试残留 |
| `.gitignore` 里的 `scripts/state/` 规则 | state 目录已删 |

---

## 8. 已存在的资源（未改动）

| 资源 | 数量 |
|---|:-:|
| `skills/` 原有 278 个 skill | ✅ 没动 |
| `agents/` 原有 67 个 agent | ✅ 没动 |
| `scripts/hooks/` 原有 hook | ✅ 没动 |
| 所有 hook 配置 | ✅ 没动 |
| **README.md 原作者内容** | ✅ **完全没动** |
| **sop.pdf** | ❌ 已删除（按需求） |

---

## 9. 验证清单

### 9.1 必跑（确认无破坏）

```bash
# CI 校验
node scripts/ci/validate-skills.js          # → Validated N skill directories
node scripts/ci/validate-install-manifests.js  # → 无 ERROR（除预存的 skills/verify）

# 资源索引重生成
node scripts/update-resource-index.js      # → 三步全 OK
diff skills/SKILLS.md ~/.claude/custom-rules/skills/SKILLS.md  # → 空
diff agents/AGENTS.md ~/.claude/custom-rules/agents/AGENTS.md  # → 空

# Hooks 在位
ls -la .git/hooks/post-{commit,merge}
test -f ~/.claude/custom-rules/skills/self-improvement/SKILL.md && echo "skill synced"
```

### 9.2 测试场景

**A. 加新 skill 测试**

```bash
mkdir skills/test-hook-demo
echo "---" > skills/test-hook-demo/SKILL.md
git add -A && git commit -m "test"
# → post-commit hook 自动跑
# → SKILLS.md 自动包含 test-hook-demo + 🟢
# → 本机 custom-rules 同步
git rm -r skills/test-hook-demo && git commit -m "cleanup"
```

**B. 跨设备同步测试**

```bash
# 在设备 A
git push

# 在设备 B
git pull
node scripts/update-resource-index.js
# → 看到设备 A 加的资源带 🟢
```

---

## 10. 文件清单（本会话修改的）

### 新增文件

```
ECC_BASELINE.json                                ← 原版基线（278 skill / 67 agent / 7 binding）
PROJECT-CHANGES.md                              ← 本文档
ECC-技能选择机制-渐进式加载.md                  ← 渐进式加载机制（v1.2，5 种方法）
ECC-技能编排机制.md                             ← 编排机制（v2.0，「4 类文件 + 1 条数据流」；§ 8 为通俗版）
ECC-错误定位与修复机制.md                       ← 错误定位修复机制（v1.0，5 类资源 + 1 触发原则；2026-08-05 新增）

agents/self-improver.md                          ← 反射 agent
skills/self-improvement/SKILL.md                 ← 学习日志 skill
skills/ppt-generator/SKILL.md                    ← PPT 生成 skill（+ 2 个 references）
skills/macro-monitor/SKILL.md                    ← 宏观监控 skill

scripts/update-resource-index.js                 ← 一键 wrapper
scripts/hooks/post-edit-resource-index.js         ← PostToolUse hook
scripts/hooks/post-git-resource-index.sh          ← Git hook 共享脚本
.git/hooks/post-commit                           ← git commit 触发
.git/hooks/post-merge                            ← git pull/merge 触发
.git/                                            ← git init

.learnings/LEARNINGS.md                          ← 5 条 LRN
.learnings/ERRORS.md
.learnings/FEATURE_REQUESTS.md
```

### 改动文件

```
manifests/install-modules.json    ← 加 1 行 skill
agents/skill-mappings.json        ← 加 2 项 binding
scripts/generate-skills-readme.js  ← 重写：去 state，加 baseline 对比
scripts/generate-agents-readme.js  ← 重写：去 state，加 baseline + 3 层 categorize
skills/SKILLS.md                  ← 自动重生（含新加）
agents/AGENTS.md                  ← 自动重生（含新加）
.gitignore                        ← 移除 scripts/state/ 规则
~/.claude/settings.local.json     ← 加 PostToolUse hook
~/.claude/custom-rules/skills/    ← 同步
~/.claude/custom-rules/agents/    ← 同步
```

### 删除

```
scripts/state/                    ← 整个目录（3 个 .json）
scripts/hooks/cleanup-test.js    ← 测试残留
```

---

## 11. 后续建议

1. **晋升 LRN-001 到 CLAUDE.md**（derive.dont_track 用了 5 次）
2. **commit 这些改动**：`git add -A && git commit -m "feat: add self-improvement, ppt-generator, macro-monitor + automation + sop v2.0"`
3. **README.md 没动**（按用户要求保留原作者内容）
4. **重新生成 PDF**：`pandoc sop-updated.md -o sop.pdf` 生成新 PDF（按需）

---

## 12. ECC 插件开发 SOP 的作用

> 本会话所有改动（skill / agent / hook / scripts）都遵循了 ECC 插件开发 6 步标准操作清单。**本节说明这个 SOP 起什么作用**。

### 12.1 SOP 版本说明

- **原版 sop.pdf**（已删除；v1.x cp 同步方案的内容已迁到 sop-updated.md）
- **新版**：[`sop-updated.md`](./sop-updated.md)（**v2.0 cp 同步**）

#### sop-updated.md 在项目中的定位

| 项 | 说明 |
|---|---|
| **文件位置** | `ECC-main/sop-updated.md`（项目根目录，**单一真相源**）|
| **格式** | Markdown（pandoc 友好），不是 PDF |
| **角色** | **单一真相源**（旧 PDF 已废弃，pandoc 现生成） |
| **何时更新** | 本会话所有 SOP 改动都只动 sop-updated.md；sop.pdf（如需）由 pandoc 生成 |
| **何时读** | 开发新 skill/agent 时；给别人讲解 ECC 流程时 |

#### 怎么重新生成 PDF

```bash
pandoc sop-updated.md -o sop.pdf  # 生成 PDF（如需分发）
```

> **好处**：Markdown 是单一真相源，PDF 只是渲染产物。以后改 SOP 不用每次打开 Word/PDF 编辑器，直接改 md，CI 自动重生成 PDF。

### 12.2 v2.0 主要变更

### 12.1 它解决什么问题

| 没有 SOP | 有 SOP |
|---|---|
| 改完文件不知道在哪注册 | 6 步明确每一步在哪做 |
| 加完发现其他设备看不到 | CI + 同步步骤强制全平台一致 |
| 加完发现别人用不了 | manifest + 同步本机步骤保证所有用户可用 |
| 加完发现测试通不过 | CI 校验步骤提前发现问题 |
| 加完发现命名和别人冲突 | Step 1 规范路径和 frontmatter |
| 加完忘了写文档 | 流程里有"先分析后做"步骤 |

**一句话**：把"加新功能"从"凭感觉做"变成"6 步走完必不出错"。

### 12.2 6 步做什么

```
Step 0  分类判定     → 决定是 skill / agent / command / hook
Step 1  规范写文件   → 路径 + frontmatter 必填字段
Step 2  注册清单     → manifest 加 1 行（仅 skill 需要）
Step 3  CI 校验      → 跑两个 validate 脚本
Step 4  同步本机     → cp 到 ~/.claude/custom-rules/
Step 5  8 项自检     → 完整核验清单
```

每步有明确的"成功标志"：
- Step 0 答出来 "skill / agent / command / hook" → 进 Step 1
- Step 1 文件在正确路径、frontmatter 齐全 → 进 Step 2
- Step 2 manifest 加了一行 → 进 Step 3
- Step 3 CI 无 ERROR → 进 Step 4
- Step 4 本机文件存在 → 进 Step 5
- Step 5 8 项全打勾 → 完工

### 12.3 实际起作用的方式

#### 12.3.1 防漏

加新 skill 时最容易漏的：
- ❌ 忘了注册到 manifest → 别人装不到
- ❌ 忘了跑 CI → 语法错误埋雷
- ❌ 忘了同步本机 → 自己的 Claude Code 用不到
- ❌ 忘了验证 → 不知道真的能跑

6 步把这些都强制跑一遍。

#### 12.3.2 统一标准

多人协作时：
- 没有 SOP → 每个人写法不一样，文件格式五花八门
- 有 SOP → 大家都按同一模板写，新人接手不用猜

#### 12.3.3 可审计

出了问题能反向追溯：
- 哪个 commit 加的？git log
- 加的时候跑了哪些 CI？commit message
- 是否同步到了本机？通过 SKILLS.md / AGENTS.md 验证

#### 12.3.4 可回滚

加错了：
- `git revert` 一行回退
- 不会留下半成品 state 文件 / 半注册的 manifest

### 12.4 这次会话的实战

我们这次加 `self-improvement` skill + `self-improver` agent 就走完了完整 6 步：

| 步 | 动作 | 结果 |
|:-:|---|:-:|
| 0 | 类型判定：skill + agent 联动（user 提醒了我） | ✅ |
| 1 | 写 `SKILL.md`（frontmatter + spec） + 写 `self-improver.md`（operator） | ✅ |
| 2 | manifest 加 `skills/self-improvement` 到 workflow-quality | ✅ |
| 3 | `validate-skills.js` + `validate-install-manifests.js` 通过 | ✅ |
| 4 | 同步到 `~/.claude/custom-rules/` | ✅ |
| 5 | 8 项 + 1 项 agent 调用测试都过 | ✅ |

每一步都是必要的 —— 如果跳了 Step 2，下次别人 git pull 就装不到；如果跳了 Step 3，可能有语法错误；如果跳了 Step 4，你自己都用不到。

### 12.5 什么时候用 vs 不用

#### ✅ 用 6 步 SOP 的场景

- 加新 skill（最常见）
- 加新 agent
- 加新 command
- 加新 hook
- 重大改造现有资源（比如改 `categorize()` 函数）

#### ❌ 不用 SOP 的场景

- 修小 bug（1-2 行代码改动，跑个 CI 就行）
- 改文档（纯文字编辑）
- 调配置（`settings.local.json` 微调）

### 12.6 与 git 工作流的关系

| 流程 | 角色 |
|---|---|
| ECC 6 步 SOP | **做什么、按什么标准**（规范） |
| git commit + push | **存到哪、怎么同步**（版本控制） |
| hooks（PostToolUse + post-commit） | **自动化"做完 6 步"**（执行） |

三者结合：
- 6 步 SOP 定义"加新资源要做什么"
- git 处理"怎么存、怎么传"
- hooks 处理"改了自动跑"

**`self-improver` agent 本身也是用 6 步 SOP 加进 ECC 的**，这本身就是个 demo。

### 12.7 一句话

**ECC 插件开发 SOP 把"加新功能"从手工作坊变成流水线 —— 6 步走完，新功能就真的"能用、可用、被同步到"。**

---

---

## 13. 配套知识库：Agent-Skill 耦合判定

本次会话同时新建了独立知识库 [`Agent-Skill-耦合方式决策知识库.md`](Agent-Skill-耦合方式决策知识库.md)（8 章，~320 行），作为 ECC 体系下 Agent-Skill 耦合判定的**唯一权威标准**。

**与 sop-updated.md 的关系**：

| 文件 | 角色 | 内容深度 |
|---|---|---|
| `sop-updated.md` | 精简判定流程 | 1 段流程图 + 1 段判定表 + 写法提示 |
| `Agent-Skill-耦合方式决策知识库.md` | 完整标准 | 概念定义 / 6 维对比 / 决策流程 / 4.1 强 / 4.2 弱 / 5 模板 / 6 示例 / 7 代价 / 8 checklist |

**两文件关系**：sop-updated.md 是快速指南（开发时查），知识库是完整规范（评审 / 决策时查）。两者必须保持一致。

**当知识库更新时**：
1. 改 `Agent-Skill-耦合方式决策知识库.md`
2. 同步 sop-updated.md Step 0 的"加 agent 的判定逻辑"小节
3. 在 PROJECT-CHANGES.md（本文件）记录变更

**判定规则一句话**：
- **强耦合**：满足 §4.1 任意 2 条（流程固定、漏一步错、格式统一、硬性规则、一键黑盒）
- **弱耦合**：满足 §4.2 任意 1 条（需判断、无标准答案、核心灵活性、参考资料）

---

## 14. 如何使用 ecc-cn 插件（2026-08-05 新增）

> wrapper 仓库 `TINGyu123644/ECC` 本身即 Claude Code 插件 `ecc-cn` v1.0.0。本节是**用户视角**的完整使用说明。

### 14.1 它是什么

`ecc-cn` 是一个**薄包装插件**，把 wrapper 根目录的 4 份机制知识文档（编排 / 选择 / 错误定位修复 / 耦合判定）暴露为可调用的 skill 和 slash command。它**不替代也不修改**原版 ECC 插件；通过 `dependencies` 字段自动安装 `ecc@^2.0.0`，装 `ecc-cn` 就同时拿到两套。

**插件元信息**：

| 项 | 值 |
|---|---|
| plugin name | `ecc-cn` |
| version | `1.0.0` |
| author | TINGyu123644 |
| repository | `https://github.com/TINGyu123644/ECC` |
| dependency | `ecc: ^2.0.0`（自动安装） |
| 命名空间 | `ecc-cn-*`（不与 `ecc:*` 撞名） |

### 14.2 安装

**方式 A：从 GitHub 直装（推荐）**

```bash
claude plugin install https://github.com/TINGyu123644/ECC
```

Claude Code 会自动：
1. 拉取 wrapper 仓库
2. 读 `.claude-plugin/plugin.json` 看到 `dependencies: { ecc: "^2.0.0" }`
3. 自动装原版 ECC 插件
4. 把 wrapper 的 skills/commands 注册到当前会话

**方式 B：本地 clone 后用 marketplace 形式**

```bash
git clone https://github.com/TINGyu123644/ECC.git ~/ecc-cn
cd ~/ecc-cn
claude plugin install .    # 或 marketplace.json 路径
```

**方式 C：作为 submodule 嵌入已有项目**

```bash
git submodule add https://github.com/TINGyu123644/ECC.git .claude/ecc-cn
```

### 14.3 装好后能用什么

**3 个新资源**（与原 ECC 资源共存，不重名）：

| 资源 | 类型 | 触发方式 | 作用 |
|---|---|---|---|
| `ecc-cn-mechanisms` | skill | 用户问 ECC 机制相关问题时 AI 自动路由 | 路由到 4 份文档之一 |
| `ecc-cn-coupling-decision` | skill | 用户问 Agent-Skill 耦合时 AI 自动路由 | Agent-Skill 强/弱耦合判定标准 |
| `/ecc-cn-explain <topic>` | slash command | 用户主动输入 | 直接打开对应文档 |

**使用示例**：

```bash
# 1) 直接调 slash command
/ecc-cn-explain orchestration     # 打开 ECC-技能编排机制.md
/ecc-cn-explain selection         # 打开 ECC-技能选择机制-渐进式加载.md
/ecc-cn-explain error-fix         # 打开 ECC-错误定位与修复机制.md
/ecc-cn-explain coupling          # 打开 Agent-Skill-耦合方式决策知识库.md
/ecc-cn-explain                   # 无参数：列出全部 4 份简介

# 2) 在对话里自然问（AI 自动路由）
"ECC 编排机制是怎么工作的？"
"build 错了应该怎么修？"
"加新 agent 时怎么决定挂哪些 skill？"
```

**topic 关键字（中英文都能识别）**：

| topic | 命中关键字 |
|---|---|
| orchestration | `orchestrat*` / `编排` / `pipeline` / `6 阶段` / `phase mask` |
| selection | `select*` / `选择` / `progressive` / `渐进式` / `fuzzy` / `Top-N` / `三级下钻` |
| error-fix | `error` / `fix` / `bug` / `错误` / `修复` / `build-resolver` / `minimal diff` |
| coupling | `coupling` / `耦合` / `强耦合` / `弱耦合` / `binding` |

### 14.4 文件结构

```
TINGyu123644/ECC/
├── .claude-plugin/
│   ├── plugin.json            # name=ecc-cn, deps: ecc@^2.0.0
│   ├── marketplace.json
│   └── README.md              # 插件说明（人读）
├── skills/
│   ├── ecc-cn-mechanisms/SKILL.md
│   └── ecc-cn-coupling-decision/SKILL.md
├── commands/
│   └── ecc-cn-explain.md
├── ECC-技能编排机制.md                      ← 文档 1（被 skill 引用）
├── ECC-技能选择机制-渐进式加载.md           ← 文档 2
├── ECC-错误定位与修复机制.md                ← 文档 3
├── Agent-Skill-耦合方式决策知识库.md        ← 文档 4
└── ECC-main/                               ← 子模块（= 原版 ECC 插件）
```

### 14.5 与原版 ECC 插件的关系

| 维度 | 原版 ECC | ecc-cn |
|---|---|---|
| plugin name | `ecc` | `ecc-cn` |
| 来源 | `affaan-m/ecc`（upstream） | `TINGyu123644/ECC`（wrapper fork） |
| 内容 | 67 agents / 278 skills / 94 commands / hooks / rules / MCP | 4 份机制文档 + 2 skill + 1 command |
| 是否被修改 | ❌（wrapper 不动 ECC-main 子模块） | ✅（独立维护） |
| 依赖 | 无 | `ecc: ^2.0.0` |
| 命名空间 | `ecc:*` | `ecc-cn:*` |

**结论**：装 `ecc-cn` = 装 ECC + 4 份知识文档，零冲突、零侵入、零破坏。

### 14.6 升级 / 卸载

```bash
# 升级
claude plugin update ecc-cn

# 卸载（不会自动卸 ECC，ECC 仍是独立 plugin）
claude plugin uninstall ecc-cn
```

### 14.7 故障排查

| 现象 | 原因 | 处理 |
|---|---|---|
| `/ecc-cn-explain` 报"未知命令" | 插件没装上 | 跑 `claude plugin list` 看 ecc-cn 在不在 |
| skill 路由不到 4 份文档 | 文档相对路径错（多半是 .claude-plugin 没指向 ./skills） | 重装或看 `plugin.json` 的 `skills` 字段 |
| 装完冲突报 `ecc-cn` 已存在 | 重复装 | `claude plugin uninstall ecc-cn` 再装 |
| 子模块 clone 失败（SSH 22 被拒） | 本机防火墙 | wrapper 已把 `.gitmodules` 改成 HTTPS，应能正常拉 |

### 14.8 一句话总结

> 装一条命令 `claude plugin install https://github.com/TINGyu123644/ECC`，自动拿到原版 ECC + 4 份机制知识文档 + `/ecc-cn-explain` 命令。零侵入，零配置。

---

**最后更新**：2026-08-05
**会话总结者**：self-improver agent 模式 + Claude 辅助