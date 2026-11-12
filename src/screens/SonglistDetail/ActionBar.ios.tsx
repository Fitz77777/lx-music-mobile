import { memo } from 'react'
import { View } from 'react-native'

import IOSButton from '@/components/ios/Button'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'
import { handleCollect, handlePlay } from './listAction'
import songlistState from '@/store/songlist/state'
import { useListInfo } from './state'

/** iOS 歌单详情操作区：收藏 + 播放全部 */
export default memo(() => {
  const t = useI18n()
  const info = useListInfo()
  const { spacing } = useIOSTheme()

  const handlePlayAll = () => {
    if (!songlistState.listDetailInfo.info.name) return
    void handlePlay(info.id, info.source, songlistState.listDetailInfo.list)
  }

  const handleCollection = () => {
    if (!songlistState.listDetailInfo.info.name) return
    void handleCollect(info.id, info.source, songlistState.listDetailInfo.info.name || info.name)
  }

  return (
    <View style={{
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.lg,
      gap: spacing.md,
    }}>
      <IOSButton title={t('collect_songlist')} variant="tinted" onPress={handleCollection} style={{ flex: 1 }} />
      <IOSButton title={t('play_all')} variant="filled" onPress={handlePlayAll} style={{ flex: 1 }} />
    </View>
  )
})
