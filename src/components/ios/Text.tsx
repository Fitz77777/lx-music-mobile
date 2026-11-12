import { memo } from 'react'
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { type IOSTextStyleName } from '@/theme/ios/tokens'

export interface IOSTextProps extends RNTextProps {
  /** 对应 Apple 文本样式，默认 body */
  variant?: IOSTextStyleName
  color?: string
  weight?: TextStyle['fontWeight']
  /** 覆盖样式里的字号（pt） */
  size?: number
  align?: TextStyle['textAlign']
}

export default memo(({ variant = 'body', color, weight, size, align, style, children, ...props }: IOSTextProps) => {
  const { colors, typography } = useIOSTheme()
  const base = typography[variant]

  return (
    <RNText
      allowFontScaling
      style={[
        {
          fontSize: size ?? base.fontSize,
          lineHeight: size == null ? base.lineHeight : Math.round(size * 1.3),
          fontWeight: weight ?? base.fontWeight,
          letterSpacing: base.letterSpacing,
          color: color ?? colors.label,
        },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...props}
    >{children}</RNText>
  )
})
