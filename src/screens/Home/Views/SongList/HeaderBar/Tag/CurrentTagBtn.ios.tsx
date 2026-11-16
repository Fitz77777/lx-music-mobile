import { forwardRef, useImperativeHandle, useState } from 'react'
import { Pressable } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface CurrentTagBtnProps {
  onShowList: () => void
}

export interface CurrentTagBtnType {
  setCurrentTagInfo: (name: string) => void
}

/** iOS 标签筛选按钮：无边框小图标，已选标签时使用强调色（原型 .chip.filter） */
export default forwardRef<CurrentTagBtnType, CurrentTagBtnProps>(({ onShowList }, ref) => {
  const t = useI18n()
  const [active, setActive] = useState(false)
  const { colors, accent, radius } = useIOSTheme()

  useImperativeHandle(ref, () => ({
    setCurrentTagInfo(name) {
      setActive(!!name && name != t('songlist_tag_default'))
    },
  }))

  return (
    <Pressable
      onPress={onShowList}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('songlist_tags')}
      style={{
        width: 29,
        height: 29,
        borderRadius: radius.pill,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <IOSIcon name="slider" size={16} color={active ? accent : colors.secondaryLabel} />
    </Pressable>
  )
})
