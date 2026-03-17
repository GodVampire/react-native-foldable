import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useFoldableScreen } from '../hooks/useFoldableScreen'
import { LayoutMode } from '../types'
import { DEFAULT_SIDEBAR_WIDTH } from '../core/constants'
import type { AdaptiveLayoutProps } from '../types'

/**
 * AdaptiveLayout — 自适应多栏内容布局
 *
 * 根据当前 LayoutMode 自动切换渲染结构：
 *
 * SINGLE      → children（全宽）
 * DUAL        → leading | trailing
 * TRI         → leading | center | trailing
 * SIDEBAR     → sidebar(fixed) + children(flex)
 * SIDEBAR_DUAL→ sidebar(fixed) + leading + trailing
 *
 * ```tsx
 * <AdaptiveLayout
 *   sidebar={<NavMenu />}
 *   leadingContent={<List />}
 *   trailingContent={<Detail />}
 *   columnRatio={[1, 2]}
 * >
 *   <ListScreen /> // 单列时显示
 * </AdaptiveLayout>
 * ```
 */
export function AdaptiveLayout({
  children,
  leadingContent,
  trailingContent,
  centerContent,
  sidebar,
  sidebarWidth = DEFAULT_SIDEBAR_WIDTH,
  style,
  columnRatio = [1, 2],
}: AdaptiveLayoutProps) {
  const { layoutMode } = useFoldableScreen()

  switch (layoutMode) {
    case LayoutMode.SINGLE:
      return <View style={[styles.fill, style]}>{children}</View>

    case LayoutMode.DUAL:
      return (
        <View style={[styles.row, style]}>
          <View style={[styles.col, { flex: columnRatio[0] }]}>{leadingContent ?? children}</View>
          {trailingContent && (
            <View style={[styles.col, { flex: columnRatio[1] }]}>{trailingContent}</View>
          )}
        </View>
      )

    case LayoutMode.TRI:
      return (
        <View style={[styles.row, style]}>
          <View style={[styles.col, { flex: 1 }]}>{leadingContent ?? children}</View>
          <View style={[styles.col, { flex: 1 }]}>{centerContent ?? null}</View>
          <View style={[styles.col, { flex: 1 }]}>{trailingContent ?? null}</View>
        </View>
      )

    case LayoutMode.SIDEBAR:
      return (
        <View style={[styles.row, style]}>
          {sidebar && <View style={[styles.sidebar, { width: sidebarWidth }]}>{sidebar}</View>}
          <View style={styles.fill}>{children}</View>
        </View>
      )

    case LayoutMode.SIDEBAR_DUAL:
      return (
        <View style={[styles.row, style]}>
          {sidebar && <View style={[styles.sidebar, { width: sidebarWidth }]}>{sidebar}</View>}
          <View style={[styles.col, { flex: columnRatio[0] }]}>{leadingContent ?? children}</View>
          {trailingContent && (
            <View style={[styles.col, { flex: columnRatio[1] }]}>{trailingContent}</View>
          )}
        </View>
      )

    default:
      return <View style={[styles.fill, style]}>{children}</View>
  }
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  col: { overflow: 'hidden' },
  sidebar: { height: '100%' },
})
