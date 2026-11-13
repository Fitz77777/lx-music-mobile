import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useActiveListId, useListFetching } from '@/store/list/hook'
import listState from '@/store/list/state'
import { getListPrevSelectId } from '@/utils/data'
import { setActiveList } from '@/core/list'
import { LIST_IDS } from '@/config/constant'
import { useI18n } from '@/lang'
import Loading from '@/components/common/Loading'

export interface ActiveListProps {
  onShowSearchBar: () => void
  onScrollToTop: () => void
}
export interface ActiveListType {
  setVisibleBar: (visible: boolean) => void
}

/**
 * iOS 我的列表头部：内置列表 chips（试听 / 收藏 / 临时），
 * 当前列表是自建歌单时追加一个 chip；右侧按钮打开全部列表抽屉。
 * 长按当前 chip 回到列表顶部。
 */
export default forwardRef<ActiveListType, ActiveListProps>(({ onScrollToTop }, ref) => {
  const { colors, accent, spacing } = useIOSTheme()
  const currentListId = useActiveListId()
  const fetching = useListFetching(currentListId)
  const t = useI18n()
  const [visibleBar, setVisibleBar] = useState(true)

  const currentListName = useMemo(() => {
    switch (currentListId) {
      case LIST_IDS.TEMP:
        return t('list_name_temp')
      case LIST_IDS.DEFAULT:
        return t('list_name_default')
      case LIST_IDS.LOVE:
        return t('list_name_love')
      default:
        return listState.allList.find(l => l.id === currentListId)?.name ?? ''
    }
  }, [currentListId, t])

  const chips = useMemo(() => {
    const list = [
      { id: LIST_IDS.DEFAULT, name: t('list_name_default') },
      { id: LIST_IDS.LOVE, name: t('list_name_love') },
      { id: LIST_IDS.TEMP, name: t('list_name_temp') },
    ] as Array<{ id: string, name: string }>
    if (!list.some(item => item.id == currentListId) && currentListName) {
      list.push({ id: currentListId, name: currentListName })
    }
    return list
  }, [currentListId, currentListName, t])

  useImperativeHandle(ref, () => ({
    setVisibleBar(visible) {
      setVisibleBar(visible)
    },
  }))

  const showList = () => {
    global.app_event.changeLoveListVisible(true)
  }

  useEffect(() => {
    void getListPrevSelectId().then((id) => {
      setActiveList(id)
    })
  }, [])

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingBottom: 12,
      backgroundColor: colors.canvas,
      opacity: visibleBar ? 1 : 0,
    }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 1 }}
        contentContainerStyle={{ alignItems: 'center' }}
        keyboardShouldPersistTaps="always"
      >
        {
          chips.map(item => {
            const active = currentListId == item.id
            return (
              <Pressable
                key={item.id}
                onPress={() => { setActiveList(item.id) }}
                onLongPress={active ? onScrollToTop : undefined}
                style={({ pressed }) => ({
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  marginRight: spacing.sm,
                  borderRadius: 16,
                  backgroundColor: active ? accent : colors.secondaryGroupedBackground,
                  shadowColor: '#000000',
                  shadowOpacity: active ? 0 : 0.06,
                  shadowRadius: 3,
                  shadowOffset: { width: 0, height: 1 },
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <IOSText
                  size={14}
                  weight={active ? '600' : '400'}
                  color={active ? '#FFFFFF' : colors.label}
                  numberOfLines={1}
                  style={{ maxWidth: 150 }}
                >{item.name}</IOSText>
              </Pressable>
            )
          })
        }
        {fetching ? <Loading color={colors.secondaryLabel} style={{ marginRight: spacing.sm }} /> : null}
      </ScrollView>
      <View style={{ flex: 1 }} />
      <Pressable
        onPress={showList}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={t('nav_love')}
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.secondaryGroupedBackground,
          shadowColor: '#000000',
          shadowOpacity: 0.06,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 1 },
        }}
      >
        <IOSIcon name="list-order" size={18} color={accent} />
      </Pressable>
    </View>
  )
})
