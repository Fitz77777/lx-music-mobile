import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

import { type COMPONENT_IDS } from '@/config/constant'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

interface Props {
  visibleNavNames: COMPONENT_IDS[]
  widthPercentage: number
  widthPercentageMax?: number
  children: React.ReactNode
  renderNavigationView: () => React.ReactNode
  drawerPosition?: 'left' | 'right'
  drawerBackgroundColor?: string
  style?: StyleProp<ViewStyle>
}

export interface DrawerLayoutFixedType {
  openDrawer: () => void
  closeDrawer: () => void
  fixWidth: () => void
}

/**
 * iOS 版本不使用侧边抽屉，而是把导航视图放进从底部升起的半屏面板（sheet）。
 * 保持与 Android 版相同的 ref API，三个列表页无需改动即可获得 iOS 交互。
 */
const DrawerLayoutFixed = forwardRef<DrawerLayoutFixedType, Props>(({
  children,
  renderNavigationView,
  drawerBackgroundColor,
  style,
}, ref) => {
  const { colors, radius, spacing } = useIOSTheme()
  const [containerHeight, setContainerHeight] = useState(0)
  const [visible, setVisible] = useState(false)
  const animation = useRef(new Animated.Value(0)).current

  const sheetHeight = Math.round(containerHeight * 0.72)

  const openDrawer = useCallback(() => {
    setVisible(true)
    global.app_event.changeHomePageScrollEnabled(false)
    Animated.timing(animation, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start()
  }, [animation])

  const closeDrawer = useCallback(() => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) setVisible(false)
      global.app_event.changeHomePageScrollEnabled(true)
    })
  }, [animation])

  useImperativeHandle(ref, () => ({
    openDrawer,
    closeDrawer,
    fixWidth() {},
  }), [closeDrawer, openDrawer])

  useEffect(() => () => {
    // 面板还没关闭就离开页面时，恢复主列表的滚动
    global.app_event.changeHomePageScrollEnabled(true)
  }, [])

  const handleLayout = useCallback(({ nativeEvent: { layout } }: LayoutChangeEvent) => {
    setContainerHeight(layout.height)
  }, [])

  const sheetTranslate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [sheetHeight || 600, 0],
  })
  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4],
  })

  return (
    <View onLayout={handleLayout} style={[{ flex: 1, width: '100%', overflow: 'hidden' }, style]}>
      <View style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </View>
      {/*
        面板内容必须常驻：标签筛选等页面是先发事件、再打开面板的，
        如果等面板打开才挂载内容，内容里的监听会漏掉这次事件（标签列表为空）。
        关闭时靠 translateY 移出可视区域，并用 pointerEvents 关掉交互。
      */}
      <View
        style={StyleSheet.absoluteFill}
        pointerEvents={visible ? 'box-none' : 'none'}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: overlayOpacity }]}
        >
          <Pressable
            onPress={closeDrawer}
            accessibilityRole="button"
            accessibilityLabel={global.i18n.t('close')}
            style={{ flex: 1 }}
          />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: sheetHeight || undefined,
            maxHeight: '88%',
            backgroundColor: drawerBackgroundColor ?? colors.secondaryBackground,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            overflow: 'hidden',
            transform: [{ translateY: sheetTranslate }],
          }}
        >
          <View style={{ alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.xs }}>
            <View
              style={{
                width: 36,
                height: 5,
                borderRadius: 2.5,
                backgroundColor: colors.tertiaryLabel,
              }}
            />
          </View>
          <View style={{ flex: 1, overflow: 'hidden' }}>
            {renderNavigationView()}
          </View>
        </Animated.View>
      </View>
    </View>
  )
})

export default DrawerLayoutFixed
