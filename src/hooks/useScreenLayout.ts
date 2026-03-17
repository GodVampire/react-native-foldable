import { useMemo } from 'react'
import { useFoldableScreen } from './useFoldableScreen'
import { LayoutMode } from '../types'

export interface ScreenLayoutAPI {
  layoutMode: LayoutMode
  isSingle: boolean
  isDual: boolean
  isTri: boolean
  isSidebar: boolean
  isSidebarDual: boolean
  showSidebar: boolean
  isWideScreen: boolean
  width: number
  height: number
}

/**
 * 布局模式快捷访问 Hook
 *
 * ```tsx
 * const { isSidebar, isDual } = useScreenLayout()
 * ```
 */
export function useScreenLayout(): ScreenLayoutAPI {
  const { layoutMode, showSidebar, isWideScreen, width, height } = useFoldableScreen()

  return useMemo<ScreenLayoutAPI>(() => ({
    layoutMode,
    isSingle: layoutMode === LayoutMode.SINGLE,
    isDual: layoutMode === LayoutMode.DUAL,
    isTri: layoutMode === LayoutMode.TRI,
    isSidebar: layoutMode === LayoutMode.SIDEBAR || layoutMode === LayoutMode.SIDEBAR_DUAL,
    isSidebarDual: layoutMode === LayoutMode.SIDEBAR_DUAL,
    showSidebar,
    isWideScreen,
    width,
    height,
  }), [layoutMode, showSidebar, isWideScreen, width, height])
}
