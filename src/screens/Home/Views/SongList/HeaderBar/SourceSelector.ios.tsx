import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { Pressable, type ViewStyle } from 'react-native'

import { iosActionSheet } from '@/components/ios/Alert'
import IOSIcon from '@/components/ios/Icon'
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

/** iOS 歌单音源：点击弹出原生 ActionSheet */
export default forwardRef<SourceSelectorType, SourceSelectorProps>(({ style, onSourceChange }, ref) => {
  const { accent, spacing } = useIOSTheme()
  const [source, setSource] = useState<Source>('kw')

  const sourceList = useSourceListI18n(songlistState.sources)
  const label = useMemo(() => {
    return sourceList.find(item => item.action == source)?.label ?? ''
  }, [sourceList, source])

  useImperativeHandle(ref, () => ({
    setSource(source) {
      setSource(source)
    },
  }), [])

  const handleShow = async() => {
    if (!sourceList.length) return
    const index = await iosActionSheet({ options: sourceList.map(item => item.label) })
    if (index == null) return
    onSourceChange(sourceList[index].action as Source)
  }

  return (
    <Pressable
      onPress={() => { void handleShow() }}
      hitSlop={8}
      style={[{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
      }, style]}
    >
      <IOSText variant="subheadline" color={accent} numberOfLines={1}>{label}</IOSText>
      <IOSIcon
        name="chevron-right"
        size={10}
        color={accent}
        style={{ marginLeft: 2, transform: [{ rotate: '90deg' }] }}
      />
    </Pressable>
  )
})
