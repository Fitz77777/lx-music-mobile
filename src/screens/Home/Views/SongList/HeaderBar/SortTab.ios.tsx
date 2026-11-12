import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView } from 'react-native'
import songlistState, { type SortInfo, type Source } from '@/store/songlist/state'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from '@/components/ios/Text'

export interface SortTabProps {
  onSortChange: (id: string) => void
}

export interface SortTabType {
  setSource: (source: Source, activeTab: SortInfo['id']) => void
}

/** iOS 歌单排序：横向胶囊标签 */
export default forwardRef<SortTabType, SortTabProps>(({ onSortChange }, ref) => {
  const [sortList, setSortList] = useState<SortInfo[]>([])
  const [activeId, setActiveId] = useState<SortInfo['id']>('')
  const t = useI18n()
  const { colors, accent, spacing } = useIOSTheme()
  const scrollViewRef = useRef<ScrollView>(null)

  useImperativeHandle(ref, () => ({
    setSource(source, activeTab) {
      scrollViewRef.current?.scrollTo({ x: 0 })
      setSortList(songlistState.sortList[source]!)
      setActiveId(activeTab)
    },
  }))

  const sorts = useMemo(() => {
    return sortList.map(s => ({ label: t(`songlist_${s.tid}`), id: s.id }))
  }, [sortList, t])

  const handleSortChange = (id: string) => {
    onSortChange(id)
    setActiveId(id)
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ flexGrow: 1, flexShrink: 1 }}
      contentContainerStyle={{ alignItems: 'center', paddingHorizontal: spacing.md }}
      keyboardShouldPersistTaps="always"
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {
        sorts.map(s => {
          const active = activeId == s.id
          return (
            <Pressable
              key={s.id}
              onPress={() => { handleSortChange(s.id) }}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: 5,
                marginRight: spacing.sm,
                borderRadius: 999,
                backgroundColor: active ? accent : colors.secondaryFill,
              }}
            >
              <IOSText
                variant="subheadline"
                weight={active ? '600' : '400'}
                color={active ? '#FFFFFF' : colors.label}
                numberOfLines={1}
              >{s.label}</IOSText>
            </Pressable>
          )
        })
      }
    </ScrollView>
  )
})
