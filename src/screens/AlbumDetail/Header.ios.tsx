import { memo } from 'react'
import { Pressable, View } from 'react-native'

import Image from '@/components/common/Image'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { dateFormat } from '@/utils/common'
import { navigations } from '@/navigation'

interface Props {
  albumInfo: {
    id?: string
    name: string
    author?: string
    picUrl?: string
    img?: string
    artists?: Array<{ id: string, name: string }>
    size?: number
    publishTime?: number
    source?: string
  }
  componentId: string
}

/** iOS 专辑详情头部：封面 + 专辑信息（返回靠右滑手势） */
export default memo(({ albumInfo, componentId }: Props) => {
  const { colors, accent, spacing } = useIOSTheme()
  const albumPic = albumInfo.picUrl ?? albumInfo.img
  const artists: Array<{ id: string, name: string }> = albumInfo.artists?.length
    ? albumInfo.artists
    : (albumInfo.author ? [{ id: '', name: albumInfo.author }] : [])

  const handleArtistPress = (artist: { id: string, name: string }) => {
    if (!artist.id) return
    // 带上 source，否则歌手页会回退到网易接口，kg/tx/kw 的歌手页会取不到数据
    navigations.pushArtistDetailScreen(componentId, {
      id: String(artist.id),
      name: artist.name,
      source: albumInfo.source,
    })
  }

  return (
    <View style={{ paddingBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg }}>
        <Image
          url={albumPic}
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            backgroundColor: colors.tertiaryFill,
          }}
        />
        <View style={{ flex: 1, marginLeft: spacing.lg, justifyContent: 'center' }}>
          <IOSText variant="headline" numberOfLines={2}>{albumInfo.name}</IOSText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.xs }}>
            {
              artists.map((artist, index) => (
                <Pressable key={artist.id || `${artist.name}_${index}`} onPress={() => { handleArtistPress(artist) }} hitSlop={4}>
                  <IOSText variant="subheadline" color={accent}>
                    {artist.name}{index < artists.length - 1 ? ' / ' : ''}
                  </IOSText>
                </Pressable>
              ))
            }
          </View>
          <IOSText variant="footnote" color={colors.secondaryLabel} style={{ marginTop: spacing.xs }}>
            {albumInfo.publishTime ? dateFormat(albumInfo.publishTime, 'Y.M.D') : ''}
            {albumInfo.size ? ` • ${global.i18n.t('album_song_count', { num: albumInfo.size })}` : ''}
          </IOSText>
        </View>
      </View>
    </View>
  )
})
