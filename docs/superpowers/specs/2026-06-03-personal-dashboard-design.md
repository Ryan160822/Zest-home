# 个人主页：仪表盘改造设计

日期：2026-06-03
状态：待实现

## 目标

把首页从「纯静态展示」升级为带交互的个人控制台：

1. 删除「状态」卡和「GitHub」卡。
2. 时间卡提到顶部，并扩为整行（4 列）的「时间 + 天气」顶栏。
3. 新增「仪表盘」卡：待办/日程合并清单 + 番茄钟。
4. 新增「灵感生成器」卡：调用 Cloudflare Workers AI 实时生成。

## 不做（YAGNI）

- 无账号系统、无跨设备同步（数据仅存 localStorage）。
- 天气不做定位/多城市，固定显示浙江温州鹿城区。
- 灵感生成不做历史记录/收藏，只「换一个」。

---

## 一、删除项

| 删除内容 | 涉及文件 |
| --- | --- |
| `renderStatus()`、`SITE.status` | `public/main.js` |
| `renderStats()`、`SITE.github` | `public/main.js` |
| `init()` 中对应的 `append` 调用 | `public/main.js` |
| `.c-status`、`.dot`、`.status-*`、`.c-stats`、`.big-num`、`.stats-sub` 样式 | `public/styles.css` |
| `--c-status`、`--c-stats` token 及 `@supports` 降级块对应行 | `public/styles.css` |

GitHub 的 42 / 128 数字不再保留（卡已删，无新去处）。

---

## 二、顶部「时间 + 天气」条（占满 4 列）

改造现有时钟卡为整行横向布局：

- **左**：北京时间（沿用现有 `startClock()` 逻辑，时:分:秒 + 星期·日期）。
- **右**：温州鹿城区天气 —— 图标/天气描述、当前温度、体感或高低温。

### 数据流（天气）

- `worker.js` 新增 `GET /api/weather` 路由，服务端代理 Open-Meteo（无需 API key）：
  - 写死坐标：纬度 `28.02`、经度 `120.66`（温州鹿城区）。
  - 请求 `https://api.open-meteo.com/v1/forecast?latitude=28.02&longitude=120.66&current=temperature_2m,weather_code,apparent_temperature&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Shanghai`。
  - 响应加 `cache-control: public, max-age=1800`（30 分钟），与 `/api/daily` 风格一致。
  - 失败返回 502 + `{error}`。
- 前端 `loadWeather()`：fetch `/api/weather`，把 `weather_code` 映射成中文描述 + emoji 图标（建一个 code→{label,icon} 表，覆盖晴/多云/阴/雨/雪/雾等常见档）。失败时天气区显示「天气加载失败」兜底，不影响时间显示。

### 响应式

- ≤768px（2 列）：时间条仍占满整行，时间与天气横向排列，空间不足时换行。
- ≤480px（1 列）：时间在上、天气在下。

---

## 三、仪表盘卡（占 2 列 2 行，与 Hero 并排）

容器 `renderDashboard()`，内含 Tab 切换：

- Tab 1：**📋 今日**（待办 + 日程合并清单）
- Tab 2：**🍅 番茄钟**

Tab 切换为纯前端 class 切换，无路由。

### 3.1 今日清单（方案 A · 统一清单）

- 添加行：一个「时间」选填输入（`type=time` 或文本）+ 一个「事项」文本框 + 加号按钮。
- 一条任务的数据结构：`{ id, text, time|null, done, createdAt }`。
- 渲染规则：
  - 有 `time` 的任务 → 按时间升序排在上方，形成时间轴；命中当前时段的高亮（当前时间所处的最近一条）。
  - 无 `time` 的任务 → 归入底部「随时做」分组。
- 每条可勾选完成（划线灰显）、可删除。
- **存储**：localStorage，key 如 `zest.tasks`。
- **每日重置**：带 `time` 的任务和番茄计数在「日期变化」时清空（记录 `lastResetDate`，加载时若与今天不符则清理带时间的任务、归零番茄数）。无 `time` 的待办**不清空**，保留到手动删除。

### 3.2 番茄钟

- 三模式：专注 25 / 短休 5 / 长休 15，可点击切换；切换或重置时停止并回到该模式初始时长。
- 控件：开始 / 暂停（同一按钮切换文案）、重置。
- 显示今日完成番茄数（专注阶段自然跑完才 +1），存 localStorage，随每日重置归零。
- 计时用 `setInterval`；为避免后台 tab 计时漂移，基于「目标结束时间戳」计算剩余秒数。
- **跑完通知**：调用 Notification API 发桌面通知（首次使用时 `Notification.requestPermission()`）。
  - 未授权 / 不支持时降级：闪烁 `document.title`（如「⏰ 时间到！」与原标题交替数秒）+ 卡内文字提示。
  - 站点为 HTTPS（Cloudflare），满足 Notification API 前置条件。

---

## 四、灵感生成器卡（占 2 列）

容器 `renderInspire()`：

- 类别选择：项目点子 / 写作选题 / 随便来点（单选，默认「项目点子」）。
- 输出区：显示生成的灵感文本；生成中显示加载态（如光标闪烁/「生成中…」）。
- 按钮：「✨ 换一个灵感」。

### 数据流（AI）

- `worker.js` 新增 `GET /api/inspire?category=...` 路由：
  - `wrangler.toml` 增加 AI 绑定：
    ```toml
    [ai]
    binding = "AI"
    ```
  - 用 `env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages })`（具体模型实现时确认可用项）。
  - 按 `category` 套不同 system/user prompt，要求输出一句简洁中文灵感。
  - 校验 `category` 白名单，非法值回退默认。
  - 失败返回 502 + `{error}`，前端显示兜底文案（如「灵感暂时枯竭了，再点一次试试」）。
- 前端 `loadInspire(category)`：fetch 接口，把返回文本填进输出区。

---

## 五、最终布局与渲染顺序

`init()` 中 `append` 顺序：

```
1. renderTopbar()      时间+天气   span-4（整行）
2. renderDashboard()   仪表盘      span-2 row-2
3. renderHero()        Hero        span-2 row-2
4. renderTools()       工具卡 ×2   各 1 列
5. renderInspire()     灵感生成器  span-2
6. renderEnglish()     英语格言    span-3
7. renderAihot()       AI 日报     span-4
```

页脚 `renderFooter()` 不变。

---

## 六、涉及文件总览

- `public/main.js`：删 status/stats；时钟改顶栏 + 天气；新增 dashboard（清单+番茄钟+localStorage+通知）、inspire；调整 `init()` 顺序与新数据。
- `public/styles.css`：删 status/stats 样式；新增顶栏、仪表盘卡（tabs/清单/番茄钟）、灵感卡样式 + token + `@supports` 降级 + 响应式。
- `worker.js`：新增 `/api/weather`、`/api/inspire` 路由。
- `wrangler.toml`：新增 `[ai]` 绑定。

## 七、错误处理与降级一览

- 天气接口失败 → 天气区兜底文案，时间正常。
- 灵感接口失败 → 输出区兜底文案。
- Notification 未授权/不支持 → 标题闪烁 + 卡内提示。
- 不支持 backdrop-filter → 沿用现有 `@supports` 提高不透明度策略，新卡片一并加入。
- localStorage 不可用（隐私模式）→ try/catch 包裹，功能降级为「当次会话内有效」，不报错。

## 八、测试要点

- 删除卡后布局无错位，响应式三档（4/2/1 列）正常。
- 待办：增删勾选、有/无时间分组、时间轴排序、当前时段高亮。
- 每日重置：模拟跨日（改 `lastResetDate`）后带时间任务与番茄数清空，纯待办保留。
- 番茄钟：三模式切换、开始/暂停/重置、跑完计数 +1、通知或降级触发。
- 天气：正常返回渲染、接口失败兜底。
- 灵感：三类别各能生成、加载态、失败兜底。
