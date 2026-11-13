import { Fragment, memo, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Animated, Easing, Modal, Pressable, StyleSheet, View, useWindowDimensions, type View as ViewType } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'
import IOSText from './Text'

export interface IOSPopoverItem {
  key: string
  label: string
  /** 左侧圆点颜色，不传则不显示圆点 */
  color?: string
  /** 当前选中项（高亮文字 + 右侧打勾） */
  selected?: boolean
  /** 该项之前插入一条分隔线 */
  dividerBefore?: boolean
}

export interface IOSPopoverProps {
  visible: boolean
  onClose: () => void
  /** 触发元素，用于定位（右对齐到它的右下角） */
  anchorRef: RefObject<ViewType>
  items?: IOSPopoverItem[]
  onSelect?: (key: string) => void
  /** 自定义内容，传入时忽略 items */
  children?: ReactNode
  minWidth?: number
}

const MARGIN = 14
const ANCHOR_GAP = 6
const ARROW_SAFE_BOTTOM = 34
const OPEN_DURATION = 160
const CLOSE_DURATION = 120
const ROW_HEIGHT = 38

interface Rect { x: number, y: number, width: number, height: number }
interface Size { width: number, height: number }
interface Position { left: number, top: number }

/**
 * iOS 锚点弹出菜单（原型 .src-pop）。
 * 贴在触发元素下方，下方放不下时向上翻；右对齐触发元素，左侧放不下改左对齐。
 */
export default memo(({
  visible,
  onClose,
  anchorRef,
  items,
  onSelect,
  children,
  minWidth = 164,
}: IOSPopoverProps) => {
  const { colors, accent, radius, hairline } = useIOSTheme()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const [mounted, setMounted] = useState(visible)
  const [anchor, setAnchor] = useState<Rect | null>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const anim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) setMounted(true)
    else {
      Animated.timing(anim, {
        toValue: 0,
        duration: CLOSE_DURATION,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setMounted(false)
          setAnchor(null)
          setSize(null)
          setPosition(null)
        }
      })
    }
  }, [anim, visible])

  // 打开时测量锚点位置
  useEffect(() => {
    if (!visible) return
    anim.setValue(0)
    setMounted(true)
    setAnchor(null)
    setSize(null)
    setPosition(null)
    const id = requestAnimationFrame(() => {
      anchorRef.current?.measureInWindow((x, y, w, h) => {
        if (!w && !h) return
        setAnchor({ x, y, width: w, height: h })
      })
    })
    return () => { cancelAnimationFrame(id) }
  }, [anim, anchorRef, visible])

  // 尺寸和锚点都就绪后再定位，避免从错误位置滑入
  useEffect(() => {
    if (!visible || !anchor || !size) return
    const maxWidth = windowWidth - MARGIN * 2
    const popWidth = Math.min(size.width, maxWidth)

    // 水平：优先与触发元素右对齐；左边放不下就改左对齐
    let left = anchor.x + anchor.width - popWidth
    if (left < MARGIN) left = Math.max(MARGIN, anchor.x)
    left = Math.min(left, windowWidth - popWidth - MARGIN)

    // 垂直：默认贴在下方，放不下就向上翻
    let top = anchor.y + anchor.height + ANCHOR_GAP
    if (top + size.height > windowHeight - ARROW_SAFE_BOTTOM) {
      top = Math.max(MARGIN, anchor.y - size.height - ANCHOR_GAP)
    }

    setPosition({ left, top })
    Animated.timing(anim, {
      toValue: 1,
      duration: OPEN_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start()
  }, [anchor, anim, size, visible, windowHeight, windowWidth])

  if (!mounted) return null

  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] })

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape']}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="close"
        />
        <Animated.View
          onLayout={e => {
            const { width, height } = e.nativeEvent.layout
            if (!width || !height) return
            setSize(prev => (prev && prev.width == width && prev.height == height ? prev : { width, height }))
          }}
          style={{
            position: 'absolute',
            left: position?.left ?? -9999,
            top: position?.top ?? -9999,
            minWidth,
            maxWidth: windowWidth - MARGIN * 2,
            padding: 5,
            borderRadius: radius.popover,
            backgroundColor: colors.secondaryGroupedBackground,
            borderWidth: hairline,
            borderColor: colors.rowSeparator,
            shadowColor: '#000000',
            shadowOpacity: 0.14,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 8 },
            opacity: anim,
            transform: [{ scale }],
          }}
        >
          {children ?? items?.map(item => (
            <Fragment key={item.key}>
              {item.dividerBefore
                ? (
                    <View style={{
                      height: hairline,
                      backgroundColor: colors.rowSeparator,
                      marginVertical: 4,
                      marginHorizontal: 8,
                    }} />
                  )
                : null}
              <Pressable
                onPress={() => { onSelect?.(item.key) }}
                accessibilityRole="button"
                style={({ pressed }) => ({
                  height: ROW_HEIGHT,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 9,
                  paddingHorizontal: 10,
                  borderRadius: 9,
                  backgroundColor: pressed ? colors.tertiaryFill : 'transparent',
                })}
              >
                {item.color
                  ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                  : null}
                <IOSText
                  size={15}
                  weight={item.selected ? '600' : '400'}
                  color={item.selected ? accent : colors.label}
                  numberOfLines={1}
                  style={{ flex: 1 }}
                >{item.label}</IOSText>
                {item.selected
                  ? <IOSIcon name="checkbox-marked" size={15} color={accent} />
                  : null}
              </Pressable>
            </Fragment>
          ))}
        </Animated.View>
      </View>
    </Modal>
  )
})
