# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目

"Zest" 个人主页：原生 HTML/CSS/JS 静态站（无框架、无构建、无依赖），由 Cloudflare Worker 托管并代理几个接口。页面是玻璃质感的 bento 网格 + 个人仪表盘（待办/日程、番茄钟）、AI 灵感生成器、时间天气条、AI 日报。

## 命令

无 `package.json`、测试、lint、构建。一切走 `wrangler`：

```bash
npx wrangler dev          # 本地起 Worker + 静态资源，默认 :8787
npx wrangler dev --local  # 离线模式：[ai] 绑定会让默认 dev 进 remote 需登录；
                          # --local 下 /api/inspire 返回 502、灵感卡走兜底（正常），天气/日报正常
npx wrangler deploy       # 部署到 Cloudflare（手动）

node --check public/main.js   # 无测试，改完用它自检语法
node --check worker.js
```

`main` 是部署分支（GitHub `Ryan160822/Zest-home`）。

## 架构

**`worker.js`**：单个 `fetch` 处理器，按路径精确匹配，其余走静态资源：
- `/api/daily` 代理 AIHOT 日报；`/api/weather` 代理 Open-Meteo（**温州坐标 28.02/120.66 故意写死，别改成可配置**）；`/api/inspire` 调 Cloudflare Workers AI（`env.AI`，category 选 prompt）；`/api/onthisday` 代理百度百科「历史上的今天」（服务端筛当天 + 剥 HTML）；其余 → `env.ASSETS`。
- 新增接口照抄现有 `try/catch` + 502 写法。绑定在 `wrangler.toml`（`[assets]`、`[ai]`）。

**页面全靠 `public/main.js` 客户端渲染**，`index.html` 只是空壳（`#bento` + `#footer`）：
- 顶部 **`SITE` 对象 = 所有可编辑内容**（资料、工具卡、语录、社交），改内容只动这里。
- **`store`**（localStorage，key `zest.dashboard`，try/catch 包裹）是唯一持久化，无后端无账号。
- `el(html)` 把模板串变 DOM 节点；每张卡是一个 `renderX()`；**`init()` 里 append 的顺序就是布局**。
- `styles.css`：`:root` 里玻璃 token + 每张卡一个 `--c-*` 色；bento 网格 `.span-*`/`.row-2`；断点 768/480。
- 动效：卡片入场（纯 CSS nth-child 错峰）、`initGlow()` 跟手光晕（CSS 变量 `--mx/--my`）、`initAmbience()` 时段调色 + 天气雨丝（URL 调试：`?sky=dawn|dusk|night|day&rain=1|0`），全部尊重 prefers-reduced-motion。
- `public/tools/`：独立子页（二维码、Prompt 库），复用根 `../styles.css` + 各自 `tools.css`/JS。

## 易踩的约定

- **加一张 bento 卡**要四处联动：`renderX()`、`init()` 里 append、`:root` 加 `--c-x`、**`@supports not (backdrop-filter)` 降级块里补一条**（否则不支持的浏览器上不可读），再加卡片样式。
- 动态/用户文本一律 `.textContent`，不要拼进 `el()` 模板串（防 XSS）。
- 时间相关全部显式 `Asia/Shanghai`（时钟、天气、`todayKey()`、任务排序）。
- `applyDailyReset()`（`init()` 首先调用）跨天时清空**带时间**的任务并归零番茄数，**无时间待办保留**。
- 功能设计意图见 `docs/superpowers/specs/` 和 `plans/`，改动前先看。
