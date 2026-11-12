import { memo, useRef, useState } from 'react'
import { Pressable, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native'
import { navigations } from '@/navigation'
import { usePlayerMusicInfo, useIsPlay, useProgress } from '@/store/player/hook'
import { useBufferProgress } from '@/plugins/player'
import { playNext, togglePlay } from '@/core/player/player'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'
import commonState from '@/store/common/state'
import playerState from '@/store/player/state'
import { LIST_IDS } from '@/config/constant'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from '@/components/ios/Text'
import IOSIcon from '@/components/ios/Icon'
import Image from '@/components/common/Image'
import { formatMusicName } from '@/utils/tools'
import { useSettingValue } from '@/store/setting/hook'
import { useKeyboard } from '@/utils/hooks'
import PlayQueueModal, { type PlayQueueModalType } from '@/components/player/PlayQueueModal'

const BTN_SIZE = 40
const PIC_SIZE = 40

/** iOS 底部播放条：56pt、半透明背景、细进度条 */
export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const { colors, accent, hairline, spacing, barHeight } = useIOSTheme()
  const musicInfo = usePlayerMusicInfo()
  const isPlay = useIsPlay()
  const { progress, maxPlayTime } = useProgress()
  const buffered = useBufferProgress()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const downloadFileName = useSettingValue('download.fileName')
  const { keyboardShown } = useKeyboard()
  const queueRef = useRef<PlayQueueModalType>(null)
  const [barWidth, setBarWidth] = useState(0)

  const title = musicInfo.id
    ? musicInfo.singer
      ? formatMusicName(downloadFileName, musicInfo.name, musicInfo.singer)
      : musicInfo.name
    : ''

  const openDetail = () => {
    if (!musicInfo.id) return
    navigations.pushPlayDetailScreen(commonState.componentIds.home!)
  }

  const handleLongPress = () => {
    if (!isHome) return
    const listId = playerState.playMusicInfo.listId
    if (!listId || listId == LIST_IDS.DOWNLOAD) return
    global.app_event.jumpListPosition()
  }

  const handleSeek = (e: GestureResponderEvent) => {
    if (!maxPlayTime || !barWidth) return
    const ratio = Math.min(Math.max(e.nativeEvent.locationX / barWidth, 0), 1)
    markTimeoutExitInteraction()
    global.app_event.setProgress(ratio * maxPlayTime)
  }

  const handleBarLayout = (e: LayoutChangeEvent) => {
    setBarWidth(e.nativeEvent.layout.width)
  }

  if (autoHidePlayBar && keyboardShown) return null

  return (
    <View style={{
      backgroundColor: colors.barBackground,
      borderTopWidth: hairline,
      borderTopColor: colors.separator,
    }}>
      <View style={{
        height: barHeight.playerBar,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.md,
        paddingRight: spacing.xs,
      }}>
        <Pressable
          onPress={openDetail}
          onLongPress={handleLongPress}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
        >
          <Image
            url={musicInfo.pic}
            style={{
              width: PIC_SIZE,
              height: PIC_SIZE,
              borderRadius: 6,
              backgroundColor: colors.tertiaryFill,
            }}
          />
          <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
            <IOSText variant="subheadline" weight="600" numberOfLines={1}>{title}</IOSText>
            <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1} style={{ marginTop: 1 }}>
              {musicInfo.singer ?? ''}
            </IOSText>
          </View>
        </Pressable>
        <Pressable
          onPress={() => { markTimeoutExitInteraction(); togglePlay() }}
          hitSlop={6}
          style={{ width: BTN_SIZE, height: BTN_SIZE, alignItems: 'center', justifyContent: 'center' }}
        >
          <IOSIcon name={isPlay ? 'pause' : 'play'} size={22} color={colors.label} />
        </Pressable>
        <Pressable
          onPress={() => { markTimeoutExitInteraction(); void playNext() }}
          hitSlop={6}
          style={{ width: BTN_SIZE, height: BTN_SIZE, alignItems: 'center', justifyContent: 'center' }}
        >
          <IOSIcon name="nextMusic" size={20} color={colors.label} />
        </Pressable>
        <Pressable
          onPress={() => { queueRef.current?.show() }}
          hitSlop={6}
          style={{ width: BTN_SIZE, height: BTN_SIZE, alignItems: 'center', justifyContent: 'center' }}
        >
          <IOSIcon name="list-order" size={20} color={colors.label} />
        </Pressable>
      </View>
      <Pressable
        onLayout={handleBarLayout}
        onPress={handleSeek}
        style={{ height: 12, justifyContent: 'center' }}
      >
        <View style={{ height: 2, backgroundColor: colors.quaternaryFill }}>
          <View style={{
            position: 'absolute',
            height: 2,
            width: `${Math.min(Math.max(buffered, 0), 1) * 100}%`,
            backgroundColor: colors.tertiaryFill,
          }} />
          <View style={{
            height: 2,
            width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
            backgroundColor: accent,
          }} />
        </View>
      </Pressable>
      <PlayQueueModal ref={queueRef} />
    </View>
  )
})
