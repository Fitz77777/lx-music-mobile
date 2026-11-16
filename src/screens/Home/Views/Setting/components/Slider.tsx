import { memo } from 'react'

import Slider, { type SliderProps } from '@react-native-community/slider'
import { StyleSheet } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export type {
  SliderProps,
}

/** iOS 滑杆：强调色轨道 + 系统灰底 */
export default memo(({ value, minimumValue, maximumValue, onSlidingStart, onSlidingComplete, onValueChange, step }: SliderProps) => {
  const { colors, accent } = useIOSTheme()

  return (
    <Slider
      value={value}
      style={styles.slider}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      minimumTrackTintColor={accent}
      maximumTrackTintColor={colors.tertiaryFill}
      thumbTintColor="#FFFFFF"
      onSlidingStart={onSlidingStart}
      onSlidingComplete={onSlidingComplete}
      onValueChange={onValueChange}
      step={step}
    />
  )
})

const styles = StyleSheet.create({
  slider: {
    flexShrink: 0,
    flexGrow: 1,
    height: 36,
    marginTop: -4,
  },
})
