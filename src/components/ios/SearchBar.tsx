import { forwardRef, useImperativeHandle, useRef } from 'react'
import { TextInput, View, type StyleProp, type ViewStyle } from 'react-native'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'

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
  autoFocus = false,
  editable = true,
  style,
}, ref) => {
  const t = useI18n()
  const { colors, radius } = useIOSTheme()
  const inputRef = useRef<TextInput>(null)

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
    onFocus?.()
  }
  const handleBlur = () => {
    onBlur?.()
  }

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View pointerEvents="none" style={{ position: 'absolute', left: 11, zIndex: 1 }}>
          <IOSIcon name="search-2" size={17} color={colors.secondaryLabel} />
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
            height: 38,
            borderRadius: radius.medium,
            paddingLeft: 35,
            paddingRight: 11,
            paddingVertical: 0,
            backgroundColor: colors.fill,
            fontSize: 16,
            color: colors.label,
          }}
        />
      </View>
    </View>
  )
})
