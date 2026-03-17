/**
 * DimensionManager — 屏幕尺寸单例管理器
 *
 * 职责：
 * 1. 监听 React Native Dimensions 变化事件（折叠/旋转/多窗口）
 * 2. 维护宽度历史（用于识别折叠设备类型）
 * 3. 防抖处理，平滑折叠动画期间的抖动
 * 4. 支持多订阅者（Provider / 外部模块）
 */

import { Dimensions, type ScaledSize } from 'react-native'
import {
  DEFAULT_DEBOUNCE_DELAY,
  WIDTH_BUCKET_SIZE,
  DEFAULT_TRI_FOLD_THRESHOLD,
  DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
} from './constants'
import type { ScreenMetrics } from '../types'

export interface DimensionSnapshot {
  window: ScreenMetrics
  screen: ScreenMetrics
  timestamp: number
}

export type DimensionChangeListener = (snapshot: DimensionSnapshot) => void

function toMetrics(size: ScaledSize): ScreenMetrics {
  return {
    width: size.width,
    height: size.height,
    scale: size.scale,
    fontScale: size.fontScale,
  }
}

/** 宽度归桶（去除细微抖动，识别稳定折叠等级） */
function toBucket(width: number): number {
  return Math.round(width / WIDTH_BUCKET_SIZE) * WIDTH_BUCKET_SIZE
}

class DimensionManager {
  private listeners = new Set<DimensionChangeListener>()
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private debounceDelay = DEFAULT_DEBOUNCE_DELAY

  private _current: DimensionSnapshot
  private _maxWindowWidth = 0

  /**
   * 宽度桶集合
   * 记录会话中出现过的不同宽度等级：
   *   1 桶 → 普通设备
   *   2 桶 → 双折叠
   *   3 桶 → 三折叠
   */
  private widthBuckets = new Set<number>()

  private subscription: ReturnType<typeof Dimensions.addEventListener> | null = null

  constructor() {
    const win = Dimensions.get('window')
    const scr = Dimensions.get('screen')
    this._current = {
      window: toMetrics(win),
      screen: toMetrics(scr),
      timestamp: Date.now(),
    }
    this._maxWindowWidth = win.width
    this.widthBuckets.add(toBucket(win.width))
    this._subscribe()
  }

  // ── 公共 API ──────────────────────────────────────────────────────────────

  get current(): DimensionSnapshot { return this._current }
  get maxWindowWidth(): number { return this._maxWindowWidth }
  get distinctWidthLevels(): number { return this.widthBuckets.size }

  /** 设备是否表现出可折叠行为（会话中出现明显宽度跳变） */
  isFoldableBehavior(minUnfoldedWidth = DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH): boolean {
    return this._maxWindowWidth >= minUnfoldedWidth && this.distinctWidthLevels >= 2
  }

  /** 设备是否表现出三折叠行为 */
  isTriFoldBehavior(
    triFoldThreshold = DEFAULT_TRI_FOLD_THRESHOLD,
    minUnfoldedWidth = DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
  ): boolean {
    return (
      this._maxWindowWidth >= triFoldThreshold ||
      (this.distinctWidthLevels >= 3 && this.isFoldableBehavior(minUnfoldedWidth))
    )
  }

  /** 更新防抖延迟（由 FoldableProvider 在配置变化时调用） */
  setDebounceDelay(ms: number): void {
    this.debounceDelay = ms
  }

  subscribe(listener: DimensionChangeListener): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  destroy(): void {
    this.subscription?.remove()
    this.subscription = null
    this.listeners.clear()
    if (this.debounceTimer) clearTimeout(this.debounceTimer)
  }

  // ── 私有方法 ──────────────────────────────────────────────────────────────

  private _subscribe(): void {
    this.subscription = Dimensions.addEventListener('change', ({ window, screen }) => {
      if (this.debounceTimer) clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => this._apply(window, screen), this.debounceDelay)
    })
  }

  private _apply(window: ScaledSize, screen: ScaledSize): void {
    this._current = {
      window: toMetrics(window),
      screen: toMetrics(screen),
      timestamp: Date.now(),
    }
    if (window.width > this._maxWindowWidth) {
      this._maxWindowWidth = window.width
    }
    this.widthBuckets.add(toBucket(window.width))

    this.listeners.forEach((fn) => {
      try { fn(this._current) } catch (e) {
        if (__DEV__) console.warn('[RNFoldable] listener error:', e)
      }
    })
  }
}

export const dimensionManager = new DimensionManager()
