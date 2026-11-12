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
  return <IOSText variant="caption1" color={colors.secondaryLabel}>{timeStr}</IOSText>
}

const PlayTimeMax = memo(({ timeStr }: { timeStr: string }) => {
  const { colors } = useIOSTheme()
  return <IOSText variant="caption1" color={colors.secondaryLabel}>{timeStr}</IOSText>
})

/** iOS 播放进度：时间标签使用系统次要文字色 */
export default () => {
  const { maxPlayTimeStr, nowPlayTimeStr, progress, maxPlayTime } = useProgress()
  const buffered = useBufferProgress()
  const { spacing } = useIOSTheme()

  return (
    <>
      <View style={{ flexGrow: 1, flexShrink: 0, flexDirection: 'column', justifyContent: 'center' }}>
        <Progress progress={progress} duration={maxPlayTime} buffered={buffered} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <PlayTimeCurrent timeStr={nowPlayTimeStr} />
        <View style={{ flexGrow: 1, flexShrink: 1, paddingHorizontal: spacing.sm }}>
          <Status />
        </View>
        <PlayTimeMax timeStr={maxPlayTimeStr} />
      </View>
    </>
  )
}
