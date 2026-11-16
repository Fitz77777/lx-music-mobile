import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import IOSBottomSheet from '@/components/ios/BottomSheet'
import IOSSearchBar from '@/components/ios/SearchBar'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import type { TagInfo, TagInfoItem, Source } from '@/store/songlist/state'
import { getTags } from '@/core/songlist'
import { useWindowSize } from '@/utils/hooks'

/**
 * 平板歌单标签筛选（原型 iPad 版 .sheet + .tag-body）：
 * 居中浮层卡片 + 搜索框 + 3 列标签网格，替代手机端的侧边抽屉。
 * 标签数量多，列表区限高滚动，避免面板过高。
 */

const COLUMNS = 3
const CHIP_GAP = 8

const chunk = <T,>(list: T[], size: number): T[][] => {
  const rows: T[][] = []
  for (let i = 0; i < list.length; i += size) rows.push(list.slice(i, i + size))
  return rows
}

export default () => {
  const t = useI18n()
  const { colors, accent, spacing, radius, hairline } = useIOSTheme()
  const { height: winHeight } = useWindowSize()
  const [visible, setVisible] = useState(false)
  const [list, setList] = useState<TagInfo['tags']>([])
  const [keyword, setKeyword] = useState('')
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(false)
  const prevSource = useRef('')
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isUnmountedRef.current = false
    const handleShow = (source: Source, id: string) => {
      setVisible(true)
      setActiveId(id)
      setKeyword('')
      if (source == prevSource.current) return
      prevSource.current = source
      setLoading(true)
      setList([{ name: '', list: [{ name: t('songlist_tag_default'), id: '', parent_id: '', parent_name: '', source }] }])
      void getTags(source).then(tagInfo => {
        if (isUnmountedRef.current) return
        setLoading(false)
        setList([
          { name: '', list: [{ name: t('songlist_tag_default'), id: '', parent_id: '', parent_name: '', source }] },
          { name: t('songlist_tag_hot'), list: [...tagInfo.hotTag] },
          ...tagInfo.tags,
        ].filter(t => t.list.length))
      }).catch(() => {
        if (isUnmountedRef.current) return
        setLoading(false)
      })
    }
    global.app_event.on('showSonglistTagList', handleShow)

    return () => {
      isUnmountedRef.current = true
      global.app_event.off('showSonglistTagList', handleShow)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groups = useMemo(() => {
    const key = keyword.trim().toLowerCase()
    if (!key) return list
    return list
      .map(type => ({
        ...type,
        list: type.list.filter(item => item.name.toLowerCase().includes(key) || item.name == t('songlist_tag_default')),
      }))
      .filter(type => type.list.length)
  }, [list, keyword, t])

  const handleSelect = (item: TagInfoItem) => {
    setVisible(false)
    requestAnimationFrame(() => {
      global.app_event.songlistTagInfoChange(item.name, item.id)
    })
  }

  const handleClose = () => { setVisible(false) }

  const renderChip = (item: TagInfoItem, inRow: boolean) => {
    const active = activeId == item.id
    return (
      <Pressable
        key={`${item.parent_id}_${item.id}`}
        onPress={() => { handleSelect(item) }}
        style={({ pressed }) => ({
          flex: 1,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: spacing.xs,
          borderRadius: radius.control,
          backgroundColor: active ? accent : pressed ? colors.tertiaryFill : 'transparent',
          borderWidth: active ? 0 : hairline,
          borderColor: colors.rowSeparator,
          marginRight: inRow ? CHIP_GAP : 0,
        })}
      >
        <IOSText
          variant="subheadline"
          weight={active ? '600' : '400'}
          color={active ? colors.onAccent : colors.label}
          numberOfLines={1}
        >{item.name}</IOSText>
      </Pressable>
    )
  }

  const renderRows = (items: TagInfoItem[]) => {
    return chunk(items, COLUMNS).map((row, rowIndex) => (
      <View
        key={rowIndex}
        style={{ flexDirection: 'row', marginBottom: CHIP_GAP }}
      >
        {row.map((item, index) => renderChip(item, index < row.length - 1))}
        {/* 最后一行不足 3 个时补齐等宽占位 */}
        {Array.from({ length: COLUMNS - row.length }).map((_, index) => (
          <View key={`ph_${index}`} style={{ flex: 1, marginRight: index < COLUMNS - row.length - 1 ? CHIP_GAP : 0 }} />
        ))}
      </View>
    ))
  }

  return (
    <IOSBottomSheet visible={visible} onClose={handleClose} title={t('songlist_tags')}>
      <IOSSearchBar
        value={keyword}
        onChangeText={setKeyword}
        placeholder={t('songlist_tag_search')}
      />
      <ScrollView
        style={{ maxHeight: Math.min(420, winHeight * 0.46) }}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xs }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View onStartShouldSetResponder={() => true}>
          {
            groups.map((type, index) => (
              <View key={index} style={{ marginBottom: spacing.md }}>
                {
                  type.name
                    ? (
                        <IOSText
                          variant="caption1"
                          color={colors.secondaryLabel}
                          style={{ marginBottom: spacing.sm, paddingLeft: 1 }}
                        >{type.name}</IOSText>
                      )
                    : null
                }
                {renderRows(type.list)}
              </View>
            ))
          }
          {
            loading
              ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <IOSText variant="body" color={colors.secondaryLabel}>{t('list_loading')}</IOSText>
                  </View>
                )
              : list.length > 0 && !groups.length
                ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                      <IOSText variant="body" color={colors.secondaryLabel}>{t('songlist_tag_search_empty')}</IOSText>
                    </View>
                  )
                : null
          }
        </View>
      </ScrollView>
      <Pressable
        onPress={handleClose}
        style={({ pressed }) => ({
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.xs,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <IOSText variant="body" color={accent}>{t('cancel')}</IOSText>
      </Pressable>
    </IOSBottomSheet>
  )
}
