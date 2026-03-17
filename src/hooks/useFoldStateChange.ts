import { useEffect, useRef } from 'react'
import { useFoldableScreen } from './useFoldableScreen'
import type { FoldState, LayoutMode, FoldableScreenInfo } from '../types'

type FoldStateChangeCb = (next: FoldState, prev: FoldState, info: FoldableScreenInfo) => void

/**
 * 监听折叠状态变化
 *
 * ```tsx
 * useFoldStateChange((next, prev) => {
 *   LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
 * })
 * ```
 */
export function useFoldStateChange(cb: FoldStateChangeCb): void {
  const info = useFoldableScreen()
  const prevRef = useRef<FoldState>(info.foldState)
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    const prev = prevRef.current
    if (info.foldState !== prev) {
      cbRef.current(info.foldState, prev, info)
      prevRef.current = info.foldState
    }
  }, [info])
}

type LayoutModeChangeCb = (next: LayoutMode, prev: LayoutMode, info: FoldableScreenInfo) => void

/**
 * 监听布局模式变化
 *
 * ```tsx
 * useLayoutModeChange((next, prev) => {
 *   console.log(`布局: ${prev} → ${next}`)
 * })
 * ```
 */
export function useLayoutModeChange(cb: LayoutModeChangeCb): void {
  const info = useFoldableScreen()
  const prevRef = useRef<LayoutMode>(info.layoutMode)
  const cbRef = useRef(cb)
  cbRef.current = cb

  useEffect(() => {
    const prev = prevRef.current
    if (info.layoutMode !== prev) {
      cbRef.current(info.layoutMode, prev, info)
      prevRef.current = info.layoutMode
    }
  }, [info])
}
