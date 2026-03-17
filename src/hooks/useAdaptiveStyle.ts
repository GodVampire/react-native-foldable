import { useMemo } from 'react'
import type { ViewStyle, TextStyle, ImageStyle } from 'react-native'
import { useBreakpoint } from './useBreakpoint'
import { BREAKPOINT_ORDER } from '../core/constants'
import type { Breakpoint } from '../types'

type AnyStyle = ViewStyle | TextStyle | ImageStyle
type StyleInput<T extends AnyStyle = AnyStyle> = Partial<Record<Breakpoint | 'base', T>>

/**
 * 响应式样式选择器（mobile-first，从小到大叠加）
 *
 * ```tsx
 * const style = useAdaptiveStyle({
 *   base: { padding: 12 },
 *   md:   { padding: 16 },
 *   lg:   { padding: 24 },
 * })
 * ```
 */
export function useAdaptiveStyle<T extends AnyStyle = ViewStyle>(styles: StyleInput<T>): T {
  const { breakpoint } = useBreakpoint()
  return useMemo<T>(() => {
    const result = { ...(styles.base ?? {}) } as T
    for (const bp of BREAKPOINT_ORDER) {
      if (BREAKPOINT_ORDER.indexOf(bp) <= BREAKPOINT_ORDER.indexOf(breakpoint) && styles[bp]) {
        Object.assign(result, styles[bp])
      }
    }
    return result
  }, [styles, breakpoint])
}

type ValueMap<T> = Partial<Record<Breakpoint, T>> & { base?: T }

/**
 * 响应式值选择器（mobile-first）
 *
 * ```tsx
 * const cols = useAdaptiveValue({ base: 1, md: 2, lg: 3, xl: 4 })
 * ```
 */
export function useAdaptiveValue<T>(map: ValueMap<T>): T | undefined {
  const { breakpoint } = useBreakpoint()
  return useMemo<T | undefined>(() => {
    let result: T | undefined = map.base
    for (const bp of BREAKPOINT_ORDER) {
      if (BREAKPOINT_ORDER.indexOf(bp) <= BREAKPOINT_ORDER.indexOf(breakpoint) && map[bp] !== undefined) {
        result = map[bp]
      }
    }
    return result
  }, [map, breakpoint])
}
