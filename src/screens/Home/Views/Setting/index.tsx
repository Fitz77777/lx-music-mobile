import { memo, useMemo } from 'react'
import { ScrollView } from 'react-native'
import { Navigation } from 'react-native-navigation'

import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useIOSHomeBottomInset } from '@/theme/ios/useIOSBottomInset'
import { IOSIcon, IOSListRow, IOSListSection } from '@/components/ios'
import { getIOSSettingSubpageOptions } from '@/navigation/iosOptions'
import { SETTING_SCREEN } from '@/navigation/screenNames'
import commonState from '@/store/common/state'
import { getIOSSettingGroups, type IOSSettingSection } from './iosSections'

export type { SettingScreenIds } from './Main'

const IconTile = memo(({ section }: { section: IOSSettingSection }) => {
  const { colors } = useIOSTheme()
  // 无底色：纯图标与文字同灰度，视觉更扁平统一
  return <IOSIcon name={section.icon} size={20} color={colors.secondaryLabel} />
})

/**
 * iOS 设置首页：系统设置风格的分组列表。
 * 点击后推入原生二级页；二级页不显示原生导航栏（无返回按钮和标题）。
 */
export default () => {
  const t = useI18n()
  const { colors } = useIOSTheme()
  const bottomInset = useIOSHomeBottomInset()
  const groups = useMemo(getIOSSettingGroups, [])

  const handlePress = (section: IOSSettingSection) => {
    const componentId = commonState.componentIds.home
    if (!componentId) return
    void Navigation.push(componentId, {
      component: {
        name: SETTING_SCREEN,
        passProps: { id: section.id },
        options: getIOSSettingSubpageOptions(),
      },
    })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 + bottomInset }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {
        groups.map(group => (
          <IOSListSection key={group.titleKey} title={t(group.titleKey)}>
            {
              group.items.map(section => (
                <IOSListRow
                  key={section.id}
                  title={t(section.titleKey)}
                  leading={<IconTile section={section} />}
                  accessory="chevron"
                  minHeight={48}
                  onPress={() => { handlePress(section) }}
                />
              ))
            }
          </IOSListSection>
        ))
      }
    </ScrollView>
  )
}
