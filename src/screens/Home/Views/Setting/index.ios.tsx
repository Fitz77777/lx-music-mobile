import { memo } from 'react'
import { ScrollView, View } from 'react-native'
import { Navigation } from 'react-native-navigation'

import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { IOSIcon, IOSListRow, IOSListSection } from '@/components/ios'
import { getIOSNavigationOptions } from '@/navigation/iosOptions'
import { SETTING_SCREEN } from '@/navigation/screenNames'
import commonState from '@/store/common/state'
import themeState from '@/store/theme/state'
import { IOS_SETTING_GROUPS, type IOSSettingSection } from './iosSections'

const IconTile = memo(({ section }: { section: IOSSettingSection }) => {
  return (
    <View style={{
      width: 29,
      height: 29,
      borderRadius: 7,
      backgroundColor: section.tint,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <IOSIcon name={section.icon} size={17} color="#FFFFFF" />
    </View>
  )
})

/**
 * iOS 设置首页：系统设置风格的分组列表。
 * 点击后推入原生二级页（大标题 + 返回按钮）。
 */
export default () => {
  const t = useI18n()
  const { colors } = useIOSTheme()

  const handlePress = (section: IOSSettingSection) => {
    const componentId = commonState.componentIds.home
    if (!componentId) return
    void Navigation.push(componentId, {
      component: {
        name: SETTING_SCREEN,
        passProps: { id: section.id },
        options: getIOSNavigationOptions(themeState.theme, t(section.titleKey)),
      },
    })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.groupedBackground }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      {
        IOS_SETTING_GROUPS.map(group => (
          <IOSListSection key={group.titleKey} title={t(group.titleKey)}>
            {
              group.items.map(section => (
                <IOSListRow
                  key={section.id}
                  title={t(section.titleKey)}
                  leading={<IconTile section={section} />}
                  accessory="chevron"
                  minHeight={44}
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
