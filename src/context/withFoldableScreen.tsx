import React from 'react'
import { FoldableContext } from './FoldableContext'
import type { FoldableScreenInfo } from '../types'

/**
 * Class 组件专属高阶组件 (HOC)
 * 将折叠屏状态以 `props.foldable` 形式注入被包裹的 class 组件。
 *
 * @example
 * ```tsx
 * import { withFoldableScreen } from '@hecom/react-native-foldable'
 * import type { FoldableScreenInfo } from '@hecom/react-native-foldable'
 *
 * interface Props {
 *   foldable: FoldableScreenInfo
 *   title: string
 * }
 *
 * class DetailScreen extends React.Component<Props> {
 *   render() {
 *     const { foldable, title } = this.props
 *     return (
 *       <View style={{ padding: foldable.showSidebar ? 24 : 16 }}>
 *         <Text>{title}</Text>
 *         <Text>{foldable.foldState} / {foldable.layoutMode}</Text>
 *       </View>
 *     )
 *   }
 * }
 *
 * export default withFoldableScreen(DetailScreen)
 * ```
 */
export function withFoldableScreen<P extends { foldable: FoldableScreenInfo }, Ref = unknown>(
  Component: React.ComponentType<P>,
): React.ForwardRefExoticComponent<
  React.PropsWithoutRef<Omit<P, 'foldable'>> & React.RefAttributes<Ref>
> {
  const displayName = Component.displayName ?? Component.name ?? 'Component'

  const WrappedComponent = React.forwardRef<Ref, Omit<P, 'foldable'>>((props, ref) => (
    <FoldableContext.Consumer>
      {({ screenInfo }) => (
        <Component {...(props as unknown as P)} foldable={screenInfo} ref={ref as never} />
      )}
    </FoldableContext.Consumer>
  ))

  WrappedComponent.displayName = `withFoldableScreen(${displayName})`
  return WrappedComponent
}
