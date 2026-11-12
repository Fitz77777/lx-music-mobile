import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from '@/components/ios/Text'
import { useStatusText } from '@/store/player/hook'

/** iOS 播放状态文字 */
export default () => {
  const statusText = useStatusText()
  const { colors } = useIOSTheme()

  return (
    <IOSText
      variant="caption1"
      color={colors.secondaryLabel}
      numberOfLines={1}
      align="center"
    >{statusText}</IOSText>
  )
}
