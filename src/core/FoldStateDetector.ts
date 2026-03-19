/**
 * FoldStateDetector — 折叠状态推断引擎（核心算法，纯 JS）
 *
 * 三折叠参考尺寸（华为 Mate XT，dp）：
 *   折叠：~499  →  FoldState.FOLDED
 *   半开：~800  →  FoldState.TRI_HALF
 *   全开：~1008 →  FoldState.TRI_FULL
 *
 * 双折叠参考（Samsung Z Fold6，dp）：
 *   折叠：~374  →  FoldState.FOLDED
 *   全开：~882  →  FoldState.UNFOLDED
 */

import {
  FoldState, DeviceType, LayoutMode, Orientation,
  type FoldableScreenInfo, type BreakpointValues,
} from '../types'
import {
  DEFAULT_SIDEBAR_MIN_WIDTH, DEFAULT_TRI_FOLD_THRESHOLD,
  DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
} from './constants'
import {
  IS_PAD, IS_HARMONY,
  classifyDeviceType, getBreakpoint, getColumnCount,
} from './PlatformDetector'
import { dimensionManager } from './DimensionManager'

export interface DetectInput {
  windowWidth: number
  windowHeight: number
  screenWidth: number
  screenHeight: number
  scale: number
  fontScale: number
  breakpoints: BreakpointValues
  sidebarMinWidth: number
  triFoldThreshold: number
  foldableMinUnfoldedWidth: number
  /** 强制设备类型，覆盖自动识别（用于 TRI_HALF 冷启动等无法自动推断的场景） */
  deviceTypeHint?: DeviceType
}

// ─── 方向识别 ─────────────────────────────────────────────────────────────────

function detectOrientation(w: number, h: number): Orientation {
  return w >= h ? Orientation.LANDSCAPE : Orientation.PORTRAIT
}

// ─── 折叠状态推断 ─────────────────────────────────────────────────────────────

function inferFoldState(
  deviceType: DeviceType,
  w: number,
  h: number,
  triFoldThreshold: number,
  foldableMinUnfoldedWidth: number,
): FoldState {
  switch (deviceType) {
    case DeviceType.TRI_FOLDABLE:
      if (w >= triFoldThreshold) return FoldState.TRI_FULL
      if (w >= foldableMinUnfoldedWidth) return FoldState.TRI_HALF
      return FoldState.FOLDED

    case DeviceType.FOLDABLE: {
      // HALF_FOLDED 启发式：帐篷/桌面模式时宽高相近且宽度不大
      const ratio = w / h
      if (ratio > 0.75 && ratio < 1.35 && w < foldableMinUnfoldedWidth) {
        return FoldState.HALF_FOLDED
      }
      return w >= foldableMinUnfoldedWidth ? FoldState.UNFOLDED : FoldState.FOLDED
    }

    default:
      return FoldState.UNKNOWN
  }
}

// ─── 布局模式推断 ─────────────────────────────────────────────────────────────

function inferLayoutMode(
  deviceType: DeviceType,
  foldState: FoldState,
  w: number,
  sidebarMinWidth: number,
  breakpoints: BreakpointValues,
): LayoutMode {
  const wideEnough = w >= sidebarMinWidth

  switch (deviceType) {
    case DeviceType.TRI_FOLDABLE:
      if (foldState === FoldState.TRI_FULL) return LayoutMode.SIDEBAR_DUAL
      if (foldState === FoldState.TRI_HALF) return wideEnough ? LayoutMode.SIDEBAR : LayoutMode.DUAL
      return LayoutMode.SINGLE

    case DeviceType.FOLDABLE:
      if (foldState === FoldState.UNFOLDED) return wideEnough ? LayoutMode.SIDEBAR : LayoutMode.DUAL
      if (foldState === FoldState.HALF_FOLDED) return LayoutMode.DUAL
      return LayoutMode.SINGLE

    case DeviceType.IPAD:
    case DeviceType.TABLET:
      if (w >= breakpoints.xl) return LayoutMode.SIDEBAR_DUAL
      return wideEnough ? LayoutMode.SIDEBAR : LayoutMode.DUAL

    case DeviceType.DESKTOP:
      return LayoutMode.SIDEBAR_DUAL

    default:
      // 普通手机：按断点降级
      if (w >= breakpoints.xl) return LayoutMode.SIDEBAR_DUAL
      if (w >= sidebarMinWidth) return LayoutMode.SIDEBAR
      if (w >= breakpoints.md) return LayoutMode.DUAL
      return LayoutMode.SINGLE
  }
}

// ─── 主计算入口 ───────────────────────────────────────────────────────────────

export function detectScreenInfo(input: DetectInput): FoldableScreenInfo {
  const {
    windowWidth: w, windowHeight: h,
    screenWidth, screenHeight,
    scale, fontScale,
    breakpoints, sidebarMinWidth,
    triFoldThreshold, foldableMinUnfoldedWidth,
  } = input

  const orientation = detectOrientation(w, h)
  const breakpoint = getBreakpoint(w, breakpoints)

  const deviceType = input.deviceTypeHint ?? classifyDeviceType({
    windowWidth: w, windowHeight: h,
    maxWindowWidth: dimensionManager.maxWindowWidth,
    hasFoldableBehavior: dimensionManager.isFoldableBehavior(foldableMinUnfoldedWidth),
    hasTriFoldBehavior: dimensionManager.isTriFoldBehavior(triFoldThreshold, foldableMinUnfoldedWidth),
    breakpoints,
  })

  const foldState = inferFoldState(deviceType, w, h, triFoldThreshold, foldableMinUnfoldedWidth)
  const layoutMode = inferLayoutMode(deviceType, foldState, w, sidebarMinWidth, breakpoints)
  const columns = getColumnCount(breakpoint)

  return {
    width: w, height: h, screenWidth, screenHeight,
    orientation, foldState, deviceType, layoutMode, breakpoint, columns,
    isTablet: deviceType === DeviceType.TABLET || deviceType === DeviceType.IPAD,
    isFoldable: deviceType === DeviceType.FOLDABLE || deviceType === DeviceType.TRI_FOLDABLE,
    isTriFold: deviceType === DeviceType.TRI_FOLDABLE,
    isPad: IS_PAD,
    isHarmony: IS_HARMONY,
    showSidebar: w >= sidebarMinWidth,
    isWideScreen: w >= breakpoints.lg,
  }
}

export function detectFromDimensionManager(
  breakpoints: BreakpointValues,
  sidebarMinWidth = DEFAULT_SIDEBAR_MIN_WIDTH,
  triFoldThreshold = DEFAULT_TRI_FOLD_THRESHOLD,
  foldableMinUnfoldedWidth = DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
  deviceTypeHint?: DeviceType,
): FoldableScreenInfo {
  const { window: win, screen: scr } = dimensionManager.current
  return detectScreenInfo({
    windowWidth: win.width, windowHeight: win.height,
    screenWidth: scr.width, screenHeight: scr.height,
    scale: win.scale, fontScale: win.fontScale,
    breakpoints, sidebarMinWidth, triFoldThreshold, foldableMinUnfoldedWidth,
    deviceTypeHint,
  })
}
