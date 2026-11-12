import { forwardRef, useImperativeHandle, useState } from 'react'
import { Pressable } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface CurrentTagBtnProps {
  onShowList: () => void
}

export interface CurrentTagBtnType {
  setCurrentTagInfo: (name: string) => void
}

/** iOS 当前标签按钮：文字 + 下箭头 */
export default forwardRef<CurrentTagBtnType, CurrentTagBtnProps>(({ onShowList }, ref) => {
  const t = useI18n()
  const [name, setName] = useState('')
  const { colors, spacing } = useIOSTheme()

  useImperativeHandle(ref, () => ({
    setCurrentTagInfo(name) {
      if (!name) name = t('songlist_tag_default')
      setName(name)
    },
  }))

  return (
    <Pressable
      onPress={onShowList}
      hitSlop={8}
      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md }}
    >
      <IOSText variant="subheadline" numberOfLines={1} style={{ maxWidth: 96 }}>{name}</IOSText>
      <IOSIcon
        name="chevron-right"
        size={10}
        color={colors.secondaryLabel}
        style={{ marginLeft: 2, transform: [{ rotate: '90deg' }] }}
      />
    </Pressable>
  )
})
