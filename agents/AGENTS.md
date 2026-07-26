# ECC Agents Index

> 自动生成 · 最近更新：2026-07-26
> 数据源：`agents/` · 共 70 个 agent / 14 个类别

## 🆕 本次新增摘要

**3 个 agent 是新加的**（不在 `ECC_BASELINE.json` 里）：

| 资源名 | 类别 |
|---|---|
| `ecc-plugin-dev-agent` | test（测试与评估）|
| `self-improver` | meta（反思与知识管理）|
| `stock-analyst` | domain-analyst（领域分析）|

**9 个 binding 是新加的**：

| Agent | 绑定的 skill |
|---|---|
| `ecc-plugin-dev-agent` | `coupling-decider` |
| `ecc-plugin-dev-agent` | `ecc-plugin-dev-sop` |
| `ecc-plugin-dev-agent` | `file-templates` |
| `ecc-plugin-dev-agent` | `verify-checklist` |
| `marketing-agent` | `ppt-generator` |
| `self-improver` | `self-improvement` |
| `stock-analyst` | `deep-research` |
| `stock-analyst` | `market-research` |
| `stock-analyst` | `stock-analyzer` |

**总览**：70 个 agent / 14 个类别 / **3 个新 agent + 9 个新 binding**

## 使用说明

1. 在 `agents/<name>.md` 下新建 agent
2. agents 整体由 manifest 注册（`agents-core` 模块，`paths: ["agents"]`），**无需逐个登记**
3. 跑 `node scripts/generate-agents-readme.js` 重新生成本索引
4. cp 到本机：`cp agents/<name>.md ~/.claude/custom-rules/agents/<name>.md`

## Agent ↔ Skill 映射

自动扫描 agent .md 内容匹配 skill 目录名（反引号或 `skills/<name>` 形式）。
手动补充：编辑 `agents/skill-mappings.json`，key = agent 名，value = skill 名数组。
优先级：手动映射表 > 自动扫描。

## 类别清单

| # | 类别 | agent 数 | 主题 |
|---|------|---------|------|
| 1 | review | 23 | 代码评审 |
| 2 | build-fix | 12 | 构建修复 |
| 3 | plan | 6 | 规划架构 |
| 4 | test | 5 | 测试与评估 |
| 5 | meta | 4 | 反思与知识管理 |
| 6 | refactor | 4 | 重构 |
| 7 | gan | 3 | GAN 评估 |
| 8 | opensource | 3 | 开源工具 |
| 9 | docs | 2 | 文档与查询 |
| 10 | loop | 2 | 循环与 Harness |
| 11 | marketing | 2 | 营销与 SEO |
| 12 | design | 2 | 类型设计 |
| 13 | network | 1 | 网络诊断 |
| 14 | domain-analyst | 1 | 领域分析 |

**合计**：70 个 agent / 14 个类别

---

## 详细列表（按类别）

### review（23 个）— 代码评审

- code-reviewer — 代码评审: Expert code review specialist. Proactively reviews code for ... [sonnet]
  - 关联 skill: coding-standards（编码规范）, verification-loop（验证循环）
- cpp-reviewer — C++ 代码评审: Expert C++ code reviewer specializing in memory safety, mode... [sonnet]
- csharp-reviewer — C# 代码评审: Expert C# code reviewer specializing in .NET conventions, as... [sonnet]
  - 关联 skill: csharp-testing（C# 测试实践）, dotnet-patterns（.NET 模式）
- database-reviewer — 数据库评审: PostgreSQL database specialist for query optimization, schem... [sonnet]
  - 关联 skill: database-migrations（数据库迁移）, postgres-patterns（PostgreSQL 模式）
- django-reviewer — Django 代码评审: Expert Django code reviewer specializing in ORM correctness,... [sonnet]
- fastapi-reviewer — FastAPI 评审: Reviews FastAPI applications for async correctness, dependen... [sonnet]
- flutter-reviewer — Flutter 评审: Flutter and Dart code reviewer. Reviews Flutter code for wid... [sonnet]
  - 关联 skill: flutter-dart-code-review（Flutter/Dart 代码评审）
- fsharp-reviewer — F# 评审: Expert F# code reviewer specializing in functional idioms, t... [sonnet]
  - 关联 skill: dotnet-patterns（.NET 模式）, fsharp-testing（F# 测试实践）
- go-reviewer — Go 评审: Expert Go code reviewer specializing in idiomatic Go, concur... [sonnet]
- healthcare-reviewer — 医疗评审: Reviews healthcare application code for clinical safety, CDS... [opus]
- java-reviewer — Java 评审: Expert Java code reviewer for Spring Boot and Quarkus projec... [sonnet]
- kotlin-reviewer — Kotlin 评审: Kotlin and Android/KMP code reviewer. Reviews Kotlin code fo... [sonnet]
- mle-reviewer — ML 工程评审: Production machine-learning engineering reviewer for data co... [sonnet]
  - 关联 skill: documentation-lookup（文档查询）, mle-workflow（ML 工程工作流）
- network-config-reviewer — 网络配置评审: Reviews router and switch configurations for security, corre... [sonnet]
- php-reviewer — PHP 评审: Expert PHP code reviewer specializing in PSR-12 compliance, ... [sonnet]
  - 关联 skill: laravel-patterns（Laravel 模式）, laravel-security（Laravel 安全）, laravel-tdd（Laravel TDD）
- python-reviewer — Python 评审: Expert Python code reviewer specializing in PEP 8 compliance... [sonnet]
  - 关联 skill: python-patterns（Python 模式）
- react-reviewer — React 评审: Expert React/JSX code reviewer specializing in hook correctn... [sonnet]
  - 关联 skill: accessibility（无障碍访问）, react-patterns（React 模式）, react-testing（React 测试）
- rust-reviewer — Rust 评审: Expert Rust code reviewer specializing in ownership, lifetim... [sonnet]
- security-reviewer — 安全评审: Security vulnerability detection and remediation specialist.... [sonnet]
  - 关联 skill: security-review（安全评审）, security-scan（安全扫描）, gateguard（GateGuard 闸门）
- silent-failure-hunter — 静默失败狩猎: Review code for silent failures, swallowed errors, bad fallb... [sonnet]
- swift-reviewer — Swift 评审: Expert Swift code reviewer specializing in protocol-oriented... [sonnet]
  - 关联 skill: swift-concurrency-6-2（Swift Concurrency 6.2）, swift-protocol-di-testing（Swift 协议 DI 测试）, swiftui-patterns（SwiftUI 模式）
- typescript-reviewer — TypeScript 评审: Expert TypeScript/JavaScript code reviewer specializing in t... [sonnet]
  - 关联 skill: backend-patterns（后端架构模式）, coding-standards（编码规范）, frontend-patterns（前端模式）
- vue-reviewer — Vue 评审: Expert Vue.js code reviewer specializing in Composition API ... [sonnet]
  - 关联 skill: vue-patterns（Vue 模式）

### build-fix（12 个）— 构建修复

- build-error-resolver — 构建错误修复: Build and TypeScript error resolution specialist. Use PROACT... [sonnet]
- cpp-build-resolver — C++ 构建修复: C++ build, CMake, and compilation error resolution specialis... [sonnet]
- dart-build-resolver — Dart 构建修复: Dart/Flutter build, analysis, and dependency error resolutio... [sonnet]
- django-build-resolver — Django 构建修复: Django/Python build, migration, and dependency error resolut... [sonnet]
- go-build-resolver — Go 构建修复: Go build, vet, and compilation error resolution specialist. ... [sonnet]
- harmonyos-app-resolver — HarmonyOS 应用修复: HarmonyOS application development expert specializing in Ark... [sonnet]
- java-build-resolver — Java 构建修复: Java/Maven/Gradle build, compilation, and dependency error r... [sonnet]
- kotlin-build-resolver — Kotlin 构建修复: Kotlin/Gradle build, compilation, and dependency error resol... [sonnet]
- pytorch-build-resolver — PyTorch 构建修复: PyTorch runtime, CUDA, and training error resolution special... [sonnet]
- react-build-resolver — React 构建修复: Diagnose and fix React build failures across Vite, webpack, ... [sonnet]
  - 关联 skill: frontend-patterns（前端模式）, react-patterns（React 模式）
- rust-build-resolver — Rust 构建修复: Rust build, compilation, and dependency error resolution spe... [sonnet]
- swift-build-resolver — Swift 构建修复: Swift/Xcode build, compilation, and dependency error resolut... [sonnet]
  - 关联 skill: swift-actor-persistence（Swift Actor 持久化）, swift-concurrency-6-2（Swift Concurrency 6.2）

### plan（6 个）— 规划架构

- a11y-architect — 无障碍架构师: Accessibility Architect specializing in WCAG 2.2 compliance ... [sonnet]
  - 关联 skill: accessibility（无障碍访问）
- architect — 架构师: Software architecture specialist for system design, scalabil... [opus]
  - 关联 skill: architecture-decision-records（架构决策记录）, agentic-patterns
- code-architect — 代码架构师: Designs feature architectures by analyzing existing codebase... [sonnet]
- homelab-architect — 家庭网络架构: Designs home and small-lab network plans from hardware inven... [sonnet]
  - 关联 skill: homelab-network-readiness（家庭网络就绪）, homelab-network-setup（家庭网络搭建）, network-config-validation（网络配置校验）, network-interface-health（网络接口健康）
- network-architect — 网络架构: Designs enterprise or multi-site network architecture from r... [sonnet]
  - 关联 skill: cisco-ios-patterns（Cisco IOS 模式）, netmiko-ssh-automation（Netmiko SSH 自动化）, network-bgp-diagnostics（BGP 诊断）, network-config-validation（网络配置校验）, network-interface-health（网络接口健康）
- planner — 规划师: Expert planning specialist for complex features and refactor... [opus]
  - 关联 skill: plan-canvas（规划画布）, plan-orchestrate（编排规划）, ecc-guide（ECC 指南）

### test（5 个）— 测试与评估

- agent-evaluator — Agent 评测器: Evaluates agent output against 5-axis quality rubric (accura... [sonnet]
  - 关联 skill: agent-self-evaluation（Agent 自评）
- e2e-runner — E2E 测试运行: End-to-end testing specialist using Vercel Agent Browser (pr... [sonnet]
  - 关联 skill: e2e-testing（端到端测试）
- ecc-plugin-dev-agent — 插件开发 🟢 **新加**: "ECC 插件开发 orchestrator。引导用户走完新增/改造 Skill/Agent/Hook/Command ... [sonson]
  - 关联 skill: ecc-plugin-dev-sop 🟢 **新加**, coupling-decider 🟢 **新加**, file-templates 🟢 **新加**, verify-checklist 🟢 **新加**
- pr-test-analyzer — PR 测试分析: Review pull request test coverage quality and completeness, ... [sonnet]
- tdd-guide — TDD 指南: Test-Driven Development specialist enforcing write-tests-fir... [sonnet]
  - 关联 skill: tdd-workflow（TDD 工作流）, verification-loop（验证循环）

### meta（4 个）— 反思与知识管理

- chief-of-staff — 幕僚长: Personal communication chief of staff that triages email, Sl... [sonnet]
- conversation-analyzer — 对话分析: Use this agent when analyzing conversation transcripts to fi... [haiku]
- performance-optimizer — 性能优化: Performance analysis and optimization specialist. Use PROACT... [sonnet]
- self-improver — 由 🟢 **新加**: "Reflects on the current session to extract learnings, error... [sonnet]
  - 关联 skill: self-improvement 🟢 **新加**

### refactor（4 个）— 重构

- code-explorer — 代码探索器: Deeply analyzes existing codebase features by tracing execut... [sonnet]
- code-simplifier — 代码简化: Simplifies and refines code for clarity, consistency, and ma... [sonnet]
- comment-analyzer — 注释分析: Analyze code comments for accuracy, completeness, maintainab... [haiku]
- refactor-cleaner — 重构清理: Dead code cleanup and consolidation specialist. Use PROACTIV... [sonnet]

### gan（3 个）— GAN 评估

- gan-evaluator — GAN 评测器: "GAN Harness — Evaluator agent. Tests the live running appli... [sonnet]
- gan-generator — GAN 生成器: "GAN Harness — Generator agent. Implements features accordin... [sonnet]
- gan-planner — GAN 规划器: "GAN Harness — Planner agent. Expands a one-line prompt into... [sonnet]

### opensource（3 个）— 开源工具

- opensource-forker — 开源 Fork: Fork any project for open-sourcing. Copies files, strips sec... [haiku]
- opensource-packager — 开源打包: Generate complete open-source packaging for a sanitized proj... [haiku]
- opensource-sanitizer — 开源清理: Verify an open-source fork is fully sanitized before release... [sonnet]

### docs（2 个）— 文档与查询

- doc-updater — 文档更新: Documentation and codemap specialist. Use PROACTIVELY for up... [haiku]
- docs-lookup — 文档查询: When the user asks how to use a library, framework, or API o... [haiku]

### loop（2 个）— 循环与 Harness

- harness-optimizer — Harness 优化: Analyze and improve the local agent harness configuration fo... [sonnet]
- loop-operator — 循环操作: Operate autonomous agent loops, monitor progress, and interv... [sonnet]

### marketing（2 个）— 营销与 SEO

- marketing-agent — 营销 Agent: Marketing strategist and copywriter for campaign planning, a... [sonnet]
  - 关联 skill: marketing-campaign（营销活动）, content-engine（内容引擎）, ppt-generator 🟢 **新加**
- seo-specialist — SEO 专家: SEO specialist for technical SEO audits, on-page optimizatio... [sonnet]
  - 关联 skill: seo（SEO 优化）, content-engine（内容引擎）

### design（2 个）— 类型设计

- spec-miner — 规约提取: Extracts behavioral specs from existing codebases for OpenSp... [opus]
  - 关联 skill: codebase-onboarding（代码库上手）
- type-design-analyzer — 类型设计分析: Analyze type design for encapsulation, invariant expression,... [sonnet]

### network（1 个）— 网络诊断

- network-troubleshooter — 网络故障排查: Diagnoses network connectivity, routing, DNS, interface, and... [sonnet]

### domain-analyst（1 个）— 领域分析

- stock-analyst — 股票分析师 🟢 **新加**: 三维股票分析（基本面 / 新闻面 / 资金面）代理由 `stock-analyzer` skill 驱动，覆盖 A股 /... [sonnet]
  - 关联 skill: stock-analyzer（全球股票综合分析工具） 🟢 **新加**, market-research（市场研究） 🟢 **新加**, deep-research（深度研究） 🟢 **新加**

---

## 🆕 新增清单（最近添加）

最近一次或近期新增的资源在主列表中以 🟢 **新加** 标注，并集中列在此处方便快速回顾。

### Agent 新增

| 资源名 | 类别 | 描述（来自 description） | 加入日期 |
|---|---|---|---|
| `ecc-plugin-dev-agent` | test（测试与评估） | "ECC 插件开发 orchestrator。引导用户走完新增/改造 Skill/Agent/Hook/Command 的完整 6 步流程：分类、耦合判定、写文... | 2026-07-26 |
| `self-improver` | meta（反思与知识管理） | "Reflects on the current session to extract learnings, errors, and feature reque... | 2026-07-26 |
| `stock-analyst` | domain-analyst（领域分析） | 三维股票分析（基本面 / 新闻面 / 资金面）代理由 `stock-analyzer` skill 驱动，覆盖 A股 / 港股 / 美股及东方财富支持的全部市场... | 2026-07-26 |

### Agent ↔ Skill 绑定更新

| Agent | 新增绑定的 skill | 日期 |
|---|---|---|
| `ecc-plugin-dev-agent` | `coupling-decider` | 2026-07-26 |
| `ecc-plugin-dev-agent` | `ecc-plugin-dev-sop` | 2026-07-26 |
| `ecc-plugin-dev-agent` | `file-templates` | 2026-07-26 |
| `ecc-plugin-dev-agent` | `verify-checklist` | 2026-07-26 |
| `marketing-agent` | `ppt-generator` | 2026-07-26 |
| `self-improver` | `self-improvement` | 2026-07-26 |
| `stock-analyst` | `deep-research` | 2026-07-26 |
| `stock-analyst` | `market-research` | 2026-07-26 |
| `stock-analyst` | `stock-analyzer` | 2026-07-26 |

> 💡 提示：新增 agent / binding = 当前 manifest / skill-mappings.json 里**不在 `ECC_BASELINE.json`** 的。git pull 自动同步，无 state 文件，跨设备一致。
