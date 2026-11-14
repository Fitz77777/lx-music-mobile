import { memo, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import IOSBadge from '@/components/ios/Badge'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import type { RowInfo } from '@/utils/tools'

/** iOS 歌曲行高（pt，原型 68pt），封面缩小为 44pt 并垂直居中 */
export const ITEM_HEIGHT = 68
const PIC_SIZE = 44
const ROW_PADDING = 14
/** 分隔线内缩到文字起点：左内边距 + 封面 + 间距 */
const SEPARATOR_INSET = ROW_PADDING + PIC_SIZE + 12

const useQualityTag = (musicInfo: LX.Music.MusicInfoOnline) => {
  const t = useI18n()
  const info: { variant: 'sq' | 'hq' | 'bit' | null, text: string } = { variant: null, text: '' }
  if (musicInfo.meta._qualitys.flac24bit) {
    info.variant = 'bit'
    info.text = t('quality_lossless_24bit')
  } else if (musicInfo.meta._qualitys.flac ?? musicInfo.meta._qualitys.ape) {
    info.variant = 'sq'
    info.text = t('quality_lossless')
  } else if (musicInfo.meta._qualitys['320k']) {
    info.variant = 'hq'
    info.text = t('quality_high_quality')
  }
  return info
}

/**
 * iOS 在线歌曲行：封面 56 + 标题 + 音质徽标/音源/歌手 + 时长 + 更多。
 * 与 Android 版共用 props 与 memo 比较逻辑。
 */
export default memo(({ item, index, activeIndex, onPress, onShowMenu, onLongPress, selectedList, rowInfo, isShowAlbumName, isShowInterval, showSource, isLast = false }: {
  item: LX.Music.MusicInfoOnline
  index: number
  activeIndex: number
  showSource?: boolean
  onPress: (item: LX.Music.MusicInfoOnline, index: number) => void
  onLongPress: (item: LX.Music.MusicInfoOnline, index: number) => void
  onShowMenu: (item: LX.Music.MusicInfoOnline, index: number, position: { x: number, y: number, w: number, h: number }) => void
  selectedList: LX.Music.MusicInfoOnline[]
  rowInfo: RowInfo
  isShowAlbumName: boolean
  isShowInterval: boolean
  isLast?: boolean
}) => {
  const { colors, accent, spacing, hairline, withAlpha, radius } = useIOSTheme()

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
      backgroundColor: isSelected ? withAlpha(accent, 0.12) : 'transparent',
    }}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: ROW_PADDING }}
        activeOpacity={0.6}
        onPress={() => { onPress(item, index) }}
        onLongPress={() => { onLongPress(item, index) }}
      >
        <Image
          url={item.meta.picUrl}
          style={{
            width: PIC_SIZE,
            height: PIC_SIZE,
            borderRadius: 8,
            backgroundColor: colors.tertiaryFill,
          }}
        />
        <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
          <IOSText weight="500" numberOfLines={1}>{item.name}</IOSText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
            {tagInfo.variant ? <IOSBadge variant={tagInfo.variant}>{tagInfo.text}</IOSBadge> : null}
            {showSource ? <IOSBadge variant="source">{item.source}</IOSBadge> : null}
            <IOSText
              variant="footnote"
              color={colors.secondaryLabel}
              numberOfLines={1}
              style={{ flexShrink: 1 }}
            >{singer}</IOSText>
          </View>
        </View>
        {
          isShowInterval
            ? <IOSText variant="subheadline" color={colors.secondaryLabel} numberOfLines={1}>{item.interval}</IOSText>
            : null
        }
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleShowMenu}
        ref={moreButtonRef}
        hitSlop={6}
        style={{
          width: 32,
          height: 32,
          borderRadius: radius.pill,
          marginHorizontal: 6,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="dots-vertical" color={colors.secondaryLabel} rawSize={18} />
      </TouchableOpacity>
      {!isLast
        ? (
            <View style={{
              position: 'absolute',
              left: SEPARATOR_INSET,
              right: 0,
              bottom: 0,
              height: hairline,
              backgroundColor: colors.rowSeparator,
            }} />
          )
        : null}
    </View>
  )
}, (prevProps, nextProps) => {
  return !!(prevProps.item === nextProps.item &&
    prevProps.index === nextProps.index &&
    prevProps.isShowAlbumName === nextProps.isShowAlbumName &&
    prevProps.isShowInterval === nextProps.isShowInterval &&
    prevProps.isLast === nextProps.isLast &&
    nextProps.selectedList.includes(nextProps.item) == prevProps.selectedList.includes(prevProps.item)
  )
})
