import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import ConfirmAlert, { type ConfirmAlertType } from '@/components/common/ConfirmAlert'
import Text from '@/components/common/Text'
import { View } from 'react-native'
import Input, { type InputType } from '@/components/common/Input'
import { createStyle, tipDialog } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { httpFetch } from '@/utils/request'
import { importUserApi } from '@/core/userApi'
import { log } from '@/utils/log'
import { state } from '@/store/userApi'

const MAX_SCRIPT_SIZE = 9_000_000
const MAX_SOURCE_NUM = 20

interface FailedInfo {
  url: string
  message: string
}

interface UrlInputType {
  setText: (text: string) => void
  getText: () => string
  focus: () => void
}
const UrlInput = forwardRef<UrlInputType, {}>((props, ref) => {
  const theme = useTheme()
  const [text, setText] = useState('')
  const [placeholder, setPlaceholder] = useState(global.i18n.t('user_api_btn_import_online_input_tip'))
  const inputRef = useRef<InputType>(null)

  useImperativeHandle(ref, () => ({
    getText() {
      return text.trim()
    },
    setText(text: string) {
      setText(text)
      setPlaceholder(global.i18n.t('user_api_btn_import_online_input_tip'))
    },
    focus() {
      inputRef.current?.focus()
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    },
  }))

  return (
    <Input
      ref={inputRef}
      multiline
      placeholder={placeholder}
      value={text}
      onChangeText={setText}
      style={{ ...styles.input, backgroundColor: theme['c-primary-input-background'], color: theme['c-font'] }}
    />
  )
})


export interface ScriptImportOnlineType {
  show: () => void
}


export default forwardRef<ScriptImportOnlineType, {}>((props, ref) => {
  const t = useI18n()
  const alertRef = useRef<ConfirmAlertType>(null)
  const urlInputRef = useRef<UrlInputType>(null)
  const [visible, setVisible] = useState(false)
  const [btn, setBtn] = useState({ disabled: false, text: t('user_api_btn_import_online_input_confirm') })

  const handleShow = () => {
    alertRef.current?.setVisible(true)
    setBtn({ disabled: false, text: t('user_api_btn_import_online_input_confirm') })
    requestAnimationFrame(() => {
      urlInputRef.current?.setText('')
    })
  }
  useImperativeHandle(ref, () => ({
    show() {
      if (visible) handleShow()
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          handleShow()
        })
      }
    },
  }))

  const parseUrls = (text: string) => {
    return [...new Set(text.split(/\s+/).map(str => str.trim()).filter(url => /^https?:\/\//i.test(url)))]
  }

  const handleBatch = async(urls: string[]) => {
    const total = urls.length
    let successCount = 0
    const failed: FailedInfo[] = []
    let current = 0
    for (const url of urls) {
      current++
      setBtn({ disabled: true, text: t('user_api_btn_import_online_input_loading', { current, total }) })
      try {
        const script = await httpFetch(url).promise.then(resp => resp.body) as string
        if (script.length > MAX_SCRIPT_SIZE) throw new Error('Too large script')
        await importUserApi(script)
        successCount++
      } catch (err: any) {
        log.error(`import script failed: ${url}\n${err?.stack ?? err}`)
        failed.push({ url, message: err?.message ?? String(err) })
      }
    }
    setBtn({ disabled: false, text: t('user_api_btn_import_online_input_confirm') })
    return { successCount, failed }
  }

  const handleImport = async() => {
    let text = urlInputRef.current?.getText() ?? ''
    const urls = parseUrls(text)
    if (!urls.length) {
      void tipDialog({ message: t('user_api_btn_import_online_empty_tip'), btnText: t('ok') })
      return
    }
    const successExists = urls.length + state.list.length > MAX_SOURCE_NUM
    if (successExists) {
      void tipDialog({ message: t('user_api_max_tip'), btnText: t('ok') })
      return
    }
    const { successCount, failed } = await handleBatch(urls)

    // 失败的链接保留在输入框内，点击「导入」即可重试
    if (failed.length) {
      urlInputRef.current?.setText(failed.map(item => item.url).join('\n'))
    } else {
      urlInputRef.current?.setText('')
      alertRef.current?.setVisible(false)
      return
    }
    void tipDialog({
      message: t('user_api_btn_import_online_summary', { n: successCount, m: failed.length }) + '\n' + failed.map(item => `${item.url}：${item.message}`).join('\n'),
      btnText: t('ok'),
    })
  }

  return (
    visible
      ? <ConfirmAlert
          ref={alertRef}
          onConfirm={handleImport}
          disabledConfirm={btn.disabled}
          confirmText={btn.text}
        >
          <View style={styles.reurlContent}>
            <Text style={{ marginBottom: 5 }}>{ t('user_api_btn_import_online')}</Text>
            <UrlInput ref={urlInputRef} />
          </View>
        </ConfirmAlert>
      : null
  )
})

const styles = createStyle({
  reurlContent: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 290,
    minHeight: 90,
    maxHeight: 180,
    borderRadius: 4,
    textAlignVertical: 'top',
    paddingTop: 2,
    paddingBottom: 2,
    fontSize: 14,
  },
})
