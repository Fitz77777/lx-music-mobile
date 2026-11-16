import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { FlatList, Pressable, View } from 'react-native'

import Image from '@/components/common/Image'
import IOSBottomSheet from '@/components/ios/BottomSheet'
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
  const t = useI18n()
  const { colors, accent, withAlpha } = useIOSTheme()

  return (
    <Pressable
      onPress={() => { onPress(index) }}
      style={({ pressed }) => ({
        height: ITEM_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        gap: 11,
        backgroundColor: active
          ? withAlpha(accent, 0.1)
          : pressed
            ? colors.tertiaryFill
            : 'transparent',
      })}
    >
      <IOSText variant="caption1" color={colors.tertiaryLabel} style={{ width: 15, textAlign: 'center' }}>
        {index + 1}
      </IOSText>
      <Image
        url={item.meta.picUrl}
        style={{
          width: 38,
          height: 38,
          borderRadius: 8,
          backgroundColor: colors.tertiaryFill,
        }}
      />
      <View style={{ flex: 1, minWidth: 0 }}>
        <IOSText
          variant="subheadline"
          weight="500"
          color={colors.label}
          numberOfLines={1}
        >{item.name}</IOSText>
        <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1} style={{ marginTop: 2 }}>
          {item.singer}
        </IOSText>
      </View>
      {active
        ? <IOSText variant="caption1" color={accent}>{t('playing')}</IOSText>
        : null}
    </Pressable>
  )
}, (prev, next) => {
  return prev.item === next.item && prev.index === next.index && prev.active === next.active
})

const Separator = () => {
  const { colors, hairline } = useIOSTheme()
  return <View style={{ height: hairline, backgroundColor: colors.rowSeparator }} />
}

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
      title={t('play_queue_title')}
      description={t('play_queue_count', { num: list.length })}
    >
      <FlatList
        style={{ maxHeight: 322, flexGrow: 0, marginBottom: spacing.lg }}
        contentContainerStyle={{
          borderRadius: 12,
          overflow: 'hidden',
          backgroundColor: colors.secondaryGroupedBackground,
        }}
        data={list}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        ItemSeparatorComponent={Separator}
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
        <IOSText color={accent}>{t('close')}</IOSText>
      </Pressable>
    </IOSBottomSheet>
  )
})
