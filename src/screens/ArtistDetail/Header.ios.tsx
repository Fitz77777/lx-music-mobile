import { memo, useState } from 'react'
import { Pressable, View } from 'react-native'

import ImageBackground from '@/components/common/ImageBackground'
import Image from '@/components/common/Image'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { pop } from '@/navigation'

interface Props {
  artist: any
  componentId: string
}

/** iOS 歌手详情头部：模糊背景 + 头像 + 简介（点击展开） */
export default memo(({ artist, componentId }: Props) => {
  const { colors, accent, spacing } = useIOSTheme()
  const [isDescExpanded, setDescExpanded] = useState(false)

  const artistName = artist?.name || ''
  const artistAlias = artist?.alias?.length ? artist.alias[0] : ''
  const description = artist?.briefDesc || artist?.desc || ''
  const artistPic = artist?.picUrl || artist?.img1v1Url || artist?.img

  const back = () => {
    void pop(componentId)
  }

  return (
    <ImageBackground
      source={artistPic ? { uri: artistPic } : null}
      style={{ backgroundColor: colors.tertiaryFill }}
      blurRadius={24}
    >
      <View style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)', paddingBottom: spacing.lg }}>
        <View style={{
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: spacing.md,
        }}>
          <Pressable
            onPress={back}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={global.i18n.t('back')}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <IOSIcon name="chevron-left" size={22} color={accent} />
            <IOSText variant="body" color={accent}>{global.i18n.t('back')}</IOSText>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg }}>
          <Image url={artistPic} style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.tertiaryFill }} />
          <View style={{ flex: 1, marginLeft: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
              <IOSText variant="title3" weight="700" color="#FFFFFF" numberOfLines={2} style={{ flexShrink: 1 }}>{artistName}</IOSText>
              {artistAlias
                ? <IOSText variant="footnote" color="rgba(255,255,255,0.8)" numberOfLines={1} style={{ marginLeft: spacing.sm, flexShrink: 1 }}>{artistAlias}</IOSText>
                : null}
            </View>
            {artist.albumSize != null || artist.musicSize != null
              ? (
                  <IOSText variant="footnote" color="rgba(255,255,255,0.8)" style={{ marginTop: 2 }}>
                    {`专辑 ${artist.albumSize ?? 0} • 单曲 ${artist.musicSize ?? 0}`}
                  </IOSText>
                )
              : null}
            {description
              ? (
                  <Pressable onPress={() => { setDescExpanded(!isDescExpanded) }} hitSlop={4}>
                    <IOSText
                      variant="footnote"
                      color="rgba(255,255,255,0.75)"
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
