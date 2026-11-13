import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Pressable, View, type ViewStyle, type View as ViewType } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSPopover from '@/components/ios/Popover'
import { getSourceColor } from '@/components/ios/sourceColor'
import IOSText from '@/components/ios/Text'
import { useSourceListI18n } from '@/components/SourceSelector'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
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
  const { accent, spacing } = useIOSTheme()
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
      <Pressable
        ref={anchorRef}
        onPress={() => { if (sourceList.length) setVisible(true) }}
        hitSlop={8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
        }}
      >
        <IOSText variant="subheadline" color={accent} numberOfLines={1}>{label}</IOSText>
        <IOSIcon
          name="chevron-right"
          size={10}
          color={accent}
          style={{ marginLeft: 2, transform: [{ rotate: '90deg' }] }}
        />
      </Pressable>
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
