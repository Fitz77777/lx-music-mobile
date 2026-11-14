import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, TextInput, View } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'

import IOSBottomSheet from '@/components/ios/BottomSheet'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { type Source } from '@/store/songlist/state'

export interface ModalProps {
  onOpenId: (id: string) => void
}

export interface ModalType {
  show: (source: Source) => void
}

/**
 * iOS「打开歌单」面板：贴合原型 .sheet（标题 / 输入框 + 粘贴 / 提示 / 主按钮 / 取消）。
 * 功能与 Android 版一致，仍然只提交歌单 ID 或链接。
 */
export default forwardRef<ModalType, ModalProps>(({ onOpenId }, ref) => {
  const t = useI18n()
  const { colors, accent, spacing, radius, typography } = useIOSTheme()
  const inputRef = useRef<TextInput>(null)
  const [visible, setVisible] = useState(false)
  const [text, setText] = useState('')

  useImperativeHandle(ref, () => ({
    show() {
      setText('')
      setVisible(true)
    },
  }))

  // 面板展示的同时聚焦输入框，让面板上滑与键盘弹出是同一段动画，
  // 避免「先出面板、再出键盘」的两段式。
  const handleShow = () => {
    inputRef.current?.focus()
  }

  const handleClose = () => {
    inputRef.current?.blur()
    setVisible(false)
  }

  const handlePaste = async() => {
    try {
      const value = await Clipboard.getString()
      if (value) setText(value)
    } catch (err) {
      console.log(err)
    }
  }

  const handleConfirm = () => {
    let id = text.trim()
    if (!id.length) return
    if (id.length > 500) id = id.substring(0, 500)
    setVisible(false)
    onOpenId(id)
  }

  const canSubmit = text.trim().length > 0

  return (
    <IOSBottomSheet
      visible={visible}
      onClose={handleClose}
      onShow={handleShow}
      title={t('songlist_open')}
    >
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        height: 46,
        borderRadius: radius.card,
        backgroundColor: colors.fill,
        paddingLeft: 14,
        paddingRight: 4,
      }}>
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder={t('songlist_open_input_placeholder')}
          placeholderTextColor={colors.placeholderText}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleConfirm}
          style={{
            flex: 1,
            minWidth: 0,
            padding: 0,
            fontSize: typography.subheadline.fontSize,
            color: colors.label,
          }}
        />
        <Pressable
          onPress={() => { void handlePaste() }}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={t('paste')}
          style={({ pressed }) => ({
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: radius.control,
            backgroundColor: colors.secondaryGroupedBackground,
            marginLeft: spacing.sm,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <IOSText variant="footnote" weight="600" color={accent}>{t('paste')}</IOSText>
        </Pressable>
      </View>
      <IOSText
        variant="caption1"
        color={colors.secondaryLabel}
        style={{ marginTop: 9, marginBottom: 18 }}
      >{t('songlist_open_input_tip')}</IOSText>
      <Pressable
        onPress={handleConfirm}
        disabled={!canSubmit}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 50,
          borderRadius: radius.control,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent,
          opacity: !canSubmit ? 0.4 : pressed ? 0.85 : 1,
        })}
      >
        <IOSText variant="headline" color={colors.onAccent}>{t('songlist_open')}</IOSText>
      </Pressable>
      <Pressable
        onPress={handleClose}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.xs,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <IOSText color={accent}>{t('cancel')}</IOSText>
      </Pressable>
    </IOSBottomSheet>
  )
})
