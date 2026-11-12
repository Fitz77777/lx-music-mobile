import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useActiveListId, useListFetching } from '@/store/list/hook'
import listState from '@/store/list/state'
import { getListPrevSelectId } from '@/utils/data'
import { setActiveList } from '@/core/list'
import { LIST_IDS } from '@/config/constant'
import Loading from '@/components/common/Loading'
import { useSettingValue } from '@/store/setting/hook'

export interface ActiveListProps {
  onShowSearchBar: () => void
  onScrollToTop: () => void
}
export interface ActiveListType {
  setVisibleBar: (visible: boolean) => void
}

/** iOS 我的列表头部：当前列表名（点击打开列表面板），搜索按钮在导航栏上 */
export default forwardRef<ActiveListType, ActiveListProps>(({ onScrollToTop }, ref) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const currentListId = useActiveListId()
  const fetching = useListFetching(currentListId)
  const langId = useSettingValue('common.langId')
  const currentListName = useMemo(() => {
    switch (currentListId) {
      case LIST_IDS.TEMP:
        return global.i18n.t('list_name_temp')
      case LIST_IDS.DEFAULT:
        return global.i18n.t('list_name_default')
      case LIST_IDS.LOVE:
        return global.i18n.t('list_name_love')
      default:
        return listState.allList.find(l => l.id === currentListId)?.name ?? ''
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentListId, langId])
  const [visibleBar, setVisibleBar] = useState(true)

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
      height: 44,
      paddingLeft: spacing.lg,
      borderBottomWidth: hairline,
      borderBottomColor: colors.separator,
      backgroundColor: colors.background,
      opacity: visibleBar ? 1 : 0,
    }}>
      <Pressable
        onPress={showList}
        onLongPress={onScrollToTop}
        hitSlop={6}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
      >
        <IOSText variant="headline" numberOfLines={1} style={{ flexShrink: 1 }}>{currentListName}</IOSText>
        {fetching ? <Loading color={colors.secondaryLabel} style={{ marginLeft: spacing.sm }} /> : null}
        <IOSIcon
          name="chevron-right"
          size={11}
          color={colors.secondaryLabel}
          style={{ marginLeft: 4, transform: [{ rotate: '90deg' }] }}
        />
      </Pressable>
    </View>
  )
})
