import { Pressable, View } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'

const PREV_NEXT_ICON_SIZE = 32
const PLAY_ICON_SIZE = 54
const SIDE_BTN_SIZE = 48
const PLAY_BTN_SIZE = 64

const PrevBtn = () => {
  const { colors } = useIOSTheme()
  const handlePlayPrev = () => {
    markTimeoutExitInteraction()
    void playPrev()
  }
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: SIDE_BTN_SIZE,
        height: SIDE_BTN_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
      onPress={handlePlayPrev}
    >
      <IOSIcon name="prevMusic" size={PREV_NEXT_ICON_SIZE} color={colors.label} />
    </Pressable>
  )
}

const NextBtn = () => {
  const { colors } = useIOSTheme()
  const handlePlayNext = () => {
    markTimeoutExitInteraction()
    void playNext()
  }
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: SIDE_BTN_SIZE,
        height: SIDE_BTN_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
      onPress={handlePlayNext}
    >
      <IOSIcon name="nextMusic" size={PREV_NEXT_ICON_SIZE} color={colors.label} />
    </Pressable>
  )
}

const TogglePlayBtn = () => {
  const { colors } = useIOSTheme()
  const isPlay = useIsPlay()
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: PLAY_BTN_SIZE,
        height: PLAY_BTN_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
      onPress={() => {
        markTimeoutExitInteraction()
        togglePlay()
      }}
    >
      <IOSIcon name={isPlay ? 'pause' : 'play'} size={PLAY_ICON_SIZE} color={colors.label} />
    </Pressable>
  )
}

/** 播放控制（原型 .controls）：上一首 / 播放暂停 / 下一首 */
export default () => {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingTop: 20,
    }}>
      <PrevBtn />
      <TogglePlayBtn />
      <NextBtn />
    </View>
  )
}
