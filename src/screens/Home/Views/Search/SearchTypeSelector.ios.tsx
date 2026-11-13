import { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSSegmentedControl from '@/components/ios/SegmentedControl'
import { type SearchType } from '@/store/search/state'
import { getSearchSetting } from '@/utils/data'

const SEARCH_TYPE_LIST = [
  'music',
  'songlist',
  'artist',
  'album',
] as const

/** iOS 搜索范围：系统分段控件（搜索框有内容时才显示） */
export default ({ visible = true }: { visible?: boolean }) => {
  const t = useI18n()
  const { spacing } = useIOSTheme()
  const [type, setType] = useState<SearchType>('music')

  useEffect(() => {
    void getSearchSetting().then(info => {
      setType(info.type)
    })
  }, [])

  const values = useMemo(() => {
    return SEARCH_TYPE_LIST.map(type => t(`search_type_${type}`))
  }, [t])

  const handleChange = (index: number) => {
    const next = SEARCH_TYPE_LIST[index]
    if (next == type) return
    setType(next)
    global.app_event.searchTypeChanged(next)
  }

  if (!visible) return null

  return (
    <View style={{ paddingHorizontal: spacing.xl, paddingBottom: 12 }}>
      <IOSSegmentedControl
        values={values}
        selectedIndex={SEARCH_TYPE_LIST.indexOf(type)}
        onChange={handleChange}
      />
    </View>
  )
}
