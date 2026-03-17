import { useMemo } from 'react'
import { useFoldableScreen } from '../hooks/useFoldableScreen'
import { LayoutMode } from '../types'
import { DEFAULT_SIDEBAR_WIDTH } from '../core/constants'
import type { NavigationLayoutHint } from '../types'

export interface FoldableNavigationOptions {
  sidebarWidth?: number
}

/**
 * 导航布局建议 Hook
 *
 * 根据折叠状态返回当前应采用的导航模式：
 * - useSidebar: 宽屏/展开 → 左侧固定侧边栏
 * - useBottomTab: 窄屏/折叠 → 底部 Tab Bar
 * - useDrawer: 中等宽度 → 抽屉导航
 *
 * 兼容 React Navigation 与自定义导航器。
 *
 * ```tsx
 * const { useSidebar, sidebarWidth } = useFoldableNavigation()
 * // React Navigation Drawer permanent 模式
 * <Drawer.Navigator
 *   drawerType={useSidebar ? 'permanent' : 'front'}
 *   drawerStyle={{ width: sidebarWidth }}
 * />
 * ```
 */
export function useFoldableNavigation(options: FoldableNavigationOptions = {}): NavigationLayoutHint {
  const { layoutMode, foldState, showSidebar } = useFoldableScreen()
  const sidebarWidth = options.sidebarWidth ?? DEFAULT_SIDEBAR_WIDTH

  return useMemo<NavigationLayoutHint>(() => {
    const useSidebar = layoutMode === LayoutMode.SIDEBAR || layoutMode === LayoutMode.SIDEBAR_DUAL
    const useBottomTab = !useSidebar && !showSidebar
    const useDrawer = !useSidebar && showSidebar
    return { useSidebar, useBottomTab, useDrawer, sidebarWidth, layoutMode, foldState }
  }, [layoutMode, foldState, showSidebar, sidebarWidth])
}
