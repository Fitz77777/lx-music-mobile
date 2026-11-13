import { memo, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { navigations } from '@/navigation'
import { usePlayerMusicInfo, useIsPlay } from '@/store/player/hook'
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

const BTN_SIZE = 32
const PIC_SIZE = 44
const CARD_HEIGHT = 60

/**
 * iOS 迷你播放器：浮动圆角卡片（原型 .mini-player）。
 * 左右 16pt、圆角 16、封面 44，右侧三个按钮（播放/暂停、下一首、播放列表）。
 */
export default memo(({ isHome = false }: { isHome?: boolean }) => {
  const { colors, spacing, hairline, isDark } = useIOSTheme()
  const musicInfo = usePlayerMusicInfo()
  const isPlay = useIsPlay()
  const autoHidePlayBar = useSettingValue('common.autoHidePlayBar')
  const downloadFileName = useSettingValue('download.fileName')
  const { keyboardShown } = useKeyboard()
  const queueRef = useRef<PlayQueueModalType>(null)

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

  if (autoHidePlayBar && keyboardShown) return null

  return (
    <View
      pointerEvents="box-none"
      style={{
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xs,
        paddingBottom: spacing.sm,
        backgroundColor: 'transparent',
      }}
    >
      <View style={{
        height: CARD_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: spacing.md,
        paddingRight: spacing.sm,
        borderRadius: 16,
        backgroundColor: colors.secondaryGroupedBackground,
        borderWidth: isDark ? hairline : 0,
        borderColor: colors.separator,
        shadowColor: '#000000',
        shadowOpacity: isDark ? 0 : 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
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
              borderRadius: 8,
              backgroundColor: colors.tertiaryFill,
            }}
          />
          <View style={{ flex: 1, marginLeft: spacing.md, justifyContent: 'center' }}>
            <IOSText variant="subheadline" weight="500" numberOfLines={1}>{title}</IOSText>
            <IOSText variant="footnote" color={colors.secondaryLabel} numberOfLines={1} style={{ marginTop: 2 }}>
              {musicInfo.singer ?? ''}
            </IOSText>
          </View>
        </Pressable>
        <Pressable
          onPress={() => { markTimeoutExitInteraction(); togglePlay() }}
          hitSlop={6}
          style={{ width: BTN_SIZE, height: BTN_SIZE, alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md }}
        >
          <IOSIcon name={isPlay ? 'pause' : 'play'} size={26} color={colors.label} />
        </Pressable>
        <Pressable
          onPress={() => { markTimeoutExitInteraction(); void playNext() }}
          hitSlop={6}
          style={{ width: BTN_SIZE, height: BTN_SIZE, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}
        >
          <IOSIcon name="nextMusic" size={24} color={colors.label} />
        </Pressable>
        <Pressable
          onPress={() => { queueRef.current?.show() }}
          hitSlop={6}
          style={{ width: BTN_SIZE, height: BTN_SIZE, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }}
        >
          <IOSIcon name="list-order" size={24} color={colors.label} />
        </Pressable>
      </View>
      <PlayQueueModal ref={queueRef} />
    </View>
  )
})
