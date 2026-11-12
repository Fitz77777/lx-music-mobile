import { memo } from 'react'
import { View } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from '@/components/ios/Text'

/** iOS 设置分组内的小标题，用于给一组选项分组 */
export default memo(({ title, children }: {
  title: string
  children: React.ReactNode | React.ReactNode[]
}) => {
  const { colors, spacing } = useIOSTheme()

  return (
    <View style={{ paddingTop: spacing.md, paddingBottom: spacing.sm }}>
      <IOSText
        variant="footnote"
        color={colors.secondaryLabel}
        style={{
          marginHorizontal: spacing.lg,
          marginBottom: spacing.sm - 2,
          textTransform: 'uppercase',
        }}
      >{title}</IOSText>
      <View style={{ paddingHorizontal: spacing.lg }}>{children}</View>
    </View>
  )
})
