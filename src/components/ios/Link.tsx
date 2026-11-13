import { memo } from 'react'
import { View } from 'react-native'

export interface IOSLinkProps {
  /** 视觉尺寸（pt），默认 19 */
  size?: number
  color: string
}

/**
 * 链条图标（原型 #i-link）。
 * 图标字体里没有 link 字形，项目也没有 SVG 依赖，这里用两个胶囊描边拼成链条：
 * 整体旋转 -45°，两段首尾重叠，视觉上就是常见的「链接」图标。
 */
export default memo(({ size = 19, color }: IOSLinkProps) => {
  const capsuleWidth = Math.round(size * 0.58)
  const capsuleHeight = Math.round(size * 0.37)
  const stroke = Math.max(1.4, Math.round(size * 0.079 * 10) / 10)
  const overlap = Math.round(size * 0.16)

  const capsule = {
    width: capsuleWidth,
    height: capsuleHeight,
    borderRadius: capsuleHeight / 2,
    borderWidth: stroke,
    borderColor: color,
  }

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', transform: [{ rotate: '-45deg' }] }}>
        <View style={capsule} />
        <View style={[capsule, { marginLeft: -overlap }]} />
      </View>
    </View>
  )
})
