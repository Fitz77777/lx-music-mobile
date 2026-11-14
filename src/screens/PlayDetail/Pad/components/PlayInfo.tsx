import { memo } from 'react'
import { View } from 'react-native'

import Progress from '@/components/ios/ProgressBar'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useProgress, useStatusText } from '@/store/player/hook'
import { useBufferProgress } from '@/plugins/player'

const PlayTimeCurrent = ({ timeStr }: { timeStr: string }) => {
  const { colors } = useIOSTheme()
  return <IOSText variant="caption2" color={colors.secondaryLabel}>{timeStr}</IOSText>
}

const PlayTimeMax = memo(({ timeStr }: { timeStr: string }) => {
  const { colors } = useIOSTheme()
  return <IOSText variant="caption2" color={colors.secondaryLabel}>{timeStr}</IOSText>
})

/** 播放状态文字 */
export const Status = () => {
  const statusText = useStatusText()
  const { colors } = useIOSTheme()

  return (
    <IOSText
      variant="caption1"
      color={colors.secondaryLabel}
      numberOfLines={1}
      align="center"
    >{statusText}</IOSText>
  )
}

/** 播放进度（原型 .progress / .times）：左右 30pt，时间标签 11pt */
export default () => {
  const { maxPlayTimeStr, nowPlayTimeStr, progress, maxPlayTime } = useProgress()
  const buffered = useBufferProgress()
  const { spacing } = useIOSTheme()

  return (
    <View style={{ paddingHorizontal: 30 }}>
      <Progress progress={progress} duration={maxPlayTime} buffered={buffered} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <PlayTimeCurrent timeStr={nowPlayTimeStr} />
        <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: spacing.sm }}>
          <Status />
        </View>
        <PlayTimeMax timeStr={maxPlayTimeStr} />
      </View>
    </View>
  )
}
