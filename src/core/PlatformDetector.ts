/**
 * PlatformDetector — 平台/设备类型识别与断点计算
 */

import { Platform } from 'react-native'
import { DEFAULT_BREAKPOINTS, BREAKPOINT_ORDER } from './constants'
import { DeviceType } from '../types'
import type { BreakpointValues, Breakpoint } from '../types'

// ─── 平台标志 ─────────────────────────────────────────────────────────────────

export const IS_PAD: boolean = Platform.OS === 'ios' && !!Platform.isPad
export const IS_IOS: boolean = Platform.OS === 'ios'
export const IS_ANDROID: boolean = Platform.OS === 'android'

/**
 * 鸿蒙系统检测
 * 支持 react-native-harmony (Platform.OS === 'harmony'/'ohos') 与
 * 基于 Android 底座的鸿蒙（从 Platform.constants 中读取 osName）
 */
export const IS_HARMONY: boolean = (() => {
  const os = Platform.OS as string
  if (os === 'harmony' || os === 'ohos') return true
  if (IS_ANDROID) {
    try {
      const c = Platform.constants as Record<string, unknown>
      const osName = String(c?.osName ?? c?.Manufacturer ?? '').toLowerCase()
      const release = String(c?.Release ?? c?.Version ?? '').toLowerCase()
      if (osName.includes('harmony') || release.includes('harmony')) return true
    } catch { /* ignore */ }
  }
  return false
})()

// ─── 断点计算 ─────────────────────────────────────────────────────────────────

export function getBreakpoint(width: number, breakpoints: BreakpointValues): Breakpoint {
  for (let i = BREAKPOINT_ORDER.length - 1; i >= 0; i--) {
    const bp = BREAKPOINT_ORDER[i]
    if (width >= breakpoints[bp]) return bp
  }
  return 'xs'
}

export function getColumnCount(breakpoint: Breakpoint): number {
  switch (breakpoint) {
    case 'xs': case 'sm': return 1
    case 'md': return 2
    case 'lg': return 2
    case 'xl': return 3
    case 'xxl': return 4
    default: return 1
  }
}

export function mergeBreakpoints(custom?: Partial<BreakpointValues>): BreakpointValues {
  return { ...DEFAULT_BREAKPOINTS, ...custom }
}

// ─── 设备类型识别 ─────────────────────────────────────────────────────────────

export interface DeviceClassifyInput {
  windowWidth: number
  windowHeight: number
  maxWindowWidth: number
  hasFoldableBehavior: boolean
  hasTriFoldBehavior: boolean
  breakpoints: BreakpointValues
}

/**
 * 综合识别设备类型
 *
 * 优先级：iPad → TRI_FOLDABLE → FOLDABLE → DESKTOP → TABLET → PHONE
 */
export function classifyDeviceType(input: DeviceClassifyInput): DeviceType {
  const { maxWindowWidth, hasFoldableBehavior, hasTriFoldBehavior, breakpoints } = input

  if (IS_PAD) return DeviceType.IPAD
  if (hasTriFoldBehavior) return DeviceType.TRI_FOLDABLE
  if (hasFoldableBehavior && maxWindowWidth >= breakpoints.md) return DeviceType.FOLDABLE
  if (maxWindowWidth >= breakpoints.xxl) return DeviceType.DESKTOP
  if (maxWindowWidth >= breakpoints.md && !hasFoldableBehavior) return DeviceType.TABLET
  return DeviceType.PHONE
}
