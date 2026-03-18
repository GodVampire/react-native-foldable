/**
 * @packageDocumentation
 * react-native-foldable — React Native 多折叠屏幕自适应布局库
 *
 * 支持设备：普通手机 / Android 平板 / iPad / 双折叠屏 / 三折叠屏 / 鸿蒙 (HarmonyOS)
 *
 * ## 快速上手
 *
 * ### 1. 根组件包裹 Provider
 * ```tsx
 * import { FoldableProvider } from '@hecom/react-native-foldable'
 *
 * export default function App() {
 *   return (
 *     <FoldableProvider config={{ debug: __DEV__ }}>
 *       <RootNavigator />
 *       {__DEV__ && <FoldDebugPanel />}
 *     </FoldableProvider>
 *   )
 * }
 * ```
 *
 * ### 2. 页面中消费折叠状态
 * ```tsx
 * import { useFoldableScreen } from '@hecom/react-native-foldable'
 *
 * function HomeScreen() {
 *   const { foldState, layoutMode, showSidebar, isTriFold, width } = useFoldableScreen()
 *   return <Text>{foldState} / {layoutMode}</Text>
 * }
 * ```
 *
 * ### 3. 开发环境模拟折叠状态
 * ```tsx
 * import { simulationManager } from '@hecom/react-native-foldable'
 *
 * simulationManager.setPreset('tri_fold_full') // 模拟三折叠全展
 * simulationManager.clear()                    // 恢复真实设备
 * ```
 *
 * @see {@link https://github.com/GodVampire/react-native-foldable} GitHub 仓库
 * @see {@link https://www.npmjs.com/package/@hecom/react-native-foldable} npm 主页
 */

// ─── 枚举类型 ────────────────────────────────────────────────────────────────
/**
 * 折叠状态枚举 {@link FoldState}、设备类型枚举 {@link DeviceType}、
 * 布局模式枚举 {@link LayoutMode}、屏幕方向枚举 {@link Orientation}
 */
export { FoldState, DeviceType, LayoutMode, Orientation } from './types'

// ─── 接口类型 ────────────────────────────────────────────────────────────────
/**
 * 核心接口与类型别名：
 * - {@link FoldableScreenInfo} — 完整屏幕感知信息（由 `useFoldableScreen` 返回）
 * - {@link FoldableConfig} — `FoldableProvider` 配置项
 * - {@link BreakpointValues} — 断点像素值表
 * - {@link NavigationLayoutHint} — 导航布局建议（由 `useFoldableNavigation` 返回）
 * - {@link AdaptiveLayoutProps} — `AdaptiveLayout` 组件属性
 * - {@link SidebarLayoutProps} — `SidebarLayout` 组件属性
 * - {@link FoldAwareViewProps} — `FoldAwareView` 组件属性
 */
export type {
  Breakpoint,
  BreakpointValues,
  ScreenMetrics,
  FoldableScreenInfo,
  FoldableConfig,
  NavigationLayoutHint,
  AdaptiveLayoutProps,
  SidebarLayoutProps,
  FoldAwareViewProps,
} from './types'

// ─── Provider ────────────────────────────────────────────────────────────────
/**
 * `FoldableProvider` — 全局状态提供者，必须包裹在 App 根部。
 *
 * 负责监听屏幕尺寸变化、推断折叠状态与布局模式，并通过 React Context
 * 向所有子组件下发最新的 {@link FoldableScreenInfo}。
 *
 * @example
 * ```tsx
 * <FoldableProvider config={{ sidebarMinWidth: 860, debug: __DEV__ }}>
 *   <App />
 * </FoldableProvider>
 * ```
 */
export { FoldableProvider } from './context/FoldableProvider'
export type { FoldableProviderProps } from './context/FoldableProvider'

// ─── Hooks ───────────────────────────────────────────────────────────────────
/**
 * 内置 Hooks：
 *
 * ---
 *
 * ### `useFoldableScreen()` — 完整屏幕状态
 * 获取宽高、折叠态、布局模式、断点等所有信息。适用于需要根据折叠形态做复杂布局决策的场景。
 * ```tsx
 * function HomeScreen() {
 *   const { foldState, layoutMode, width, isTriFold } = useFoldableScreen()
 *
 *   if (isTriFold && foldState === FoldState.TRI_FULL) {
 *     return <ThreeColumnLayout />
 *   }
 *   return <View style={{ padding: width > 840 ? 24 : 16 }} />
 * }
 * ```
 *
 * ---
 *
 * ### `useScreenLayout()` — 布局模式布尔值
 * 只关心"现在该用哪种布局"，不需要原始枚举值。
 * ```tsx
 * function AppShell() {
 *   const { isSidebar, isSidebarDual, isSingle } = useScreenLayout()
 *   return (
 *     <View style={{ flexDirection: 'row' }}>
 *       {!isSingle && <NavigationSidebar />}
 *       <MainContent />
 *       {isSidebarDual && <DetailPanel />}
 *     </View>
 *   )
 * }
 * ```
 *
 * ---
 *
 * ### `useBreakpoint()` — 响应式断点查询
 * 类似 CSS 媒体查询，根据当前断点控制样式或行为。
 * ```tsx
 * function ProductGrid() {
 *   const { up } = useBreakpoint()
 *   const numColumns = up('xl') ? 4 : up('lg') ? 3 : up('md') ? 2 : 1
 *   return <FlatList numColumns={numColumns} data={products} renderItem={renderItem} />
 * }
 * ```
 *
 * ---
 *
 * ### `useAdaptiveStyle()` — 响应式样式（mobile-first 叠加）
 * 同一组件在不同屏幕宽度下应用不同样式，从 `base` 开始向上叠加。
 * ```tsx
 * function Card() {
 *   const style = useAdaptiveStyle({
 *     base: { padding: 12, borderRadius: 8 },
 *     md:   { padding: 16 },
 *     lg:   { padding: 24, flexDirection: 'row' },
 *   })
 *   return <View style={style} />
 * }
 * ```
 *
 * ---
 *
 * ### `useAdaptiveValue()` — 响应式单值
 * 字号、间距、列数等单一数值随断点变化。
 * ```tsx
 * function ArticleTitle({ title }: { title: string }) {
 *   const fontSize   = useAdaptiveValue({ base: 18, md: 22, lg: 26, xl: 30 })
 *   const lineHeight = useAdaptiveValue({ base: 26, md: 32, lg: 38, xl: 44 })
 *   return <Text style={{ fontSize, lineHeight }}>{title}</Text>
 * }
 * ```
 *
 * ---
 *
 * ### `useFoldStateChange()` / `useLayoutModeChange()` — 变化事件
 * 折叠/展开时触发动画、埋点、重置滚动位置等副作用。
 * ```tsx
 * function Screen() {
 *   const scrollRef = useRef<ScrollView>(null)
 *
 *   useLayoutModeChange(() => {
 *     // 布局切换时回到顶部并触发过渡动画
 *     scrollRef.current?.scrollTo({ y: 0 })
 *     if (Platform.OS !== 'ios') {
 *       LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
 *     }
 *   })
 *
 *   useFoldStateChange((next, prev) => {
 *     analytics.track('fold_state_change', { from: prev, to: next })
 *   })
 * }
 * ```
 *
 * ---
 *
 * ### `useFoldableNavigation()` — 导航布局建议
 * 根据屏幕宽度自动在"底部 Tab"和"永久侧边栏"之间切换，适合现有工程改造。
 * ```tsx
 * function RootNavigator() {
 *   const { useSidebar, useBottomTab, sidebarWidth } = useFoldableNavigation()
 *   return (
 *     <SidebarLayout
 *       sidebar={useSidebar ? <AppSidebarNav /> : null}
 *       sidebarWidth={sidebarWidth}
 *     >
 *       <AppStackNavigator />
 *       {useBottomTab && <BottomTabBar />}
 *     </SidebarLayout>
 *   )
 * }
 * ```
 */
export { useFoldableScreen } from './hooks/useFoldableScreen'
export { useScreenLayout } from './hooks/useScreenLayout'
export type { ScreenLayoutAPI } from './hooks/useScreenLayout'
export { useBreakpoint } from './hooks/useBreakpoint'
export type { BreakpointAPI } from './hooks/useBreakpoint'
export { useAdaptiveStyle, useAdaptiveValue } from './hooks/useAdaptiveStyle'
export { useFoldStateChange, useLayoutModeChange } from './hooks/useFoldStateChange'
export { useFoldableNavigation } from './navigation/useFoldableNavigation'
export type { FoldableNavigationOptions } from './navigation/useFoldableNavigation'

// ─── 组件 ────────────────────────────────────────────────────────────────────
/**
 * 内置组件：
 *
 * | 组件 | 说明 |
 * |------|------|
 * | `FoldAwareView` | render-prop 容器，子函数可接收完整 `FoldableScreenInfo` |
 * | `AdaptiveLayout` | 自动在 SINGLE / DUAL / TRI / SIDEBAR / SIDEBAR_DUAL 间切换的多栏布局 |
 * | `SidebarLayout` | 左侧固定侧边栏 + 右侧主内容的骨架容器 |
 * | `FoldableNavigationContainer` | 一体化导航适配容器，内置侧边栏/底部 Tab 自动切换 |
 */
export { FoldAwareView } from './components/FoldAwareView'
export { AdaptiveLayout } from './components/AdaptiveLayout'
export { SidebarLayout } from './components/SidebarLayout'
export { FoldableNavigationContainer } from './navigation/FoldableNavigationContainer'
export type { FoldableNavigationContainerProps } from './navigation/FoldableNavigationContainer'

// ─── 底层工具（高级用法） ─────────────────────────────────────────────────────
/**
 * 底层工具，供有特殊需求时直接操作核心模块：
 *
 * - `dimensionManager` — 全局尺寸单例，监听 `Dimensions` 变化并维护宽度历史
 * - `detectScreenInfo()` — 根据输入参数直接计算 `FoldableScreenInfo`，可脱离 Provider 使用
 * - `detectFromDimensionManager()` — 读取 `dimensionManager` 当前快照并计算屏幕信息
 * - `getBreakpoint()` / `getColumnCount()` / `mergeBreakpoints()` — 断点工具函数
 * - `IS_PAD` / `IS_HARMONY` — 平台静态检测常量
 * - `DEFAULT_*` — 各项默认阈值常量
 */
export { dimensionManager } from './core/DimensionManager'
export { detectScreenInfo, detectFromDimensionManager } from './core/FoldStateDetector'
export { getBreakpoint, getColumnCount, mergeBreakpoints, IS_PAD, IS_HARMONY } from './core/PlatformDetector'
export {
  DEFAULT_BREAKPOINTS,
  DEFAULT_SIDEBAR_MIN_WIDTH,
  DEFAULT_SIDEBAR_WIDTH,
  DEFAULT_TRI_FOLD_THRESHOLD,
  DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
} from './core/constants'

// ─── 调试 / 模拟工具（仅开发环境使用） ───────────────────────────────────────
/**
 * 折叠屏调试模拟器，**仅在开发环境使用**，勿在生产包中引入。
 *
 * - `simulationManager` — 全局模拟器单例，可注入任意预设或自定义屏幕状态
 * - `SIMULATION_PRESETS` — 10 个内置设备预设（手机 / 平板 / iPad / 双折叠 / 三折叠）
 * - `PRESET_ORDER` — 调试面板中预设的展示顺序
 * - `FoldDebugPanel` — 可视化悬浮调试面板，点选预设即切换模拟状态
 *
 * @example
 * ```tsx
 * // App.tsx
 * {__DEV__ && <FoldDebugPanel position="bottom-right" />}
 * ```
 *
 * @example
 * ```ts
 * // 命令式 API
 * simulationManager.setPreset('tri_fold_full')
 * simulationManager.setPreset('fold_open')
 * simulationManager.clear() // 恢复真实设备
 * ```
 */
export { simulationManager, SIMULATION_PRESETS, PRESET_ORDER } from './debug/SimulationManager'
export type { SimulationPreset, SimulationGroup, SimulationEntry } from './debug/SimulationManager'
export { FoldDebugPanel } from './debug/FoldDebugPanel'
export type { FoldDebugPanelProps, DebugPanelPosition } from './debug/FoldDebugPanel'
