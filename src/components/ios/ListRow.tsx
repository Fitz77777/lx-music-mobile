import { memo, type ReactNode } from 'react'
import { Pressable, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'
import IOSText from './Text'

export interface ListRowProps {
  title: string
  subtitle?: string
  /** 左侧图标/封面/勾选框 */
  leading?: ReactNode
  /** 右侧附加值，渲染在箭头左侧 */
  trailing?: ReactNode
  accessory?: 'chevron' | 'checkmark' | 'none'
  onPress?: () => void
  onLongPress?: () => void
  disabled?: boolean
  /** 标题使用系统红 */
  destructive?: boolean
  /** 由 ListSection 自动注入 */
  isLast?: boolean
  showSeparator?: boolean
  separatorInset?: number
  minHeight?: number
  style?: StyleProp<ViewStyle>
  titleStyle?: StyleProp<TextStyle>
}

export default memo(({
  title,
  subtitle,
  leading,
  trailing,
  accessory = 'none',
  onPress,
  onLongPress,
  disabled = false,
  destructive = false,
  isLast = false,
  showSeparator = true,
  separatorInset = 16,
  minHeight,
  style,
  titleStyle,
}: ListRowProps) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const titleColor = destructive ? colors.systemRed : colors.label

  const content = (
    <>
      {leading ? <View style={{ marginRight: spacing.md }}>{leading}</View> : null}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <IOSText
          variant="body"
          color={titleColor}
          numberOfLines={1}
          style={titleStyle}
        >{title}</IOSText>
        {subtitle
          ? <IOSText variant="footnote" color={colors.secondaryLabel} numberOfLines={1} style={{ marginTop: 2 }}>{subtitle}</IOSText>
          : null}
      </View>
      {trailing
        ? <View style={{ marginLeft: spacing.sm, flexDirection: 'row', alignItems: 'center' }}>{trailing}</View>
        : null}
      {accessory == 'chevron'
        ? <IOSIcon name="chevron-right" size={13} color={colors.tertiaryLabel} style={{ marginLeft: spacing.sm }} />
        : accessory == 'checkmark'
          ? <IOSIcon name="check" size={17} color={colors.systemBlue} style={{ marginLeft: spacing.sm }} />
          : null}
      {!isLast && showSeparator
        ? (
            <View style={{
              position: 'absolute',
              left: separatorInset,
              right: 0,
              bottom: 0,
              height: hairline,
              backgroundColor: colors.separator,
            }} />
          )
        : null}
    </>
  )

  const rowStyle: StyleProp<ViewStyle> = [{
    minHeight: minHeight ?? 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md - 1,
    flexDirection: 'row',
    alignItems: 'center',
    opacity: disabled ? 0.45 : 1,
  }, style]

  if (!onPress && !onLongPress) return <View style={rowStyle}>{content}</View>

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        rowStyle,
        pressed ? { backgroundColor: colors.secondaryFill } : null,
      ]}
      android_ripple={{ color: colors.secondaryFill }}
    >
      {content}
    </Pressable>
  )
})
