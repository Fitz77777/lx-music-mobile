import { Children, memo } from 'react'
import { View } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'

interface Props {
  /** 保留给各设置页共用（iOS 二级页不显示分组小标题） */
  title?: string
  children: React.ReactNode | React.ReactNode[]
}

/**
 * iOS 分组卡片。子项之间自动插入 hairline 分隔线。
 * 只负责外观，子项仍复用各设置项原有的逻辑组件。
 * 二级页不显示左上角的分组小标题，卡片直接接在页面顶部。
 */
export default memo(({ children }: Props) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const items = Children.toArray(children).filter(Boolean)

  return (
    <View style={{
      marginBottom: spacing.xl,
      marginHorizontal: spacing.lg,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.secondaryGroupedBackground,
    }}>
      {
        items.map((child, index) => (
          <View key={index}>
            {child}
            {index < items.length - 1
              ? (
                  <View style={{
                    height: hairline,
                    marginLeft: spacing.lg,
                    backgroundColor: colors.rowSeparator,
                  }} />
                )
              : null}
          </View>
        ))
      }
    </View>
  )
})
