import { memo } from 'react'
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'

export type IOSButtonVariant = 'filled' | 'tinted' | 'plain' | 'destructive'

export interface IOSButtonProps {
  title: string
  onPress?: () => void
  variant?: IOSButtonVariant
  size?: 'regular' | 'small'
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

/** iOS 按钮：填充 / 浅色底 / 纯文字 / 危险操作 */
export default memo(({
  title,
  onPress,
  variant = 'filled',
  size = 'regular',
  disabled = false,
  style,
}: IOSButtonProps) => {
  const { colors, accent, radius, withAlpha } = useIOSTheme()
  const height = size == 'small' ? 34 : 44

  const backgroundColor = (() => {
    switch (variant) {
      case 'filled': return accent
      case 'tinted': return withAlpha(accent, 0.15)
      case 'destructive': return colors.systemRed
      case 'plain': return 'transparent'
    }
  })()
  const textColor = (() => {
    switch (variant) {
      case 'filled':
      case 'destructive': return colors.onAccent
      case 'tinted':
      case 'plain': return accent
    }
  })()

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{
        height,
        borderRadius: radius.control,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      }, style]}
    >
      <View>
        <IOSText
          variant={size == 'small' ? 'subheadline' : 'body'}
          weight="600"
          color={textColor}
          numberOfLines={1}
        >{title}</IOSText>
      </View>
    </Pressable>
  )
})
