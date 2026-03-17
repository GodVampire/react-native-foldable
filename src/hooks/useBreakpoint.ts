import { useContext, useMemo } from 'react'
import { FoldableContext } from '../context/FoldableContext'
import { BREAKPOINT_ORDER } from '../core/constants'
import type { Breakpoint, BreakpointValues } from '../types'

export interface BreakpointAPI {
  breakpoint: Breakpoint
  breakpoints: BreakpointValues
  width: number
  /** 当前断点 ≥ target（mobile-first 用法） */
  up: (target: Breakpoint) => boolean
  /** 当前断点 < target */
  down: (target: Breakpoint) => boolean
  /** 当前断点在 [from, to) 区间内 */
  between: (from: Breakpoint, to: Breakpoint) => boolean
  /** 当前断点精确等于 target */
  is: (target: Breakpoint) => boolean
}

const idx = (bp: Breakpoint) => BREAKPOINT_ORDER.indexOf(bp)

/**
 * 响应式断点 Hook
 *
 * ```tsx
 * const { up, down } = useBreakpoint()
 * const padding = up('md') ? 24 : 12
 * ```
 */
export function useBreakpoint(): BreakpointAPI {
  const { screenInfo, config } = useContext(FoldableContext)
  const { breakpoint, width } = screenInfo
  const breakpoints = config.breakpoints

  return useMemo<BreakpointAPI>(() => ({
    breakpoint, breakpoints, width,
    up: (t) => idx(breakpoint) >= idx(t),
    down: (t) => idx(breakpoint) < idx(t),
    between: (from, to) => idx(breakpoint) >= idx(from) && idx(breakpoint) < idx(to),
    is: (t) => breakpoint === t,
  }), [breakpoint, breakpoints, width])
}
