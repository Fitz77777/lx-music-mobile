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

/** iOS 标签筛选按钮：29×29 圆形图标，已选标签时使用强调色（原型 .chip.filter） */
export default forwardRef<CurrentTagBtnType, CurrentTagBtnProps>(({ onShowList }, ref) => {
  const t = useI18n()
  const [active, setActive] = useState(false)
  const { colors, accent } = useIOSTheme()

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
        borderRadius: 15,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? accent : colors.secondaryGroupedBackground,
        shadowColor: '#000000',
        shadowOpacity: active ? 0 : 0.06,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
      }}
    >
      <IOSIcon name="slider" size={16} color={active ? '#FFFFFF' : colors.secondaryLabel} />
    </Pressable>
  )
})
