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
 * | Hook | 说明 |
 * |------|------|
 * | `useFoldableScreen()` | 获取完整屏幕感知信息（宽高、折叠态、布局模式、断点等） |
 * | `useScreenLayout()` | 布局模式快捷访问（`isSingle` / `isSidebar` / `isDual` …） |
 * | `useBreakpoint()` | 响应式断点查询（`up()` / `down()` / `between()` / `is()`） |
 * | `useAdaptiveStyle()` | mobile-first 响应式样式叠加 |
 * | `useAdaptiveValue()` | 按断点返回不同值（列数、字号等） |
 * | `useFoldStateChange()` | 监听折叠状态变化回调 |
 * | `useLayoutModeChange()` | 监听布局模式变化回调 |
 * | `useFoldableNavigation()` | 获取导航布局建议（侧边栏 / 底部 Tab / Drawer） |
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
