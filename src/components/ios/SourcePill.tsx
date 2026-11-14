import { memo, type Ref } from 'react'
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { getSourceColor } from './sourceColor'
import IOSIcon from './Icon'
import IOSText from './Text'

export interface IOSSourcePillProps {
  /** 音源 id（用于取音源色点） */
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
 * 音源选择触发器（胶囊）：音源色点 + 当前音源名 + 下拉箭头。
 * 只显示音源名时用户看不出这里可以点，统一加底色和箭头表达「可切换」。
 */
export default memo(({ source, label, anchorRef, onPress, onLongPress, disabled, style }: IOSSourcePillProps) => {
  const { colors, radius } = useIOSTheme()

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
        gap: 5,
        height: 28,
        paddingHorizontal: 10,
        borderRadius: radius.pill,
        backgroundColor: colors.tertiaryFill,
        opacity: pressed ? 0.6 : disabled ? 0.4 : 1,
      }, style]}
    >
      <View style={{
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: getSourceColor(source),
      }} />
      <IOSText variant="footnote" weight="500" numberOfLines={1}>{label}</IOSText>
      <IOSIcon
        name="chevron-right"
        size={11}
        color={colors.secondaryLabel}
        style={{ transform: [{ rotate: '90deg' }] }}
      />
    </Pressable>
  )
})
