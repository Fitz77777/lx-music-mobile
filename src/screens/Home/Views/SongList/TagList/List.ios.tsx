import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { View, ScrollView } from 'react-native'

import TagGroup, { type TagGroupProps } from './TagGroup'
import { useI18n } from '@/lang'
import { type TagInfo, type Source } from '@/store/songlist/state'
import { getTags } from '@/core/songlist'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface ListProps {
  onTagChange: TagGroupProps['onTagChange']
}

export interface ListType {
  loadTag: (source: Source, activeId: string) => void
}

/** iOS 歌单标签抽屉：分组胶囊列表 */
export default forwardRef<ListType, ListProps>(({ onTagChange }, ref) => {
  const [activeId, setActiveId] = useState('')
  const [list, setList] = useState<TagInfo['tags']>([])
  const t = useI18n()
  const { colors, spacing } = useIOSTheme()
  const prevSource = useRef('')

  const isUnmountedRef = useRef(false)
  useEffect(() => {
    isUnmountedRef.current = false
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  useImperativeHandle(ref, () => ({
    loadTag(source, id) {
      if (id != activeId) setActiveId(id)
      if (source != prevSource.current) {
        setList([{ name: '', list: [{ name: t('songlist_tag_default'), id: '', parent_id: '', parent_name: '', source }] }])
        void getTags(source).then(tagInfo => {
          if (isUnmountedRef.current) return
          prevSource.current = source
          setList([
            { name: '', list: [{ name: t('songlist_tag_default'), id: '', parent_id: '', parent_name: '', source }] },
            { name: t('songlist_tag_hot'), list: [...tagInfo.hotTag] },
            ...tagInfo.tags,
          ].filter(t => t.list.length))
        })
      }
    },
  }))


  return (
    <ScrollView
      style={{ flexShrink: 1, flexGrow: 0 }}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
      keyboardShouldPersistTaps="always"
    >
      <View onStartShouldSetResponder={() => true}>
        {
          list.map((type, index) => (
            <TagGroup
              key={index}
              name={type.name}
              list={type.list}
              activeId={activeId}
              onTagChange={onTagChange}
            />
          ))
        }
        {
          list.length == 1
            ? (
                <View style={{ paddingTop: 60, alignItems: 'center', justifyContent: 'center' }}>
                  <IOSText variant="body" color={colors.secondaryLabel}>{t('list_loading')}</IOSText>
                </View>
              )
            : null
        }
      </View>
    </ScrollView>
  )
})
