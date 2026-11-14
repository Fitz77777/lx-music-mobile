import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, View, type View as ViewType } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSPopover from '@/components/ios/Popover'
import { getSourceColor } from '@/components/ios/sourceColor'
import IOSText from '@/components/ios/Text'
import { useSourceListI18n } from '@/components/SourceSelector'
import { getBoardsList } from '@/core/leaderboard'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import leaderboardState, { type BoardItem, type Source } from '@/store/leaderboard/state'

export interface HeaderBarProps {
  onShowBound: () => void
  onSourceChange: (source: LX.OnlineSource) => void
  onSelectBoard?: (id: string, name: string) => void
}

export interface HeaderBarType {
  setBound: (source: LX.OnlineSource, id: string, name: string) => void
}

/** 常驻快捷榜单数量 */
const QUICK_BOARD_COUNT = 3

/** iOS 排行榜工具条：三个常驻榜单 chips + 音源链接（原型 .chips） */
export default forwardRef<HeaderBarType, HeaderBarProps>(({ onShowBound, onSourceChange, onSelectBoard }, ref) => {
  const { colors, accent, spacing, radius, shadow } = useIOSTheme()
  const [source, setSource] = useState<Source>('kw')
  const [activeId, setActiveId] = useState('')
  const [boards, setBoards] = useState<BoardItem[]>([])
  const [popoverVisible, setPopoverVisible] = useState(false)
  const sourceAnchorRef = useRef<ViewType>(null)
  const boardRequestRef = useRef(0)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isUnmountedRef.current = false
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  const sourceList = useSourceListI18n(leaderboardState.sources)
  const sourceLabel = useMemo(() => {
    return sourceList.find(item => item.action == source)?.label ?? ''
  }, [sourceList, source])

  useImperativeHandle(ref, () => ({
    setBound(nextSource, id) {
      setSource(nextSource)
      setActiveId(id)
      const requestId = ++boardRequestRef.current
      void getBoardsList(nextSource).then(list => {
        if (isUnmountedRef.current || requestId != boardRequestRef.current) return
        setBoards(list)
      })
    },
  }), [])

  const quickBoards = useMemo(() => {
    // 与「全部榜单」保持同一顺序：直接取榜单列表前三个（从左往右）
    return boards.slice(0, QUICK_BOARD_COUNT)
  }, [boards])

  // 当前榜不在常驻 chips 内时，把榜名交给首页大标题显示（原型行为）
  useEffect(() => {
    if (!boards.length) return
    const isQuick = quickBoards.some(item => item.id == activeId)
    const name = isQuick ? '' : boards.find(item => item.id == activeId)?.name ?? ''
    global.app_event.leaderboardBoundChange(name)
  }, [boards, quickBoards, activeId])

  const handleShowSourceMenu = () => {
    if (!sourceList.length) return
    setPopoverVisible(true)
  }

  const sourceItems = useMemo(() => {
    return sourceList.map(item => ({
      key: item.action,
      label: item.label,
      color: getSourceColor(item.action),
      selected: item.action == source,
    }))
  }, [sourceList, source])

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: 12,
      backgroundColor: colors.canvas,
    }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
        keyboardShouldPersistTaps="always"
      >
        {
          quickBoards.map(item => {
            const active = activeId == item.id
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setActiveId(item.id)
                  onSelectBoard?.(item.id, item.name)
                }}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginRight: spacing.sm,
                  borderRadius: radius.pill,
                  backgroundColor: active ? accent : colors.secondaryGroupedBackground,
                  ...(active ? null : shadow.chip),
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <IOSText
                  variant="subheadline"
                  weight={active ? '600' : '400'}
                  color={active ? colors.onAccent : colors.label}
                  numberOfLines={1}
                >{item.name}</IOSText>
              </Pressable>
            )
          })
        }
      </ScrollView>
      <View style={{ flex: 1 }} />
      <Pressable
        ref={sourceAnchorRef}
        onPress={handleShowSourceMenu}
        onLongPress={onShowBound}
        hitSlop={8}
        style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.sm }}
      >
        <IOSText variant="subheadline" color={accent} numberOfLines={1}>{sourceLabel}</IOSText>
        <IOSIcon
          name="chevron-right"
          size={12}
          color={accent}
          style={{ marginLeft: 3, transform: [{ rotate: '90deg' }] }}
        />
      </Pressable>
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
