import { forwardRef, useImperativeHandle, useRef } from 'react'
import { Pressable, View } from 'react-native'

import Modal, { type ModalType } from './Modal'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useKeyboard } from '@/utils/hooks'

export interface DialogProps {
  onHide?: () => void
  keyHide?: boolean
  bgHide?: boolean
  closeBtn?: boolean
  title?: string
  children: React.ReactNode | React.ReactNode[]
  height?: number | `${number}%`
}

export interface DialogType {
  setVisible: (visible: boolean) => void
}

/** iOS 对话框外壳：居中圆角卡片 + 标题栏 + 关闭按钮 */
export default forwardRef<DialogType, DialogProps>(({
  onHide,
  keyHide = true,
  bgHide = true,
  closeBtn = true,
  title = '',
  children,
  height,
}, ref) => {
  const { colors, hairline } = useIOSTheme()
  const { keyboardShown, keyboardHeight } = useKeyboard()
  const modalRef = useRef<ModalType>(null)

  useImperativeHandle(ref, () => ({
    setVisible(visible: boolean) {
      modalRef.current?.setVisible(visible)
    },
  }))

  const close = () => {
    modalRef.current?.setVisible(false)
  }

  return (
    <Modal
      onHide={onHide}
      keyHide={keyHide}
      bgHide={bgHide}
      bgColor="rgba(0, 0, 0, 0.3)"
      ref={modalRef}
    >
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: keyboardShown ? keyboardHeight : 0,
      }}>
        <View style={{
          width: '100%',
          maxWidth: 360,
          maxHeight: '78%',
          height,
          borderRadius: 14,
          overflow: 'hidden',
          backgroundColor: colors.secondaryGroupedBackground,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 44,
            paddingHorizontal: 16,
            borderBottomWidth: hairline,
            borderBottomColor: colors.rowSeparator,
          }}>
            <IOSText variant="headline" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{title}</IOSText>
            {closeBtn
              ? (
                  <Pressable onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel={global.i18n.t('close')}>
                    <IOSIcon name="close" size={17} color={colors.secondaryLabel} />
                  </Pressable>
                )
              : null}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  )
})
