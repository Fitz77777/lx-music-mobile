import { memo } from 'react'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'

export interface IOSIconButtonProps {
  name: string
  size?: number
  color?: string
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  /** 视觉尺寸固定 44pt，满足最小点击区域 */
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
}

export default memo(({
  name,
  size = 22,
  color,
  onPress,
  onLongPress,
  disabled = false,
  style,
  accessibilityLabel,
}: IOSIconButtonProps) => {
  const { colors } = useIOSTheme()

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      hitSlop={8}
      style={({ pressed }) => [{
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.5 : 1,
      }, style]}
    >
      <IOSIcon name={name} size={size} color={color ?? colors.label} />
    </Pressable>
  )
})
