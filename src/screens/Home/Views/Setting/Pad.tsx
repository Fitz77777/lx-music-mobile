import { useMemo, useRef, useState } from 'react'
import { Pressable, Platform, ScrollView, View } from 'react-native'

import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import Main, { type MainType } from './Main'
import { IOS_SETTING_GROUPS, type IOSSettingGroup, type IOSSettingSection } from './iosSections'

/**
 * 平板设置（原型 .set-split）：左侧入口列表常驻，右侧就地展开，无二级页与返回。
 * 分组结构沿用 iOS 设置首页的 iosSections；Android 平板额外补上
 * 桌面歌词与网络设置（仅 Android 实现的设置项）。
 */
const ANDROID_EXTRA_SECTIONS: Record<string, IOSSettingSection> = {
  lyric_desktop: { id: 'lyric_desktop', titleKey: 'setting_lyric_desktop', icon: 'lyric-on' },
  network: { id: 'network', titleKey: 'setting_network', icon: 'slider' },
}

const buildGroups = (): IOSSettingGroup[] => {
  if (Platform.OS != 'android') return IOS_SETTING_GROUPS
  return IOS_SETTING_GROUPS.map((group) => {
    const items = [...group.items]
    if (group.titleKey == 'setting_group_playback') items.push(ANDROID_EXTRA_SECTIONS.lyric_desktop)
    if (group.titleKey == 'setting_group_data') items.unshift(ANDROID_EXTRA_SECTIONS.network)
    return { titleKey: group.titleKey, items }
  })
}

const TILE_SIZE = 26

export default () => {
  const t = useI18n()
  const { colors, accent, spacing, radius, hairline, withAlpha } = useIOSTheme()
  const mainRef = useRef<MainType>(null)
  const groups = useMemo(buildGroups, [])
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
          gap: 10,
          minHeight: 44,
          marginRight: spacing.sm,
          paddingHorizontal: 10,
          borderRadius: radius.control,
          backgroundColor: active ? colors.quaternaryFill : pressed ? colors.secondaryFill : 'transparent',
        })}
      >
        <View style={{
          width: TILE_SIZE,
          height: TILE_SIZE,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? withAlpha(accent, 0.16) : colors.iconTileBackground,
        }}>
          <IOSIcon name={item.icon} size={17} color={active ? accent : colors.iconTileForeground} />
        </View>
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
      <View style={{ width: hairline, backgroundColor: colors.separator }} />
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
