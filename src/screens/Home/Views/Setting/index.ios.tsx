import { memo } from 'react'
import { ScrollView, View } from 'react-native'
import { Navigation } from 'react-native-navigation'

import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { iosHomeBottomInset } from '@/theme/ios/tokens'
import { IOSIcon, IOSListRow, IOSListSection } from '@/components/ios'
import { getIOSSettingSubpageOptions } from '@/navigation/iosOptions'
import { SETTING_SCREEN } from '@/navigation/screenNames'
import commonState from '@/store/common/state'
import { IOS_SETTING_GROUPS, type IOSSettingSection } from './iosSections'

const IconTile = memo(({ section }: { section: IOSSettingSection }) => {
  const { colors, radius } = useIOSTheme()
  return (
    <View style={{
      width: 29,
      height: 29,
      borderRadius: radius.cover,
      backgroundColor: colors.iconTileBackground,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <IOSIcon name={section.icon} size={17} color={colors.iconTileForeground} />
    </View>
  )
})

/**
 * iOS 设置首页：系统设置风格的分组列表。
 * 点击后推入原生二级页；二级页不显示原生导航栏（无返回按钮和标题）。
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
        options: getIOSSettingSubpageOptions(),
      },
    })
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 + iosHomeBottomInset }}
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
