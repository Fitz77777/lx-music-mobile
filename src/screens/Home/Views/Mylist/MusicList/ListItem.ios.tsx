import { memo, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Badge from '@/components/common/Badge'
import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import IOSText from '@/components/ios/Text'
import { useAssertApiSupport } from '@/store/common/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import type { RowInfo } from '@/utils/tools'

/** iOS 音乐行高（pt） */
export const ITEM_HEIGHT = 64
const PIC_SIZE = 44

/**
 * iOS「我的列表」歌曲行：序号/播放标记 + 封面 + 标题 + 音源/歌手 + 时长 + 更多。
 * 与 Android 版共用 props 与 memo 比较逻辑。
 */
export default memo(({ item, index, activeIndex, onPress, onShowMenu, onLongPress, selectedList, rowInfo, isShowAlbumName, isShowInterval }: {
  item: LX.Music.MusicInfo
  index: number
  activeIndex: number
  onPress: (item: LX.Music.MusicInfo, index: number) => void
  onLongPress: (item: LX.Music.MusicInfo, index: number) => void
  onShowMenu: (item: LX.Music.MusicInfo, index: number, position: { x: number, y: number, w: number, h: number }) => void
  selectedList: LX.Music.MusicInfo[]
  rowInfo: RowInfo
  isShowAlbumName: boolean
  isShowInterval: boolean
}) => {
  const { colors, accent, spacing } = useIOSTheme()

  const isSelected = selectedList.includes(item)
  const isSupported = useAssertApiSupport(item.source)
  const moreButtonRef = useRef<TouchableOpacity>(null)
  const handleShowMenu = () => {
    if (moreButtonRef.current?.measure) {
      moreButtonRef.current.measure((fx, fy, width, height, px, py) => {
        onShowMenu(item, index, { x: Math.ceil(px), y: Math.ceil(py), w: Math.ceil(width), h: Math.ceil(height) })
      })
    }
  }
  const active = activeIndex == index

  const singer = `${item.singer}${isShowAlbumName && item.meta.albumName ? ` · ${item.meta.albumName}` : ''}`

  return (
    <View style={{
      width: rowInfo.rowWidth,
      height: ITEM_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isSelected ? colors.secondaryFill : 'transparent',
      opacity: isSupported ? 1 : 0.5,
    }}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: spacing.lg }}
        activeOpacity={0.5}
        onPress={() => { onPress(item, index) }}
        onLongPress={() => { onLongPress(item, index) }}
      >
        <View style={{ width: 22, alignItems: 'center' }}>
          {
            active
              ? <Icon name="play-outline" size={14} color={accent} />
              : <IOSText variant="footnote" color={colors.secondaryLabel}>{index + 1}</IOSText>
          }
        </View>
        <Image
          url={item.meta.picUrl}
          style={{
            width: PIC_SIZE,
            height: PIC_SIZE,
            borderRadius: 6,
            marginLeft: spacing.sm,
            backgroundColor: colors.tertiaryFill,
          }}
        />
        <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
          <IOSText
            variant="body"
            color={active ? accent : colors.label}
            numberOfLines={1}
          >{item.name}</IOSText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
            <Badge>{item.source.toUpperCase()}</Badge>
            <IOSText
              variant="footnote"
              color={colors.secondaryLabel}
              numberOfLines={1}
              style={{ flexShrink: 1, marginLeft: 4 }}
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
    prevProps.activeIndex != nextProps.index &&
    nextProps.activeIndex != nextProps.index &&
    nextProps.selectedList.includes(nextProps.item) == prevProps.selectedList.includes(prevProps.item)
  )
})
