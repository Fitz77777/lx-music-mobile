import { memo, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Badge, { type BadgeType } from '@/components/common/Badge'
import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import type { RowInfo } from '@/utils/tools'

/** iOS 音乐行高（pt） */
export const ITEM_HEIGHT = 64
const PIC_SIZE = 44

const useQualityTag = (musicInfo: LX.Music.MusicInfoOnline) => {
  const t = useI18n()
  const info: { type: BadgeType | null, text: string } = { type: null, text: '' }
  if (musicInfo.meta._qualitys.flac24bit) {
    info.type = 'secondary'
    info.text = t('quality_lossless_24bit')
  } else if (musicInfo.meta._qualitys.flac ?? musicInfo.meta._qualitys.ape) {
    info.type = 'secondary'
    info.text = t('quality_lossless')
  } else if (musicInfo.meta._qualitys['320k']) {
    info.type = 'tertiary'
    info.text = t('quality_high_quality')
  }

  return info
}

/**
 * iOS 音乐列表行：封面 + 标题 + 歌手/专辑 + 时长 + 更多。
 * 与 Android 版共用 props 与 memo 比较逻辑。
 */
export default memo(({ item, index, showSource, onPress, onLongPress, onShowMenu, selectedList, rowInfo, isShowAlbumName, isShowInterval }: {
  item: LX.Music.MusicInfoOnline
  index: number
  showSource?: boolean
  onPress: (item: LX.Music.MusicInfoOnline, index: number) => void
  onLongPress: (item: LX.Music.MusicInfoOnline, index: number) => void
  onShowMenu: (item: LX.Music.MusicInfoOnline, index: number, position: { x: number, y: number, w: number, h: number }) => void
  selectedList: LX.Music.MusicInfoOnline[]
  rowInfo: RowInfo
  isShowAlbumName: boolean
  isShowInterval: boolean
}) => {
  const { colors, spacing } = useIOSTheme()

  const isSelected = selectedList.includes(item)

  const moreButtonRef = useRef<TouchableOpacity>(null)
  const handleShowMenu = () => {
    if (moreButtonRef.current?.measure) {
      moreButtonRef.current.measure((fx, fy, width, height, px, py) => {
        onShowMenu(item, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
      })
    }
  }
  const tagInfo = useQualityTag(item)

  const singer = `${item.singer}${isShowAlbumName && item.meta.albumName ? ` · ${item.meta.albumName}` : ''}`

  return (
    <View style={{
      width: rowInfo.rowWidth,
      height: ITEM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isSelected ? colors.secondaryFill : 'transparent',
    }}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg }}
        activeOpacity={0.5}
        onPress={() => { onPress(item, index) }}
        onLongPress={() => { onLongPress(item, index) }}
      >
        <Image
          url={item.meta.picUrl}
          style={{
            width: PIC_SIZE,
            height: PIC_SIZE,
            borderRadius: 6,
            backgroundColor: colors.tertiaryFill,
          }}
        />
        <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
          <IOSText variant="body" numberOfLines={1}>{item.name}</IOSText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            {tagInfo.type ? <Badge type={tagInfo.type}>{tagInfo.text}</Badge> : null}
            {showSource ? <Badge type="tertiary">{item.source}</Badge> : null}
            <IOSText
              variant="footnote"
              color={colors.secondaryLabel}
              numberOfLines={1}
              style={{ flexShrink: 1, marginLeft: tagInfo.type != null || showSource ? 4 : 0 }}
            >{singer}</IOSText>
          </View>
        </View>
        {
          isShowInterval
            ? <IOSText variant="footnote" color={colors.secondaryLabel} numberOfLines={1}>{item.interval}</IOSText>
            : null
        }
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleShowMenu}
        ref={moreButtonRef}
        hitSlop={6}
        style={{ width: 44, height: '100%', alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon name="dots-vertical" color={colors.secondaryLabel} rawSize={18} />
      </TouchableOpacity>
    </View>
  )
}, (prevProps, nextProps) => {
  return !!(prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.isShowAlbumName === nextProps.isShowAlbumName &&
    prevProps.isShowInterval === nextProps.isShowInterval &&
    nextProps.selectedList.includes(nextProps.item) == prevProps.selectedList.includes(prevProps.item)
  )
})
