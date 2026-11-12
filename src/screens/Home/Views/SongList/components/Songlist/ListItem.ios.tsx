import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { type ListInfoItem } from '@/store/songlist/state'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import Image from '@/components/common/Image'

const GAP = 12

/** iOS 歌单卡片：圆角封面 + 两行标题 */
export default memo(({ item, index, width, showSource, onPress }: {
  item: ListInfoItem
  index: number
  showSource: boolean
  width: number
  onPress: (item: ListInfoItem, index: number) => void
}) => {
  const { colors, spacing } = useIOSTheme()
  const itemWidth = width - GAP

  if (!item.source) return <View style={{ width: itemWidth, margin: GAP / 2 }} />

  const handlePress = () => {
    onPress(item, index)
  }

  return (
    <View style={{ width: itemWidth, margin: GAP / 2 }}>
      <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
        <View style={{
          width: itemWidth,
          height: itemWidth,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: colors.tertiaryFill,
        }}>
          <Image
            url={item.img}
            nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_from_${item.id}`}
            style={{ width: itemWidth, height: itemWidth }}
          />
          {showSource
            ? (
                <View style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  paddingHorizontal: 5,
                  paddingVertical: 1,
                  borderBottomLeftRadius: 6,
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                }}>
                  <IOSText variant="caption2" color="#FFFFFF">{item.source}</IOSText>
                </View>
              )
            : null}
        </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.6} onPress={handlePress}>
        <IOSText
          variant="subheadline"
          numberOfLines={2}
          style={{ marginTop: spacing.xs + 2, marginBottom: spacing.xs }}
        >{item.name}</IOSText>
      </TouchableOpacity>
    </View>
  )
})
