import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, TextInput, View, type StyleProp, type ViewStyle } from 'react-native'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'
import IOSText from './Text'

export interface SearchBarType {
  focus: () => void
  blur: () => void
  clear: () => void
}

export interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  onSubmit?: (text: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onCancel?: () => void
  autoFocus?: boolean
  editable?: boolean
  style?: StyleProp<ViewStyle>
}

/** iOS 搜索框（UISearchBar 风格），带原生清除按钮 */
export default forwardRef<SearchBarType, SearchBarProps>(({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  onFocus,
  onBlur,
  onCancel,
  autoFocus = false,
  editable = true,
  style,
}, ref) => {
  const t = useI18n()
  const { colors, accent, spacing, radius } = useIOSTheme()
  const inputRef = useRef<TextInput>(null)
  const [focused, setFocused] = useState(false)

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current?.focus()
    },
    blur() {
      inputRef.current?.blur()
    },
    clear() {
      onChangeText('')
    },
  }), [onChangeText])

  const handleFocus = () => {
    setFocused(true)
    onFocus?.()
  }
  const handleBlur = () => {
    setFocused(false)
    onBlur?.()
  }
  const handleCancel = () => {
    inputRef.current?.blur()
    onChangeText('')
    onCancel?.()
  }

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: spacing.sm + 1, zIndex: 1 }}>
          <IOSIcon name="search-2" size={15} color={colors.secondaryLabel} />
        </View>
        <TextInput
          ref={inputRef}
          value={value}
          editable={editable}
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
          returnKeyType="search"
          placeholder={placeholder ?? t('search_input_placeholder')}
          placeholderTextColor={colors.placeholderText}
          onChangeText={onChangeText}
          onSubmitEditing={() => { onSubmit?.(value) }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{
            height: 36,
            borderRadius: radius.medium,
            paddingLeft: spacing.xxxl,
            paddingRight: spacing.sm,
            paddingVertical: 0,
            backgroundColor: colors.fill,
            fontSize: 17,
            color: colors.label,
          }}
        />
      </View>
      {focused
        ? (
            <Pressable onPress={handleCancel} hitSlop={8} style={{ paddingLeft: spacing.md }}>
              <IOSText variant="body" color={accent}>{t('cancel')}</IOSText>
            </Pressable>
          )
        : null}
    </View>
  )
})
