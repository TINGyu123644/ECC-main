---
description: Run end-to-end three-dimension stock analysis (基本面 / 新闻面 / 资金面) for a specific ticker via the stock-analyst SubAgent + stock-analyzer skill. Outputs Markdown + HTML report + 数据来源状态 table.
---

# Stock Analyzer Command

Trigger the canonical A股 / 港股 / 美股 analysis flow with a single slash. This command delegates to the `stock-analyst` SubAgent, which loads the `stock-analyzer` skill and walks its 8-step procedure. The user gets a standardized Markdown report in chat, an HTML file on disk, and a transparent data-source status table.

## Usage

```
/stock-analyzer <ticker or company-name> [--goal <analysis-goal>] [--term <time-horizon>]
/stock-analyzer 600519
/stock-analyzer 贵州茅台
/stock-analyzer MU
/stock-analyzer AAPL --goal buy-decision --term short
/stock-analyzer 00700 --goal valuation --term long
```

Pass the ticker (numeric, Chinese name, or English alphabetic) as the first argument. Optional flags:

- `--goal buy-decision | valuation | risk-audit | full` (default `full`)
- `--term short | medium | long` (default `medium`, ~1-3 个月)

## What Happens

1. Parse the ticker and any flags from the slash input. If the input is ambiguous (e.g. `苹果` could be AAPL or A股 中含「苹果」的标的), the agent **asks one clarifying question** before proceeding.
2. The command body instructs the parent Claude to dispatch the `stock-analyst` SubAgent — an isolated execution context with `model: sonnet`, `tools: [Read, Glob, Grep, Bash, WebFetch, WebSearch]`, and the agent's 三维评分 + rate-limit system prompt.
3. The SubAgent's first step is always `Skill('stock-analyzer')` — this loads the canonical SKILL.md (1014 lines) into the SubAgent's context. The skill body becomes the operating manual; the agent does **not** improvise.
4. The SubAgent walks Step 0 → Step 8 of the skill:
   - Step 0: eastmoney 登录引导 (if user has not already logged in).
   - Step 1-2: search → detail page (prefer `python scripts/fetch_stock.py` when reachable).
   - Step 3-5: 基本面 / 新闻面 / 资金面 数据采集.
   - Step 6: 技术面 + (A 股 only) Step 6.6 异动监控 + (条件触发) Step 6.5 并购重组.
   - Step 7: 三维评分 (基本面 35% + 资金面 35% + 新闻面 20% + 技术面 10%) + 买卖价位计算.
   - Step 8: 输出 Markdown + HTML + 数据来源状态表.
5. The SubAgent returns its structured output to the parent Claude, which surfaces the Markdown report in the chat and the HTML file path.

## When to Use This Command

Use `/stock-analyzer` when the user's request explicitly contains a stock ticker or specific company and asks for analysis, valuation, target price, 走势, or buy/sell guidance. Do NOT use for:

- Pure macro-economic commentary with no specific ticker (route to `/plan-canvas` or the `market-research` skill).
- General company fundamental research without a buy/sell angle (route to `deep-research`).
- Non-stock financial questions (crypto, forex, bonds) — out of scope for this skill.

## Important Constraints (enforced by the agent + skill)

- **1 秒延迟**: between consecutive `WebFetch` calls to any `*.eastmoney.com` URL.
- **串行 fetches**: never parallel eastmoney requests.
- **数据来源透明**: every report includes a 数据来源状态 table at the bottom; the agent will not skip this section even if all rows are ✅.
- **未登录提示**: the agent prompts for login before fetching rate-limited pages.
- **Disclaimer**: every report ends with the standard 「本报告仅供参考，不构成投资建议」 disclaimer.

## Examples

```
/stock-analyzer 600519
→ 触发 stock-analyst SubAgent
→ 加载 stock-analyzer skill (含 Step 6.6 A股异动监控)
→ 输出贵州茅台三维分析 + 买卖价位 + 异动天花板 + 数据来源状态表

/stock-analyzer AAPL
→ 跳过 Step 6.6 (仅 A 股)
→ 输出基本面 / 新闻面 / 资金面 (美股资金流向可能 N/A) + 数据来源状态表

/stock-analyzer 00700 --goal valuation --term long
→ 重点做估值（PE / DCF 思路），用 long 时间轴输出年度趋势
```

## Notes for the Parent Claude

- This is a `/` (slash command) — the user typed it explicitly. Treat the request as a real task, not a probe.
- Do NOT spawn a second analysis inside the same turn; the SubAgent runs to completion before you answer.
- If the SubAgent returns a partial result (e.g. eastmoney 限流), surface the 数据来源状态 table verbatim — let the user see exactly which fields failed.
