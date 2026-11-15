import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react'
import { View } from 'react-native'

import ConfirmAlert, { type ConfirmAlertType } from '@/components/common/ConfirmAlert'
import Text from '@/components/common/Text'
import Input, { type InputType } from '@/components/common/Input'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { updateUserListPosition } from '@/core/list'

export interface ListPositionModalType {
  show: (listInfo: LX.List.UserListInfo, position: number) => void
}

interface PositionInputType {
  getText: () => string
  setText: (text: string) => void
  focus: () => void
}
const PositionInput = forwardRef<PositionInputType, { initialText: string }>(({ initialText }, ref) => {
  const theme = useTheme()
  const t = useI18n()
  const [text, setText] = useState(initialText)
  const inputRef = useRef<InputType>(null)
  const initialTextRef = useRef(initialText)

  useEffect(() => {
    if (initialTextRef.current != initialText) {
      initialTextRef.current = initialText
      setText(initialText)
    }
  }, [initialText])

  useImperativeHandle(ref, () => ({
    getText() {
      return text.trim()
    },
    setText(text) {
      setText(text)
    },
    focus() {
      inputRef.current?.focus()
    },
  }))

  return (
    <Input
      placeholder={t('change_position_tip')}
      value={text}
      onChangeText={setText}
      ref={inputRef}
      style={{ ...styles.input, backgroundColor: theme['c-primary-input-background'] }}
    />
  )
})
PositionInput.displayName = 'PositionInput'

/**
 * 歌单手动排序：把选中的歌单移动到输入的位置。
 * 输入的位置按抽屉里的可见顺序编号（试听/收藏固定占第 1、2 位），
 * 确认后换算成可移动歌单的相对位置调用 updateUserListPosition。
 */
export default forwardRef<ListPositionModalType, {}>((props, ref) => {
  const t = useI18n()
  const alertRef = useRef<ConfirmAlertType>(null)
  const inputRef = useRef<PositionInputType>(null)
  const listInfoRef = useRef<LX.List.UserListInfo | null>(null)
  const [initialText, setInitialText] = useState('')
  const [visible, setVisible] = useState(false)

  const handleShow = () => {
    alertRef.current?.setVisible(true)
    requestAnimationFrame(() => {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    })
  }

  useImperativeHandle(ref, () => ({
    show(listInfo, position) {
      listInfoRef.current = listInfo
      setInitialText(String(position + 1))
      if (visible) handleShow()
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          handleShow()
        })
      }
    },
  }))

  const verify = () => {
    const result = /^[1-9]\d*/.exec(inputRef.current?.getText() ?? '')
    const num = result ? parseInt(result[0]) : ''
    inputRef.current?.setText(num.toString())
    return num
  }

  const handleSetListPosition = () => {
    const num = verify()
    if (num == '') return
    const listInfo = listInfoRef.current
    if (!listInfo) return
    alertRef.current?.setVisible(false)
    // 可见序号（1 起，含固定两项）→ 可移动歌单的 0 基位置：序号 n 对应 userLists 的 n-3
    void updateUserListPosition(Math.max((num) - 3, 0), [listInfo.id])
  }

  return (
    visible
      ? <ConfirmAlert
          ref={alertRef}
          onConfirm={handleSetListPosition}
          onHide={() => { setInitialText('') }}
        >
          <View style={styles.content}>
            <Text style={styles.title}>
              {listInfoRef.current ? t('change_position_music_title', { name: listInfoRef.current.name }) : ''}
            </Text>
            <PositionInput ref={inputRef} initialText={initialText} />
          </View>
        </ConfirmAlert>
      : null
  )
})

const styles = createStyle({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
  },
  title: {
    marginBottom: 5,
    textAlign: 'center',
  },
  input: {
    marginHorizontal: 10,
    marginBottom: 10,
  },
})
