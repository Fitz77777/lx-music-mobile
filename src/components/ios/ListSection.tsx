import { Children, cloneElement, isValidElement, memo, type ReactElement, type ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'

export interface ListSectionProps {
  /** 分组标题，自动大写（中文不受影响） */
  title?: string
  footer?: string
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * iOS 内嵌分组列表（inset grouped）。
 * 自动给最后一个 ListRow 打上 isLast，避免末尾出现多余分隔线。
 */
export default memo(({ title, footer, children, style }: ListSectionProps) => {
  const { colors, spacing } = useIOSTheme()
  const items = Children.toArray(children).filter(Boolean)

  return (
    <View style={style}>
      {title
        ? (
            <IOSText
              variant="footnote"
              color={colors.secondaryLabel}
              style={{
                marginTop: spacing.xl,
                marginBottom: spacing.sm,
                marginHorizontal: spacing.lg + spacing.xs,
                textTransform: 'uppercase',
              }}
            >{title}</IOSText>
          )
        : null}
      <View style={{
        marginHorizontal: spacing.lg,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.secondaryGroupedBackground,
      }}>
        {
          items.map((child, index) => (
            isValidElement(child)
              ? cloneElement(child as ReactElement<{ isLast?: boolean }>, { isLast: index == items.length - 1 })
              : child
          ))
        }
      </View>
      {footer
        ? (
            <IOSText
              variant="footnote"
              color={colors.secondaryLabel}
              style={{
                marginTop: spacing.sm,
                marginBottom: spacing.xl,
                marginHorizontal: spacing.lg + spacing.lg,
              }}
            >{footer}</IOSText>
          )
        : null}
    </View>
  )
})
