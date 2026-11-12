import { memo } from 'react'
import { Pressable, View } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import StatusBar from '@/components/common/StatusBar'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'
import { pop } from '@/navigation'
import commonState from '@/store/common/state'

/** iOS 评论页头部：返回 + 标题 */
export default memo(({ musicInfo }: {
  musicInfo: LX.Music.MusicInfo
}) => {
  const t = useI18n()
  const { colors, accent, spacing, hairline } = useIOSTheme()

  const back = () => {
    void pop(commonState.componentIds.comment!)
  }

  return (
    <View style={{ backgroundColor: colors.background }}>
      <StatusBar />
      <View style={{
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        borderBottomWidth: hairline,
        borderBottomColor: colors.separator,
      }}>
        <Pressable
          onPress={back}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('back')}
          style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}
        >
          <IOSIcon name="chevron-left" size={22} color={accent} />
          <IOSText variant="body" color={accent}>{t('back')}</IOSText>
        </Pressable>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', left: 72, right: 72, alignItems: 'center' }}
        >
          <IOSText variant="headline" numberOfLines={1}>
            {t('comment_title', { name: musicInfo.name, singer: musicInfo.singer })}
          </IOSText>
        </View>
      </View>
    </View>
  )
})
