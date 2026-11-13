import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'

export interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  /** 标题（居中，20pt 粗体） */
  title?: string
  /** 标题下方的说明文字 */
  description?: string
  children: ReactNode
  /** 点击遮罩是否关闭，默认 true */
  dismissOnBackdrop?: boolean
}

const OPEN_DURATION = 280
const CLOSE_DURATION = 200

/**
 * iOS 底部面板（原型 .sheet）。
 * 圆角 22、顶部拖动条、点击遮罩关闭、弹出时遮罩淡入 + 面板上滑。
 * 使用原生 Modal transparent，方便和键盘一起移动。
 */
export default memo(({
  visible,
  onClose,
  title,
  description,
  children,
  dismissOnBackdrop = true,
}: BottomSheetProps) => {
  const { colors, spacing, radius } = useIOSTheme()
  const [mounted, setMounted] = useState(visible)
  const [sheetHeight, setSheetHeight] = useState(420)
  const anim = useRef(new Animated.Value(visible ? 1 : 0)).current

  useEffect(() => {
    if (visible) {
      setMounted(true)
      Animated.timing(anim, {
        toValue: 1,
        duration: OPEN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: CLOSE_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setMounted(false)
      })
    }
  }, [anim, visible])

  const handleLayout = (e: LayoutChangeEvent) => {
    const height = e.nativeEvent.layout.height
    if (height > 0) setSheetHeight(height)
  }

  if (!mounted) return null

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight, 0],
  })

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: anim }]}>
          <Pressable
            style={{ flex: 1, backgroundColor: colors.overlay }}
            onPress={dismissOnBackdrop ? onClose : undefined}
            accessibilityRole="button"
          />
        </Animated.View>
        <KeyboardAvoidingView
          behavior="padding"
          pointerEvents="box-none"
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Animated.View
            onLayout={handleLayout}
            style={{
              transform: [{ translateY }],
              backgroundColor: colors.secondaryGroupedBackground,
              borderTopLeftRadius: radius.sheet,
              borderTopRightRadius: radius.sheet,
              paddingTop: spacing.sm,
              paddingHorizontal: spacing.xl,
              paddingBottom: 34,
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <View style={{
                width: 36,
                height: 5,
                borderRadius: 3,
                backgroundColor: colors.tertiaryLabel,
              }} />
            </View>
            {title
              ? (
                  <IOSText
                    variant="title3"
                    align="center"
                    numberOfLines={1}
                    style={{ letterSpacing: 0.2 }}
                  >{title}</IOSText>
                )
              : null}
            {description
              ? (
                  <IOSText
                    variant="footnote"
                    color={colors.secondaryLabel}
                    align="center"
                    style={{ marginTop: spacing.sm, paddingHorizontal: spacing.xs }}
                  >{description}</IOSText>
                )
              : null}
            <View style={{ marginTop: title ? spacing.lg : spacing.sm }}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
})
