import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'

import Image from '@/components/common/Image'
import IOSBottomSheet from '@/components/ios/BottomSheet'
import IOSBadge from '@/components/ios/Badge'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { usePlayInfo } from '@/store/player/hook'
import { playList } from '@/core/player/player'
import { getList } from '@/core/player/playInfo'

const ITEM_HEIGHT = 56

const ListItem = memo(({ item, index, active, onPress }: {
  item: LX.Music.MusicInfo
  index: number
  active: boolean
  onPress: (index: number) => void
}) => {
  const { colors, accent, withAlpha } = useIOSTheme()

  return (
    <Pressable
      onPress={() => { onPress(index) }}
      style={({ pressed }) => ({
        height: ITEM_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        backgroundColor: active
          ? withAlpha(accent, 0.1)
          : pressed
            ? colors.tertiaryFill
            : 'transparent',
      })}
    >
      <View style={{ width: 20, alignItems: 'center' }}>
        {active
          ? <IOSIcon name="play-outline" size={13} color={accent} />
          : <IOSText size={12} color={colors.tertiaryLabel}>{index + 1}</IOSText>}
      </View>
      <Image
        url={item.meta.picUrl}
        style={{
          width: 40,
          height: 40,
          marginLeft: 8,
          borderRadius: 8,
          backgroundColor: colors.tertiaryFill,
        }}
      />
      <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
        <IOSText
          size={15}
          weight={active ? '600' : '400'}
          color={active ? accent : colors.label}
          numberOfLines={1}
        >{item.name}</IOSText>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 6 }}>
          <IOSBadge variant="source">{item.source.toUpperCase()}</IOSBadge>
          <IOSText size={12} color={colors.secondaryLabel} numberOfLines={1} style={{ flexShrink: 1 }}>
            {item.singer}
          </IOSText>
        </View>
      </View>
      {item.interval
        ? <IOSText size={12} color={colors.secondaryLabel}>{item.interval}</IOSText>
        : null}
    </Pressable>
  )
}, (prev, next) => {
  return prev.item === next.item && prev.index === next.index && prev.active === next.active
})

export interface PlayQueueModalType {
  show: () => void
}

/** iOS 播放队列：底部面板（原型 #queueSheet），点击歌曲直接切歌 */
export default forwardRef<PlayQueueModalType, {}>((props, ref) => {
  const t = useI18n()
  const { colors, accent, spacing } = useIOSTheme()
  const [visible, setVisible] = useState(false)
  const playInfo = usePlayInfo()

  const listId = playInfo.playerListId
  const activeIndex = playInfo.playerPlayIndex

  const list = useMemo(() => {
    if (!listId) return []
    return getList(listId) as LX.Music.MusicInfo[]
  // 打开面板时刷新一次列表
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId, visible])

  useImperativeHandle(ref, () => ({
    show() {
      setVisible(true)
    },
  }))

  const handlePress = useCallback((index: number) => {
    if (!listId || index === activeIndex) return
    void playList(listId, index)
  }, [activeIndex, listId])

  const renderItem = useCallback(({ item, index }: { item: LX.Music.MusicInfo, index: number }) => (
    <ListItem item={item} index={index} active={index === activeIndex} onPress={handlePress} />
  ), [activeIndex, handlePress])

  const getItemLayout = useCallback((data: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), [])

  const keyExtractor = useCallback((item: LX.Music.MusicInfo) => item.id, [])

  return (
    <IOSBottomSheet
      visible={visible}
      onClose={() => { setVisible(false) }}
      title={`${t('play_queue_title')} (${list.length})`}
    >
      <FlatList
        style={{ maxHeight: 380, flexGrow: 0 }}
        contentContainerStyle={{
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.groupedBackground,
        }}
        data={list}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialScrollIndex={Math.max(0, activeIndex - 2)}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
      <Pressable
        onPress={() => { setVisible(false) }}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.xs,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <IOSText size={17} color={accent}>{t('close')}</IOSText>
      </Pressable>
    </IOSBottomSheet>
  )
})
