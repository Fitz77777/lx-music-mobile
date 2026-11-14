import { memo } from 'react'
import { View } from 'react-native'

import Progress from '@/components/player/ProgressBar'
import Status from './Status'
import IOSText from '@/components/ios/Text'
import { useProgress } from '@/store/player/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useBufferProgress } from '@/plugins/player'

const PlayTimeCurrent = ({ timeStr }: { timeStr: string }) => {
  const { colors } = useIOSTheme()
  return <IOSText variant="caption2" color={colors.secondaryLabel}>{timeStr}</IOSText>
}

const PlayTimeMax = memo(({ timeStr }: { timeStr: string }) => {
  const { colors } = useIOSTheme()
  return <IOSText variant="caption2" color={colors.secondaryLabel}>{timeStr}</IOSText>
})

/** iOS 播放进度（原型 .progress / .times）：左右 30pt，时间标签 11pt */
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
