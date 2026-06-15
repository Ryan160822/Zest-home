# 主页动效设计：入场 + 光晕 + 轻氛围

日期：2026-06-06
状态：待实现

## 目标

给主页加三种"安静优雅"取向的动效（用户从 5 个现场 demo 中选定 01/02/05）：

1. **优雅入场** —— 卡片依次浮现
2. **跟手光晕** —— 鼠标柔光跟随
3. **轻氛围** —— 背景随真实时间/温州天气变化

## 不做（YAGNI / 明确排除）

- 俏皮立体（3D 倾斜、弹性悬浮）和光斑鼠标视差 —— 用户未选。
- **夜间深色主题** —— 用户明确"以后再说"；本期夜晚档只是背景蓝调加深，卡片/文字体系完全不动。
- 雪花效果 —— 本期只做雨丝。
- 不引入任何库；不改 worker。

## 一、优雅入场

- `#bento` 下每张 `.card` 加载时依次浮现：`opacity 0→1`、`translateY(16px)→0`、单张 0.65s、`var(--ease)`，每张错开约 80ms。
- 纯 CSS：`.bento > .card { animation: card-in 0.65s var(--ease) backwards; }` + `nth-child` 设 `animation-delay`（覆盖到第 9 张，之后的不延迟直接进）。
- `animation-fill-mode: backwards` 保证有 delay 的卡在动画前不可见。
- 卡片由 JS 在 `DOMContentLoaded` 后 append，动画自然在插入时触发，无需 JS 配合。

## 二、跟手光晕

- 作用于所有 `.card`（含工具卡 `<a>`）。
- `main.js` 在 `#bento` 上挂一个委托 `mousemove`：找到 `e.target.closest('.card')`，把光标相对卡片的坐标写入该卡 `--mx`/`--my`。
- `styles.css`：`.card::after` 覆盖层，`radial-gradient(240px circle at var(--mx) var(--my), 白光+淡品牌蓝, transparent)`，默认 `opacity:0`，`.card:hover::after` 渐显（0.3s）；`pointer-events:none`。
- 注意：`.featured::after` 是遗留死样式（无卡使用），`.card::after` 不冲突。
- 触屏设备无 hover，光晕自然不出现，无需特判。

## 三、轻氛围（时间 + 天气）

### 时段调色
- 按 `Asia/Shanghai` 小时分四档，`<body>` 挂类：
  - `sky-dawn` 5:00–9:59 暖白
  - （白天 10:00–16:59 = 现状，不挂类）
  - `sky-dusk` 17:00–19:59 橘紫
  - `sky-night` 20:00–4:59 深一点的蓝调（仍是浅色页面）
- CSS 按 body 类覆盖 `--bg-gradient` 与 `.blob-1..4` 的背景色；只动背景层，卡片/文字零改动。
- `initAmbience()` 启动时判定一次，之后每分钟检查，跨档直接换类（不做渐变过渡）。

### 雨丝
- 复用 `loadWeather()` 已取到的 `current.weather_code`：码在 51–67、80–82、95–99 时视为下雨。
- 下雨时在现有 `.bg` 背景层内插入一个雨容器（约 24 条 CSS 动画雨丝，`transform: translateY` 循环，随机 left/时长/延迟），低透明度、`pointer-events:none`、在卡片后面。
- 天气接口失败 → 无雨丝，静默降级。

### 调试覆盖
- URL 参数强制预览：`?sky=dawn|dusk|night` 覆盖时段判定，`?rain=1` 强制下雨（`rain=0` 强制无雨）。

## 通用规则

- `prefers-reduced-motion: reduce`：入场动画禁用（卡片直接显示）、雨丝隐藏；光晕保留（跟手不自动动）。沿用 styles.css 现有的 reduced-motion 块。
- 全部动画只用 `transform`/`opacity`。
- 涉及文件：仅 `public/styles.css`、`public/main.js`。

## 验收要点

- 刷新页面：卡片依次浮现；reduced-motion 下直接显示。
- 鼠标滑过任意卡：柔光跟手、移开淡出；不影响卡内点击交互（待办勾选、Tab、按钮）。
- `?sky=dawn/dusk/night` 各档背景与光斑变色，卡片可读性不变；`?rain=1` 雨丝出现且在卡片后面。
- 正常无参数时按当前北京时间判档；温州真实下雨时（或 mock weather_code）雨丝自动出现。
- `node --check public/main.js` 通过；控制台无报错。
