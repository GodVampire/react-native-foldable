/**
 * SimulationManager — 折叠屏模拟器（仅用于开发调试）
 *
 * 在没有真实折叠设备的情况下，注入指定设备预设，驱动整个
 * FoldableProvider 的状态机，方便在 iOS 模拟器或 Android
 * 模拟器上调试各折叠形态的布局。
 *
 * 用法（命令式）：
 * ```ts
 * import { simulationManager } from 'react-native-foldable'
 *
 * simulationManager.setPreset('tri_fold_full')  // 切换到三折叠全展
 * simulationManager.clear()                     // 恢复真实设备数据
 * ```
 *
 * 也可配合 <FoldDebugPanel /> 在屏幕上点选。
 */

import {
  FoldState, DeviceType, LayoutMode, Orientation,
  type FoldableScreenInfo,
} from '../types'

// ─── 预设名称 ─────────────────────────────────────────────────────────────────

export type SimulationPreset =
  | 'phone'
  | 'tablet'
  | 'ipad'
  | 'ipad_pro'
  | 'fold_closed'
  | 'fold_half'
  | 'fold_open'
  | 'tri_fold_closed'
  | 'tri_fold_half'
  | 'tri_fold_full'

// ─── 分组标签（用于调试面板 UI 分组） ────────────────────────────────────────

export type SimulationGroup = 'common' | 'foldable' | 'tri_foldable'

// ─── 预设条目 ─────────────────────────────────────────────────────────────────

export interface SimulationEntry {
  preset: SimulationPreset
  /** 中文短名，显示在调试面板按钮上 */
  label: string
  /** 英文设备型号 + 尺寸，显示为副标题 */
  description: string
  group: SimulationGroup
  info: FoldableScreenInfo
}

// ─── 公共默认字段 ─────────────────────────────────────────────────────────────

const BASE: FoldableScreenInfo = {
  width: 390,
  height: 844,
  screenWidth: 390,
  screenHeight: 844,
  orientation: Orientation.PORTRAIT,
  foldState: FoldState.UNKNOWN,
  deviceType: DeviceType.PHONE,
  layoutMode: LayoutMode.SINGLE,
  breakpoint: 'sm',
  columns: 1,
  isTablet: false,
  isFoldable: false,
  isTriFold: false,
  isPad: false,
  isHarmony: false,
  showSidebar: false,
  isWideScreen: false,
}

// ─── 内置预设表 ───────────────────────────────────────────────────────────────

export const SIMULATION_PRESETS: Record<SimulationPreset, SimulationEntry> = {
  // ── 普通设备 ────────────────────────────────────────────────────────────────
  phone: {
    preset: 'phone',
    label: '手机',
    description: 'iPhone 15  (390×844)',
    group: 'common',
    info: { ...BASE },
  },

  tablet: {
    preset: 'tablet',
    label: '安卓平板',
    description: 'Android Tablet  (800×1280)',
    group: 'common',
    info: {
      ...BASE,
      width: 800, height: 1280,
      screenWidth: 800, screenHeight: 1280,
      orientation: Orientation.PORTRAIT,
      foldState: FoldState.UNKNOWN,
      deviceType: DeviceType.TABLET,
      layoutMode: LayoutMode.SIDEBAR,
      breakpoint: 'lg',
      columns: 3,
      isTablet: true,
      showSidebar: false,   // 800 < 840（默认侧边栏阈值）
      isWideScreen: true,
    },
  },

  ipad: {
    preset: 'ipad',
    label: 'iPad',
    description: 'iPad mini  (744×1133)',
    group: 'common',
    info: {
      ...BASE,
      width: 744, height: 1133,
      screenWidth: 744, screenHeight: 1133,
      orientation: Orientation.PORTRAIT,
      foldState: FoldState.UNKNOWN,
      deviceType: DeviceType.IPAD,
      layoutMode: LayoutMode.DUAL,
      breakpoint: 'lg',
      columns: 3,
      isTablet: true,
      isPad: true,
      showSidebar: false,  // 744 < 840
      isWideScreen: true,
    },
  },

  ipad_pro: {
    preset: 'ipad_pro',
    label: 'iPad Pro 13"',
    description: 'iPad Pro 13"  (1024×1366)',
    group: 'common',
    info: {
      ...BASE,
      width: 1024, height: 1366,
      screenWidth: 1024, screenHeight: 1366,
      orientation: Orientation.PORTRAIT,
      foldState: FoldState.UNKNOWN,
      deviceType: DeviceType.IPAD,
      layoutMode: LayoutMode.SIDEBAR_DUAL,
      breakpoint: 'xl',
      columns: 4,
      isTablet: true,
      isPad: true,
      showSidebar: true,
      isWideScreen: true,
    },
  },

  // ── 双折叠（Samsung Z Fold 6） ──────────────────────────────────────────────
  fold_closed: {
    preset: 'fold_closed',
    label: 'Z Fold 折叠',
    description: 'Samsung Z Fold6  折叠态 (374×820)',
    group: 'foldable',
    info: {
      ...BASE,
      width: 374, height: 820,
      screenWidth: 882, screenHeight: 832,
      orientation: Orientation.PORTRAIT,
      foldState: FoldState.FOLDED,
      deviceType: DeviceType.FOLDABLE,
      layoutMode: LayoutMode.SINGLE,
      breakpoint: 'sm',
      columns: 1,
      isFoldable: true,
      showSidebar: false,
      isWideScreen: false,
    },
  },

  fold_half: {
    preset: 'fold_half',
    label: 'Z Fold 帐篷',
    description: 'Samsung Z Fold6  帐篷模式 (568×512)',
    group: 'foldable',
    info: {
      ...BASE,
      width: 568, height: 512,
      screenWidth: 882, screenHeight: 832,
      orientation: Orientation.LANDSCAPE,
      foldState: FoldState.HALF_FOLDED,
      deviceType: DeviceType.FOLDABLE,
      layoutMode: LayoutMode.DUAL,
      breakpoint: 'sm',
      columns: 2,
      isFoldable: true,
      showSidebar: false,
      isWideScreen: false,
    },
  },

  fold_open: {
    preset: 'fold_open',
    label: 'Z Fold 展开',
    description: 'Samsung Z Fold6  全展开 (882×832)',
    group: 'foldable',
    info: {
      ...BASE,
      width: 882, height: 832,
      screenWidth: 882, screenHeight: 832,
      orientation: Orientation.LANDSCAPE,
      foldState: FoldState.UNFOLDED,
      deviceType: DeviceType.FOLDABLE,
      layoutMode: LayoutMode.SIDEBAR,
      breakpoint: 'lg',
      columns: 3,
      isFoldable: true,
      showSidebar: true,   // 882 >= 840
      isWideScreen: true,
    },
  },

  // ── 三折叠（华为 Mate XT） ──────────────────────────────────────────────────
  tri_fold_closed: {
    preset: 'tri_fold_closed',
    label: 'Mate XT 折叠',
    description: '华为 Mate XT  折叠态 (499×1079)',
    group: 'tri_foldable',
    info: {
      ...BASE,
      width: 499, height: 1079,
      screenWidth: 1008, screenHeight: 1079,
      orientation: Orientation.PORTRAIT,
      foldState: FoldState.FOLDED,
      deviceType: DeviceType.TRI_FOLDABLE,
      layoutMode: LayoutMode.SINGLE,
      breakpoint: 'sm',
      columns: 1,
      isFoldable: true,
      isTriFold: true,
      showSidebar: false,
      isWideScreen: false,
    },
  },

  tri_fold_half: {
    preset: 'tri_fold_half',
    label: 'Mate XT 半展',
    description: '华为 Mate XT  展开一屏 (800×848)',
    group: 'tri_foldable',
    info: {
      ...BASE,
      width: 800, height: 848,
      screenWidth: 1008, screenHeight: 1079,
      orientation: Orientation.LANDSCAPE,
      foldState: FoldState.TRI_HALF,
      deviceType: DeviceType.TRI_FOLDABLE,
      layoutMode: LayoutMode.SIDEBAR,
      breakpoint: 'lg',
      columns: 3,
      isFoldable: true,
      isTriFold: true,
      showSidebar: false,  // 800 < 840
      isWideScreen: true,
    },
  },

  tri_fold_full: {
    preset: 'tri_fold_full',
    label: 'Mate XT 全展',
    description: '华为 Mate XT  三屏全展 (1008×848)',
    group: 'tri_foldable',
    info: {
      ...BASE,
      width: 1008, height: 848,
      screenWidth: 1008, screenHeight: 1079,
      orientation: Orientation.LANDSCAPE,
      foldState: FoldState.TRI_FULL,
      deviceType: DeviceType.TRI_FOLDABLE,
      layoutMode: LayoutMode.SIDEBAR_DUAL,
      breakpoint: 'xl',
      columns: 4,
      isFoldable: true,
      isTriFold: true,
      showSidebar: true,
      isWideScreen: true,
    },
  },
}

/** 调试面板预设顺序 */
export const PRESET_ORDER: SimulationPreset[] = [
  'phone',
  'tablet',
  'ipad',
  'ipad_pro',
  'fold_closed',
  'fold_half',
  'fold_open',
  'tri_fold_closed',
  'tri_fold_half',
  'tri_fold_full',
]

// ─── SimulationManager ────────────────────────────────────────────────────────

type SimulationListener = (info: FoldableScreenInfo | null) => void

class SimulationManager {
  private _activePreset: SimulationPreset | null = null
  private _customInfo: FoldableScreenInfo | null = null
  private readonly listeners = new Set<SimulationListener>()

  /** 当前是否处于模拟态 */
  get isActive(): boolean {
    return this._activePreset !== null || this._customInfo !== null
  }

  /** 当前激活的预设名称（null 表示未模拟或使用自定义数据） */
  get currentPreset(): SimulationPreset | null {
    return this._activePreset
  }

  /**
   * 当前模拟的屏幕信息快照。
   * null 代表未激活，Consumer 应回退到真实尺寸数据。
   */
  get currentInfo(): FoldableScreenInfo | null {
    if (this._customInfo) return this._customInfo
    if (this._activePreset) return SIMULATION_PRESETS[this._activePreset].info
    return null
  }

  /**
   * 激活内置预设
   * @param preset 预设名称，参见 SimulationPreset
   */
  setPreset(preset: SimulationPreset): void {
    this._activePreset = preset
    this._customInfo = null
    this._notify()
  }

  /**
   * 注入自定义屏幕信息（高级用法）
   * 缺省字段会用 phone 预设填充，保证对象完整。
   */
  setCustom(partial: Partial<FoldableScreenInfo>): void {
    this._activePreset = null
    this._customInfo = { ...SIMULATION_PRESETS.phone.info, ...partial }
    this._notify()
  }

  /** 清除模拟，恢复真实设备数据 */
  clear(): void {
    this._activePreset = null
    this._customInfo = null
    this._notify()
  }

  /**
   * 订阅模拟状态变化。
   * 回调中 info 为 null 表示模拟已清除。
   * @returns 取消订阅函数
   */
  subscribe(listener: SimulationListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private _notify(): void {
    const info = this.currentInfo
    this.listeners.forEach((fn) => {
      try {
        fn(info)
      } catch (e) {
        if (__DEV__) console.warn('[RNFoldable][Sim] listener error:', e)
      }
    })
  }
}

/**
 * 全局模拟器单例
 *
 * ```ts
 * simulationManager.setPreset('tri_fold_full')
 * simulationManager.clear()
 * ```
 */
export const simulationManager = new SimulationManager()
