/**
 * FoldableNavigationContainer — React Navigation 适配容器
 *
 * 将 FoldableProvider 与自适应导航骨架合并为一个组件。
 * 宽屏自动切换为左侧固定侧边栏，窄屏显示底部 Tab Bar。
 *
 * ```tsx
 * // App.tsx
 * export default function App() {
 *   return (
 *     <NavigationContainer>
 *       <FoldableNavigationContainer
 *         config={{ debug: __DEV__ }}
 *         sidebarWidth={260}
 *         renderSidebar={(info) => <MySidebarNav />}
 *         renderBottomBar={() => <MyBottomTabBar />}
 *       >
 *         {() => <RootStack />}
 *       </FoldableNavigationContainer>
 *     </NavigationContainer>
 *   )
 * }
 * ```
 */

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { FoldableProvider } from '../context/FoldableProvider'
import { useFoldableScreen } from '../hooks/useFoldableScreen'
import { useFoldableNavigation } from './useFoldableNavigation'
import { DEFAULT_SIDEBAR_WIDTH } from '../core/constants'
import type { FoldableConfig, FoldableScreenInfo } from '../types'

export interface FoldableNavigationContainerProps {
  config?: FoldableConfig
  children: React.ReactNode | ((info: FoldableScreenInfo) => React.ReactNode)
  renderSidebar?: (info: FoldableScreenInfo) => React.ReactNode
  renderBottomBar?: (info: FoldableScreenInfo) => React.ReactNode
  sidebarWidth?: number
}

function Inner({
  children,
  renderSidebar,
  renderBottomBar,
  sidebarWidth,
}: Omit<FoldableNavigationContainerProps, 'config'> & { sidebarWidth: number }) {
  const info = useFoldableScreen()
  const { useSidebar } = useFoldableNavigation({ sidebarWidth })

  const main = typeof children === 'function' ? children(info) : children
  const sidebarNode = renderSidebar?.(info)
  const bottomNode = renderBottomBar?.(info)

  if (useSidebar && sidebarNode) {
    return (
      <View style={styles.row}>
        <View style={[styles.sidebar, { width: sidebarWidth }]}>{sidebarNode}</View>
        <View style={styles.content}>{main}</View>
      </View>
    )
  }

  return (
    <View style={styles.col}>
      <View style={styles.content}>{main}</View>
      {bottomNode && <View>{bottomNode}</View>}
    </View>
  )
}

export function FoldableNavigationContainer({
  config,
  children,
  renderSidebar,
  renderBottomBar,
  sidebarWidth = DEFAULT_SIDEBAR_WIDTH,
}: FoldableNavigationContainerProps) {
  return (
    <FoldableProvider config={config}>
      <Inner
        renderSidebar={renderSidebar}
        renderBottomBar={renderBottomBar}
        sidebarWidth={sidebarWidth}
      >
        {children}
      </Inner>
    </FoldableProvider>
  )
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  col: { flex: 1, flexDirection: 'column' },
  sidebar: { height: '100%' },
  content: { flex: 1, overflow: 'hidden' },
})
