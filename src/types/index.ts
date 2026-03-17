/**
 * react-native-foldable — 核心类型定义
 *
 * 支持设备：iOS / Android / 鸿蒙(HarmonyOS) / iPadOS
 * 支持形态：普通手机、iPad、双折叠屏、三折叠屏、Android 平板
 */

// ─── 折叠状态 ─────────────────────────────────────────────────────────────────

/**
 * 设备折叠状态枚举
 *
 * 状态机流转（三折叠示例）：
 *   FOLDED ──展开一屏──► TRI_HALF ──再展开──► TRI_FULL
 *   FOLDED ──展开──► UNFOLDED（双折叠）
 *   HALF_FOLDED（桌面/帐篷模式，屏幕弯折角度约 90°）
 */
export enum FoldState {
  /** 完全折叠，呈现为普通手机形态 */
  FOLDED = 'FOLDED',
  /** 半折叠：桌面模式/帐篷模式（屏幕弯折，两部分分别显示内容） */
  HALF_FOLDED = 'HALF_FOLDED',
  /** 完全展开（双折叠/大屏平板模式） */
  UNFOLDED = 'UNFOLDED',
  /** 三折叠：展开了一个面板（中间态） */
  TRI_HALF = 'TRI_HALF',
  /** 三折叠：三屏全部展开（最宽态） */
  TRI_FULL = 'TRI_FULL',
  /** 未知/初始状态（平板/普通手机） */
  UNKNOWN = 'UNKNOWN',
}

// ─── 设备类型 ─────────────────────────────────────────────────────────────────

export enum DeviceType {
  PHONE = 'PHONE',
  TABLET = 'TABLET',
  FOLDABLE = 'FOLDABLE',
  TRI_FOLDABLE = 'TRI_FOLDABLE',
  IPAD = 'IPAD',
  DESKTOP = 'DESKTOP',
}

// ─── 布局模式 ─────────────────────────────────────────────────────────────────

/**
 * 布局模式枚举
 *
 * SINGLE       → 单栏（手机/折叠态，底部 Tab）
 * DUAL         → 双栏（大屏手机/折叠半开，主从布局）
 * TRI          → 三栏（三折叠全开）
 * SIDEBAR      → 左侧固定侧边栏 + 单主内容区（平板/折叠展开）
 * SIDEBAR_DUAL → 左侧侧边栏 + 中间列表 + 右侧详情（三折叠/大平板）
 */
export enum LayoutMode {
  SINGLE = 'SINGLE',
  DUAL = 'DUAL',
  TRI = 'TRI',
  SIDEBAR = 'SIDEBAR',
  SIDEBAR_DUAL = 'SIDEBAR_DUAL',
}

export enum Orientation {
  PORTRAIT = 'PORTRAIT',
  LANDSCAPE = 'LANDSCAPE',
}

/**
 * 响应式断点名称
 *
 * xs: <360    超小屏
 * sm: 360–599 标准手机/折叠态
 * md: 600–839 大屏手机/折叠半开
 * lg: 840–1199 平板/折叠全开
 * xl: 1200–1599 三折叠全开/大平板
 * xxl: ≥1600  超大屏
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

export interface BreakpointValues {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

export interface ScreenMetrics {
  width: number
  height: number
  scale: number
  fontScale: number
}

/**
 * 完整屏幕感知信息
 * 由 FoldableProvider 维护，通过 useFoldableScreen() 消费
 */
export interface FoldableScreenInfo {
  width: number
  height: number
  screenWidth: number
  screenHeight: number
  orientation: Orientation
  foldState: FoldState
  deviceType: DeviceType
  layoutMode: LayoutMode
  breakpoint: Breakpoint
  columns: number
  isTablet: boolean
  isFoldable: boolean
  isTriFold: boolean
  isPad: boolean
  isHarmony: boolean
  showSidebar: boolean
  isWideScreen: boolean
}

export interface FoldableConfig {
  breakpoints?: Partial<BreakpointValues>
  /** 侧边栏显示最小宽度，默认 840 */
  sidebarMinWidth?: number
  /** 三折叠完全展开宽度阈值，默认 900 */
  triFoldThreshold?: number
  /** 可折叠设备最小展开宽度，默认 600 */
  foldableMinUnfoldedWidth?: number
  /** 防抖延迟(ms)，默认 150 */
  debounceDelay?: number
  debug?: boolean
}

export interface AdaptiveLayoutProps {
  children?: React.ReactNode
  leadingContent?: React.ReactNode
  trailingContent?: React.ReactNode
  centerContent?: React.ReactNode
  sidebar?: React.ReactNode
  sidebarWidth?: number
  style?: import('react-native').ViewStyle
  columnRatio?: [number, number]
}

export interface SidebarLayoutProps {
  sidebar: React.ReactNode
  children: React.ReactNode
  minWidth?: number
  sidebarWidth?: number
  sidebarStyle?: import('react-native').ViewStyle
  contentStyle?: import('react-native').ViewStyle
  style?: import('react-native').ViewStyle
}

export interface FoldAwareViewProps {
  children: React.ReactNode | ((info: FoldableScreenInfo) => React.ReactNode)
  style?: import('react-native').ViewStyle
}

export interface NavigationLayoutHint {
  useSidebar: boolean
  useBottomTab: boolean
  useDrawer: boolean
  sidebarWidth: number
  layoutMode: LayoutMode
  foldState: FoldState
}
