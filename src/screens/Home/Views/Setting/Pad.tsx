import { useMemo, useRef, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import Main, { type MainType } from './Main'
import { getIOSSettingGroups, type IOSSettingSection } from './iosSections'

/**
 * 平板设置（原型 .set-split）：左侧入口列表常驻，右侧就地展开，无二级页与返回。
 * 分组结构沿用 iOS 设置首页的 iosSections；Android 平板额外补上
 * 桌面歌词与网络设置（仅 Android 实现的设置项）。
 */


export default () => {
  const t = useI18n()
  const { colors, accent, spacing, radius, hairline } = useIOSTheme()
  const mainRef = useRef<MainType>(null)
  const groups = useMemo(getIOSSettingGroups, [])
  const [activeId, setActiveId] = useState(() => global.lx.settingActiveId || groups[0].items[0].id)

  const handlePress = (item: IOSSettingSection) => {
    setActiveId(item.id)
    global.lx.settingActiveId = item.id
    mainRef.current?.setActiveId(item.id)
  }

  const activeTitleKey = useMemo(() => {
    for (const group of groups) {
      const item = group.items.find(item => item.id == activeId)
      if (item) return item.titleKey
    }
    return groups[0].items[0].titleKey
  }, [activeId, groups])

  const renderRow = (item: IOSSettingSection) => {
    const active = item.id == activeId
    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        onPress={() => { handlePress(item) }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 44,
          marginRight: spacing.sm,
          paddingHorizontal: 10,
          borderRadius: radius.control,
          backgroundColor: active ? colors.quaternaryFill : pressed ? colors.secondaryFill : 'transparent',
        })}
      >
        <IOSIcon name={item.icon} size={20} color={active ? accent : colors.secondaryLabel} />
        <IOSText size={15} weight={active ? '600' : '500'} color={active ? accent : colors.label} numberOfLines={1}>
          {t(item.titleKey)}
        </IOSText>
      </Pressable>
    )
  }

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <ScrollView
        style={{ width: 216, flexShrink: 0 }}
        contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {
          groups.map((group, index) => (
            <View key={group.titleKey}>
              <IOSText
                variant="caption2"
                size={12}
                color={colors.secondaryLabel}
                style={{
                  paddingHorizontal: 8,
                  paddingTop: index == 0 ? 2 : 16,
                  paddingBottom: 6,
                }}
              >{t(group.titleKey)}</IOSText>
              {group.items.map(renderRow)}
            </View>
          ))
        }
      </ScrollView>
      <View style={{ width: hairline, backgroundColor: colors.rowSeparator }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: spacing.xxl, paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="always"
      >
        <IOSText size={22} weight="700" style={{ letterSpacing: 0.2, marginBottom: spacing.lg }}>
          {t(activeTitleKey)}
        </IOSText>
        <View style={{ marginHorizontal: -spacing.lg }}>
          <Main ref={mainRef} />
        </View>
      </ScrollView>
    </View>
  )
}
