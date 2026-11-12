import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import type { CheckBoxProps } from '@/components/common/CheckBox'
import IOSIcon from '@/components/ios/Icon'
import IOSSwitch from '@/components/ios/Switch'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { tipDialog } from '@/utils/tools'

/**
 * iOS 开关行：标题在左，UISwitch 在右。
 * 与 Android 版共用 CheckBoxProps，设置项无需改动。
 */
export default memo(({
  check,
  label,
  children,
  onChange,
  helpTitle,
  helpDesc,
  disabled = false,
  need = false,
  size = 1,
  marginBottom = 0,
}: CheckBoxProps) => {
  const { colors, spacing } = useIOSTheme()
  const [isDisabled, setDisabled] = useState(false)

  useEffect(() => {
    if (need) {
      setDisabled(check)
    } else {
      setDisabled(false)
    }
  }, [check, need])

  const handleChange = useCallback((value: boolean) => {
    if (isDisabled) return
    onChange(value)
  }, [isDisabled, onChange])

  const helpComponent = useMemo(() => {
    if (!(helpTitle ?? helpDesc)) return null
    const handleShowHelp = () => {
      void tipDialog({
        title: helpTitle ?? '',
        message: helpDesc,
        btnText: global.i18n.t('understand'),
      })
    }
    return (
      <Pressable onPress={handleShowHelp} hitSlop={8} style={{ paddingLeft: spacing.sm }}>
        <IOSIcon name="help" size={17} color={colors.tertiaryLabel} />
      </Pressable>
    )
  }, [helpTitle, helpDesc, colors, spacing])

  const title = label
    ? <IOSText variant="body" size={size == 1 ? undefined : 17 * size} numberOfLines={2}>{label}</IOSText>
    : children

  return (
    <View style={{
      minHeight: 44,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      marginBottom,
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.45 : 1,
    }}>
      <Pressable
        onPress={() => { handleChange(!check) }}
        disabled={disabled || isDisabled}
        style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
      >
        <View style={{ flex: 1, paddingRight: spacing.sm }}>{title}</View>
        {helpComponent}
      </Pressable>
      <View style={{ marginLeft: spacing.sm }}>
        <IOSSwitch
          value={check}
          disabled={disabled || isDisabled}
          onValueChange={handleChange}
        />
      </View>
    </View>
  )
})
