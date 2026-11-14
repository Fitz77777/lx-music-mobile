import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { PanResponder, View } from 'react-native'

import { markTimeoutExitInteraction } from '@/core/player/timeoutExit'
import { useDrag } from '@/utils/hooks'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

const BAR_HEIGHT = 4
/** 触摸热区高度（pt） */
const TOUCH_HEIGHT = 20
const KNOB_SIZE = 13

const DefaultBar = memo(() => {
  const { colors } = useIOSTheme()
  return (
    <View style={{
      position: 'absolute',
      left: 0,
      top: (TOUCH_HEIGHT - BAR_HEIGHT) / 2,
      width: '100%',
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: colors.fill,
    }} />
  )
})

const BufferedBar = memo(({ progress }: { progress: number }) => {
  const { accent } = useIOSTheme()
  return (
    <View style={{
      position: 'absolute',
      left: 0,
      top: (TOUCH_HEIGHT - BAR_HEIGHT) / 2,
      width: `${progress * 100}%`,
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      backgroundColor: accent,
      opacity: 0.25,
    }} />
  )
})

const PreassBar = ({ onDragState, setDragProgress, onSetProgress }: {
  onDragState: (drag: boolean) => void
  setDragProgress: (progress: number) => void
  onSetProgress: (progress: number) => void
}) => {
  const {
    onLayout,
    onDragStart,
    onDragEnd,
    onDrag,
  } = useDrag(onSetProgress, onDragState, setDragProgress)

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: (evt, gestureState) => {
        onDrag(gestureState.dx)
      },
      onPanResponderGrant: (evt, gestureState) => {
        onDragStart(gestureState.dx, evt.nativeEvent.locationX)
      },
      onPanResponderRelease: () => {
        onDragEnd()
      },
    }),
  ).current

  return (
    <View
      onLayout={onLayout}
      style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: TOUCH_HEIGHT, zIndex: 6 }}
      {...panResponder.panHandlers}
    />
  )
}

const knobStyle = {
  width: KNOB_SIZE,
  height: KNOB_SIZE,
  borderRadius: KNOB_SIZE / 2,
  position: 'absolute' as const,
  right: -KNOB_SIZE / 2,
  top: (BAR_HEIGHT - KNOB_SIZE) / 2,
}

/**
 * iOS 播放进度条（原型 .progress）：
 * 4pt 高轨道 + 强调色进度 + 13pt 白色圆点，拖动时实时预览。
 * iOS 与平板共用（components/ios 为共享设计套件，无平台后缀）。
 */
const Progress = ({ progress, duration, buffered }: {
  progress: number
  duration: number
  buffered: number
}) => {
  const { accent } = useIOSTheme()
  const [draging, setDraging] = useState(false)
  const [dragProgress, setDragProgress] = useState(0)
  const progressStr: `${number}%` = `${progress * 100}%`

  const durationRef = useRef(duration)
  useEffect(() => {
    durationRef.current = duration
  }, [duration])
  const onSetProgress = useCallback((value: number) => {
    markTimeoutExitInteraction()
    global.app_event.setProgress(value * durationRef.current)
  }, [])

  const knob = useMemo(() => (
    <View style={{
      ...knobStyle,
      backgroundColor: '#FFFFFF',
      shadowColor: '#000000',
      shadowOpacity: 0.25,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
    }} />
  ), [])

  const activeWidth: `${number}%` = draging ? `${dragProgress * 100}%` : progressStr

  return (
    <View style={{ width: '100%', height: TOUCH_HEIGHT }}>
      <DefaultBar />
      <BufferedBar progress={buffered} />
      <View style={{
        position: 'absolute',
        left: 0,
        top: (TOUCH_HEIGHT - BAR_HEIGHT) / 2,
        width: activeWidth,
        height: BAR_HEIGHT,
        borderRadius: BAR_HEIGHT / 2,
        backgroundColor: accent,
      }}>
        {knob}
      </View>
      <PreassBar onDragState={setDraging} setDragProgress={setDragProgress} onSetProgress={onSetProgress} />
    </View>
  )
}

export default Progress
