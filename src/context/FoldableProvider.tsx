/**
 * FoldableProvider — 折叠屏状态全局提供者
 *
 * 在 App 根部包裹，所有子组件均可通过 Hooks 消费屏幕状态。
 *
 * ```tsx
 * export default function App() {
 *   return (
 *     <FoldableProvider config={{ debug: __DEV__ }}>
 *       <RootNavigator />
 *     </FoldableProvider>
 *   )
 * }
 * ```
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { FoldableContext, type ResolvedFoldableConfig } from './FoldableContext'
import { dimensionManager } from '../core/DimensionManager'
import { detectFromDimensionManager } from '../core/FoldStateDetector'
import { mergeBreakpoints } from '../core/PlatformDetector'
import {
  DEFAULT_SIDEBAR_MIN_WIDTH, DEFAULT_TRI_FOLD_THRESHOLD,
  DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH, DEFAULT_DEBOUNCE_DELAY, LOG_PREFIX,
} from '../core/constants'
import { simulationManager } from '../debug/SimulationManager'
import { Orientation } from '../types'
import type { FoldableConfig, FoldableScreenInfo, BreakpointValues } from '../types'

export interface FoldableProviderProps {
  children: React.ReactNode
  config?: FoldableConfig
}

function resolveConfig(c?: FoldableConfig): ResolvedFoldableConfig {
  return {
    breakpoints: mergeBreakpoints(c?.breakpoints),
    sidebarMinWidth: c?.sidebarMinWidth ?? DEFAULT_SIDEBAR_MIN_WIDTH,
    triFoldThreshold: c?.triFoldThreshold ?? DEFAULT_TRI_FOLD_THRESHOLD,
    foldableMinUnfoldedWidth: c?.foldableMinUnfoldedWidth ?? DEFAULT_FOLDABLE_MIN_UNFOLDED_WIDTH,
    debounceDelay: c?.debounceDelay ?? DEFAULT_DEBOUNCE_DELAY,
    debug: c?.debug ?? false,
    deviceTypeHint: c?.deviceTypeHint,
  }
}

export function FoldableProvider({ children, config: userConfig }: FoldableProviderProps) {
  const resolvedConfig = useMemo(() => resolveConfig(userConfig), [userConfig])

  useEffect(() => {
    dimensionManager.setDebounceDelay(resolvedConfig.debounceDelay)
  }, [resolvedConfig.debounceDelay])

  const [screenInfo, setScreenInfo] = useState<FoldableScreenInfo>(() => {
    // 如果已有模拟数据（热重载场景），优先使用
    if (simulationManager.isActive && simulationManager.currentInfo) {
      return simulationManager.currentInfo
    }
    return detectFromDimensionManager(
      resolvedConfig.breakpoints,
      resolvedConfig.sidebarMinWidth,
      resolvedConfig.triFoldThreshold,
      resolvedConfig.foldableMinUnfoldedWidth,
      resolvedConfig.deviceTypeHint,
    )
  })

  // 持有最新 config 引用，避免回调闭包陷阱
  const configRef = useRef(resolvedConfig)
  configRef.current = resolvedConfig

  /** 计算并应用真实设备数据 */
  const applyRealDimensions = useCallback(() => {
    const cfg = configRef.current
    const next = detectFromDimensionManager(
      cfg.breakpoints, cfg.sidebarMinWidth,
      cfg.triFoldThreshold, cfg.foldableMinUnfoldedWidth,
      cfg.deviceTypeHint,
    )
    if (cfg.debug) {
      console.log(
        `${LOG_PREFIX}`,
        `${next.width}×${next.height}dp`,
        `| ${next.foldState} | ${next.layoutMode} | ${next.breakpoint} | ${next.deviceType}`,
      )
    }
    setScreenInfo(next)
  }, [])

  // config 变化时重新计算（模拟中不覆盖模拟数据）
  useEffect(() => {
    if (!simulationManager.isActive) {
      applyRealDimensions()
    }
  }, [
    resolvedConfig.breakpoints,
    resolvedConfig.sidebarMinWidth,
    resolvedConfig.triFoldThreshold,
    resolvedConfig.foldableMinUnfoldedWidth,
    applyRealDimensions,
  ])

  // 监听真实尺寸变化
  // 模拟激活时只同步真实设备的屏幕方向，其余字段保持模拟数据不变
  const handleChange = useCallback(() => {
    if (simulationManager.isActive) {
      const { window: win } = dimensionManager.current
      const realOrientation = win.width >= win.height ? Orientation.LANDSCAPE : Orientation.PORTRAIT
      setScreenInfo((prev) =>
        prev.orientation !== realOrientation ? { ...prev, orientation: realOrientation } : prev
      )
      return
    }
    applyRealDimensions()
  }, [applyRealDimensions])

  useEffect(() => {
    return dimensionManager.subscribe(handleChange)
  }, [handleChange])

  // 订阅模拟器：模拟 → 注入假数据；清除 → 恢复真实数据
  useEffect(() => {
    return simulationManager.subscribe((simInfo) => {
      if (simInfo) {
        if (configRef.current.debug) {
          console.log(
            `${LOG_PREFIX} [SIM]`,
            `${simInfo.width}×${simInfo.height}dp`,
            `| ${simInfo.foldState} | ${simInfo.layoutMode} | ${simInfo.deviceType}`,
          )
        }
        setScreenInfo(simInfo)
      } else {
        // 模拟已清除，恢复真实设备数据
        applyRealDimensions()
      }
    })
  }, [applyRealDimensions])

  const value = useMemo(
    () => ({ screenInfo, config: resolvedConfig }),
    [screenInfo, resolvedConfig],
  )

  return (
    <FoldableContext.Provider value={value}>
      {children}
    </FoldableContext.Provider>
  )
}
