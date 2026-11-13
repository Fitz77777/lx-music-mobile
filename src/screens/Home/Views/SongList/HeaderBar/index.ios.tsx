import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
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

/** iOS 歌单广场工具条：标签筛选 + 排序胶囊 + 音源链接（打开歌单入口在导航栏） */
export default forwardRef<HeaderBarType, HeaderBarProps>(({ onSortChange, onTagChange, onSourceChange }, ref) => {
  const { colors, spacing } = useIOSTheme()
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

  // 导航栏的「打开」按钮通过事件触发这里的打开歌单面板
  useEffect(() => {
    const handleShow = () => { openListRef.current?.show() }
    global.app_event.on('showSonglistOpenList', handleShow)
    return () => {
      global.app_event.off('showSonglistOpenList', handleShow)
    }
  }, [])

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      paddingLeft: spacing.lg,
      backgroundColor: colors.groupedBackground,
    }}>
      <Tag ref={tagRef} onTagChange={onTagChange} />
      <SortTab ref={sortTabRef} onSortChange={onSortChange} />
      <SourceSelector ref={sourceSelectorRef} onSourceChange={onSourceChange} style={{ paddingRight: spacing.lg }} />
      <OpenList ref={openListRef} hideButton />
    </View>
  )
})
