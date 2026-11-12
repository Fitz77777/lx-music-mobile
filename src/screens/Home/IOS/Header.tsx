import { View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId } from '@/store/common/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { IOSIconButton } from '@/components/ios'
import IOSText from '@/components/ios/Text'
import SearchTypeSelector from '@/screens/Home/Views/Search/SearchTypeSelector'
import { setNavActiveId } from '@/core/common'

/** iOS 大标题头部：左侧大标题，右侧设置入口；搜索页附带范围分段控件 */
export default () => {
  const t = useI18n()
  const id = useNavActiveId()
  const { colors, spacing } = useIOSTheme()

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
      }}>
        <IOSText variant="largeTitle" numberOfLines={1} style={{ flex: 1 }}>{t(id)}</IOSText>
        {id != 'nav_setting'
          ? (
              <IOSIconButton
                name="setting"
                size={22}
                color={colors.secondaryLabel}
                accessibilityLabel={t('nav_setting')}
                onPress={() => { setNavActiveId('nav_setting') }}
              />
            )
          : null}
      </View>
      {id == 'nav_search' ? <SearchTypeSelector /> : null}
    </View>
  )
}
