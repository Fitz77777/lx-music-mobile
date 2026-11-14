import { memo, type ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'

export type IOSBadgeVariant =
  /** SQ 无损：主题强调色 */
  | 'sq'
  /** HQ 高品质：系统橙 */
  | 'hq'
  /** 24bit：系统紫 */
  | 'bit'
  /** 音源小方块：中性填充 */
  | 'source'

export interface IOSBadgeProps {
  variant: IOSBadgeVariant
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * iOS 歌曲行徽标（原型 .badge / .src-tag）。
 * 音质徽标用 12% 同色底，音源用中性填充底。
 */
export default memo(({ variant, children, style }: IOSBadgeProps) => {
  const { colors, accent, withAlpha } = useIOSTheme()

  const color = variant == 'sq'
    ? accent
    : variant == 'hq'
      ? colors.systemOrange
      : variant == 'bit'
        ? colors.systemPurple
        : colors.secondaryLabel

  return (
    <View style={[{
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
      backgroundColor: variant == 'source' ? colors.fill : withAlpha(color, 0.12),
    }, style]}>
      <IOSText
        variant="caption2"
        weight={variant == 'source' ? '400' : '700'}
        color={color}
        numberOfLines={1}
        style={{ letterSpacing: 0.3 }}
      >{children}</IOSText>
    </View>
  )
})
