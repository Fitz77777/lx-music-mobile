import { memo } from 'react'
import { Modal, Pressable, View } from 'react-native'

import Comment from '@/screens/Comment'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useWindowSize } from '@/utils/hooks'

/**
 * 平板评论浮层（原型 iPad 版的浮层卡片思路）：
 * 横竖屏都不再整页全屏，改为窗口内的大卡片，背后保留播放页。
 */
export default memo(({ visible, componentId, onClose }: {
  visible: boolean
  componentId: string
  onClose: () => void
}) => {
  const { colors, radius, shadow, hairline } = useIOSTheme()
  const { width: winWidth, height: winHeight } = useWindowSize()

  const cardWidth = Math.min(680, winWidth - 96)
  const cardHeight = Math.min(720, winHeight - 140)

  // 未打开时不渲染评论内容，避免提前请求评论数据
  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.overlay,
      }}>
        <Pressable style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} onPress={onClose} />
        <View style={{
          width: cardWidth,
          height: cardHeight,
          borderRadius: radius.sheet,
          backgroundColor: colors.secondaryGroupedBackground,
          borderWidth: hairline,
          borderColor: colors.separator,
          overflow: 'hidden',
          ...shadow.raised,
        }}>
          <Comment embedded componentId={componentId} onClose={onClose} />
        </View>
      </View>
    </Modal>
  )
})
