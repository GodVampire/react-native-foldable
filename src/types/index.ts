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
  /** 普通智能手机（含折叠态下的外屏） */
  PHONE = 'PHONE',
  /** Android 平板电脑（非 iPad，屏幕较大但无折叠行为） */
  TABLET = 'TABLET',
  /** 双折叠屏设备，如 Samsung Z Fold 系列（折叠/展开两种宽度状态） */
  FOLDABLE = 'FOLDABLE',
  /** 三折叠屏设备，如华为 Mate XT（折叠/半展/全展三种宽度状态） */
  TRI_FOLDABLE = 'TRI_FOLDABLE',
  /** Apple iPad / iPadOS 设备 */
  IPAD = 'IPAD',
  /** 桌面端或超大屏设备（宽度 ≥ xxl 断点，如 macOS Catalyst） */
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
  /** 单栏布局：手机或折叠态，内容全宽显示，通常配合底部 Tab 导航 */
  SINGLE = 'SINGLE',
  /** 双栏布局：大屏手机或折叠半开，左侧列表 + 右侧详情的主从结构 */
  DUAL = 'DUAL',
  /** 三栏布局：三折叠全展开时的三列并排结构 */
  TRI = 'TRI',
  /** 侧边栏布局：左侧固定宽度导航栏 + 右侧主内容区（平板/折叠全展） */
  SIDEBAR = 'SIDEBAR',
  /** 侧边栏 + 双栏：左侧导航栏 + 中间列表 + 右侧详情（三折叠/大平板） */
  SIDEBAR_DUAL = 'SIDEBAR_DUAL',
}

export enum Orientation {
  /** 竖屏：高度大于宽度 */
  PORTRAIT = 'PORTRAIT',
  /** 横屏：宽度大于等于高度 */
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
  /** 超小屏最小宽度，默认 0dp */
  xs: number
  /** 小屏最小宽度，默认 360dp（标准手机/折叠态） */
  sm: number
  /** 中屏最小宽度，默认 600dp（大屏手机/折叠半开） */
  md: number
  /** 大屏最小宽度，默认 840dp（平板/折叠全展） */
  lg: number
  /** 超大屏最小宽度，默认 1200dp（三折叠全展/大平板） */
  xl: number
  /** 极大屏最小宽度，默认 1600dp（超大屏/桌面） */
  xxl: number
}

export interface ScreenMetrics {
  /** 逻辑宽度（dp） */
  width: number
  /** 逻辑高度（dp） */
  height: number
  /** 像素密度（物理像素 / 逻辑像素） */
  scale: number
  /** 字体缩放比例（用户无障碍设置） */
  fontScale: number
}

/**
 * 完整屏幕感知信息
 * 由 FoldableProvider 维护，通过 useFoldableScreen() 消费
 */
export interface FoldableScreenInfo {
  /** 当前窗口逻辑宽度（dp），多窗口/折叠时与屏幕物理宽度不同 */
  width: number
  /** 当前窗口逻辑高度（dp） */
  height: number
  /** 物理屏幕宽度（dp），不受多窗口影响 */
  screenWidth: number
  /** 物理屏幕高度（dp） */
  screenHeight: number
  /** 当前屏幕方向 */
  orientation: Orientation
  /** 折叠状态（折叠/半折/展开/三折中间态/三折全开/未知） */
  foldState: FoldState
  /** 识别到的设备类型 */
  deviceType: DeviceType
  /** 当前推荐布局模式 */
  layoutMode: LayoutMode
  /** 当前响应式断点名称 */
  breakpoint: Breakpoint
  /** 推荐的网格列数（1-4） */
  columns: number
  /** 是否为平板设备（TABLET 或 IPAD） */
  isTablet: boolean
  /** 是否为可折叠设备（双折叠或三折叠） */
  isFoldable: boolean
  /** 是否为三折叠设备 */
  isTriFold: boolean
  /** 是否为 iPad（由平台静态检测，不随尺寸变化） */
  isPad: boolean
  /** 是否运行在鸿蒙 (HarmonyOS) 系统上 */
  isHarmony: boolean
  /** 当前窗口宽度是否达到侧边栏显示阈值 */
  showSidebar: boolean
  /** 当前窗口宽度是否达到大屏断点（≥ lg） */
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
  /** 开启调试日志，打印每次尺寸/折叠状态变化，默认 false */
  debug?: boolean
  /**
   * 强制指定设备类型，用于绕过冷启动识别局限。
   *
   * 纯 JS 方案在以下场景无法通过宽度历史推断设备类型：
   * - 三折叠设备以 TRI_HALF 态（~800dp）冷启动：宽度与普通平板重叠，无法区分
   * - 三折叠设备始终在 TRI_HALF 范围内使用、从不展开至 TRI_FULL（≥900dp）
   *
   * 如需首帧即准确识别，可通过 react-native-device-info 等库获取设备型号后手动传入：
   * ```tsx
   * import DeviceInfo from 'react-native-device-info'
   * const model = DeviceInfo.getModel() // e.g. "Mate XT"
   * <FoldableProvider config={{
   *   deviceTypeHint: model.includes('Mate XT') ? DeviceType.TRI_FOLDABLE : undefined
   * }}>
   * ```
   */
  deviceTypeHint?: DeviceType
}

export interface AdaptiveLayoutProps {
  /** SINGLE 模式下渲染的内容（全宽单栏） */
  children?: React.ReactNode
  /** DUAL/SIDEBAR_DUAL 模式下左侧/主列内容 */
  leadingContent?: React.ReactNode
  /** DUAL/SIDEBAR_DUAL 模式下右侧/详情列内容 */
  trailingContent?: React.ReactNode
  /** TRI 模式下中间列内容 */
  centerContent?: React.ReactNode
  /** SIDEBAR/SIDEBAR_DUAL 模式下左侧固定导航栏内容 */
  sidebar?: React.ReactNode
  /** 侧边栏宽度（dp），默认 240 */
  sidebarWidth?: number
  /** 容器样式 */
  style?: import('react-native').ViewStyle
  /** DUAL 模式下两列宽度比例，默认 [1, 2] */
  columnRatio?: [number, number]
}

export interface SidebarLayoutProps {
  /** 左侧固定侧边栏内容，传入 null 时隐藏侧边栏（退为单栏） */
  sidebar: React.ReactNode
  /** 右侧主内容区 */
  children: React.ReactNode
  /** 显示侧边栏的最小窗口宽度（dp），低于此值自动隐藏，默认同 sidebarMinWidth */
  minWidth?: number
  /** 侧边栏宽度（dp），默认 240 */
  sidebarWidth?: number
  /** 侧边栏容器追加样式 */
  sidebarStyle?: import('react-native').ViewStyle
  /** 主内容区容器追加样式 */
  contentStyle?: import('react-native').ViewStyle
  /** 整体容器样式 */
  style?: import('react-native').ViewStyle
}

export interface FoldAwareViewProps {
  /**
   * 子内容，支持两种写法：
   * - 静态节点：直接渲染，不感知折叠状态
   * - render prop：`(info: FoldableScreenInfo) => ReactNode`，可读取完整屏幕信息
   */
  children: React.ReactNode | ((info: FoldableScreenInfo) => React.ReactNode)
  /** 容器样式 */
  style?: import('react-native').ViewStyle
}

export interface NavigationLayoutHint {
  /** 是否应显示永久侧边栏导航（宽屏/平板/折叠展开时为 true） */
  useSidebar: boolean
  /** 是否应显示底部 Tab 导航（窄屏/折叠态时为 true） */
  useBottomTab: boolean
  /** 是否应使用 Drawer 模式（中等宽度时为 true，permanent 或 front 由 useSidebar 决定） */
  useDrawer: boolean
  /** 建议的侧边栏/Drawer 宽度（dp） */
  sidebarWidth: number
  /** 当前布局模式，可用于导航结构切换的判断依据 */
  layoutMode: LayoutMode
  /** 当前折叠状态，可用于精细化导航动画或过渡效果 */
  foldState: FoldState
}
