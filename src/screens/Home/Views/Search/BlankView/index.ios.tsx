import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useSettingValue } from '@/store/setting/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { iosHomeBottomInset } from '@/theme/ios/tokens'
import { useI18n } from '@/lang'
import IOSText from '@/components/ios/Text'
import HistorySearch, { type HistorySearchType } from './HistorySearch'
import HotSearch, { type HotSearchType } from './HotSearch'

interface BlankViewProps {
  onSearch: (keyword: string) => void
}
type Source = LX.OnlineSource | 'all'

export interface BlankViewType {
  show: (source: Source) => void
}

/** iOS 搜索空状态：热门搜索与历史搜索 */
export default forwardRef<BlankViewType, BlankViewProps>(({ onSearch }, ref) => {
  const [visible, setVisible] = useState(false)
  const hotSearchRef = useRef<HotSearchType>(null)
  const historySearchRef = useRef<HistorySearchType>(null)
  const isShowHotSearch = useSettingValue('search.isShowHotSearch')
  const isShowHistorySearch = useSettingValue('search.isShowHistorySearch')
  const { colors, spacing } = useIOSTheme()
  const t = useI18n()

  const handleShow = (source: Source) => {
    hotSearchRef.current?.show(source)
    historySearchRef.current?.show()
  }

  useImperativeHandle(ref, () => ({
    show(source) {
      if (visible) handleShow(source)
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          handleShow(source)
        })
      }
    },
  }), [visible])

  if (!visible) return null

  if (!isShowHotSearch && !isShowHistorySearch) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <IOSText variant="title2" color={colors.secondaryLabel}>{t('search__welcome')}</IOSText>
      </View>
    )
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="always"
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl + iosHomeBottomInset,
      }}
    >
      {isShowHotSearch ? <HotSearch ref={hotSearchRef} onSearch={onSearch} /> : null}
      {isShowHistorySearch ? <HistorySearch ref={historySearchRef} onSearch={onSearch} /> : null}
    </ScrollView>
  )
})
