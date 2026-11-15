import { memo, useEffect, useRef, useState, type MutableRefObject } from 'react'
import { Animated, FlatList, PanResponder, Pressable, SafeAreaView, View, type NativeScrollEvent, type NativeSyntheticEvent, type FlatListProps } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import CheckMark from '@/components/ios/CheckMark'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useIOSHomeBottomInset } from '@/theme/ios/useIOSBottomInset'
import { useActiveListId, useListFetching, useMyList } from '@/store/list/hook'
import { LIST_SCROLL_POSITION_KEY } from '@/config/constant'
import { getListPosition, saveListPosition } from '@/utils/data'
import { setActiveList, updateUserListPosition } from '@/core/list'
import { type Position } from './ListMenu'
import Loading from '@/components/common/Loading'
import { useI18n } from '@/lang'
import { iosHairline, iosMotion } from '@/theme/ios/tokens'

type FlatListType = FlatListProps<LX.List.MyListInfo>

const ITEM_HEIGHT = 48
/** 列表前固定的两个内置列表（试听 / 收藏），不可拖动、不可越过 */
const FIXED_COUNT = 2

interface DragController {
  start: (item: LX.List.MyListInfo, slot: number) => void
  move: (dy: number) => void
  end: () => void
}

const ListHeader = memo(() => {
  const t = useI18n()
  const { colors, spacing } = useIOSTheme()
  return (
    <SafeAreaView style={{ backgroundColor: colors.groupedBackground }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: spacing.lg }}>
        <IOSText variant="headline">{t('nav_love')}</IOSText>
        <View style={{ flex: 1 }} />
      </View>
    </SafeAreaView>
  )
})

/** 拖动把手：触摸即开始拖动，由它独占手势，因此不会和列表滚动冲突 */
const DragHandle = memo(({ item, slot, ctlRef }: {
  item: LX.List.MyListInfo
  slot: number
  ctlRef: MutableRefObject<DragController | null>
}) => {
  const { colors } = useIOSTheme()
  const infoRef = useRef({ item, slot })
  infoRef.current = { item, slot }

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: () => {
      ctlRef.current?.start(infoRef.current.item, infoRef.current.slot)
    },
    onPanResponderMove: (_e, g) => {
      ctlRef.current?.move(g.dy)
    },
    onPanResponderRelease: () => {
      ctlRef.current?.end()
    },
    onPanResponderTerminate: () => {
      ctlRef.current?.end()
    },
  })).current

  return (
    <View {...pan.panHandlers} style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <IOSIcon name="menu" size={18} color={colors.tertiaryLabel} />
    </View>
  )
})

const ListItem = memo(({ item, index, activeId, sortMode, isDragging, ctlRef, onPress, onShowMenu }: {
  item: LX.List.MyListInfo
  index: number
  activeId: string
  sortMode: boolean
  isDragging: boolean
  ctlRef: MutableRefObject<DragController | null>
  onPress: (item: LX.List.MyListInfo) => void
  onShowMenu: (item: LX.List.MyListInfo, index: number, position: Position) => void
}) => {
  const { colors, accent, spacing } = useIOSTheme()
  const moreButtonRef = useRef<View>(null)
  const fetching = useListFetching(item.id)

  const active = activeId == item.id
  const fixed = index < FIXED_COUNT

  const handleShowMenu = () => {
    moreButtonRef.current?.measure((fx, fy, width, height, px, py) => {
      onShowMenu(item, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
    })
  }

  // 排序模式下固定的试听/收藏用强调色提示不可移动，且不显示拖动把手
  const labelColor = sortMode && fixed ? accent : active ? accent : colors.label

  return (
    <View style={{
      height: ITEM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDragging ? colors.quaternaryFill : 'transparent',
    }}>
      <Pressable
        onPress={sortMode ? undefined : () => { onPress(item) }}
        style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg }}
      >
        <IOSText
          variant="body"
          weight={sortMode && fixed ? '600' : '400'}
          color={labelColor}
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >{item.name}</IOSText>
        {fetching ? <Loading color={active ? accent : colors.secondaryLabel} style={{ marginLeft: spacing.sm }} /> : null}
        {active && !sortMode ? <CheckMark size={13} color={accent} thickness={2} style={{ marginLeft: spacing.sm }} /> : null}
      </Pressable>
      {
        sortMode
          ? (fixed ? null : <DragHandle item={item} slot={index} ctlRef={ctlRef} />)
          : (
              <Pressable
                ref={moreButtonRef}
                onPress={handleShowMenu}
                hitSlop={6}
                style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}
              >
                <IOSIcon name="dots-vertical" size={18} color={colors.secondaryLabel} />
              </Pressable>
            )
      }
    </View>
  )
})

export interface ListProps {
  onShowMenu: (info: { listInfo: LX.List.MyListInfo, index: number }, position: Position) => void
  sortMode: boolean
}

/** iOS 我的列表抽屉：歌单列表；排序模式下按住右侧把手可拖动调序 */
export default ({ onShowMenu, sortMode }: ListProps) => {
  const flatListRef = useRef<FlatList>(null)
  const allList = useMyList()
  const activeListId = useActiveListId()
  const { colors } = useIOSTheme()
  const bottomInset = useIOSHomeBottomInset()

  // 拖动期间的本地顺序（避免与 store 更新互相打断）；非拖动时与 allList 保持一致
  const [order, setOrder] = useState(allList)
  const orderRef = useRef(allList)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingRef = useRef<{ id: string, startSlot: number } | null>(null)
  const ctlRef = useRef<DragController | null>(null)
  const offsetsRef = useRef(new Map<string, Animated.Value>())
  /** 刚松手的行：让它的回弹动画跑完，不要在列表同步时被重置 */
  const settlingRef = useRef(new Set<string>())

  const getOffset = (id: string) => {
    let value = offsetsRef.current.get(id)
    if (!value) {
      value = new Animated.Value(0)
      offsetsRef.current.set(id, value)
    }
    return value
  }

  useEffect(() => {
    if (draggingRef.current) return
    orderRef.current = allList
    setOrder(allList)
    // 列表外部变化时清掉残留位移（刚松手的行除外，让回弹动画自然结束）
    offsetsRef.current.forEach((value, id) => {
      if (settlingRef.current.delete(id)) return
      value.stopAnimation()
      value.setValue(0)
    })
  }, [allList])

  /** 其他行让位：从旧位置滑到新位置（回弹到 0 位移） */
  const animateShift = (id: string, fromSlot: number, toSlot: number) => {
    const value = getOffset(id)
    value.stopAnimation()
    value.setValue((fromSlot - toSlot) * ITEM_HEIGHT)
    Animated.spring(value, {
      toValue: 0,
      useNativeDriver: false,
      friction: iosMotion.spring.damping / 2,
      tension: iosMotion.spring.stiffness / 2.6,
    }).start()
  }

  const handleDragStart = (item: LX.List.MyListInfo, slot: number) => {
    draggingRef.current = { id: item.id, startSlot: slot }
    setDraggingId(item.id)
    getOffset(item.id).setValue(0)
  }

  const handleDragMove = (dy: number) => {
    const drag = draggingRef.current
    if (!drag) return
    const list = orderRef.current
    const currentSlot = list.findIndex(m => m.id == drag.id)
    const target = Math.min(
      Math.max(drag.startSlot + Math.round(dy / ITEM_HEIGHT), FIXED_COUNT),
      list.length - 1,
    )
    if (target != currentSlot) {
      const next = [...list]
      const [moved] = next.splice(currentSlot, 1)
      next.splice(target, 0, moved)
      orderRef.current = next
      setOrder(next)
      // 其余行平滑让位
      next.forEach((m, newSlot) => {
        if (m.id == drag.id) return
        const oldSlot = list.findIndex(x => x.id == m.id)
        if (oldSlot != newSlot) animateShift(m.id, oldSlot, newSlot)
      })
    }
    const renderedSlot = orderRef.current.findIndex(m => m.id == drag.id)
    // 拖动行跟手：(起始槽位到当前槽位的位移) + 手指位移
    getOffset(drag.id).setValue((drag.startSlot - renderedSlot) * ITEM_HEIGHT + dy)
  }

  const handleDragEnd = () => {
    const drag = draggingRef.current
    if (!drag) return
    draggingRef.current = null
    setDraggingId(null)
    const index = orderRef.current.findIndex(m => m.id == drag.id)
    settlingRef.current.add(drag.id)
    Animated.spring(getOffset(drag.id), {
      toValue: 0,
      useNativeDriver: false,
      friction: iosMotion.spring.damping / 2,
      tension: iosMotion.spring.stiffness / 2.6,
    }).start()
    if (index != drag.startSlot) {
      // 前两位是固定的试听/收藏，可移动歌单从第 3 行开始
      void updateUserListPosition(index - FIXED_COUNT, [drag.id])
    }
  }

  ctlRef.current = {
    start: handleDragStart,
    move: handleDragMove,
    end: handleDragEnd,
  }

  const handleToggleList = (item: LX.List.MyListInfo) => {
    global.app_event.changeMyListSortMode(false)
    global.app_event.changeLoveListVisible(false)
    requestAnimationFrame(() => {
      setActiveList(item.id)
    })
  }

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    void saveListPosition(LIST_SCROLL_POSITION_KEY, nativeEvent.contentOffset.y)
  }

  const showMenu = (listInfo: LX.List.MyListInfo, index: number, position: Position) => {
    onShowMenu({ listInfo, index }, position)
  }

  useEffect(() => {
    void getListPosition(LIST_SCROLL_POSITION_KEY).then((offset) => {
      flatListRef.current?.scrollToOffset({ offset, animated: false })
    })
  }, [])

  const renderItem: FlatListType['renderItem'] = ({ item, index }) => {
    const isDragging = draggingId != null && draggingId == item.id
    return (
      <Animated.View style={{
        height: ITEM_HEIGHT,
        zIndex: isDragging ? 10 : 0,
        transform: [{ translateY: getOffset(item.id) }],
      }}>
        <ListItem
          item={item}
          index={index}
          activeId={activeListId}
          sortMode={sortMode}
          isDragging={isDragging}
          ctlRef={ctlRef}
          onPress={handleToggleList}
          onShowMenu={showMenu}
        />
      </Animated.View>
    )
  }
  const getkey: FlatListType['keyExtractor'] = item => item.id
  const getItemLayout: FlatListType['getItemLayout'] = (data, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
      <ListHeader />
      <View style={{ width: '100%', height: iosHairline, backgroundColor: colors.rowSeparator }} />
      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        style={{ flexShrink: 1, flexGrow: 0, backgroundColor: colors.groupedBackground }}
        data={order}
        maxToRenderPerBatch={9}
        windowSize={9}
        initialNumToRender={18}
        renderItem={renderItem}
        keyExtractor={getkey}
        getItemLayout={getItemLayout}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 + bottomInset }}
      />
    </View>
  )
}
