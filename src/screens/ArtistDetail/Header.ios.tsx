import { memo, useState } from 'react'
import { Pressable, View } from 'react-native'

import ImageBackground from '@/components/common/ImageBackground'
import Image from '@/components/common/Image'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

interface Props {
  artist: any
  componentId: string
}

/** iOS 歌手详情头部：模糊背景 + 头像 + 简介（点击展开） */
export default memo(({ artist, componentId }: Props) => {
  const { colors, spacing, radius, withAlpha } = useIOSTheme()
  const [isDescExpanded, setDescExpanded] = useState(false)

  const artistName = artist?.name || ''
  const artistAlias = artist?.alias?.length ? artist.alias[0] : ''
  const description = artist?.briefDesc || artist?.desc || ''
  const artistPic = artist?.picUrl || artist?.img1v1Url || artist?.img

  return (
    <ImageBackground
      source={artistPic ? { uri: artistPic } : null}
      style={{ backgroundColor: colors.tertiaryFill }}
      blurRadius={24}
    >
      <View style={{ backgroundColor: colors.scrim, paddingBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg }}>
          <Image url={artistPic} style={{ width: 88, height: 88, borderRadius: radius.pill, backgroundColor: colors.tertiaryFill }} />
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <IOSText variant="title3" weight="700" color={colors.onAccent} numberOfLines={2} style={{ flexShrink: 1 }}>{artistName}</IOSText>
              {artistAlias
                ? <IOSText variant="footnote" color={withAlpha(colors.onAccent, 0.8)} numberOfLines={1} style={{ marginLeft: spacing.sm, flexShrink: 1 }}>{artistAlias}</IOSText>
                : null}
            </View>
            {artist.albumSize != null || artist.musicSize != null
              ? (
                  <IOSText variant="footnote" color={withAlpha(colors.onAccent, 0.8)} style={{ marginTop: 2 }}>
                    {`专辑 ${artist.albumSize ?? 0} • 单曲 ${artist.musicSize ?? 0}`}
                  </IOSText>
                )
              : null}
            {description
              ? (
                  <Pressable onPress={() => { setDescExpanded(!isDescExpanded) }} hitSlop={4}>
                    <IOSText
                      variant="footnote"
                      color={withAlpha(colors.onAccent, 0.75)}
                      numberOfLines={isDescExpanded ? undefined : 2}
                      style={{ marginTop: spacing.xs }}
                    >{description}</IOSText>
                  </Pressable>
                )
              : null}
          </View>
        </View>
      </View>
    </ImageBackground>
  )
})
