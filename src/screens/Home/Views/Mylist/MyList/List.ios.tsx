import { memo, useEffect, useRef, useState } from 'react'
import { Animated, FlatList, PanResponder, Pressable, SafeAreaView, View, type GestureResponderEvent, type NativeScrollEvent, type NativeSyntheticEvent, type FlatListProps } from 'react-native'

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

type FlatListType = FlatListProps<LX.List.MyListInfo>

const ITEM_HEIGHT = 48
/** 列表前固定的两个内置列表（试听 / 收藏），不可拖动、不可越过 */
const FIXED_COUNT = 2

interface DragInfo {
  id: string
  fromIndex: number
}

const ListHeader = memo(({ sortMode, onToggleSortMode }: {
  sortMode: boolean
  onToggleSortMode: () => void
}) => {
  const t = useI18n()
  const { colors, accent, spacing, radius } = useIOSTheme()
  return (
    <SafeAreaView style={{ backgroundColor: colors.groupedBackground }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', height: 44, paddingHorizontal: spacing.lg }}>
        <IOSText variant="headline">{t('nav_love')}</IOSText>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={onToggleSortMode}
          hitSlop={6}
          accessibilityRole="button"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: radius.control,
            backgroundColor: sortMode ? colors.quaternaryFill : pressed ? colors.secondaryFill : 'transparent',
          })}
        >
          <IOSIcon name="list-order" size={15} color={sortMode ? accent : colors.secondaryLabel} />
          <IOSText variant="subheadline" weight={sortMode ? '600' : '400'} color={sortMode ? accent : colors.secondaryLabel}>
            {sortMode ? t('fine') : t('list_position_sort')}
          </IOSText>
        </Pressable>
      </View>
    </SafeAreaView>
  )
})

const ListItem = memo(({ item, index, activeId, sortMode, isDragging, onPress, onShowMenu, onDragStart }: {
  item: LX.List.MyListInfo
  index: number
  activeId: string
  sortMode: boolean
  isDragging: boolean
  onPress: (item: LX.List.MyListInfo) => void
  onShowMenu: (item: LX.List.MyListInfo, index: number, position: Position) => void
  onDragStart: (item: LX.List.MyListInfo, index: number, e: GestureResponderEvent) => void
}) => {
  const { colors, accent, spacing } = useIOSTheme()
  const moreButtonRef = useRef<View>(null)
  const fetching = useListFetching(item.id)

  const active = activeId == item.id

  const handleShowMenu = () => {
    moreButtonRef.current?.measure((fx, fy, width, height, px, py) => {
      onShowMenu(item, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
    })
  }

  const handleLongPress = (e: GestureResponderEvent) => {
    onDragStart(item, index, e)
  }

  return (
    <View style={{
      height: ITEM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDragging ? colors.quaternaryFill : 'transparent',
    }}>
      <Pressable
        onPress={sortMode ? undefined : () => { onPress(item) }}
        onLongPress={sortMode ? handleLongPress : undefined}
        delayLongPress={280}
        style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg }}
      >
        <IOSText
          variant="body"
          color={active ? accent : colors.label}
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >{item.name}</IOSText>
        {fetching ? <Loading color={active ? accent : colors.secondaryLabel} style={{ marginLeft: spacing.sm }} /> : null}
        {active && !sortMode ? <CheckMark size={13} color={accent} thickness={2} style={{ marginLeft: spacing.sm }} /> : null}
      </Pressable>
      {
        sortMode
          ? (
              <View style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <IOSIcon name="menu" size={18} color={colors.secondaryLabel} />
              </View>
            )
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
}, (prev, next) => {
  return !!(prev.item === next.item &&
    prev.index === next.index &&
    prev.activeId == next.activeId &&
    prev.sortMode == next.sortMode &&
    prev.isDragging == next.isDragging)
})

export interface ListProps {
  onShowMenu: (info: { listInfo: LX.List.MyListInfo, index: number }, position: Position) => void
  sortMode: boolean
}

/** iOS 我的列表抽屉：头部（标题 + 手动排序开关）+ 歌单列表（排序模式下长按拖动调序） */
export default ({ onShowMenu, sortMode }: ListProps) => {
  const flatListRef = useRef<FlatList>(null)
  const allList = useMyList()
  const activeListId = useActiveListId()
  const { colors } = useIOSTheme()
  const bottomInset = useIOSHomeBottomInset()

  // 排序拖动期间的本地顺序（避免与 store 更新互相打断）；非拖动时与 allList 保持一致
  const [order, setOrder] = useState(allList)
  const orderRef = useRef(allList)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const draggingRef = useRef<DragInfo | null>(null)
  const [scrollEnabled, setScrollEnabled] = useState(true)
  const translateY = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (draggingRef.current == null) {
      orderRef.current = allList
      setOrder(allList)
    }
  }, [allList])

  const finishDrag = () => {
    const drag = draggingRef.current
    draggingRef.current = null
    setDraggingId(null)
    setScrollEnabled(true)
    translateY.setValue(0)
    if (drag) {
      const index = orderRef.current.findIndex(m => m.id == drag.id)
      if (index != drag.fromIndex) {
        // 抽屉里前两位是固定的试听/收藏，可移动歌单从第 3 行开始
        void updateUserListPosition(index - FIXED_COUNT, [drag.id])
      }
    }
  }

  const panResponderRef = useRef(PanResponder.create({
    // 只在长按进入排序拖动后接管，避免影响正常滚动
    onMoveShouldSetPanResponderCapture: () => draggingRef.current != null,
    onPanResponderTerminationRequest: () => false,
    onPanResponderMove: (_e, g) => {
      const drag = draggingRef.current
      if (!drag) return
      const fromIndex = orderRef.current.findIndex(m => m.id == drag.id)
      const target = Math.min(
        Math.max(fromIndex + Math.round(g.dy / ITEM_HEIGHT), FIXED_COUNT),
        orderRef.current.length - 1,
      )
      if (target == fromIndex) {
        translateY.setValue(g.dy)
        return
      }
      const next = [...orderRef.current]
      const [item] = next.splice(fromIndex, 1)
      next.splice(target, 0, item)
      orderRef.current = next
      setOrder(next)
      // 行渲染位置随插入点变化，平移补偿保持手指下的视觉连续
      translateY.setValue((fromIndex - target) * ITEM_HEIGHT + g.dy)
    },
    onPanResponderRelease: finishDrag,
    onPanResponderTerminate: finishDrag,
  }))

  const handleDragStart = (item: LX.List.MyListInfo, index: number, e: GestureResponderEvent) => {
    if (!sortMode || index < FIXED_COUNT) return
    const drag = { id: item.id, fromIndex: index }
    draggingRef.current = drag
    orderRef.current = order
    setDraggingId(item.id)
    setScrollEnabled(false)
    translateY.setValue(0)
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
    const row = (
      <ListItem
        item={item}
        index={index}
        activeId={activeListId}
        sortMode={sortMode}
        isDragging={isDragging}
        onPress={handleToggleList}
        onShowMenu={showMenu}
        onDragStart={handleDragStart}
      />
    )
    if (!isDragging) return <View collapsable={false} style={{ height: ITEM_HEIGHT }}>{row}</View>
    return (
      <View collapsable={false} style={{ height: ITEM_HEIGHT, zIndex: 10 }}>
        <Animated.View style={{ transform: [{ translateY }] }}>{row}</Animated.View>
      </View>
    )
  }
  const getkey: FlatListType['keyExtractor'] = item => item.id
  const getItemLayout: FlatListType['getItemLayout'] = (data, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
      <ListHeader
        sortMode={sortMode}
        onToggleSortMode={() => {
          global.app_event.changeMyListSortMode(!sortMode)
        }}
      />
      <View style={{ height: 1, backgroundColor: colors.rowSeparator }} />
      <View style={{ flex: 1 }} {...panResponderRef.current.panHandlers}>
        <FlatList
          ref={flatListRef}
          onScroll={handleScroll}
          scrollEnabled={scrollEnabled}
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
    </View>
  )
}
