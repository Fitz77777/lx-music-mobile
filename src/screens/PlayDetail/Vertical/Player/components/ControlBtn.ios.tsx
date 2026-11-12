import { useMemo } from 'react'
import { Pressable, View, type ViewStyle } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { useWindowSize } from '@/utils/hooks'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'
import { BTN_WIDTH } from './MoreBtn/Btn'

const PrevBtn = ({ size }: { size: number }) => {
  const { colors } = useIOSTheme()
  const handlePlayPrev = () => {
    markTimeoutExitInteraction()
    void playPrev()
  }
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={handlePlayPrev}
    >
      <IOSIcon name="prevMusic" size={size * 0.62} color={colors.label} />
    </Pressable>
  )
}

const NextBtn = ({ size }: { size: number }) => {
  const { colors } = useIOSTheme()
  const handlePlayNext = () => {
    markTimeoutExitInteraction()
    void playNext()
  }
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={handlePlayNext}
    >
      <IOSIcon name="nextMusic" size={size * 0.62} color={colors.label} />
    </Pressable>
  )
}

const TogglePlayBtn = ({ size }: { size: number }) => {
  const { colors } = useIOSTheme()
  const isPlay = useIsPlay()
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.5 : 1,
      })}
      onPress={() => {
        markTimeoutExitInteraction()
        togglePlay()
      }}
    >
      <IOSIcon name={isPlay ? 'pause' : 'play'} size={size * 0.62} color={colors.label} />
    </Pressable>
  )
}

const MAX_SIZE = BTN_WIDTH * 1.6
const MIN_SIZE = BTN_WIDTH * 1.2

/** iOS 播放控制：上一首 / 播放暂停 / 下一首 */
export default () => {
  const winSize = useWindowSize()
  const maxHeight = Math.max(winSize.height * 0.11, MIN_SIZE)
  const containerStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: '4%',
    paddingVertical: 18,
    maxHeight,
  }), [maxHeight])
  const size = Math.min(Math.max(winSize.width * 0.33 * global.lx.fontSize * 0.4, MIN_SIZE), MAX_SIZE, maxHeight)

  return (
    <View style={containerStyle}>
      <PrevBtn size={size} />
      <TogglePlayBtn size={size} />
      <NextBtn size={size} />
    </View>
  )
}
