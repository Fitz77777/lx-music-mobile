import { memo } from 'react'
import { View } from 'react-native'

import IOSText from '@/components/ios/Text'
import StatusBar from '@/components/common/StatusBar'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'

/** iOS 评论页头部：居中标题（返回靠右滑手势） */
export default memo(({ musicInfo }: {
  musicInfo: LX.Music.MusicInfo
}) => {
  const t = useI18n()
  const { colors, spacing, hairline } = useIOSTheme()

  return (
    <View style={{ backgroundColor: colors.canvas }}>
      <StatusBar />
      <View style={{
        height: 44,
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        borderBottomWidth: hairline,
        borderBottomColor: colors.separator,
      }}>
        <IOSText variant="headline" align="center" numberOfLines={1}>
          {t('comment_title', { name: musicInfo.name, singer: musicInfo.singer })}
        </IOSText>
      </View>
    </View>
  )
})
