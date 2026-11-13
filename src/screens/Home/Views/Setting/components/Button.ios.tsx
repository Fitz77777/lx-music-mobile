import { memo } from 'react'
import { Pressable } from 'react-native'

import type { BtnProps } from '@/components/common/Button'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

type ButtonProps = BtnProps

/**
 * iOS 设置页动作按钮：强调色浅底 + 强调色文字，圆角 10、高 44。
 * 默认按内容宽度居中显示，也可以传 style（如 alignSelf: 'stretch' / flex: 1）
 * 做成整行按钮或并排按钮，避免看起来像一行文字链接。
 */
export default memo(({ disabled, onPress, children, style }: ButtonProps) => {
  const { accent, spacing, withAlpha } = useIOSTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ([
        {
          minHeight: 44,
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.sm + 2,
          borderRadius: 10,
          alignSelf: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: withAlpha(accent, 0.12),
          opacity: disabled ? 0.4 : pressed ? 0.6 : 1,
        },
        style,
      ])}
    >
      <IOSText size={16} weight="600" color={accent} numberOfLines={1}>{children}</IOSText>
    </Pressable>
  )
})
