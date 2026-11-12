import { ActionSheetIOS, Alert } from 'react-native'

export interface IOSAlertButton {
  text: string
  style?: 'default' | 'cancel' | 'destructive'
  onPress?: () => void
}

/** 原生 UIAlertController */
export const iosAlert = (title: string, message?: string, buttons?: IOSAlertButton[]) => {
  Alert.alert(title, message, buttons ?? [{ text: global.i18n.t('dialog_confirm') }])
}

export interface IOSConfirmOptions {
  title: string
  message?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

/** 原生确认框，返回用户是否确认 */
export const iosConfirm = async({ title, message, confirmText, cancelText, destructive = false }: IOSConfirmOptions): Promise<boolean> => {
  return await new Promise(resolve => {
    let settled = false
    const done = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    Alert.alert(title, message, [
      { text: cancelText ?? global.i18n.t('cancel'), style: 'cancel', onPress: () => { done(false) } },
      {
        text: confirmText ?? global.i18n.t('dialog_confirm'),
        style: destructive ? 'destructive' : 'default',
        onPress: () => { done(true) },
      },
    ], {
      cancelable: true,
      onDismiss: () => { done(false) },
    })
  })
}

export interface IOSActionSheetOptions {
  title?: string
  message?: string
  options: string[]
  cancelText?: string
  destructiveIndex?: number
}

/** 原生 UIActionSheet，返回选中项下标；取消返回 null */
export const iosActionSheet = async({ title, message, options, cancelText, destructiveIndex }: IOSActionSheetOptions): Promise<number | null> => {
  return await new Promise(resolve => {
    ActionSheetIOS.showActionSheetWithOptions({
      title,
      message,
      options: [...options, cancelText ?? global.i18n.t('cancel')],
      cancelButtonIndex: options.length,
      destructiveButtonIndex: destructiveIndex,
    }, index => {
      resolve(index == options.length ? null : index)
    })
  })
}
