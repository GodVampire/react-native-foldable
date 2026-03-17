import React from 'react'
import { View } from 'react-native'
import { useFoldableScreen } from '../hooks/useFoldableScreen'
import type { FoldAwareViewProps, FoldableScreenInfo } from '../types'

/**
 * FoldAwareView — 折叠感知容器
 *
 * 支持 render prop 和静态子节点两种模式：
 *
 * ```tsx
 * // render prop（推荐）
 * <FoldAwareView>
 *   {({ showSidebar, width }) => (
 *     <View style={{ padding: width > 840 ? 24 : 12 }}>...</View>
 *   )}
 * </FoldAwareView>
 *
 * // 静态子节点
 * <FoldAwareView style={styles.wrap}>
 *   <MyContent />
 * </FoldAwareView>
 * ```
 */
export function FoldAwareView({ children, style }: FoldAwareViewProps) {
  const info = useFoldableScreen()
  const resolved = typeof children === 'function'
    ? (children as (i: FoldableScreenInfo) => React.ReactNode)(info)
    : children
  return <View style={style}>{resolved}</View>
}
