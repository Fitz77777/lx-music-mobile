import { memo } from 'react'
import { ImageBackground, StyleSheet, View, type ImageSourcePropType } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { getIOSColors, withAlpha } from '@/theme/ios/tokens'

/** 把主题里的背景图路径规整成 RN 能识别的 source */
const normalizeSource = (source: unknown): ImageSourcePropType => {
  // 自定义主题里的 bg-image 是文件路径字符串，内置主题是 require 的图片
  if (typeof source != 'string') return source as ImageSourcePropType
  if (/^(https?:|file:|data:|content:)/.test(source)) return { uri: source }
  return { uri: `file://${source}` }
}

/**
 * 主题背景图（自定义背景图优先）。
 * 铺在页面最底层，并叠加一层页面底色蒙版；此时 useIOSTheme 里的
 * 页面底色是透明的，卡片保持一点透明度，背景图就能整片透出来。
 * 没有背景图时不渲染，维持原来的不透明分组灰。
 */
export default memo(() => {
  const { backdrop, isDark } = useIOSTheme()
  if (!backdrop) return null

  const tint = withAlpha(getIOSColors(isDark).groupedBackground, isDark ? 0.75 : 0.72)

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={normalizeSource(backdrop)}
        resizeMode="cover"
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, backgroundColor: tint }} />
      </ImageBackground>
    </View>
  )
})
