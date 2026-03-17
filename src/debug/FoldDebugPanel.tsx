/**
 * FoldDebugPanel — 折叠屏调试浮层（仅开发环境使用）
 *
 * 在屏幕上渲染一个可展开的悬浮按钮，列出所有内置设备预设。
 * 点击预设即注入模拟状态；再次点击同一预设则清除模拟。
 *
 * 用法：将其放在 App 根组件末尾，确保位于其他内容之上：
 *
 * ```tsx
 * // App.tsx
 * import { FoldableProvider, FoldDebugPanel } from 'react-native-foldable'
 *
 * export default function App() {
 *   return (
 *     <FoldableProvider config={{ debug: true }}>
 *       <RootNavigator />
 *       {__DEV__ && <FoldDebugPanel />}
 *     </FoldableProvider>
 *   )
 * }
 * ```
 */

import React, { useState, useCallback, useEffect } from 'react'
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform,
} from 'react-native'
import {
  simulationManager,
  SIMULATION_PRESETS,
  PRESET_ORDER,
  type SimulationPreset,
  type SimulationGroup,
} from './SimulationManager'
import { useFoldableScreen } from '../hooks/useFoldableScreen'

// ─── 分组标题 ─────────────────────────────────────────────────────────────────

const GROUP_LABELS: Record<SimulationGroup, string> = {
  common: '普通设备',
  foldable: '双折叠',
  tri_foldable: '三折叠',
}

// ─── 面板位置 ─────────────────────────────────────────────────────────────────

export type DebugPanelPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

const POSITION_STYLE: Record<DebugPanelPosition, object> = {
  'top-right':    { top: 60,  right: 12 },
  'top-left':     { top: 60,  left: 12  },
  'bottom-right': { bottom: 48, right: 12 },
  'bottom-left':  { bottom: 48, left: 12  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FoldDebugPanelProps {
  /**
   * 悬浮按钮的停靠位置，默认 `'bottom-right'`
   */
  position?: DebugPanelPosition
}

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export function FoldDebugPanel({ position = 'bottom-right' }: FoldDebugPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [activePreset, setActivePreset] = useState<SimulationPreset | null>(
    () => simulationManager.currentPreset,
  )
  const { foldState, layoutMode, deviceType, width, breakpoint } = useFoldableScreen()

  // 外部调用 simulationManager API 时同步按钮状态
  useEffect(() => {
    return simulationManager.subscribe(() => {
      setActivePreset(simulationManager.currentPreset)
    })
  }, [])

  const handleSelect = useCallback((preset: SimulationPreset) => {
    if (activePreset === preset) {
      simulationManager.clear()
    } else {
      simulationManager.setPreset(preset)
    }
  }, [activePreset])

  const handleClear = useCallback(() => {
    simulationManager.clear()
    setExpanded(false)
  }, [])

  // 按分组收集预设
  const groups = PRESET_ORDER.reduce<Record<SimulationGroup, SimulationPreset[]>>(
    (acc, key) => {
      const group = SIMULATION_PRESETS[key].group
      acc[group].push(key)
      return acc
    },
    { common: [], foldable: [], tri_foldable: [] },
  )

  return (
    <View
      style={[styles.container, POSITION_STYLE[position]]}
      // 允许触摸穿透到 FAB 以外的区域
      pointerEvents="box-none"
    >
      {expanded && (
        <View style={styles.panel}>
          {/* 当前状态 */}
          <View style={styles.statusBar}>
            <Text style={styles.statusLabel}>当前状态</Text>
            <Text style={styles.statusText} numberOfLines={1}>
              {deviceType}  ·  {foldState}
            </Text>
            <Text style={styles.statusText} numberOfLines={1}>
              {layoutMode}  ·  {breakpoint}  ·  {Math.round(width)}dp
            </Text>
            {simulationManager.isActive && (
              <View style={styles.simBadge}>
                <Text style={styles.simBadgeText}>· SIMULATED ·</Text>
              </View>
            )}
          </View>

          {/* 预设列表（按分组） */}
          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {(Object.keys(groups) as SimulationGroup[]).map((group) => {
              const presets = groups[group]
              return (
                <View key={group}>
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupLabel}>{GROUP_LABELS[group]}</Text>
                  </View>
                  {presets.map((key) => {
                    const entry = SIMULATION_PRESETS[key]
                    const isActive = activePreset === key
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.item, isActive && styles.itemActive]}
                        onPress={() => handleSelect(key)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.itemRow}>
                          <Text style={[styles.itemLabel, isActive && styles.itemLabelActive]}>
                            {entry.label}
                          </Text>
                          {isActive && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.itemDesc}>{entry.description}</Text>
                      </TouchableOpacity>
                    )
                  })}
                </View>
              )
            })}
          </ScrollView>

          {/* 底部操作栏 */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.footerBtn, !simulationManager.isActive && styles.footerBtnDisabled]}
              onPress={handleClear}
              disabled={!simulationManager.isActive}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.footerBtnText,
                !simulationManager.isActive && styles.footerBtnTextDisabled,
              ]}>
                清除模拟
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 悬浮按钮 */}
      <TouchableOpacity
        style={[styles.fab, simulationManager.isActive && styles.fabActive]}
        onPress={() => setExpanded((v: boolean) => !v)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>{expanded ? '✕' : '📱'}</Text>
        {simulationManager.isActive && !expanded && (
          <View style={styles.activeDot} />
        )}
      </TouchableOpacity>
    </View>
  )
}

// ─── 样式 ─────────────────────────────────────────────────────────────────────

const MONO = Platform.OS === 'ios' ? 'Menlo' : 'monospace'

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 99999,
    alignItems: 'flex-end',
  },

  // ── 面板 ───────────────────────────────────────────────────────────────────
  panel: {
    width: 230,
    maxHeight: 440,
    backgroundColor: '#12122a',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2e2e5c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 14,
  },

  // ── 状态栏 ─────────────────────────────────────────────────────────────────
  statusBar: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#0c0c22',
  },
  statusLabel: {
    color: '#5c5c8a',
    fontSize: 10,
    fontFamily: MONO,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusText: {
    color: '#a0a0cc',
    fontSize: 11,
    fontFamily: MONO,
    lineHeight: 16,
  },
  simBadge: {
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#1a3a6a',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  simBadgeText: {
    color: '#4fc3f7',
    fontSize: 9,
    fontFamily: MONO,
    letterSpacing: 1,
  },

  // ── 分组 ───────────────────────────────────────────────────────────────────
  scroll: {
    maxHeight: 310,
  },
  groupHeader: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 3,
    backgroundColor: '#0e0e26',
  },
  groupLabel: {
    color: '#5c5c8a',
    fontSize: 10,
    fontFamily: MONO,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // ── 预设条目 ───────────────────────────────────────────────────────────────
  item: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1e1e40',
  },
  itemActive: {
    backgroundColor: '#0f253e',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemLabel: {
    color: '#c0c0e0',
    fontSize: 13,
    fontWeight: '600',
  },
  itemLabelActive: {
    color: '#4fc3f7',
  },
  checkmark: {
    color: '#4fc3f7',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemDesc: {
    color: '#6060a0',
    fontSize: 10,
    fontFamily: MONO,
    marginTop: 2,
  },

  // ── 底部 ───────────────────────────────────────────────────────────────────
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#1e1e40',
    backgroundColor: '#0e0e26',
  },
  footerBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  footerBtnDisabled: {
    opacity: 0.35,
  },
  footerBtnText: {
    color: '#ef5350',
    fontSize: 12,
    fontWeight: '600',
  },
  footerBtnTextDisabled: {
    color: '#6060a0',
  },

  // ── FAB ────────────────────────────────────────────────────────────────────
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1c1c38',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2e2e5c',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 8,
  },
  fabActive: {
    borderColor: '#4fc3f7',
    backgroundColor: '#0c1e34',
  },
  fabIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  activeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4fc3f7',
  },
})
