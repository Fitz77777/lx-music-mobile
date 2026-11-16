import { forwardRef, useImperativeHandle, useState } from 'react'

import IOSBottomSheet from '@/components/ios/BottomSheet'

export interface PopupProps {
  onHide?: () => void
  keyHide?: boolean
  bgHide?: boolean
  closeBtn?: boolean
  position?: 'top' | 'left' | 'right' | 'bottom'
  title?: string
  children: React.ReactNode
}

export interface PopupType {
  setVisible: (visible: boolean) => void
}

/**
 * iOS 弹层：统一用底部面板（与原型 .sheet 一致）。
 * 播放页设置、音效、同步历史这些原本是 Android 居中弹窗的，现在都是底部面板。
 */
export default forwardRef<PopupType, PopupProps>(({
  onHide = () => {},
  bgHide = true,
  title = '',
  children,
}: PopupProps, ref) => {
  const [visible, setVisible] = useState(false)

  useImperativeHandle(ref, () => ({
    setVisible(v: boolean) {
      setVisible(v)
      if (!v) onHide()
    },
  }), [onHide])

  return (
    <IOSBottomSheet
      visible={visible}
      onClose={() => {
        setVisible(false)
        onHide()
      }}
      title={title || undefined}
      dismissOnBackdrop={bgHide}
    >
      {children}
    </IOSBottomSheet>
  )
})
