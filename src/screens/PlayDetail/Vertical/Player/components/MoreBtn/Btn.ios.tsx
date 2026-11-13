import { Pressable } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

/** 播放页更多操作按钮尺寸（pt） */
export const BTN_WIDTH = 44
export const BTN_ICON_SIZE = 24

/** iOS 播放页底部操作按钮 */
export default ({ icon, color, onPress, onLongPress }: {
  icon: string
  color?: string
  onPress: () => void
  onLongPress?: () => void
}) => {
  const { colors } = useIOSTheme()

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: BTN_WIDTH,
        height: BTN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <IOSIcon name={icon} size={BTN_ICON_SIZE} color={color ?? colors.label} />
    </Pressable>
  )
}
