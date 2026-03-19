/**
 * FoldableContext — 全局折叠屏状态上下文
 */

import { createContext } from 'react'
import { detectFromDimensionManager } from '../core/FoldStateDetector'
import { DEFAULT_BREAKPOINTS, DEFAULT_SIDEBAR_MIN_WIDTH, DEFAULT_TRI_FOLD_THRESHOLD, DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH } from '../core/constants'
import type { FoldableScreenInfo, FoldableConfig, BreakpointValues } from '../types'

// 已合并完整断点版本的配置类型
export interface ResolvedFoldableConfig extends Omit<Required<FoldableConfig>, 'breakpoints' | 'deviceTypeHint'> {
  breakpoints: BreakpointValues
  deviceTypeHint: FoldableConfig['deviceTypeHint']
}

export interface FoldableContextValue {
  screenInfo: FoldableScreenInfo
  config: ResolvedFoldableConfig
}

const defaultConfig: ResolvedFoldableConfig = {
  breakpoints: DEFAULT_BREAKPOINTS,
  sidebarMinWidth: DEFAULT_SIDEBAR_MIN_WIDTH,
  triFoldThreshold: DEFAULT_TRI_FOLD_THRESHOLD,
  foldableMinUnfoldedWidth: DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
  debounceDelay: 150,
  debug: false,
  deviceTypeHint: undefined,
}

export const FoldableContext = createContext<FoldableContextValue>({
  screenInfo: detectFromDimensionManager(
    DEFAULT_BREAKPOINTS as BreakpointValues,
    DEFAULT_SIDEBAR_MIN_WIDTH,
    DEFAULT_TRI_FOLD_THRESHOLD,
    DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
  ),
  config: defaultConfig,
})

FoldableContext.displayName = 'FoldableContext'
