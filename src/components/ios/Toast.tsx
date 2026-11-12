import { memo, useEffect, useRef, useState } from 'react'
import { Animated, View } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'
import { registerIOSToast } from './toastEvent'

const FADE_IN = 160
const FADE_OUT = 200

/**
 * iOS Toast 宿主：深色药丸、底部居中、淡入淡出。
 * 挂载在页面容器里，通过 toastEvent 接收 showIOSToast 的消息。
 */
export default memo(() => {
  const { colors, spacing } = useIOSTheme()
  const [message, setMessage] = useState('')
  const [visible, setVisible] = useState(false)
  const opacity = useRef(new Animated.Value(0)).current
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const unregister = registerIOSToast((msg, duration) => {
      setMessage(msg)
      setVisible(true)
      opacity.stopAnimation()
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN,
        useNativeDriver: true,
      }).start()
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: FADE_OUT,
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setVisible(false)
        })
      }, duration)
    })

    return () => {
      unregister()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [opacity])

  if (!visible) return null

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 100,
        alignItems: 'center',
        paddingHorizontal: spacing.xxl,
      }}
    >
      <Animated.View style={{
        opacity,
        maxWidth: '100%',
        backgroundColor: colors.toastBackground,
        borderRadius: 20,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm + 2,
      }}>
        <IOSText variant="subheadline" color={colors.toastLabel} style={{ textAlign: 'center' }}>{message}</IOSText>
      </Animated.View>
    </View>
  )
})
