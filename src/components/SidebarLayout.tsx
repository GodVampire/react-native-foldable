import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useFoldableScreen } from '../hooks/useFoldableScreen'
import { DEFAULT_SIDEBAR_WIDTH } from '../core/constants'
import type { SidebarLayoutProps } from '../types'

/**
 * SidebarLayout — 左侧固定侧边导航栏布局骨架
 *
 * 宽屏时：左固定侧边栏 + 右内容区（flex: 1）
 * 窄屏时：仅渲染 children（底部 Tab 由外层导航器提供）
 *
 * ```tsx
 * <SidebarLayout sidebar={<NavMenu />} sidebarWidth={260}>
 *   <Stack.Navigator />
 * </SidebarLayout>
 * ```
 */
export function SidebarLayout({
  sidebar,
  children,
  minWidth,
  sidebarWidth = DEFAULT_SIDEBAR_WIDTH,
  sidebarStyle,
  contentStyle,
  style,
}: SidebarLayoutProps) {
  const { showSidebar, width } = useFoldableScreen()
  const show = minWidth !== undefined ? width >= minWidth : showSidebar

  if (!show) {
    return <View style={[styles.fill, style]}>{children}</View>
  }

  return (
    <View style={[styles.row, style]}>
      <View style={[styles.sidebar, { width: sidebarWidth }, sidebarStyle]}>
        {sidebar}
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  sidebar: { height: '100%' },
  content: { flex: 1, overflow: 'hidden' },
})
