import { Pressable, View } from 'react-native'
import { useI18n } from '@/lang'
import { useNavActiveId } from '@/store/common/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'

/**
 * iOS 导航栏：34pt 大标题与右侧操作同一行（原型 .nav）。
 * 不再保留 44pt 空操作栏，页面底色直接透出分组灰。
 */
export default () => {
  const t = useI18n()
  const id = useNavActiveId()
  const { colors, accent, spacing } = useIOSTheme()

  const showListSearch = () => {
    global.app_event.showMylistSearchBar()
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      paddingTop: 6,
      paddingHorizontal: spacing.xl,
      paddingBottom: 10,
      backgroundColor: colors.groupedBackground,
    }}>
      <IOSText variant="largeTitle" numberOfLines={1} style={{ flex: 1 }}>{t(id)}</IOSText>
      {id == 'nav_songlist' || id == 'nav_top'
        ? (
            <Pressable
              onPress={() => {
                if (id == 'nav_songlist') global.app_event.showSonglistOpenList()
                else global.app_event.showLeaderboardBoards()
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={id == 'nav_songlist' ? t('songlist_open') : t('leaderboard_all')}
              style={{ paddingVertical: 4, marginBottom: 4 }}
            >
              <IOSText size={15} weight="500" color={accent}>
                {id == 'nav_songlist' ? t('songlist_open') : t('leaderboard_all')}
              </IOSText>
            </Pressable>
          )
        : id == 'nav_love'
          ? (
              <Pressable
                onPress={showListSearch}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('nav_search')}
                style={{
                  width: 32,
                  height: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 2,
                }}
              >
                <IOSIcon name="search-2" size={20} color={accent} />
              </Pressable>
            )
          : null}
    </View>
  )
}
