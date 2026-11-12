import { Children, memo } from 'react'
import { View } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from '@/components/ios/Text'

interface Props {
  title: string
  children: React.ReactNode | React.ReactNode[]
}

/**
 * iOS 分组卡片。子项之间自动插入 hairline 分隔线。
 * 只负责外观，子项仍复用各设置项原有的逻辑组件。
 */
export default memo(({ title, children }: Props) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const items = Children.toArray(children).filter(Boolean)

  return (
    <View style={{ marginBottom: spacing.xl }}>
      <IOSText
        variant="footnote"
        color={colors.secondaryLabel}
        style={{
          marginHorizontal: spacing.lg + spacing.xs,
          marginBottom: spacing.sm - 2,
          textTransform: 'uppercase',
        }}
      >{title}</IOSText>
      <View style={{
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
    </View>
  )
})
