import { memo } from 'react'
import { Switch as RNSwitch } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface IOSSwitchProps {
  value: boolean
  onValueChange?: (value: boolean) => void
  disabled?: boolean
}

/** 原生 UISwitch，选中色跟随主题强调色 */
export default memo(({ value, onValueChange, disabled }: IOSSwitchProps) => {
  const { colors, accent } = useIOSTheme()

  return (
    <RNSwitch
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
      trackColor={{ false: colors.fill, true: accent }}
      ios_backgroundColor={colors.fill}
    />
  )
})
