import { memo } from 'react'
import { Pressable, View } from 'react-native'

import type { BtnProps } from '@/components/common/Button'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

type ButtonProps = BtnProps

/**
 * iOS 设置页动作按钮：整行可点，强调色文字。
 * 保留 BtnProps，设置项无需改动。
 */
export default memo(({ disabled, onPress, children }: ButtonProps) => {
  const { accent, spacing } = useIOSTheme()

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.5 : 1,
      })}
    >
      <View>
        <IOSText variant="body" weight="600" color={accent} numberOfLines={1}>{children}</IOSText>
      </View>
    </Pressable>
  )
})
