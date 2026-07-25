---
name: macro-monitor
description: 每日宏观数据监控和推送。自动浏览免费数据源（Trading Economics、FRED、国家统计局、央行官网、财联社等），整理过去 24 小时发布的宏观数据和政策信息，并推送给用户。通过 cron 每天晚上 10 点自动触发。
origin: community
version: 1.0.2
---

# 宏观数据监控技能

## 工作流程

当此技能被触发时（通常通过 cron 每天晚上 10 点），执行以下步骤：

### 1. 启动浏览器

使用 browser 工具启动浏览器控制：
```
browser action=start profile=openclaw
```

### 2. 读取科普知识库

**必须先读取** references/indicators.md 文件，获取常见指标的科普解释：
```
read path=skills/macro-monitor/references/indicators.md
```

### 3. 采集数据

按优先级访问以下数据源，收集过去 24 小时发布的宏观数据和政策信息：

**国际数据：**
- Trading Economics (https://tradingeconomics.com/calendar) - 查看经济日历
- FRED (https://fred.stlouisfed.org/releases) - 美联储经济数据发布

**国内数据：**
- 国家统计局 (http://www.stats.gov.cn/) - 查看最新数据发布
- 央行官网 (http://www.pbc.gov.cn/) - 货币政策、利率、流动性数据
- 证监会官网 (http://www.csrc.gov.cn/) - 监管政策

**新闻资讯：**
- 财联社 (https://www.cls.cn/) - 实时金融新闻
- 华尔街见闻 (https://wallstreetcn.com/) - 市场资讯

### 4. 整理整合

将采集到的数据按以下结构整理：

```
【过去 24 小时宏观数据】📊

🌍 国际数据
- [数据名称] [发布值] [预期值] [前值] [影响说明]
  💡 [小白向科普解释说明 - 每个指标都必须添加]

🇨🇳 国内数据
- [数据名称] [发布值] [预期值] [前值] [影响说明]
  💡 [小白向科普解释说明 - 每个指标都必须添加]

📜 政策动态
- [政策标题] - [简要说明]

📰 重要资讯
- [新闻标题] - [简要说明]
```

**科普解释规则（强制执行）：**

1. **每个指标都必须添加科普解释**，没有例外
2. **科普解释来源优先级：** 先查 references/indicators.md，找不到则走"未知指标处理"流程
3. **科普解释格式：** 💡 [指标名]：[一句话定义] / - 为什么重要 / - 怎么看（正常范围/关键阈值）
4. **重要数据变化加额外解读：** 超预期/低于预期的原因和市场影响

### 未知指标处理流程

遇到 references/indicators.md 中没有的指标：

1. 多源搜索（"指标名 是什么意思" / "指标名 investing.com"）
2. 交叉验证（优先央行、统计局、知名财经媒体）
3. 整理为标准科普格式
4. 可选：补充到 references/indicators.md 避免重复搜索

### 5. 推送消息

使用 message 工具将整理好的报告推送给用户。

## 数据源快速访问

### Trading Economics 经济日历
- URL: https://tradingeconomics.com/calendar
- 关注：高重要性事件（红色标记）
- 字段：时间、国家、事件、实际值、预期值、前值

### 国家统计局
- URL: http://www.stats.gov.cn/
- 关注：最新数据发布栏目
- 重点指标：GDP、CPI、PPI、PMI、工业增加值、社会消费品零售

### 央行官网
- URL: http://www.pbc.gov.cn/
- 关注：新闻发布、政策解读
- 重点：LPR 利率、MLF 操作、公开市场操作、货币政策报告

## 注意事项

1. **时间过滤**：采集过去 24 小时（GMT+8）发布的数据和新闻
2. **科普解释强制**：每个指标都必须添加科普解释，没有例外
3. **重要性排序**：高重要性数据优先展示
4. **简洁明了**：每个条目不超过 2 行，重点突出数值变化
5. **数据验证**：对比实际值与预期值，标注超预期/不及预期
6. **异常处理**：某个数据源无法访问时跳过并记录，不影响其他数据源

## Cron 配置

此技能通过以下 cron job 调度：

```json
{
  "name": "macro-monitor-daily",
  "schedule": {
    "kind": "cron",
    "expr": "0 22 * * *",
    "tz": "Asia/Singapore"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "执行宏观数据监控，浏览免费数据源，整理过去 24 小时发布的宏观数据和政策信息并推送"
  },
  "sessionTarget": "isolated",
  "enabled": true
}
```

## 手动触发

```
执行宏观数据监控，浏览免费数据源，整理过去 24 小时发布的宏观数据和政策信息并推送
```

## Handoff Artifacts

- `references/indicators.md` — 常见指标的科普解释知识库（必填依赖），用于 Phase 2 提供科普解释
- cron 配置 JSON — 放在用户调度系统（OpenClaw scheduler）中，不在 skill 文件内

## Verification

- 触发后必须先读取 references/indicators.md（Phase 2）
- 每个数据条目必须包含 💡 科普解释（强制）
- 推送消息按 Phase 4 模板
- 数据源失败时跳过并记录，不中断整个流程

## Agent / Command Map

| 任务 | 工具 / Agent |
|------|-------------|
| 浏览器自动化 | `browser` 工具（profile=openclaw） |
| 数据采集 | `browser` + `WebFetch` |
| 知识库读取 | `Read` 工具 |
| 消息推送 | `message` 工具 |
| 失败兜底（参考）| silent-failure-hunter agent |
| 安全审查（参考）| security-reviewer agent（browser 自动化是安全触发点） |

## 决策记录：为何不创建专属 agent

经评估，本 skill **不需要创建专属 agent**，原因：

1. **管线自包含**：5 步串行（启动 → 读知识库 → 采集 → 聚合 → 推送），无分支决策
2. **无复盘必要**：是确定性数据聚合，不是主观判断，无需"硬约束 dispatch"压制偏见
3. **无需独立视角**：cron 触发、单点执行、无并发协调需求
4. **现成 agent 可参考**：silent-failure-hunter 兜底、security-reviewer 审计 — 已在 Agent Map 标注，但非必须调用

如未来扩展（多语言版本、回测分析、跨市场对比），可再评估 Step 7.5 子 agent 模式。