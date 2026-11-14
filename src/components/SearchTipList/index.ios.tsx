import { useRef, useState, useCallback, useMemo, forwardRef, useImperativeHandle, type Ref } from 'react'
import { Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import List, { type ItemT, type ListProps, type ListType } from './List'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface SearchTipListProps<T> extends ListProps<T> {
  onPressBg?: () => void
  hideWhenEmpty?: boolean
}
export interface SearchTipListType<T> {
  setList: (list: T[]) => void
  setHeight: (height: number) => void
  hide: () => void
}

/** 单行高度（与 TipList 的行样式保持一致） */
export const TIP_ITEM_HEIGHT = 44
/** 面板最多展示的行数 */
const MAX_ROWS = 8
/** 小圆角/阴影来自设计令牌 */

const noop = () => {}

/**
 * iOS 搜索联想面板（原型无此页，按系统搜索建议设计）：
 * 搜索框下方的浮层卡片，最多展示 8 行，超出内部滚动；
 * 面板高度随内容区高度自适应，但不会像原来那样铺满整屏。
 */
const Component = <T extends ItemT<T>>({ onPressBg = noop, hideWhenEmpty = true, ...props }: SearchTipListProps<T>, ref: Ref<SearchTipListType<T>>) => {
  const { colors, radius, shadow, hairline } = useIOSTheme()
  const translateY = useRef(new Animated.Value(0)).current
  const scaleY = useRef(new Animated.Value(0)).current
  const [visible, setVisible] = useState(false)
  const [animatePlayed, setAnimatPlayed] = useState(true)
  const listRef = useRef<ListType<T>>(null)
  const prevListRef = useRef<T[]>([])
  const [panelMaxHeight, setPanelMaxHeight] = useState(TIP_ITEM_HEIGHT * MAX_ROWS)

  useImperativeHandle(ref, () => ({
    setList(list) {
      if (prevListRef.current.length) {
        if (!list.length && hideWhenEmpty) handleHide()
      } else if ((list.length || !hideWhenEmpty) && !visible) handleShow()
      prevListRef.current = list
      requestAnimationFrame(() => {
        listRef.current?.setList(list)
      })
    },
    setHeight(height) {
      // 内容区高度的 60%，且不超过 8 行，避免平板/横屏下铺满整屏
      setPanelMaxHeight(Math.max(TIP_ITEM_HEIGHT * 3, Math.min(Math.round(height * 0.6), TIP_ITEM_HEIGHT * MAX_ROWS)))
    },
    hide() {
      prevListRef.current = []
      requestAnimationFrame(() => {
        listRef.current?.setList([])
      })
      handleHide()
    },
  }))

  const handleShow = useCallback(() => {
    if (!panelMaxHeight) return
    setVisible(true)
    setAnimatPlayed(false)
    requestAnimationFrame(() => {
      translateY.setValue(-panelMaxHeight / 2)
      scaleY.setValue(0)

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(scaleY, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimatPlayed(true)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translateY, scaleY, panelMaxHeight])

  const handleHide = useCallback(() => {
    setAnimatPlayed(false)
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -panelMaxHeight / 2,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scaleY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start((finished) => {
      if (!finished) return
      setVisible(false)
      setAnimatPlayed(true)
    })
  }, [translateY, scaleY, panelMaxHeight])

  const component = useMemo(() => {
    const panelStyle: StyleProp<ViewStyle> = {
      backgroundColor: colors.secondaryGroupedBackground,
      borderRadius: radius.card,
      borderWidth: hairline,
      borderColor: colors.separator,
      overflow: 'hidden',
      ...shadow.raised,
    }

    return (
      <Animated.View
        style={{
          ...styles.anima,
          transform: [
            { translateY },
            { scaleY },
          ],
        }}>
        <Pressable style={styles.mask} onPress={onPressBg} />
        <View style={styles.content} pointerEvents="box-none">
          <View style={panelStyle}>
            {/* 高度限制加在 FlatList 上，保证超出 8 行时面板内部可滚动 */}
            <List ref={listRef} {...props} style={{ maxHeight: panelMaxHeight }} />
          </View>
        </View>
      </Animated.View>
    )
  }, [colors, hairline, onPressBg, panelMaxHeight, props, radius, scaleY, shadow.raised, translateY])

  return !visible && animatePlayed ? null : component
}

export default forwardRef(Component) as
  <T,>(p: SearchTipListProps<T> & { ref?: Ref<SearchTipListType<T>> }) => JSX.Element | null

const styles = StyleSheet.create({
  anima: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    zIndex: 10,
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  content: {
    zIndex: 1,
    paddingTop: 6,
    paddingHorizontal: 8,
  },
})
