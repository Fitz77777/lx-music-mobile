import { memo } from 'react'
import { View } from 'react-native'

export interface IOSHeartProps {
  /** 视觉尺寸（pt），默认 24 */
  size?: number
  color: string
}

/**
 * 实心爱心（原型 #i-heart-fill）。
 * 图标字体只有描边爱心，这里用「旋转方块 + 两个圆」拼出实心爱心，
 * 不引入 SVG 依赖；未选中时仍使用图标字体的描边 love。
 */
export default memo(({ size = 24, color }: IOSHeartProps) => {
  // 方块边长：旋转 45° 后整体视觉宽度约为边长的 1.7 倍
  const side = Math.round(size * 0.58)

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: side,
        height: side,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
      }}>
        <View style={{
          position: 'absolute',
          left: -side / 2,
          top: 0,
          width: side,
          height: side,
          borderRadius: side / 2,
          backgroundColor: color,
        }} />
        <View style={{
          position: 'absolute',
          left: 0,
          top: -side / 2,
          width: side,
          height: side,
          borderRadius: side / 2,
          backgroundColor: color,
        }} />
      </View>
    </View>
  )
})
