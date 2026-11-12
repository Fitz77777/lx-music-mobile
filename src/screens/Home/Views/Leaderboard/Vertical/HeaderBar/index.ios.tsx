import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import { iosActionSheet } from '@/components/ios/Alert'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useSourceListI18n } from '@/components/SourceSelector'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import leaderboardState, { type Source } from '@/store/leaderboard/state'

export interface HeaderBarProps {
  onShowBound: () => void
  onSourceChange: (source: LX.OnlineSource) => void
}

export interface HeaderBarType {
  setBound: (source: LX.OnlineSource, id: string, name: string) => void
}

/** iOS 排行榜头部：音源按钮 + 当前榜单（点击打开榜单抽屉） */
export default forwardRef<HeaderBarType, HeaderBarProps>(({ onShowBound, onSourceChange }, ref) => {
  const { colors, accent, spacing, hairline } = useIOSTheme()
  const [source, setSource] = useState<Source>('kw')
  const [boardName, setBoardName] = useState('')

  const sourceList = useSourceListI18n(leaderboardState.sources)
  const sourceLabel = useMemo(() => {
    return sourceList.find(item => item.action == source)?.label ?? ''
  }, [sourceList, source])

  useImperativeHandle(ref, () => ({
    setBound(source, id, name) {
      setSource(source)
      setBoardName(name)
    },
  }), [])

  const handleShowSourceMenu = async() => {
    if (!sourceList.length) return
    const index = await iosActionSheet({ options: sourceList.map(item => item.label) })
    if (index == null) return
    onSourceChange(sourceList[index].action as LX.OnlineSource)
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: 44,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: hairline,
      borderBottomColor: colors.separator,
      backgroundColor: colors.background,
    }}>
      <Pressable
        onPress={() => { void handleShowSourceMenu() }}
        hitSlop={8}
        style={{ flexDirection: 'row', alignItems: 'center', marginRight: spacing.lg }}
      >
        <IOSText variant="subheadline" color={accent} numberOfLines={1}>{sourceLabel}</IOSText>
        <IOSIcon
          name="chevron-right"
          size={11}
          color={accent}
          style={{ marginLeft: 2, transform: [{ rotate: '90deg' }] }}
        />
      </Pressable>
      <Pressable
        onPress={onShowBound}
        hitSlop={8}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}
      >
        <IOSText variant="subheadline" numberOfLines={1} style={{ flexShrink: 1 }}>{boardName}</IOSText>
        <IOSIcon name="chevron-right" size={11} color={colors.secondaryLabel} style={{ marginLeft: 4 }} />
      </Pressable>
    </View>
  )
})
