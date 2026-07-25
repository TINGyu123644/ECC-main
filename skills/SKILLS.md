# ECC Skills Index

> 自动生成 · 最近更新：2026-07-25
> 数据源：`manifests/install-modules.json` · 共 281 个 skill / 17 个模块

## 使用说明

1. 在 `skills/<name>/` 下新建 SKILL.md
2. 在 `manifests/install-modules.json` 对应模块的 `paths` 数组加 `"skills/<name>"`
3. 跑 `node scripts/generate-skills-readme.js` 重新生成本索引
4. 跑 CI: `node scripts/ci/validate-skills.js && node scripts/ci/validate-install-manifests.js`
5. cp 到本机：`cp -r skills/<name>/ ~/.claude/custom-rules/skills/<name>/`

## 模块清单

| # | 模块 | skill 数 | 主题 |
|---|------|---------|------|
| 1 | `framework-language` | 68 | 编程语言规范 |
| 2 | `database` | 7 | 数据库 |
| 3 | `workflow-quality` | 43 | 工作流质量 |
| 4 | `optimization-workflows` | 8 | 性能优化 |
| 5 | `security` | 20 | 安全 / 合规 |
| 6 | `research-apis` | 9 | 科研 / 检索 API |
| 7 | `business-content` | 17 | 业务 / 办公 / 金融 |
| 8 | `operator-workflows` | 19 | 运维工作流 |
| 9 | `prediction-market-skills` | 6 | 预测市场 |
| 10 | `social-distribution` | 3 | 社交分发 |
| 11 | `media-generation` | 8 | 媒体生成 |
| 12 | `swift-apple` | 7 | Apple 生态 |
| 13 | `agentic-patterns` | 36 | Agent 模式 / 编排 |
| 14 | `devops-infra` | 16 | DevOps / 网络 / K8s |
| 15 | `machine-learning` | 4 | ML 工程 |
| 16 | `supply-chain-domain` | 8 | 供应链 |
| 17 | `document-processing` | 2 | 文档处理 |

**合计**：281 个 skill / 17 个模块

---

## 详细列表（按模块）

### framework-language（68 个）

- android-clean-architecture — Android 整洁架构 ✅
- angular-developer — Angular 开发者指南 ✅
- api-design — API 设计模式 ✅
- backend-patterns — 后端架构模式 ✅
- coding-standards — 编码规范 ✅
- compose-multiplatform-patterns — Compose 多端模式 ✅
- csharp-testing — C# 测试实践 ✅
- fsharp-testing — F# 测试实践 ✅
- cpp-coding-standards — C++ 编码规范 ✅
- cpp-testing — C++ 测试实践 ✅
- dart-flutter-patterns — Dart/Flutter 模式 ✅
- django-patterns — Django 模式 ✅
- django-tdd — Django TDD 实践 ✅
- django-verification — Django 验收测试 ✅
- dotnet-patterns — .NET 模式 ✅
- fastapi-patterns — FastAPI 模式 ✅
- frontend-design-direction — 前端设计方向 ✅
- frontend-patterns — 前端模式 ✅
- frontend-slides — 前端幻灯片 ✅
- make-interfaces-feel-better — 界面体验优化 ✅
- motion-ui — 动效 UI ✅
- golang-patterns — Go 模式 ✅
- golang-testing — Go 测试 ✅
- java-coding-standards — Java 编码规范 ✅
- kotlin-coroutines-flows — Kotlin 协程与 Flow ✅
- kotlin-exposed-patterns — Kotlin Exposed 模式 ✅
- kotlin-ktor-patterns — Kotlin Ktor 模式 ✅
- kotlin-patterns — Kotlin 模式 ✅
- kotlin-testing — Kotlin 测试 ✅
- laravel-plugin-discovery — Laravel 插件发现 ✅
- laravel-patterns — Laravel 模式 ✅
- laravel-tdd — Laravel TDD ✅
- laravel-verification — Laravel 验收 ✅
- mcp-server-patterns — MCP 服务端模式 ✅
- nestjs-patterns — NestJS 模式 ✅
- perl-patterns — Perl 模式 ✅
- perl-testing — Perl 测试 ✅
- python-patterns — Python 模式 ✅
- python-testing — Python 测试 ✅
- quarkus-patterns — Quarkus 模式 ✅
- quarkus-tdd — Quarkus TDD ✅
- quarkus-verification — Quarkus 验收 ✅
- react-patterns — React 模式 ✅
- react-performance — React 性能 ✅
- react-testing — React 测试 ✅
- rust-patterns — Rust 模式 ✅
- rust-testing — Rust 测试 ✅
- springboot-patterns — Spring Boot 模式 ✅
- springboot-tdd — Spring Boot TDD ✅
- springboot-verification — Spring Boot 验收 ✅
- ui-to-vue — UI 转 Vue ✅
- vue-patterns — Vue 模式 ✅
- accessibility — 无障碍访问 ✅
- bun-runtime — Bun 运行时 ✅
- design-system — 设计系统 ✅
- django-celery — Django + Celery ✅
- flutter-dart-code-review — Flutter/Dart 代码评审 ✅
- frontend-a11y — 前端无障碍 ✅
- generating-python-installer — Python 安装包生成 ✅
- hexagonal-architecture — 六边形架构 ✅
- motion-advanced — 高级动效 ✅
- motion-foundations — 动效基础 ✅
- motion-patterns — 动效模式 ✅
- nextjs-turbopack — Next.js Turbopack ✅
- nuxt4-patterns — Nuxt 4 模式 ✅
- react-native-patterns — React Native 模式 ✅
- tinystruct-patterns — TinyStruct 模式 ✅
- vite-patterns — Vite 模式 ✅

### database（7 个）

- clickhouse-io — ClickHouse IO ✅
- database-migrations — 数据库迁移 ✅
- jpa-patterns — JPA 模式 ✅
- mysql-patterns — MySQL 模式 ✅
- postgres-patterns — PostgreSQL 模式 ✅
- prisma-patterns — Prisma 模式 ✅
- redis-patterns — Redis 模式 ✅

### workflow-quality（43 个）

- agent-sort — Agent 分类 ✅
- agent-introspection-debugging — Agent 内省调试 ✅
- ai-regression-testing — AI 回归测试 ✅
- configure-ecc — ECC 配置 ✅
- code-tour — 代码导览 ✅
- continuous-learning — 持续学习 ✅
- continuous-learning-v2 — 持续学习 v2 ✅
- council — Council 决策 ✅
- e2e-testing — 端到端测试 ✅
- error-handling — 错误处理 ✅
- eval-harness — 评测 Harness ✅
- hookify-rules — Hook 化规则 ✅
- iterative-retrieval — 迭代检索 ✅
- plan-canvas — 规划画布 ✅
- plankton-code-quality — Plankton 代码质量 ✅
- production-audit — 生产审计 ✅
- skill-scout — Skill 侦察 ✅
- skill-stocktake — Skill 盘点 ✅
- strategic-compact — 战略压缩 ✅
- tdd-workflow — TDD 工作流 ✅
- verification-loop — 验证循环 ✅
- windows-desktop-e2e — Windows 桌面 E2E ✅
- agent-self-evaluation — Agent 自评 ✅
- architecture-decision-records — 架构决策记录 ✅
- browser-qa — 浏览器 QA ✅
- ck — CK 模式 ✅
- click-path-audit — 点击路径审计 ✅
- codebase-onboarding — 代码库上手 ✅
- codehealth-mcp — 代码健康 MCP ✅
- config-gc — 配置 GC ✅
- context-budget — 上下文预算 ✅
- delivery-gate — 交付闸门 ✅
- ecc-guide — ECC 指南 ✅
- ecc-recipes — ECC 配方 ✅
- growth-log — 增长日志 ✅
- inherit-legacy-style — 继承遗留风格 ✅
- intent-driven-development — 意图驱动开发 ✅
- loop-design-check — 循环设计检查 ✅
- product-lens — 产品视角 ✅
- repo-scan — 仓库扫描 ✅
- rules-distill — 规则提炼 ✅
- santa-method — Santa 方法 ✅
- git-workflow — Git 工作流 ✅

### optimization-workflows（8 个）

- benchmark-optimization-loop — Benchmark 优化循环 ✅
- data-throughput-accelerator — 数据吞吐加速 ✅
- latency-critical-systems — 延迟关键系统 ✅
- parallel-execution-optimizer — 并行执行优化 ✅
- recursive-decision-ledger — 递归决策账本 ✅
- agent-eval — Agent 评测 ✅
- benchmark — 基准测试 ✅
- benchmark-methodology — 基准方法学 ✅

### security（20 个）

- defi-amm-security — DeFi AMM 安全 ✅
- django-security — Django 安全 ✅
- healthcare-phi-compliance — 医疗 PHI 合规 ✅
- hipaa-compliance — HIPAA 合规 ✅
- laravel-security — Laravel 安全 ✅
- llm-trading-agent-security — LLM 交易 Agent 安全 ✅
- nodejs-keccak256 — Node.js Keccak256 ✅
- perl-security — Perl 安全 ✅
- quarkus-security — Quarkus 安全 ✅
- security-review — 安全评审 ✅
- security-scan — 安全扫描 ✅
- security-bounty-hunter — 安全赏金猎人 ✅
- springboot-security — Spring Boot 安全 ✅
- evm-token-decimals — EVM 代币精度 ✅
- the-security-guide.md ❌ (missing SKILL.md)
- gateguard — GateGuard 闸门 ✅
- healthcare-cdss-patterns — 医疗 CDSS 模式 ✅
- healthcare-emr-patterns — 医疗 EMR 模式 ✅
- healthcare-eval-harness — 医疗评测 Harness ✅
- safety-guard — 安全守卫 ✅

### research-apis（9 个）

- deep-research — 深度研究 ✅
- exa-search — Exa 搜索 ✅
- research-ops — 研究运营 ✅
- scientific-db-pubmed-database — PubMed 数据库 ✅
- scientific-db-uspto-database — USPTO 数据库 ✅
- scientific-pkg-gget — gget 科学包 ✅
- scientific-thinking-literature-review — 文献综述思考 ✅
- scientific-thinking-scholar-evaluation — 学者评估思考 ✅
- documentation-lookup — 文档查询 ✅

### business-content（17 个）

- article-writing — 文章写作 ✅
- brand-voice — 品牌调性 ✅
- content-engine — 内容引擎 ✅
- investor-materials — 投资者材料 ✅
- investor-outreach — 投资者触达 ✅
- lead-intelligence — 线索情报 ✅
- product-capability — 产品能力 ✅
- social-graph-ranker — 社交图谱排序 ✅
- seo — SEO 优化 ✅
- market-research — 市场研究 ✅
- stock-analyzer — 全球股票综合分析工具 ✅ 🟢 **新加**
- brand-discovery — 品牌发现 ✅
- competitive-platform-analysis — 竞品平台分析 ✅
- competitive-report-structure — 竞品报告结构 ✅
- marketing-campaign — 营销活动 ✅
- macro-monitor — 宏观数据监控技能 ✅ 🟢 **新加**
- ppt-generator — 智能 ✅ 🟢 **新加**

### operator-workflows（19 个）

- automation-audit-ops — 自动化审计运营 ✅
- api-connector-builder — API 连接器构建 ✅
- connections-optimizer — 连接优化 ✅
- cost-tracking — 成本追踪 ✅
- customer-billing-ops — 客户计费运营 ✅
- dashboard-builder — 仪表盘构建 ✅
- ecc-tools-cost-audit — ECC 工具成本审计 ✅
- email-ops — 邮件运营 ✅
- finance-billing-ops — 财务计费运营 ✅
- github-ops — GitHub 运营 ✅
- google-workspace-ops — Google Workspace 运营 ✅
- jira-integration — Jira 集成 ✅
- knowledge-ops — 知识运营 ✅
- messages-ops — 消息运营 ✅
- project-flow-ops — 项目流运营 ✅
- terminal-ops — 终端运营 ✅
- unified-notifications-ops — 统一通知运营 ✅
- workspace-surface-audit — 工作区面审计 ✅
- mailtrap-email-integration — Mailtrap 邮件集成 ✅

### prediction-market-skills（6 个）

- ito-basket-compare — Ito 篮子对比 ✅
- ito-data-atlas-agent — Ito 数据地图 Agent ✅
- ito-market-intelligence — Ito 市场情报 ✅
- ito-trade-planner — Ito 交易规划 ✅
- prediction-market-oracle-research — 预测市场 Oracle 研究 ✅
- prediction-market-risk-review — 预测市场风险评审 ✅

### social-distribution（3 个）

- crosspost — 跨平台发布 ✅
- x-api — X (Twitter) API ✅
- social-publisher — 社交发布 ✅

### media-generation（8 个）

- blender-motion-state-inspection — Blender 动画状态检查 ✅
- fal-ai-media — Fal AI 媒体 ✅
- manim-video — Manim 视频 ✅
- remotion-video-creation — Remotion 视频创作 ✅
- ui-demo — UI 演示 ✅
- video-editing — 视频剪辑 ✅
- videodb — 视频数据库 ✅
- taste — 视觉审美 ✅

### swift-apple（7 个）

- foundation-models-on-device — 端侧基础模型 ✅
- liquid-glass-design — 液态玻璃设计 ✅
- swift-actor-persistence — Swift Actor 持久化 ✅
- swift-concurrency-6-2 — Swift Concurrency 6.2 ✅
- swift-protocol-di-testing — Swift 协议 DI 测试 ✅
- swiftui-patterns — SwiftUI 模式 ✅
- ios-icon-gen — iOS 图标生成 ✅

### agentic-patterns（36 个）

- scripts/claw.js ❌ (missing SKILL.md)
- agent-architecture-audit — Agent 架构审计 ✅
- agent-harness-construction — Agent Harness 构建 ✅
- agentic-engineering — Agentic 工程 ✅
- agentic-os — Agentic OS ✅
- ai-first-engineering — AI 优先工程 ✅
- autonomous-loops — 自主循环 ✅
- blueprint — 蓝图 ✅
- claude-devfleet — Claude DevFleet ✅
- content-hash-cache-pattern — 内容哈希缓存模式 ✅
- continuous-agent-loop — 持续 Agent 循环 ✅
- cost-aware-llm-pipeline — 成本感知 LLM 管道 ✅
- data-scraper-agent — 数据抓取 Agent ✅
- dynamic-workflow-mode — 动态工作流模式 ✅
- enterprise-agent-ops — 企业 Agent 运营 ✅
- nanoclaw-repl — NanoClaw REPL ✅
- prompt-optimizer — Prompt 优化 ✅
- ralphinho-rfc-pipeline — Ralphinho RFC 管道 ✅
- regex-vs-llm-structured-text — 正则 vs LLM 结构化文本 ✅
- search-first — 搜索优先 ✅
- team-agent-orchestration — 团队 Agent 编排 ✅
- token-budget-advisor — Token 预算顾问 ✅
- team-builder — 团队构建 ✅
- agent-payment-x402 — Agent 支付 x402 ✅
- autonomous-agent-harness — 自主 Agent Harness ✅
- gan-style-harness — GAN 风格 Harness ✅
- hermes-imports — Hermes 导入 ✅
- openclaw-persona-forge — OpenClaw 人格锻造 ✅
- opensource-pipeline — 开源流水线 ✅
- orch-add-feature — Orch 添加功能 ✅
- orch-build-mvp — Orch 构建 MVP ✅
- orch-change-feature — Orch 修改功能 ✅
- orch-fix-defect — Orch 修复缺陷 ✅
- orch-pipeline — Orch 流水线 ✅
- orch-refine-code — Orch 重构代码 ✅
- plan-orchestrate — 编排规划 ✅

### devops-infra（16 个）

- cisco-ios-patterns — Cisco IOS 模式 ✅
- deployment-patterns — 部署模式 ✅
- docker-patterns — Docker 模式 ✅
- homelab-network-readiness — 家庭网络就绪 ✅
- homelab-network-setup — 家庭网络搭建 ✅
- netmiko-ssh-automation — Netmiko SSH 自动化 ✅
- network-bgp-diagnostics — BGP 诊断 ✅
- network-config-validation — 网络配置校验 ✅
- network-interface-health — 网络接口健康 ✅
- canary-watch — 金丝雀观察 ✅
- flox-environments — Flox 环境 ✅
- homelab-pihole-dns — 家庭 Pi-hole DNS ✅
- homelab-vlan-segmentation — 家庭 VLAN 划分 ✅
- homelab-wireguard-vpn — 家庭 WireGuard VPN ✅
- kubernetes-patterns — K8s 模式 ✅
- uncloud — Uncloud ✅

### machine-learning（4 个）

- mle-workflow — ML 工程工作流 ✅
- ml-adoption-playbook — ML 采用手册 ✅
- pytorch-patterns — PyTorch 模式 ✅
- recsys-pipeline-architect — 推荐系统架构 ✅

### supply-chain-domain（8 个）

- carrier-relationship-management — 承运商关系管理 ✅
- customs-trade-compliance — 海关贸易合规 ✅
- energy-procurement — 能源采购 ✅
- inventory-demand-planning — 库存需求规划 ✅
- logistics-exception-management — 物流异常管理 ✅
- production-scheduling — 生产排程 ✅
- quality-nonconformance — 质量不合格 ✅
- returns-reverse-logistics — 退货逆向物流 ✅

### document-processing（2 个）

- nutrient-document-processing — Nutrient 文档处理 ✅
- visa-doc-translate — 签证文档翻译 ✅

---

## 🆕 新增清单（最近添加）

最近一次或近期新增的 skill 在主列表中以 🟢 **新加** 标注，并集中列在此处方便快速回顾。

| 资源名 | 所属模块 | 触发词（来自 description） | 加入日期 |
|---|---|---|---|
| `macro-monitor` | `business-content`（业务 / 办公 / 金融） | 每日宏观数据监控和推送。自动浏览免费数据源（Trading Economics、FRED、国家统计局、央行官网、财联社等 | 2026-07-25 |
| `ppt-generator` | `business-content`（业务 / 办公 / 金融） | 做PPT、生成PPT、制作幻灯片、make ppt、create presentation、帮我做个PPT | 2026-07-25 |
| `stock-analyzer` | `business-content`（业务 / 办公 / 金融） | 全球股票综合分析工具。支持A股、港股、美股等东方财富覆盖的所有市场。根据用户输入的股票名称或代码，从东方财富网获取股票信 | 2026-07-25 |

> 💡 提示：用 `RECENT="<新skill名>" node scripts/generate-skills-readme.js` 把新 skill 标为 🟢 **新加**（自动写入 state，下次自动保留）。
> 用 `node scripts/generate-skills-readme.js --clear-recent` 清空所有"新加"标记。
