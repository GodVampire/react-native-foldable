# @hecom/react-native-foldable

> React Native 多折叠屏幕自适应布局库
> **三折叠 / 双折叠 / iPad / 平板 / 鸿蒙 (HarmonyOS)** 全支持

---

## 特性

| 能力 | 说明 |
|------|------|
| 📱 自动识别设备类型 | 手机 / iPad / 双折叠 / 三折叠 / 鸿蒙 |
| 🔄 实时监听折叠变化 | `FOLDED → TRI_HALF → TRI_FULL` 毫秒级响应 |
| 📐 响应式断点系统 | `xs/sm/md/lg/xl/xxl`（全部可自定义） |
| 🧭 导航布局建议 | 自动切换「底部 Tab」↔「左侧永久侧边栏」 |
| 🧩 即插即用组件 | `AdaptiveLayout` / `SidebarLayout` / `FoldAwareView` |
| 💡 **纯 JS，无原生模块** | 无需 pod install / gradle 改动 |
| 🔧 完整 TypeScript | 全类型定义导出 |

---

## 安装

```bash
npm install @hecom/react-native-foldable
# 或
yarn add @hecom/react-native-foldable
```

无额外原生依赖，开箱即用。

---

## 快速集成

### Step 1：根组件包裹 Provider

```tsx
// App.tsx
import { FoldableProvider } from '@hecom/react-native-foldable'

export default function App() {
  return (
    <FoldableProvider config={{ debug: __DEV__ }}>
      <RootNavigator />
    </FoldableProvider>
  )
}
```

### Step 2：页面中使用 Hook

```tsx
import { useFoldableScreen } from '@hecom/react-native-foldable'

function HomeScreen() {
  const { foldState, layoutMode, showSidebar, isTriFold, width } = useFoldableScreen()

  return (
    <View style={{ padding: width > 840 ? 24 : 16 }}>
      <Text>折叠状态：{foldState}</Text>
      <Text>布局模式：{layoutMode}</Text>
    </View>
  )
}
```

> 导航与组件的完整适配方案，请参阅 [NAVIGATION.md](NAVIGATION.md)。

---

## Hooks API

### `useFoldableScreen()` — 完整状态

```ts
const {
  width, height,            // 窗口尺寸(dp)
  screenWidth, screenHeight,// 物理屏尺寸(dp)
  foldState,   // FOLDED | HALF_FOLDED | UNFOLDED | TRI_HALF | TRI_FULL | UNKNOWN
  deviceType,  // PHONE | TABLET | FOLDABLE | TRI_FOLDABLE | IPAD | DESKTOP
  layoutMode,  // SINGLE | DUAL | TRI | SIDEBAR | SIDEBAR_DUAL
  breakpoint,  // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  orientation, // PORTRAIT | LANDSCAPE
  columns,     // 推荐列数
  isTablet, isFoldable, isTriFold, isPad, isHarmony,
  showSidebar, isWideScreen,
} = useFoldableScreen()
```

### `useBreakpoint()` — 响应式断点

```ts
const { breakpoint, up, down, between, is } = useBreakpoint()

up('md')              // 当前宽度 ≥ 600dp
down('lg')            // 当前宽度 < 840dp
between('md', 'xl')   // 600dp ≤ 当前宽度 < 1200dp
is('lg')              // 精确等于 lg 断点
```

### `useAdaptiveStyle()` — 响应式样式（mobile-first 叠加）

```ts
const style = useAdaptiveStyle({
  base: { padding: 12, borderRadius: 8 },
  md:   { padding: 16 },
  lg:   { padding: 24, borderRadius: 12 },
  xl:   { padding: 32 },
})
```

### `useAdaptiveValue()` — 响应式值

```ts
const fontSize   = useAdaptiveValue({ base: 14, md: 16, lg: 18, xl: 20 })
const numColumns = useAdaptiveValue({ base: 1, md: 2, lg: 3, xl: 4 })
```

### `useFoldStateChange()` — 折叠变化事件

```ts
useFoldStateChange((nextState, prevState, info) => {
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
})

useLayoutModeChange((next, prev) => {
  console.log(`布局模式: ${prev} → ${next}`)
})
```

---

## 折叠状态说明

| FoldState | 触发条件 | 典型场景 |
|-----------|---------|---------|
| `FOLDED` | 完全折叠 | Z Fold 折叠 (~374dp) / Mate XT 折叠 (~499dp) |
| `HALF_FOLDED` | 帐篷/桌面模式（宽高相近） | Z Fold 半折 |
| `UNFOLDED` | 双折叠完全展开 | Z Fold 全开 (~882dp) |
| `TRI_HALF` | 三折叠展开一屏 | Mate XT 半展 (~800dp) |
| `TRI_FULL` | 三折叠三屏全开 | Mate XT 全展 (~1008dp) |
| `UNKNOWN` | 无折叠状态 | iPad / 安卓平板 |

## 断点说明

| 断点 | 最小宽度 | 场景 |
|------|---------|------|
| `xs` | 0 | 超小屏 |
| `sm` | 360dp | 手机、折叠态 |
| `md` | 600dp | 大屏手机、折叠半开 |
| `lg` | 840dp | 平板、iPad、折叠全开 |
| `xl` | 1200dp | 三折叠全开、大平板 |
| `xxl` | 1600dp | 超大屏/桌面 |

---

## 三折叠识别原理

```
1. 初始化记录当前宽度（归桶精度 40dp）
2. 每次 Dimensions 变化（防抖 150ms）记录新宽度桶
3. 历史出现 ≥ 3 个宽度桶 → 标记为 TRI_FOLDABLE
4. 最大宽度 ≥ triFoldThreshold(900dp) → 也视为 TRI_FOLDABLE
5. 折叠状态：≥900dp=TRI_FULL | ≥600dp=TRI_HALF | <600dp=FOLDED
```

**冷启动识别准确度：**

| 冷启动状态 | 宽度 | 首帧识别结果 |
|-----------|------|-------------|
| TRI_FULL 全展开 | ~1008dp | ✅ 直接识别（≥ 900dp 阈值命中） |
| TRI_HALF 半展开 | ~800dp | ⚠️ 被识别为 TABLET，会话内展开至 TRI_FULL 后自动修正 |
| FOLDED 折叠态 | ~499dp | ⚠️ 被识别为 PHONE，展开至 TRI_FULL（≥900dp）后自动修正 |

> **原因**：纯 JS 方案无法访问系统级折叠 API（Android `WindowManager.FoldingFeature`），TRI_HALF（~800dp）与普通 Android 平板宽度重叠，仅凭单次尺寸快照无法区分。

**如需首帧精确识别**（如 Mate XT 专属应用），可通过 `deviceTypeHint` 手动指定：

```tsx
import DeviceInfo from 'react-native-device-info'
import { DeviceType } from '@hecom/react-native-foldable'

const model = await DeviceInfo.getModel()  // e.g. "HUAWEI Mate XT"

<FoldableProvider config={{
  deviceTypeHint: model.includes('Mate XT') ? DeviceType.TRI_FOLDABLE : undefined,
}}>
```

---

## 鸿蒙 (HarmonyOS) 支持

自动检测以下情况：
- `Platform.OS === 'harmony'` 或 `'ohos'`（react-native-harmony）
- `Platform.constants` 中包含 `harmonyos` 关键字

折叠检测逻辑与 Android 完全一致，无需额外配置。

---

## 目录结构

```
src/
├── types/index.ts              全部 TypeScript 类型
├── core/
│   ├── constants.ts            默认常量与阈值
│   ├── DimensionManager.ts     屏幕尺寸单例（防抖+历史追踪）
│   ├── PlatformDetector.ts     平台/设备识别 + 断点计算
│   └── FoldStateDetector.ts    折叠状态推断引擎（核心算法）
├── context/
│   ├── FoldableContext.ts      React Context 定义
│   └── FoldableProvider.tsx    全局 Provider
├── hooks/
│   ├── useFoldableScreen.ts    完整屏幕信息
│   ├── useScreenLayout.ts      布局模式快捷访问
│   ├── useBreakpoint.ts        断点工具
│   ├── useAdaptiveStyle.ts     响应式样式/值
│   └── useFoldStateChange.ts   状态变化监听
├── components/
│   ├── FoldAwareView.tsx       render-prop 感知容器
│   ├── AdaptiveLayout.tsx      多栏自适应布局
│   └── SidebarLayout.tsx       侧边导航骨架
├── navigation/
│   ├── useFoldableNavigation.ts         导航建议 Hook
│   └── FoldableNavigationContainer.tsx  一体化适配容器
└── index.ts                    公共 API 导出
```

---

## License

MIT
