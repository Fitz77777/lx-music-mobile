import { memo, useEffect, useRef } from 'react'
import { View, Pressable, FlatList, type NativeScrollEvent, type NativeSyntheticEvent, type FlatListProps } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import CheckMark from '@/components/ios/CheckMark'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { iosHomeBottomInset } from '@/theme/ios/tokens'
import { useActiveListId, useListFetching, useMyList } from '@/store/list/hook'
import { LIST_SCROLL_POSITION_KEY } from '@/config/constant'
import { getListPosition, saveListPosition } from '@/utils/data'
import { setActiveList } from '@/core/list'
import { type Position } from './ListMenu'
import Loading from '@/components/common/Loading'

type FlatListType = FlatListProps<LX.List.MyListInfo>

const ITEM_HEIGHT = 48

const ListItem = memo(({ item, index, activeId, onPress, onShowMenu }: {
  onPress: (item: LX.List.MyListInfo) => void
  index: number
  activeId: string
  item: LX.List.MyListInfo
  onShowMenu: (item: LX.List.MyListInfo, index: number, position: { x: number, y: number, w: number, h: number }) => void
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

  const handlePress = () => {
    onPress(item)
  }

  return (
    <View style={{ height: ITEM_HEIGHT, flexDirection: 'row', alignItems: 'center' }}>
      <Pressable
        onPress={handlePress}
        style={{ flex: 1, height: '100%', flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg }}
      >
        <IOSText
          variant="body"
          color={active ? accent : colors.label}
          numberOfLines={1}
          style={{ flexShrink: 1 }}
        >{item.name}</IOSText>
        {fetching ? <Loading color={active ? accent : colors.secondaryLabel} style={{ marginLeft: spacing.sm }} /> : null}
        {active ? <CheckMark size={13} color={accent} thickness={2} style={{ marginLeft: spacing.sm }} /> : null}
      </Pressable>
      <Pressable
        ref={moreButtonRef}
        onPress={handleShowMenu}
        hitSlop={6}
        style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <IOSIcon name="dots-vertical" size={18} color={colors.secondaryLabel} />
      </Pressable>
    </View>
  )
}, (prevProps, nextProps) => {
  return !!(prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.item.name == nextProps.item.name &&
    prevProps.activeId != nextProps.item.id &&
    nextProps.activeId != nextProps.item.id
  )
})

/** iOS 我的列表抽屉：播放列表行 */
export default ({ onShowMenu }: {
  onShowMenu: (info: { listInfo: LX.List.MyListInfo, index: number }, position: Position) => void
}) => {
  const flatListRef = useRef<FlatList>(null)
  const allList = useMyList()
  const activeListId = useActiveListId()
  const { colors } = useIOSTheme()

  const handleToggleList = (item: LX.List.MyListInfo) => {
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

  const renderItem: FlatListType['renderItem'] = ({ item, index }) => (
    <ListItem
      key={item.id}
      item={item}
      index={index}
      activeId={activeListId}
      onPress={handleToggleList}
      onShowMenu={showMenu}
    />
  )
  const getkey: FlatListType['keyExtractor'] = item => item.id
  const getItemLayout: FlatListType['getItemLayout'] = (data, index) => {
    return { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
  }

  return (
    <FlatList
      ref={flatListRef}
      onScroll={handleScroll}
      style={{ flexShrink: 1, flexGrow: 0, backgroundColor: colors.groupedBackground }}
      data={allList}
      maxToRenderPerBatch={9}
      windowSize={9}
      removeClippedSubviews
      initialNumToRender={18}
      renderItem={renderItem}
      keyExtractor={getkey}
      getItemLayout={getItemLayout}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 8 + iosHomeBottomInset }}
    />
  )
}
