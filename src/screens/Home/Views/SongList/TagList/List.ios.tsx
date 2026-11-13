import { useEffect, useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react'
import { View, ScrollView } from 'react-native'

import TagGroup, { type TagGroupProps } from './TagGroup'
import IOSSearchBar from '@/components/ios/SearchBar'
import { useI18n } from '@/lang'
import { type TagInfo, type Source } from '@/store/songlist/state'
import { getTags } from '@/core/songlist'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { iosHomeBottomInset } from '@/theme/ios/tokens'

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
  const [keyword, setKeyword] = useState('')
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


  const groups = useMemo(() => {
    const key = keyword.trim().toLowerCase()
    if (!key) return list
    return list
      .map(type => ({
        ...type,
        list: type.list.filter(item => item.name.toLowerCase().includes(key)),
      }))
      .filter(type => type.list.length)
  }, [list, keyword])

  return (
    <View style={{ flexShrink: 1, flexGrow: 0 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <IOSSearchBar
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('songlist_tag_search')}
        />
      </View>
      <ScrollView
        style={{ flexShrink: 1, flexGrow: 0 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl + iosHomeBottomInset }}
        keyboardShouldPersistTaps="always"
      >
        <View onStartShouldSetResponder={() => true}>
          {
            groups.map((type, index) => (
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
              : list.length > 0 && !groups.length
                ? (
                    <View style={{ paddingTop: 40, alignItems: 'center', justifyContent: 'center' }}>
                      <IOSText variant="body" color={colors.secondaryLabel}>{t('songlist_tag_search_empty')}</IOSText>
                    </View>
                  )
                : null
          }
        </View>
      </ScrollView>
    </View>
  )
})
