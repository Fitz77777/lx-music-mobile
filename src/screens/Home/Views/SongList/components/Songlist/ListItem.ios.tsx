import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { type ListInfoItem } from '@/store/songlist/state'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import Image from '@/components/common/Image'

/** iOS 歌单卡片：14pt 圆角封面 + 播放量角标 + 两行标题（原型 .grid2） */
export default memo(({ item, index, width, showSource, onPress }: {
  item: ListInfoItem
  index: number
  showSource: boolean
  width: number
  onPress: (item: ListInfoItem, index: number) => void
}) => {
  const { colors, spacing, radius } = useIOSTheme()

  if (!item.source) return <View style={{ width, marginBottom: spacing.xl }} />

  const handlePress = () => {
    onPress(item, index)
  }

  return (
    <View style={{ width, marginBottom: spacing.xl }}>
      <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
        <View style={{
          width,
          height: width,
          borderRadius: radius.card,
          overflow: 'hidden',
          backgroundColor: colors.tertiaryFill,
        }}>
          <Image
            url={item.img}
            nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_from_${item.id}`}
            style={{ width, height: width }}
          />
          {showSource
            ? (
                <View style={{
                  position: 'absolute',
                  top: 6,
                  left: 6,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: radius.cover,
                  backgroundColor: colors.imageOverlay,
                }}>
                  <IOSText variant="caption2" color={colors.onAccent}>{item.source}</IOSText>
                </View>
              )
            : null}
          {item.play_count
            ? (
                <View style={{
                  position: 'absolute',
                  right: 8,
                  bottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  borderRadius: 8,
                  backgroundColor: colors.imageOverlay,
                }}>
                  <IOSIcon name="play" size={9} color={colors.onAccent} style={{ marginRight: 3 }} />
                  <IOSText variant="caption2" weight="500" color={colors.onAccent} numberOfLines={1}>{item.play_count}</IOSText>
                </View>
              )
            : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
        <IOSText
          variant="subheadline"
          weight="500"
          numberOfLines={2}
          style={{ marginTop: spacing.sm, lineHeight: 19 }}
        >{item.name}</IOSText>
      </TouchableOpacity>
    </View>
  )
})
