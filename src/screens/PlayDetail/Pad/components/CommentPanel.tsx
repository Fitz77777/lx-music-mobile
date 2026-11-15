import { memo, useEffect, useRef, useState } from 'react'
import { Animated, Easing, Modal, Pressable, SafeAreaView, View } from 'react-native'

import Comment from '@/screens/Comment'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useWindowSize } from '@/utils/hooks'

/**
 * 平板评论：右侧滑出的半屏面板。
 * 贴满右缘、全高，宽约为窗口一半（竖屏 / 横屏一致）；
 * 点击左侧遮罩或面板内关闭按钮收起，不再使用居中浮层卡片。
 */
export default memo(({ visible, componentId, onClose }: {
  visible: boolean
  componentId: string
  onClose: () => void
}) => {
  const { colors, hairline, shadow } = useIOSTheme()
  const { width: winWidth } = useWindowSize()
  const panelWidth = Math.min(Math.round(winWidth * 0.5), 620)

  const [mounted, setMounted] = useState(visible)
  const progress = useRef(new Animated.Value(visible ? 0 : 1)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current
  const closingRef = useRef(false)

  useEffect(() => {
    if (visible) {
      closingRef.current = false
      setMounted(true)
      Animated.parallel([
        Animated.timing(progress, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]).start()
    }
  }, [visible, progress, backdropOpacity])

  if (!mounted) return null

  const requestClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    Animated.parallel([
      Animated.timing(progress, {
        toValue: 1,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false)
        onClose()
      }
    })
  }

  return (
    <Modal
      transparent
      visible={mounted}
      onRequestClose={requestClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Animated.View style={{ flex: 1, backgroundColor: colors.overlay, opacity: backdropOpacity }}>
          <Pressable style={{ flex: 1 }} onPress={requestClose} accessibilityRole="button" />
        </Animated.View>
        <Animated.View
          style={{
            width: panelWidth,
            height: '100%',
            backgroundColor: colors.secondaryGroupedBackground,
            borderLeftWidth: hairline,
            borderLeftColor: colors.separator,
            transform: [{ translateX: Animated.multiply(progress, panelWidth) }],
            ...shadow.raised,
          }}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <Comment embedded componentId={componentId} onClose={requestClose} />
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  )
})
