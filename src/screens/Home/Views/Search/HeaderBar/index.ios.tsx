import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Pressable, View, type View as ViewType } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSPopover from '@/components/ios/Popover'
import IOSSearchBar, { type SearchBarType } from '@/components/ios/SearchBar'
import { getSourceColor } from '@/components/ios/sourceColor'
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
 * iOS 搜索栏：系统搜索框 + 音源下拉（原型 .src-pop）。
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
  const [popoverVisible, setPopoverVisible] = useState(false)
  const sourceAnchorRef = useRef<ViewType>(null)

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
    <View style={{ backgroundColor: colors.groupedBackground }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingBottom: 14,
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
          ref={sourceAnchorRef}
          onPress={handleShowSourceMenu}
          disabled={!sourceList.length}
          hitSlop={8}
          style={{
            marginLeft: 10,
            minWidth: 72,
            height: 38,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 3,
          }}
        >
          <IOSText size={14} color={accent} numberOfLines={1}>{activeSourceLabel}</IOSText>
          <IOSIcon
            name="chevron-right"
            size={13}
            color={accent}
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </Pressable>
        <IOSPopover
          visible={popoverVisible}
          anchorRef={sourceAnchorRef}
          items={sourceItems}
          onClose={() => { setPopoverVisible(false) }}
          onSelect={key => {
            setPopoverVisible(false)
            const next = key as Sources[number]
            setSource(next)
            onSourceChange(next)
          }}
        />
      </View>
      <SearchTypeSelector visible={text.trim().length > 0} />
    </View>
  )
})
