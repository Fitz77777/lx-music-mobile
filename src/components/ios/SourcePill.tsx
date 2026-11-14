import { memo, type Ref } from 'react'
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'
import IOSText from './Text'

export interface IOSSourcePillProps {
  /** 音源 id */
  source: string
  /** 当前音源名称 */
  label: string
  anchorRef?: Ref<View>
  onPress: () => void
  onLongPress?: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

/**
 * 音源选择触发器：当前音源名 + 下拉箭头（强调色）。
 * 三处音源入口（搜索 / 排行榜 / 歌单）共用，保持轻量、不加底色。
 */
export default memo(({ label, anchorRef, onPress, onLongPress, disabled, style }: IOSSourcePillProps) => {
  const { accent, spacing } = useIOSTheme()

  return (
    <Pressable
      ref={anchorRef}
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingVertical: spacing.xs,
        opacity: pressed ? 0.6 : disabled ? 0.4 : 1,
      }, style]}
    >
      <IOSText variant="subheadline" color={accent} numberOfLines={1}>{label}</IOSText>
      <IOSIcon
        name="chevron-right"
        size={12}
        color={accent}
        style={{ transform: [{ rotate: '90deg' }] }}
      />
    </Pressable>
  )
})
