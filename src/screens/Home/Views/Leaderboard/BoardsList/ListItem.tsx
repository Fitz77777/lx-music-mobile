import { useCallback, useRef } from 'react'
import { Pressable, type View } from 'react-native'

import IOSText from '@/components/ios/Text'
import CheckMark from '@/components/ios/CheckMark'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { type BoardItem } from '@/store/leaderboard/state'

export interface ListItemProps {
  item: BoardItem
  index: number
  longPressIndex: number
  activeId: string
  onShowMenu: (id: string, name: string, index: number, position: { x: number, y: number, w: number, h: number }) => void
  onBoundChange: (item: BoardItem) => void
}

/** iOS 排行榜列表行：当前榜单显示对勾，长按弹出操作菜单 */
export default ({ item, activeId, index, longPressIndex, onBoundChange, onShowMenu }: ListItemProps) => {
  const { colors, accent, spacing } = useIOSTheme()
  const rowRef = useRef<View>(null)

  const setPosition = useCallback(() => {
    rowRef.current?.measure((fx, fy, width, height, px, py) => {
      onShowMenu(item.id, item.name, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
    })
  }, [index, item, onShowMenu])

  const active = activeId == item.id

  return (
    <Pressable
      ref={rowRef}
      onPress={() => { onBoundChange(item) }}
      onLongPress={setPosition}
      style={({ pressed }) => ({
        minHeight: 48,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.lg,
        paddingRight: spacing.md,
        backgroundColor: pressed || index == longPressIndex ? colors.secondaryFill : 'transparent',
      })}
    >
      <IOSText
        variant="body"
        color={active ? accent : colors.label}
        numberOfLines={1}
        style={{ flex: 1, paddingRight: spacing.sm }}
      >{item.name}</IOSText>
      {active ? <CheckMark size={13} color={accent} thickness={2} /> : null}
    </Pressable>
  )
}
