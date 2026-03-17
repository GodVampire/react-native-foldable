/**
 * react-native-foldable — 公共 API 入口
 */

// ─── 枚举类型 ────────────────────────────────────────────────────────────────
export { FoldState, DeviceType, LayoutMode, Orientation } from './types'

// ─── 接口类型 ────────────────────────────────────────────────────────────────
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
export { FoldableProvider } from './context/FoldableProvider'
export type { FoldableProviderProps } from './context/FoldableProvider'

// ─── Hooks ───────────────────────────────────────────────────────────────────
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
export { FoldAwareView } from './components/FoldAwareView'
export { AdaptiveLayout } from './components/AdaptiveLayout'
export { SidebarLayout } from './components/SidebarLayout'
export { FoldableNavigationContainer } from './navigation/FoldableNavigationContainer'
export type { FoldableNavigationContainerProps } from './navigation/FoldableNavigationContainer'

// ─── 底层工具（高级用法） ─────────────────────────────────────────────────────
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
export { simulationManager, SIMULATION_PRESETS, PRESET_ORDER } from './debug/SimulationManager'
export type { SimulationPreset, SimulationGroup, SimulationEntry } from './debug/SimulationManager'
export { FoldDebugPanel } from './debug/FoldDebugPanel'
export type { FoldDebugPanelProps, DebugPanelPosition } from './debug/FoldDebugPanel'
