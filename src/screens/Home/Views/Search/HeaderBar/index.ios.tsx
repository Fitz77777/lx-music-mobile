import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'

import { iosActionSheet } from '@/components/ios/Alert'
import IOSIcon from '@/components/ios/Icon'
import IOSSearchBar, { type SearchBarType } from '@/components/ios/SearchBar'
import IOSText from '@/components/ios/Text'
import { useSourceListI18n } from '@/components/SourceSelector'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import SearchTypeSelector from '../SearchTypeSelector'
import { type Source as MusicSource } from '@/store/search/music/state'
import { type Source as SonglistSource } from '@/store/search/songlist/state'

type Sources = Readonly<Array<MusicSource | SonglistSource>>

export interface HeaderBarProps {
  onSourceChange: (source: Sources[number]) => void
  onTipSearch: (text: string) => void
  onSearch: (text: string) => void
  onHideTipList: () => void
  onShowTipList: () => void
}

export interface HeaderBarType {
  setSourceList: (list: Sources, source: Sources[number]) => void
  setText: (text: string) => void
  blur: () => void
}

/**
 * iOS 搜索栏：系统搜索框 + 音源按钮（点击弹出原生 ActionSheet）。
 * 保持与 Android 版相同的 ref API，搜索页逻辑无需改动。
 */
export default forwardRef<HeaderBarType, HeaderBarProps>(({
  onSourceChange,
  onTipSearch,
  onSearch,
  onHideTipList,
  onShowTipList,
}, ref) => {
  const { colors, accent, spacing } = useIOSTheme()
  const searchBarRef = useRef<SearchBarType>(null)
  const [text, setText] = useState('')
  const [sources, setSources] = useState<Sources>([])
  const [source, setSource] = useState<Sources[number]>('kw')

  const sourceList = useSourceListI18n(sources)
  const activeSourceLabel = sourceList.find(item => item.action == source)?.label ?? ''

  useImperativeHandle(ref, () => ({
    setSourceList(list, activeSource) {
      setSources(list)
      setSource(activeSource)
    },
    setText(text) {
      setText(text)
    },
    blur() {
      searchBarRef.current?.blur()
    },
  }), [])

  const handleChangeText = (text: string) => {
    setText(text)
    onTipSearch(text.trim())
  }

  const handleSubmit = (text: string) => {
    onSearch(text)
  }

  const handleCancel = () => {
    setText('')
    onTipSearch('')
  }

  const handleShowSourceMenu = async() => {
    if (!sourceList.length) return
    const index = await iosActionSheet({
      options: sourceList.map(item => item.label),
    })
    if (index == null) return
    const next = sourceList[index].action
    setSource(next)
    onSourceChange(next)
  }

  return (
    <View style={{ backgroundColor: colors.groupedBackground }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }}>
        <IOSSearchBar
          ref={searchBarRef}
          value={text}
          onChangeText={handleChangeText}
          onSubmit={handleSubmit}
          onFocus={onShowTipList}
          onBlur={onHideTipList}
          onCancel={handleCancel}
          style={{ flex: 1 }}
        />
        <Pressable
          onPress={() => { void handleShowSourceMenu() }}
          disabled={!sourceList.length}
          hitSlop={8}
          style={{
            marginLeft: spacing.md,
            height: 36,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <IOSText variant="subheadline" color={accent} numberOfLines={1}>{activeSourceLabel}</IOSText>
          <IOSIcon
            name="chevron-right"
            size={11}
            color={accent}
            style={{ marginLeft: 2, transform: [{ rotate: '90deg' }] }}
          />
        </Pressable>
      </View>
      <SearchTypeSelector visible={text.trim().length > 0} />
    </View>
  )
})
