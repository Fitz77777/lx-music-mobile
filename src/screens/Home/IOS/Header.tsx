import { Pressable, View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId } from '@/store/common/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'

/** iOS 导航栏：44pt 操作栏 + 大标题，底部细线分隔 */
export default () => {
  const t = useI18n()
  const id = useNavActiveId()
  const { colors, accent, spacing, hairline, barHeight } = useIOSTheme()

  // 搜索页自带「搜索框 + 范围」头部，这里不再叠加标题栏
  if (id == 'nav_search') return null

  const showListSearch = () => {
    global.app_event.showMylistSearchBar()
  }

  return (
    <View style={{
      backgroundColor: colors.barBackground,
      borderBottomWidth: hairline,
      borderBottomColor: colors.separator,
    }}>
      <View style={{
        height: barHeight.navBar,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingHorizontal: spacing.sm,
      }}>
        {id == 'nav_love'
          ? (
              <Pressable
                onPress={showListSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('nav_search')}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <IOSIcon name="search-2" size={20} color={accent} />
              </Pressable>
            )
          : null}
      </View>
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.sm }}>
        <IOSText variant="largeTitle" numberOfLines={1}>{t(id)}</IOSText>
      </View>
    </View>
  )
}
