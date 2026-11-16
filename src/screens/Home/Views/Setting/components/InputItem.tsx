import { memo, useState, useEffect, useRef } from 'react'

import { Keyboard, StyleSheet, View } from 'react-native'
import type { InputType, InputProps } from '@/components/common/Input'
import Input from '@/components/common/Input'
import IOSText from '@/components/ios/Text'
import { iosTypography } from '@/theme/ios/tokens'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface InputItemProps extends InputProps {
  value: string
  label: string
  onChanged: (text: string, callback: (value: string) => void) => void
}

/**
 * iOS 输入行：标题在左，输入框在右，失焦或键盘收起时保存。
 */
export default memo(({ value, label, onChanged, ...props }: InputItemProps) => {
  const { colors, spacing } = useIOSTheme()
  const [text, setText] = useState(value)
  const textRef = useRef(value)
  const isMountRef = useRef(false)
  const inputRef = useRef<InputType>(null)

  const saveValue = () => {
    onChanged?.(text, (value: string) => {
      if (!isMountRef.current) return
      const newValue = String(value)
      setText(newValue)
      textRef.current = newValue
    })
  }

  useEffect(() => {
    isMountRef.current = true
    return () => {
      isMountRef.current = false
    }
  }, [])

  useEffect(() => {
    const handleKeyboardDidHide = () => {
      if (!inputRef.current?.isFocused()) return
      onChanged?.(textRef.current, value => {
        if (!isMountRef.current) return
        const newValue = String(value)
        setText(newValue)
        textRef.current = newValue
      })
    }
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', handleKeyboardDidHide)

    return () => {
      keyboardDidHide.remove()
    }
  }, [onChanged])

  useEffect(() => {
    if (value != text) {
      const newValue = String(value)
      setText(newValue)
      textRef.current = newValue
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const handleSetSelectMode = (text: string) => {
    setText(text)
    textRef.current = text
  }

  return (
    <View style={{
      minHeight: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: 7,
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      <IOSText variant="body" numberOfLines={1} style={{ marginRight: spacing.md }}>{label}</IOSText>
      <Input
        value={text}
        ref={inputRef}
        onChangeText={handleSetSelectMode}
        placeholderTextColor={colors.placeholderText}
        style={[styles.input, { color: colors.label }]}
        {...props}
        onBlur={saveValue}
      />
    </View>
  )
})

const styles = StyleSheet.create({
  input: {
    flexGrow: 1,
    flexShrink: 1,
    height: 34,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: iosTypography.body.fontSize,
    textAlign: 'right',
  },
})
