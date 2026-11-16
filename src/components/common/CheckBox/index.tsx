import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, View } from 'react-native'

import CheckMark from '@/components/ios/CheckMark'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { tipDialog } from '@/utils/tools'

export interface CheckBoxProps {
  check: boolean
  label?: string
  children?: React.ReactNode
  onChange: (check: boolean) => void
  disabled?: boolean
  need?: boolean
  size?: number
  marginRight?: number
  marginBottom?: number

  helpTitle?: string
  helpDesc?: string
}

/**
 * iOS 复选项：圆形选框 + 标签，用于一组选项的单选/多选。
 * 与 Android 版保持同一套 props，调用方无需区分平台。
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
  marginRight = 0,
  marginBottom = 0,
  size = 1,
}: CheckBoxProps) => {
  const { colors, accent, spacing } = useIOSTheme()
  const [isDisabled, setDisabled] = useState(false)

  useEffect(() => {
    if (need) {
      setDisabled(check)
    } else {
      setDisabled(false)
    }
  }, [check, need])

  const handlePress = useCallback(() => {
    if (isDisabled) return
    onChange(!check)
  }, [isDisabled, onChange, check])

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
      <Pressable onPress={handleShowHelp} hitSlop={8} style={{ paddingHorizontal: spacing.sm }}>
        <IOSIcon name="help" size={15 * size} color={colors.tertiaryLabel} />
      </Pressable>
    )
  }, [helpTitle, helpDesc, size, colors, spacing])

  const boxSize = 22 * size
  const inactive = disabled || isDisabled

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginRight,
      marginBottom,
      paddingVertical: 4,
      opacity: disabled ? 0.45 : 1,
    }}>
      <Pressable onPress={handlePress} disabled={inactive} hitSlop={6}>
        <View style={{
          width: boxSize,
          height: boxSize,
          borderRadius: boxSize / 2,
          borderWidth: check ? 0 : 1.5,
          borderColor: colors.tertiaryLabel,
          backgroundColor: check ? accent : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {check ? <CheckMark size={boxSize * 0.5} color={colors.onAccent} thickness={2} /> : null}
        </View>
      </Pressable>
      <Pressable
        onPress={handlePress}
        disabled={inactive}
        style={{ flexShrink: 1, marginLeft: spacing.sm, paddingRight: 3 }}
      >
        {label
          ? <IOSText variant="body" size={15 * size} color={disabled ? colors.secondaryLabel : colors.label}>{label}</IOSText>
          : children}
      </Pressable>
      {helpComponent}
    </View>
  )
})
