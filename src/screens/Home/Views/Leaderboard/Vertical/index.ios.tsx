import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState, type RefObject } from 'react'
import { Pressable, ScrollView, View, type View as ViewType } from 'react-native'

import MusicList, { type MusicListType } from '../MusicList'
import { getLeaderboardSetting, saveLeaderboardSetting } from '@/utils/data'
import HeaderBar, { type HeaderBarType, type HeaderBarProps } from './HeaderBar'
import { getBoardsList } from '@/core/leaderboard'
import { handleCollect, handlePlay } from '../listAction'
import boardState, { type BoardItem } from '@/store/leaderboard/state'
import IOSBottomSheet from '@/components/ios/BottomSheet'
import IOSIcon from '@/components/ios/Icon'
import IOSSearchBar from '@/components/ios/SearchBar'
import IOSText from '@/components/ios/Text'
import ListMenu, { type ListMenuType, type Position } from '../BoardsList/ListMenu'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useKeyboard } from '@/utils/hooks'

interface BoardsSheetProps {
  onSelect: (id: string) => void
  onPlay: (id: string) => void
  onCollect: (id: string, name: string) => void
}
interface BoardsSheetType {
  setList: (list: BoardItem[], activeId: string) => void
  show: () => void
  hide: () => void
}

const CELL_HEIGHT = 50
const CELL_GAP = 9
const CELL_RADIUS = 12
const GRID_MAX_HEIGHT = 300
/** 键盘弹出时压缩网格，避免面板顶到状态栏 */
const GRID_MAX_HEIGHT_WITH_KEYBOARD = 150

/**
 * iOS「全部榜单」面板：搜索框 + 双列网格 + 当前项打勾（原型 .sheet.tall）。
 * 榜单数量多，用搜索定位；面板中的操作菜单与抽屉版保持一致。
 */
const BoardsSheet = forwardRef<BoardsSheetType, BoardsSheetProps>(({ onSelect, onPlay, onCollect }, ref) => {
  const t = useI18n()
  const { colors, accent, spacing } = useIOSTheme()
  const { keyboardShown } = useKeyboard()
  const [visible, setVisible] = useState(false)
  const [list, setList] = useState<BoardItem[]>([])
  const [activeId, setActiveId] = useState('')
  const [keyword, setKeyword] = useState('')
  const [width, setWidth] = useState(0)
  const [longPressIndex, setLongPressIndex] = useState(-1)
  const scrollRef = useRef<ScrollView>(null)
  const listMenuRef = useRef<ListMenuType>(null)
  const activeIndexRef = useRef(-1)

  const filtered = useMemo(() => {
    const key = keyword.trim().toLowerCase()
    if (!key) return list
    return list.filter(item => item.name.toLowerCase().includes(key))
  }, [list, keyword])

  const cellWidth = width > 0 ? (width - CELL_GAP) / 2 : 0
  const gridMaxHeight = keyboardShown ? GRID_MAX_HEIGHT_WITH_KEYBOARD : GRID_MAX_HEIGHT

  useImperativeHandle(ref, () => ({
    setList(nextList, nextActiveId) {
      setList(nextList)
      setActiveId(nextActiveId)
      activeIndexRef.current = nextList.findIndex(item => item.id == nextActiveId)
    },
    show() {
      setKeyword('')
      setVisible(true)
    },
    hide() {
      setVisible(false)
    },
  }))

  // 打开面板时把当前榜单滚到可视区域中间
  useEffect(() => {
    if (!visible || activeIndexRef.current < 0 || !cellWidth) return
    const timer = setTimeout(() => {
      const row = Math.floor(activeIndexRef.current / 2)
      scrollRef.current?.scrollTo({
        y: Math.max(0, row * (CELL_HEIGHT + CELL_GAP) - gridMaxHeight / 2 + CELL_HEIGHT),
        animated: false,
      })
    }, 360)
    return () => {
      clearTimeout(timer)
    }
  }, [visible, cellWidth, gridMaxHeight])

  const handleLongPress = (item: BoardItem, index: number, rowRef: RefObject<ViewType>) => {
    setLongPressIndex(index)
    rowRef.current?.measure((fx, fy, w, h, px, py) => {
      const position: Position = { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(w), h: Math.ceil(h) }
      listMenuRef.current?.show({ listId: item.id, name: item.name, index }, position)
    })
  }

  return (
    <>
      <IOSBottomSheet
        visible={visible}
        onClose={() => { setVisible(false) }}
      >
        <View style={{ marginBottom: spacing.md }}>
          <IOSSearchBar
            value={keyword}
            onChangeText={setKeyword}
            placeholder={t('leaderboard_search_placeholder')}
          />
        </View>
        <View onLayout={e => { setWidth(e.nativeEvent.layout.width) }}>
          <ScrollView
            ref={scrollRef}
            style={{ maxHeight: gridMaxHeight }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {
              filtered.length
                ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      {
                        filtered.map((item, index) => {
                          const active = item.id == activeId
                          return (
                            <BoardCell
                              key={item.id}
                              item={item}
                              index={index}
                              width={cellWidth}
                              active={active}
                              highlight={index == longPressIndex}
                              pressedBackground={colors.secondaryFill}
                              onPress={() => {
                                onSelect(item.id)
                                setVisible(false)
                              }}
                              onLongPress={handleLongPress}
                            />
                          )
                        })
                      }
                    </View>
                  )
                : (
                    <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                      <IOSText variant="body" color={colors.secondaryLabel}>{t('leaderboard_search_empty')}</IOSText>
                    </View>
                  )
            }
          </ScrollView>
        </View>
        <Pressable
          onPress={() => { setVisible(false) }}
          accessibilityRole="button"
          style={({ pressed }) => ({
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: spacing.xs,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <IOSText color={accent}>{t('cancel')}</IOSText>
        </Pressable>
      </IOSBottomSheet>
      <ListMenu
        ref={listMenuRef}
        onHideMenu={() => { setLongPressIndex(-1) }}
        onPlay={({ listId }) => { onPlay(listId) }}
        onCollect={({ listId, name }) => { onCollect(listId, name) }}
      />
    </>
  )
})
BoardsSheet.displayName = 'BoardsSheet'

/** 单个榜单格子（原型 .rk-cell） */
const BoardCell = ({ item, index, width, active, highlight, pressedBackground, onPress, onLongPress }: {
  item: BoardItem
  index: number
  width: number
  active: boolean
  highlight: boolean
  pressedBackground: string
  onPress: () => void
  onLongPress: (item: BoardItem, index: number, rowRef: RefObject<ViewType>) => void
}) => {
  const { colors, accent, withAlpha } = useIOSTheme()
  const rowRef = useRef<ViewType>(null)

  return (
    <Pressable
      ref={rowRef}
      onPress={onPress}
      onLongPress={() => { onLongPress(item, index, rowRef) }}
      style={({ pressed }) => ({
        width,
        height: CELL_HEIGHT,
        borderRadius: CELL_RADIUS,
        paddingHorizontal: 12,
        justifyContent: 'center',
        marginBottom: CELL_GAP,
        backgroundColor: active
          ? withAlpha(accent, 0.12)
          : pressed || highlight
            ? pressedBackground
            : colors.groupedBackground,
      })}
    >
      <IOSText
        variant="subheadline"
        weight={active ? '600' : '400'}
        color={active ? accent : colors.label}
        numberOfLines={1}
        style={{ paddingRight: active ? 16 : 0 }}
      >{item.name}</IOSText>
      {active
        ? <IOSIcon name="checkbox-marked" size={13} color={accent} style={{ position: 'absolute', top: 8, right: 9 }} />
        : null}
    </Pressable>
  )
}

/**
 * iOS 排行榜页：标题栏 + 快捷榜单 chips + 歌曲列表，
 * 「全部榜单」通过底部面板选择（原型排行榜页）。
 */
export default () => {
  const musicListRef = useRef<MusicListType>(null)
  const boardsSheetRef = useRef<BoardsSheetType>(null)
  const headerBarRef = useRef<HeaderBarType>(null)
  const boundInfo = useRef<{ source: LX.OnlineSource, id: string | null }>({ source: 'kw', id: null })

  const resolveBoardId = (list: BoardItem[], boardId: string | null) => {
    if (!list.length) return null
    return list.some(item => item.id == boardId) ? boardId : list[0].id
  }

  const handleBoundChange = (source: LX.OnlineSource, id: string) => {
    musicListRef.current?.loadList(source, id)
    void saveLeaderboardSetting({
      source,
      boardId: id,
    })
  }

  const syncBoardsSheet = (source: LX.OnlineSource, id: string | null) => {
    if (!id) return
    void getBoardsList(source).then(list => {
      if (!list.length) return
      requestAnimationFrame(() => {
        boardsSheetRef.current?.setList(list, id)
      })
    })
  }

  const selectBoard = (id: string) => {
    boundInfo.current.id = id
    void getBoardsList(boundInfo.current.source).then(list => {
      requestAnimationFrame(() => {
        const bound = list.find(l => l.id == id)
        headerBarRef.current?.setBound(boundInfo.current.source, id, bound?.name ?? 'Unknown')
      })
    })
    handleBoundChange(boundInfo.current.source, id)
  }

  const onPlay = (id: string) => {
    boundInfo.current.id = id
    void handlePlay(id, boardState.listDetailInfo.list)
  }
  const onCollect = (id: string, name: string) => {
    boundInfo.current.id = id
    void handleCollect(id, name, boundInfo.current.source)
  }
  const onShowBound = () => {
    syncBoardsSheet(boundInfo.current.source, boundInfo.current.id)
    boardsSheetRef.current?.show()
  }
  const onSourceChange: HeaderBarProps['onSourceChange'] = (source) => {
    boundInfo.current.source = source
    void getBoardsList(source).then(list => {
      const id = resolveBoardId(list, null)
      if (!id) return
      const bound = list.find(item => item.id == id)
      requestAnimationFrame(() => {
        boardsSheetRef.current?.setList(list, id)
        headerBarRef.current?.setBound(source, id, bound?.name ?? 'Unknown')
        requestAnimationFrame(() => {
          boundInfo.current.id = id
          handleBoundChange(source, id)
        })
      })
    })
  }

  useEffect(() => {
    const handleShowBoards = () => {
      syncBoardsSheet(boundInfo.current.source, boundInfo.current.id)
      boardsSheetRef.current?.show()
    }

    global.app_event.on('showLeaderboardBoards', handleShowBoards)

    void getLeaderboardSetting().then(({ source, boardId }) => {
      boundInfo.current.source = source
      void getBoardsList(source).then(list => {
        const resolvedId = resolveBoardId(list, boardId)
        if (!resolvedId) return
        boundInfo.current.id = resolvedId
        const bound = list.find(l => l.id == resolvedId)
        boardsSheetRef.current?.setList(list, resolvedId)
        headerBarRef.current?.setBound(source, resolvedId, bound?.name ?? 'Unknown')
        if (resolvedId != boardId) {
          void saveLeaderboardSetting({
            source,
            boardId: resolvedId,
          })
        }
        musicListRef.current?.loadList(source, resolvedId)
      })
    })

    return () => {
      global.app_event.off('showLeaderboardBoards', handleShowBoards)
    }
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <HeaderBar
        ref={headerBarRef}
        onShowBound={onShowBound}
        onSelectBoard={selectBoard}
        onSourceChange={onSourceChange}
      />
      <MusicList ref={musicListRef} />
      <BoardsSheet
        ref={boardsSheetRef}
        onSelect={selectBoard}
        onPlay={onPlay}
        onCollect={onCollect}
      />
    </View>
  )
}
