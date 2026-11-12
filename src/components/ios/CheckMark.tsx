import { memo } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

export interface CheckMarkProps {
  /** 整体尺寸（pt） */
  size?: number
  color?: string
  thickness?: number
  style?: StyleProp<ViewStyle>
}

/**
 * 用两条边框绘制对勾，避免为 iOS 额外引入图标字体。
 * 尺寸按 pt 计算，不经过 Android 的 scaleSize。
 */
export default memo(({ size = 13, color = '#FFFFFF', thickness = 2, style }: CheckMarkProps) => {
  return (
    <View
      style={[{
        width: size * 0.55,
        height: size,
        borderRightWidth: thickness,
        borderBottomWidth: thickness,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
        marginTop: -size * 0.18,
      }, style]}
    />
  )
})
