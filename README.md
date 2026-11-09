# 天气应用 · Vue 3 Take-Home

城市搜索 + 当前天气 + 24 小时 / 7 天预报，覆盖加载、空、错误三种状态。
技术栈：**Vue 3（Composition API + `<script setup>`）/ Vite / TypeScript / Pinia**，数据源为
[Open-Meteo](https://open-meteo.com/)（公开接口，无需 API Key）。

## 运行

```bash
npm install
npm run dev        # 本地开发
npm run build      # 类型检查 + 常规构建（产物在 dist/）
npm run build:single  # 单文件构建（dist-single/index.html 可直接双击打开）
```

交付时附带的 `天气应用Demo.html` 就是 `npm run build:single` 的产物：把 JS/CSS 全部内联进
单个文件，双击即可在浏览器里运行（不需要装 Node，也不需要起服务）。

## 目录结构

```
src/
├── App.vue                 # 页面壳：顶部栏 + 状态编排，不含业务细节
├── main.ts                 # createApp + Pinia
├── style.css               # 全局样式（移动端优先，920px 以上两栏）
├── components/
│   ├── SearchBar.vue       # 输入防抖 / 下拉候选 / 键盘选择 / 点击外部收起
│   ├── CurrentWeather.vue  # 当前天气主卡片
│   ├── HourlyForecast.vue  # 未来 24 小时（横向滚动 + 温度柱）
│   ├── DailyForecast.vue   # 7 天预报（区间条）
│   ├── RecentSearches.vue  # 最近搜索（localStorage）
│   ├── SkeletonPanel.vue   # 加载态
│   ├── ErrorPanel.vue      # 错误态 + 重试
│   └── WeatherIcon.vue     # WMO 码 -> 图标，单一色 currentColor
├── stores/
│   ├── weather.ts          # 唯一数据入口：状态机、竞态控制、降级策略
│   └── preferences.ts      # 温度单位、最近搜索（持久化）
├── services/
│   ├── http.ts             # fetch 封装：超时 / 取消 / 错误分类
│   ├── weatherApi.ts       # URL 拼装 + 原始响应 -> 领域模型
│   └── mockWeather.ts      # 离线兜底的示例数据
├── composables/
│   └── useDebouncedValue.ts
├── utils/                  # cities / format / weatherCode 纯函数
└── types/weather.ts        # 领域模型（UI 不感知第三方字段名）
```

## 架构决策

**1. 四层职责切分，单向依赖**

`组件 -> store -> service -> utils`。组件只消费 store 的 state 和 action，不直接调 API；
service 负责把 Open-Meteo 的 `temperature_2m` / `weather_code` 这类字段翻译成领域模型
（`CurrentWeather` / `HourlyPoint` / `DailyPoint`）。换数据源只改 `weatherApi.ts` 一个文件，
组件和 store 不动。

**2. 状态管理用 Pinia，只有一个天气 store 持有服务端状态**

- `weather` store：`status: idle | loading | ready | error` 显式状态机，取代 `isLoading + hasError`
  这种布尔组合（避免出现「同时在加载又同时报错」的非法态）。
- `preferences` store：纯客户端状态（单位、最近搜索），与请求态解耦，写 localStorage 失败时
  静默退化为内存态。

**3. 请求竞态：seq + AbortController 双保险**

快速连点城市时，旧请求的结果可能后到并覆盖新结果。store 里每次请求分配自增 `seq`，
请求返回后 `seq !== 当前 seq` 直接丢弃；同时 abort 上一个请求，省掉无用的网络开销。
搜索建议与天气预报各用一套 controller，互不干扰。

**4. 错误处理分三层**

- `http.ts`：统一超时（8s）、把异常分类成 `network / timeout / http / parse / aborted`。
- store：`aborted` 静默忽略（那是自己取消的）；其余真实失败走**降级**——用内置示例数据兜住
  界面，并在顶部提示「当前展示内置示例数据」。这样断网时页面不会白屏，数据来源也标注清楚。
- 组件：`ErrorPanel` 负责展示与重试；为了能演示错误态，页脚提供了「模拟网络失败」开关，
  打开后请求直接抛错，走真实错误分支。

> 这里有个取舍：真实项目里"静默降级到假数据"是危险的，必须标注来源（本 Demo 已在提示条和
> 页脚标注）。如果作业要求强一致，应改成只显示错误态 + 重试。

**5. 健壮性细节**

- 首屏自动加载默认城市，同时保留「热门城市」快捷入口；
- 下拉搜索支持 ↑ ↓ Enter / Esc，点击外部自动收起；`pointerdown` 而非 `click`，避免与选项点击冲突；
- 空结果、搜索服务不可用各有独立文案（本地兜底匹配热门城市）；
- 时间字段直接用接口返回的城市当地时间字符串，不做时区换算，避免跨时区错位；
- 所有数字格式化集中在 `utils/format.ts`，组件里不出现裸数字；
- 图标是一套 inline SVG（无图标库依赖），按天气分组归并，颜色继承 `--accent`；
- 温度单位切换只影响展示层，不改原始数据。

## 需求覆盖

| 作业要求 | 实现 |
| --- | --- |
| 搜索地点 | 地理编码接口 + 300ms 防抖 + 候选列表（含省份/国家去歧义） |
| 当前天气 | 温度、体感、天气描述、湿度、风速风向、日出日落、降水概率 |
| 天气预报 | 24 小时逐时（温度柱 + 图标）、7 天（最高/最低区间条） |
| 加载状态 | 骨架屏（结构与真实布局一致，避免加载完成时跳动） |
| 错误状态 | 分类文案 + 重试 + 模拟开关 + 降级提示 |
| 源码 + README | 本仓库 |

## 已知取舍（刻意不做）

- 不做多语言与多城市对比：作业明确「控制范围」，这两项会把 4–6h 的边界撑破。
- 不做请求缓存层：Open-Meteo 数据时效性强，缓存收益低；需要时可在 service 层加一层
  `Map<cacheKey, {data, expiresAt}>` 即可，不影响上层。
- 不引入 ECharts：24 小时曲线用 CSS 柱状 + 7 天用区间条已经够表达，省掉 ~90KB 依赖。
- 未写单测：`utils/*` 是纯函数、store 依赖注入 service，两者都容易补测；优先保证结构与可读性。

## 数据来源

- 地理编码：`https://geocoding-api.open-meteo.com/v1/search`
- 天气预报：`https://api.open-meteo.com/v1/forecast`（`current` / `hourly` / `daily`，`timezone=auto`）
