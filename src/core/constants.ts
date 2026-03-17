/**
 * 内置默认常量（单位：逻辑像素 dp/pt）
 */

import type { BreakpointValues, Breakpoint } from '../types'

export const DEFAULT_BREAKPOINTS: BreakpointValues = {
  xs: 0,
  sm: 360,
  md: 600,
  lg: 840,
  xl: 1200,
  xxl: 1600,
}

export const BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl']

/** 三折叠全展开识别阈值（华为 Mate XT ≈ 1008dp，Samsung Z Fold ≈ 882dp） */
export const DEFAULT_TRI_FOLD_THRESHOLD = 900

/** 可折叠设备最小展开宽度（超过即认为有折叠行为） */
export const DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH = 600

/** 侧边栏显示阈值（窗口宽度 ≥ 此值时建议显示永久侧边栏） */
export const DEFAULT_SIDEBAR_MIN_WIDTH = 840

/** 默认侧边栏宽度 */
export const DEFAULT_SIDEBAR_WIDTH = 240

/** 折叠动画期间防抖延迟 (ms) */
export const DEFAULT_DEBOUNCE_DELAY = 150

/**
 * 宽度分桶精度 (dp)
 * 用于判断设备是否经历了不同宽度等级
 * 较大值可过滤系统 UI 缩放等导致的微小抖动
 */
export const WIDTH_BUCKET_SIZE = 40

export const LOG_PREFIX = '[RNFoldable]'
