import { useContext } from 'react'
import { FoldableContext } from '../context/FoldableContext'
import type { FoldableScreenInfo } from '../types'

/**
 * 获取完整的折叠屏状态信息
 * 必须在 <FoldableProvider> 内部使用
 */
export function useFoldableScreen(): FoldableScreenInfo {
  const ctx = useContext(FoldableContext)
  if (__DEV__ && !ctx) {
    throw new Error(
      '[RNFoldable] useFoldableScreen() 必须在 <FoldableProvider> 内部使用。'
    )
  }
  return ctx.screenInfo
}
