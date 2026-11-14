import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { View, type ViewStyle, type View as ViewType } from 'react-native'

import IOSPopover from '@/components/ios/Popover'
import IOSSourcePill from '@/components/ios/SourcePill'
import { getSourceColor } from '@/components/ios/sourceColor'
import { useSourceListI18n } from '@/components/SourceSelector'
import songlistState, { type Source } from '@/store/songlist/state'

export interface SourceSelectorProps {
  onSourceChange: (source: Source) => void
  style?: ViewStyle
}

export interface SourceSelectorType {
  setSource: (source: Source) => void
}

/** iOS 歌单音源：点击弹出下拉菜单（原型 .src-pop） */
export default forwardRef<SourceSelectorType, SourceSelectorProps>(({ style, onSourceChange }, ref) => {
  const [source, setSource] = useState<Source>('kw')
  const [visible, setVisible] = useState(false)
  const anchorRef = useRef<ViewType>(null)

  const sourceList = useSourceListI18n(songlistState.sources)
  const label = useMemo(() => {
    return sourceList.find(item => item.action == source)?.label ?? ''
  }, [sourceList, source])

  useImperativeHandle(ref, () => ({
    setSource(source) {
      setSource(source)
    },
  }), [])

  const items = useMemo(() => {
    return sourceList.map(item => ({
      key: item.action,
      label: item.label,
      color: getSourceColor(item.action),
      selected: item.action == source,
    }))
  }, [sourceList, source])

  return (
    <View style={style}>
      <IOSSourcePill
        source={source}
        label={label}
        anchorRef={anchorRef}
        onPress={() => { if (sourceList.length) setVisible(true) }}
        disabled={!sourceList.length}
      />
      <IOSPopover
        visible={visible}
        anchorRef={anchorRef}
        items={items}
        onClose={() => { setVisible(false) }}
        onSelect={key => {
          setVisible(false)
          onSourceChange(key as Source)
        }}
      />
    </View>
  )
})
