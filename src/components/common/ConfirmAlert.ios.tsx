import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import Modal, { type ModalType } from './Modal'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useKeyboard } from '@/utils/hooks'

export interface ConfirmAlertProps {
  onCancel?: () => void
  onHide?: () => void
  onConfirm?: () => void
  keyHide?: boolean
  bgHide?: boolean
  closeBtn?: boolean
  title?: string
  text?: string
  cancelText?: string
  confirmText?: string
  showConfirm?: boolean
  disabledConfirm?: boolean
  reverseBtn?: boolean
  children?: React.ReactNode | React.ReactNode[]
}

export interface ConfirmAlertType {
  setVisible: (visible: boolean) => void
}

const BUTTON_HEIGHT = 44

/**
 * iOS 确认框：系统 UIAlertController 风格（居中圆角卡片 + 分隔线 + 强调色文字按钮）。
 * 需要输入框等自定义内容的场景（连接码、规则编辑）仍然复用同一套外壳。
 */
export default forwardRef<ConfirmAlertType, ConfirmAlertProps>(({
  onHide,
  onCancel,
  onConfirm = () => {},
  keyHide,
  bgHide,
  title = '',
  text = '',
  cancelText = '',
  confirmText = '',
  showConfirm = true,
  disabledConfirm = false,
  children,
  reverseBtn = false,
}, ref) => {
  const { colors, accent, hairline, radius } = useIOSTheme()
  const { keyboardShown, keyboardHeight } = useKeyboard()
  const modalRef = useRef<ModalType>(null)

  useImperativeHandle(ref, () => ({
    setVisible(visible: boolean) {
      modalRef.current?.setVisible(visible)
    },
  }))

  const handleCancel = () => {
    onCancel?.()
    modalRef.current?.setVisible(false)
  }

  const renderButton = (label: string, bold: boolean, onPress: () => void, disabled = false) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flex: 1,
        height: BUTTON_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : pressed ? 0.5 : 1,
      })}
    >
      <IOSText weight={bold ? '600' : '400'} color={accent} numberOfLines={1}>{label}</IOSText>
    </Pressable>
  )

  const cancelButton = renderButton(cancelText || global.i18n.t('cancel'), false, handleCancel)
  const confirmButton = showConfirm
    ? renderButton(confirmText || global.i18n.t('confirm'), true, onConfirm, disabledConfirm)
    : null

  return (
    <Modal
      onHide={onHide}
      keyHide={keyHide}
      bgHide={bgHide}
      bgColor={colors.overlay}
      ref={modalRef}
    >
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 30,
        paddingBottom: keyboardShown ? keyboardHeight : 0,
      }}>
        <View style={{
          width: '100%',
          maxWidth: 290,
          borderRadius: radius.card,
          overflow: 'hidden',
          backgroundColor: colors.secondaryGroupedBackground,
        }}>
          {title
            ? (
                <IOSText
                  weight="600"
                  align="center"
                  style={{ marginHorizontal: 16, marginTop: 19 }}
                >{title}</IOSText>
              )
            : null}
          <ScrollView
            style={{ flexGrow: 0, maxHeight: 320 }}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: title ? 4 : 19,
              paddingBottom: 19,
            }}
            keyboardShouldPersistTaps="handled"
          >
            {children ?? (
              <IOSText variant="footnote" align="center" color={colors.secondaryLabel}>{text}</IOSText>
            )}
          </ScrollView>
          <View style={{ flexDirection: 'row', borderTopWidth: hairline, borderTopColor: colors.rowSeparator }}>
            {reverseBtn
              ? (
                  <>
                    {confirmButton}
                    {confirmButton
                      ? <View style={{ width: hairline, backgroundColor: colors.rowSeparator }} />
                      : null}
                    {cancelButton}
                  </>
                )
              : (
                  <>
                    {cancelButton}
                    {confirmButton
                      ? <View style={{ width: hairline, backgroundColor: colors.rowSeparator }} />
                      : null}
                    {confirmButton}
                  </>
                )}
          </View>
        </View>
      </View>
    </Modal>
  )
})
