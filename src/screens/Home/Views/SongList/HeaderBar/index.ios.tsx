import { forwardRef, useImperativeHandle, useRef } from 'react'
import { View } from 'react-native'

import SortTab, { type SortTabProps, type SortTabType } from './SortTab'
import SourceSelector, {
  type SourceSelectorType,
  type SourceSelectorProps,
} from './SourceSelector'
import { type Source } from '@/store/songlist/state'
import Tag, { type TagType, type TagProps } from './Tag'
import OpenList, { type OpenListType } from './OpenList'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface HeaderBarProps {
  onSortChange: SortTabProps['onSortChange']
  onTagChange: TagProps['onTagChange']
  onSourceChange: SourceSelectorProps['onSourceChange']
}

export interface HeaderBarType {
  setSource: (source: Source, sortId: string, tagName: string, tagId: string) => void
}

/** iOS 歌单广场头部：排序胶囊 + 标签 + 打开歌单 + 音源 */
export default forwardRef<HeaderBarType, HeaderBarProps>(({ onSortChange, onTagChange, onSourceChange }, ref) => {
  const { colors, hairline } = useIOSTheme()
  const sortTabRef = useRef<SortTabType>(null)
  const tagRef = useRef<TagType>(null)
  const openListRef = useRef<OpenListType>(null)
  const sourceSelectorRef = useRef<SourceSelectorType>(null)

  useImperativeHandle(ref, () => ({
    setSource(source, sortId, tagName, tagId) {
      sortTabRef.current?.setSource(source, sortId)
      tagRef.current?.setSelectedTagInfo(source, tagName, tagId)
      sourceSelectorRef.current?.setSource(source)
      openListRef.current?.setInfo(source)
    },
  }), [])

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      borderBottomWidth: hairline,
      borderBottomColor: colors.separator,
      backgroundColor: colors.background,
    }}>
      <SortTab ref={sortTabRef} onSortChange={onSortChange} />
      <Tag ref={tagRef} onTagChange={onTagChange} />
      <OpenList ref={openListRef} />
      <SourceSelector ref={sourceSelectorRef} onSourceChange={onSourceChange} />
    </View>
  )
})
