import { memo } from 'react'
import { type StyleProp, type TextStyle } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface IOSIconProps {
  name: string
  /** iOS 图标尺寸（pt），不走 Android 的缩放 */
  size?: number
  color?: string
  style?: StyleProp<TextStyle>
}

/** iOS 图标：绕过 scaleSizeW，保持 SF Symbol 级别的固定尺寸 */
export const IOSIcon = memo(({ name, size = 22, color, style }: IOSIconProps) => {
  const { colors } = useIOSTheme()
  return <Icon name={name} rawSize={size} color={color ?? colors.label} style={style} />
})

export default IOSIcon
