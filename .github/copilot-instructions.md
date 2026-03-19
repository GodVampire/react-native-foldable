# @hecom/react-native-foldable — Copilot 集成指南

React Native 多折叠屏幕自适应布局库，支持三折叠 / 双折叠 / iPad / 平板 / 鸿蒙，**纯 JS 无原生依赖**。

---

## 接入规范

### 必须：根组件包裹 Provider

```tsx
import { FoldableProvider } from '@hecom/react-native-foldable'

export default function App() {
  return (
    <FoldableProvider config={{ debug: __DEV__ }}>
      <RootNavigator />
      {__DEV__ && <FoldDebugPanel />}
    </FoldableProvider>
  )
}
```

---

## 函数组件 — Hook 用法

### 完整状态

```tsx
import { useFoldableScreen } from '@hecom/react-native-foldable'

function Screen() {
  const { foldState, layoutMode, width, showSidebar, isTriFold, columns } = useFoldableScreen()
}
```

### 断点查询

```tsx
import { useBreakpoint } from '@hecom/react-native-foldable'

function Grid() {
  const { up } = useBreakpoint()
  const cols = up('xl') ? 4 : up('lg') ? 3 : up('md') ? 2 : 1
}
```

### 响应式样式（mobile-first 叠加）

```tsx
import { useAdaptiveStyle, useAdaptiveValue } from '@hecom/react-native-foldable'

function Card() {
  const style = useAdaptiveStyle({ base: { padding: 12 }, md: { padding: 16 }, lg: { padding: 24 } })
  const fontSize = useAdaptiveValue({ base: 14, md: 16, lg: 18, xl: 20 })
}
```

### 折叠变化事件

```tsx
import { useFoldStateChange, useLayoutModeChange } from '@hecom/react-native-foldable'

useFoldStateChange((next, prev) => { /* 折叠/展开时触发 */ })
useLayoutModeChange(() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut) })
```

---

## Class 组件 — 三种接入方式

### 方式一：`withFoldableScreen` HOC（推荐）

```tsx
import { withFoldableScreen } from '@hecom/react-native-foldable'
import type { FoldableScreenInfo } from '@hecom/react-native-foldable'

interface Props { foldable: FoldableScreenInfo; title: string }

class DetailScreen extends React.Component<Props> {
  render() {
    const { foldable } = this.props
    return <View style={{ padding: foldable.showSidebar ? 24 : 16 }} />
  }
}
export default withFoldableScreen(DetailScreen)
// 使用：<DetailScreen title="详情" />  （无需传 foldable）
```

### 方式二：`static contextType`（推荐用于继承场景）

`static contextType` 会被子类自动继承，**有基类时优先用此方式**，不要对基类使用 HOC（HOC 返回函数组件，无法被继承）。

```tsx
import { FoldableContext } from '@hecom/react-native-foldable'
import type { FoldableContextValue } from '@hecom/react-native-foldable'

// 基类：声明一次，子类全部继承
class BaseScreen extends React.Component {
  static contextType = FoldableContext
  declare context: FoldableContextValue
  get foldable() { return this.context.screenInfo }
}

class HomeScreen extends BaseScreen {
  render() {
    const { width, showSidebar } = this.foldable  // ✅ 直接可用
    return <View style={{ padding: showSidebar ? 24 : 16 }} />
  }
}
```

### 方式三：`FoldableContext.Consumer`（局部使用）

```tsx
import { FoldableContext } from '@hecom/react-native-foldable'

class ProfileScreen extends React.Component {
  render() {
    return (
      <FoldableContext.Consumer>
        {({ screenInfo }) => <View style={{ padding: screenInfo.isWideScreen ? 32 : 16 }} />}
      </FoldableContext.Consumer>
    )
  }
}
```

---

## 组件

```tsx
import { AdaptiveLayout, SidebarLayout, FoldAwareView } from '@hecom/react-native-foldable'

// 多栏自适应（SINGLE/DUAL/TRI/SIDEBAR/SIDEBAR_DUAL 自动切换）
<AdaptiveLayout
  sidebar={<Nav />}
  leadingContent={<List />}
  trailingContent={<Detail />}
/>

// 固定侧边栏骨架
<SidebarLayout sidebar={<AppNav />} sidebarWidth={240}>
  <MainContent />
</SidebarLayout>

// render-prop，子函数接收完整 FoldableScreenInfo
<FoldAwareView>
  {(info) => <Text>{info.foldState}</Text>}
</FoldAwareView>
```

---

## 导航适配

```tsx
import { useFoldableNavigation, FoldableNavigationContainer } from '@hecom/react-native-foldable'

// Hook 方式
function RootNavigator() {
  const { useSidebar, useBottomTab, sidebarWidth } = useFoldableNavigation()
}

// 一体化容器
<FoldableNavigationContainer
  sidebar={<AppSidebarNav />}
  bottomTab={<BottomTabBar />}
>
  <AppStackNavigator />
</FoldableNavigationContainer>
```

---

## 枚举速查

| 枚举 | 值 |
|------|----|
| `FoldState` | `FOLDED` `HALF_FOLDED` `UNFOLDED` `TRI_HALF` `TRI_FULL` `UNKNOWN` |
| `DeviceType` | `PHONE` `TABLET` `FOLDABLE` `TRI_FOLDABLE` `IPAD` `DESKTOP` |
| `LayoutMode` | `SINGLE` `DUAL` `TRI` `SIDEBAR` `SIDEBAR_DUAL` |
| `Breakpoint` | `xs(0)` `sm(360)` `md(600)` `lg(840)` `xl(1200)` `xxl(1600)` (dp) |

---

## 开发调试

```tsx
import { FoldDebugPanel, simulationManager } from '@hecom/react-native-foldable'

// 悬浮调试面板（仅 DEV）
{__DEV__ && <FoldDebugPanel position="bottom-right" />}

// 命令式模拟
simulationManager.setPreset('tri_fold_full')  // 模拟三折叠全展
simulationManager.setPreset('fold_open')      // 模拟双折叠展开
simulationManager.clear()                     // 恢复真实设备
```

---

## 三折叠冷启动注意

冷启动于 `TRI_HALF`（~800dp）时首帧识别为 TABLET，展开到 `TRI_FULL`（≥900dp）后自动修正。
需首帧精确识别时通过 `deviceTypeHint` 手动指定：

```tsx
<FoldableProvider config={{ deviceTypeHint: DeviceType.TRI_FOLDABLE }}>
```

---

## 重要规则

- `FoldableProvider` **必须在 App 根部包裹**，所有 Hook / HOC 均依赖此 Context。
- Hook 只能用于函数组件；class 组件使用 `withFoldableScreen` / `contextType` / `Consumer`。
- 调试工具（`FoldDebugPanel`, `simulationManager`）**仅在 `__DEV__` 下使用**。
- 无需任何原生配置，开箱即用。
