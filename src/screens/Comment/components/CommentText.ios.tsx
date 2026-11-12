import { memo, useMemo, useState } from 'react'
import { View } from 'react-native'

import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'

const TEXT_LIMIT = 160
const SUB_TEXT_LIMIT = TEXT_LIMIT * 1.2

/** iOS 评论正文：超长时折叠，展开按钮使用强调色 */
export default memo(({ text }: { text: string }) => {
  const [show, setShow] = useState(false)
  const { accent, spacing } = useIOSTheme()
  const t = useI18n()

  const length = useMemo(() => {
    let count = 0
    let bCount = 0
    let subLength = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i)
      if (char == '\n') {
        count += bCount * 24 + 20
        bCount++
      } else {
        count++
        if (char.trim() != '') bCount &&= 0
      }
      if (!subLength && count > TEXT_LIMIT) subLength = i
      if (count >= SUB_TEXT_LIMIT) return subLength
    }
    return 0
  }, [text])

  return (
    length
      ? (
          <View>
            <IOSText variant="subheadline" selectable style={{ marginTop: spacing.xs, lineHeight: 20 }}>
              {show ? text : `${text.substring(0, length)}……`}
            </IOSText>
            <IOSText
              variant="subheadline"
              color={accent}
              onPress={() => { setShow(!show) }}
              style={{ marginTop: spacing.sm, alignSelf: 'flex-end' }}
            >{show ? t('comment_hide_text') : t('comment_show_text')}</IOSText>
          </View>
        )
      : <IOSText variant="subheadline" selectable style={{ marginTop: spacing.xs, lineHeight: 20 }}>{text}</IOSText>
  )
})
