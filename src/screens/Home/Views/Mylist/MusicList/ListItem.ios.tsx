import { memo, useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { Icon } from '@/components/common/Icon'
import Image from '@/components/common/Image'
import IOSBadge from '@/components/ios/Badge'
import IOSText from '@/components/ios/Text'
import { useAssertApiSupport } from '@/store/common/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import type { RowInfo } from '@/utils/tools'

/** iOS 音乐行高（pt，原型 68pt / 封面 56pt） */
export const ITEM_HEIGHT = 68
const PIC_SIZE = 56
const ROW_PADDING = 14
const TEXT_GAP = 12
/** 分隔线内缩到文字起点 */
const SEPARATOR_INSET = ROW_PADDING + PIC_SIZE + TEXT_GAP

/**
 * iOS「我的列表」歌曲行：封面 + 标题 + 音源/歌手 + 时长 + 更多。
 * 与 Android 版共用 props 与 memo 比较逻辑。
 */
export default memo(({ item, index, activeIndex, onPress, onShowMenu, onLongPress, selectedList, rowInfo, isShowAlbumName, isShowInterval, isLast = false, onToggleSource }: {
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
  isLast?: boolean
  /** 点击音源标签换源 */
  onToggleSource?: (item: LX.Music.MusicInfo) => void
}) => {
  const { colors, accent, hairline, withAlpha, radius } = useIOSTheme()
  const isSupported = useAssertApiSupport(item.source)

  const isSelected = selectedList.includes(item)

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
      backgroundColor: isSelected ? withAlpha(accent, 0.12) : 'transparent',
      opacity: isSupported ? 1 : 0.5,
    }}>
      <TouchableOpacity
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingLeft: ROW_PADDING }}
        activeOpacity={0.5}
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
        <View style={{ flex: 1, marginLeft: TEXT_GAP, justifyContent: 'center' }}>
          <IOSText
            weight="500"
            color={active ? accent : colors.label}
            numberOfLines={1}
          >{item.name}</IOSText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
            <TouchableOpacity
              disabled={!onToggleSource}
              onPress={() => { onToggleSource?.(item) }}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              accessibilityRole="button"
            >
              <IOSBadge variant="source">{item.source.toUpperCase()}</IOSBadge>
            </TouchableOpacity>
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
        <Icon name="dots-vertical" color={colors.secondaryLabel} rawSize={20} />
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
    prevProps.activeIndex != nextProps.index &&
    nextProps.activeIndex != nextProps.index &&
    nextProps.selectedList.includes(nextProps.item) == prevProps.selectedList.includes(prevProps.item)
  )
})
