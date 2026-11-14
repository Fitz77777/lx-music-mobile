import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { View, type View as ViewType } from 'react-native'

import BoardsList, { type BoardsListType, type BoardsListProps } from '../BoardsList'
import IOSPopover from '@/components/ios/Popover'
import IOSSourcePill from '@/components/ios/SourcePill'
import { getSourceColor } from '@/components/ios/sourceColor'
import { useSourceListI18n } from '@/components/SourceSelector'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { handleCollect, handlePlay } from '../listAction'
import boardState from '@/store/leaderboard/state'
import { getBoardsList } from '@/core/leaderboard'

export interface LeftBarProps {
  onChangeList: (source: LX.OnlineSource, id: string) => void
}

export interface LeftBarType {
  setBound: (source: LX.OnlineSource, id: string) => void
}

const SIDEBAR_WIDTH = 216

/**
 * 横屏排行榜左栏（iOS 版）：顶部音源选择胶囊 + 全部榜单列表。
 * 榜单已全部平铺在左侧，因此横屏不再提供「全部榜单」入口。
 */
export default forwardRef<LeftBarType, LeftBarProps>(({ onChangeList }, ref) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const boardsListRef = useRef<BoardsListType>(null)
  const sourceAnchorRef = useRef<ViewType>(null)
  const boundInfo = useRef<{ source: LX.OnlineSource, id: string | null }>({ source: 'kw', id: null })
  const [source, setSource] = useState<LX.OnlineSource>('kw')
  const [popoverVisible, setPopoverVisible] = useState(false)

  const sourceList = useSourceListI18n(boardState.sources)
  const sourceLabel = useMemo(() => {
    return sourceList.find(item => item.action == source)?.label ?? ''
  }, [sourceList, source])

  const sourceItems = useMemo(() => {
    return sourceList.map(item => ({
      key: item.action,
      label: item.label,
      color: getSourceColor(item.action),
      selected: item.action == source,
    }))
  }, [sourceList, source])

  useImperativeHandle(ref, () => ({
    setBound(nextSource, listId) {
      boundInfo.current = { source: nextSource, id: listId }
      setSource(nextSource)
      void getBoardsList(nextSource).then(list => {
        boardsListRef.current?.setList(list, listId)
      })
    },
  }))

  const onSourceChange = (nextSource: LX.OnlineSource) => {
    boundInfo.current.source = nextSource
    setSource(nextSource)
    void getBoardsList(nextSource).then(list => {
      const id = list[0].id
      requestAnimationFrame(() => {
        boardsListRef.current?.setList(list, id)
        requestAnimationFrame(() => {
          onChangeList(nextSource, id)
        })
      })
    })
  }

  const onBoundChange: BoardsListProps['onBoundChange'] = (id) => {
    boundInfo.current.id = id
    onChangeList(boundInfo.current.source, id)
  }
  const onPlay: BoardsListProps['onPlay'] = (id) => {
    boundInfo.current.id = id
    void handlePlay(id, boardState.listDetailInfo.list)
  }
  const onCollect: BoardsListProps['onCollect'] = (id, name) => {
    boundInfo.current.id = id
    void handleCollect(id, name, boundInfo.current.source)
  }

  return (
    <View style={{
      width: SIDEBAR_WIDTH,
      flexGrow: 0,
      flexShrink: 0,
      borderRightWidth: hairline,
      borderRightColor: colors.separator,
      paddingTop: spacing.sm,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
      }}>
        <IOSSourcePill
          source={source}
          label={sourceLabel}
          anchorRef={sourceAnchorRef}
          onPress={() => { if (sourceList.length) setPopoverVisible(true) }}
          disabled={!sourceList.length}
        />
      </View>
      <BoardsList
        ref={boardsListRef}
        onBoundChange={onBoundChange}
        onPlay={onPlay}
        onCollect={onCollect}
      />
      <IOSPopover
        visible={popoverVisible}
        anchorRef={sourceAnchorRef}
        items={sourceItems}
        onClose={() => { setPopoverVisible(false) }}
        onSelect={key => {
          setPopoverVisible(false)
          onSourceChange(key as LX.OnlineSource)
        }}
      />
    </View>
  )
})
