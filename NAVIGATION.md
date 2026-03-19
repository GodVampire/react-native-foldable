# 导航与组件适配指南

> 本文档专注于 `@hecom/react-native-foldable` 的导航适配与组件使用方案。
> 基础安装与 Hooks API 请参阅 [README.md](README.md)。

---

## 目录

- [导航适配方案](#导航适配方案)
  - [方案 A：FoldableNavigationContainer（一体化，推荐）](#方案-a-foldablenavigationcontainer一体化推荐)
  - [方案 B：useFoldableNavigation + 自定义导航](#方案-b-usefoldablenavigation--自定义导航)
  - [方案 C：React Navigation Drawer permanent 模式](#方案-c-react-navigation-drawer-permanent-模式)
- [组件 API](#组件-api)
  - [FoldableProvider](#foldableprovider)
  - [AdaptiveLayout](#adaptivelayout)
  - [SidebarLayout](#sidebarlayout)
  - [FoldAwareView](#foldawareview)
- [完整生产示例](#完整生产示例)

---

## 导航适配方案

折叠屏设备在不同展开状态下宽度差异显著，导航容器需要跟随切换形态：
- 窄屏（折叠态）：底部 Tab 导航
- 宽屏（展开态）：左侧永久侧边栏

以下三种方案按工程接入成本从低到高排列，按需选择。

---

### 方案 A：`FoldableNavigationContainer`（一体化，推荐）

最简接入方式，只需替换 Provider 层，内部自动处理侧边栏与底部 Tab 的切换逻辑。

```tsx
// App.tsx
import { NavigationContainer } from '@react-navigation/native'
import { FoldableNavigationContainer } from '@hecom/react-native-foldable'

export default function App() {
  return (
    <NavigationContainer>
      <FoldableNavigationContainer
        config={{ debug: __DEV__ }}
        sidebarWidth={260}
        renderSidebar={(info) => <MySidebarNav foldState={info.foldState} />}
        renderBottomBar={() => <MyBottomTabBar />}
      >
        {() => <RootStack />}
      </FoldableNavigationContainer>
    </NavigationContainer>
  )
}
```

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `config` | `FoldableConfig` | Provider 配置，同 `FoldableProvider` |
| `sidebarWidth` | `number` | 侧边栏宽度（dp），默认 `240` |
| `renderSidebar` | `(info) => ReactNode` | 宽屏时渲染侧边栏，`null` 表示不渲染 |
| `renderBottomBar` | `() => ReactNode` | 窄屏时渲染底部导航栏 |
| `children` | `() => ReactNode` | 主内容区（render prop） |

---

### 方案 B：`useFoldableNavigation` + 自定义导航（适合现有工程改造）

对已有导航结构的工程，通过 Hook 获取布局建议，在外部控制显示逻辑，侵入性最低。

```tsx
// RootNavigator.tsx
import { useFoldableNavigation, SidebarLayout } from '@hecom/react-native-foldable'

function RootNavigator() {
  const { useSidebar, useBottomTab, sidebarWidth } = useFoldableNavigation()

  return (
    <SidebarLayout
      sidebar={useSidebar ? <MySidebarMenu /> : null}
      sidebarWidth={sidebarWidth}
    >
      <MyCustomStack />
      {useBottomTab && <MyBottomTabBar />}
    </SidebarLayout>
  )
}
```

**`useFoldableNavigation` 返回值：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `useSidebar` | `boolean` | 是否应显示侧边栏 |
| `useBottomTab` | `boolean` | 是否应显示底部 Tab |
| `sidebarWidth` | `number` | 推荐侧边栏宽度（dp） |
| `layoutMode` | `LayoutMode` | 当前布局模式 |

**可选参数：**

```ts
useFoldableNavigation({
  sidebarWidth: 260,      // 覆盖默认宽度
  sidebarMinWidth: 860,   // 显示侧边栏的最小屏幕宽度（dp）
})
```

---

### 方案 C：React Navigation Drawer permanent 模式

若项目已使用 React Navigation Drawer，可直接通过 `drawerType` 切换常驻/浮层模式，无需引入额外组件。

```tsx
import { createDrawerNavigator } from '@react-navigation/drawer'
import { useFoldableNavigation } from '@hecom/react-native-foldable'

const Drawer = createDrawerNavigator()

function AppNavigator() {
  const { useSidebar, sidebarWidth } = useFoldableNavigation()

  return (
    <Drawer.Navigator
      drawerType={useSidebar ? 'permanent' : 'front'}
      drawerStyle={{ width: sidebarWidth }}
      drawerContent={(props) => <AppDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
    </Drawer.Navigator>
  )
}
```

> `drawerType: 'permanent'` 时抽屉常驻左侧，不遮挡内容区；`'front'` 时为普通浮层抽屉。

---

## 组件 API

### `<FoldableProvider>`

根组件，必须在使用任何 Hook 或组件之前包裹应用。

```tsx
<FoldableProvider
  config={{
    breakpoints: { lg: 900 },      // 自定义断点（dp）
    sidebarMinWidth: 860,           // 侧边栏显示阈值
    triFoldThreshold: 950,          // 三折叠全展开识别宽度
    foldableMinUnfoldedWidth: 650,  // 折叠设备展开识别宽度
    debounceDelay: 200,             // 防抖延迟(ms)
    debug: true,                    // 开启状态日志
  }}
>
  {children}
</FoldableProvider>
```

**`config` 字段说明：**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `breakpoints` | `Partial<Breakpoints>` | 见断点表 | 自定义各级断点宽度（dp） |
| `sidebarMinWidth` | `number` | `840` | 宽于此值时显示侧边栏 |
| `triFoldThreshold` | `number` | `900` | 识别三折叠全展开的最小宽度 |
| `foldableMinUnfoldedWidth` | `number` | `600` | 识别折叠设备展开态的最小宽度 |
| `debounceDelay` | `number` | `150` | 尺寸变化防抖延迟（ms） |
| `debug` | `boolean` | `false` | 开启控制台状态日志 |

---

### `<AdaptiveLayout>`

多栏自适应布局组件，根据当前 `layoutMode` 自动切换渲染结构。

| LayoutMode | 渲染结构 |
|-----------|---------|
| `SINGLE` | `children` 全宽 |
| `DUAL` | `leadingContent` \| `trailingContent` |
| `TRI` | `leadingContent` \| `children`(center) \| `trailingContent` |
| `SIDEBAR` | `sidebar`（固定宽） + `children`（flex） |
| `SIDEBAR_DUAL` | `sidebar` + `leadingContent` + `trailingContent` |

```tsx
<AdaptiveLayout
  sidebar={<NavMenu />}
  leadingContent={<ArticleList />}
  trailingContent={<ArticleDetail />}
  sidebarWidth={240}
  columnRatio={[1, 2]}
>
  <ArticleListScreen /> {/* 单列（SINGLE）时渲染 */}
</AdaptiveLayout>
```

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `children` | `ReactNode` | `SINGLE` 模式下的主内容 |
| `sidebar` | `ReactNode` | 侧边栏内容（`SIDEBAR` / `SIDEBAR_DUAL` 时显示） |
| `leadingContent` | `ReactNode` | 左/主列内容 |
| `trailingContent` | `ReactNode` | 右/次列内容 |
| `sidebarWidth` | `number` | 侧边栏固定宽度（dp），默认 `240` |
| `columnRatio` | `[number, number]` | 双列时左右宽度比例，如 `[1, 2]` |

---

### `<SidebarLayout>`

侧边导航骨架组件，sidebar 有内容时呈水平布局，否则 children 全宽。

```tsx
<SidebarLayout
  sidebar={<NavigationMenu />}
  sidebarWidth={240}
  sidebarStyle={{ backgroundColor: '#1a1a2e' }}
>
  <Stack.Navigator />
</SidebarLayout>
```

**Props：**

| 属性 | 类型 | 说明 |
|------|------|------|
| `sidebar` | `ReactNode \| null` | 侧边栏内容，`null` 时隐藏 |
| `sidebarWidth` | `number` | 侧边栏宽度（dp），默认 `240` |
| `sidebarStyle` | `ViewStyle` | 侧边栏容器样式 |
| `contentStyle` | `ViewStyle` | 主内容区容器样式 |
| `children` | `ReactNode` | 主内容 |

---

### `<FoldAwareView>`

Render prop 组件，将折叠状态注入子组件，适合需要精细控制布局的场景。

```tsx
<FoldAwareView>
  {({ foldState, showSidebar, width, layoutMode }) => (
    <View style={{ flexDirection: showSidebar ? 'row' : 'column' }}>
      <Text>折叠状态：{foldState}</Text>
    </View>
  )}
</FoldAwareView>
```

**Render prop 参数：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `foldState` | `FoldState` | 当前折叠状态 |
| `layoutMode` | `LayoutMode` | 当前布局模式 |
| `showSidebar` | `boolean` | 是否应显示侧边栏 |
| `width` | `number` | 当前窗口宽度（dp） |
| `height` | `number` | 当前窗口高度（dp） |
| `breakpoint` | `Breakpoint` | 当前响应式断点 |

---

## 完整生产示例

以下示例综合了 Provider、导航布局自适应与折叠动画，适合作为新项目的起步模板。

```tsx
// App.tsx
import React from 'react'
import { LayoutAnimation, Platform } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import {
  FoldableProvider,
  SidebarLayout,
  useFoldableNavigation,
  useFoldStateChange,
} from '@hecom/react-native-foldable'

function RootNavigator() {
  const { useSidebar, sidebarWidth } = useFoldableNavigation({ sidebarWidth: 260 })

  // 折叠状态变化时触发过渡动画（iOS 不支持 LayoutAnimation + RN 新架构，需跳过）
  useFoldStateChange(() => {
    if (Platform.OS !== 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    }
  })

  return (
    <SidebarLayout
      sidebar={useSidebar ? <AppSidebarNav /> : null}
      sidebarWidth={sidebarWidth}
    >
      <AppStackNavigator />
    </SidebarLayout>
  )
}

export default function App() {
  return (
    <FoldableProvider config={{ debug: __DEV__ }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </FoldableProvider>
  )
}
```
