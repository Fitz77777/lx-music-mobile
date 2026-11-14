import { memo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { iosPad } from '@/theme/ios/tokens'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'

export interface PadSidebarItem {
  id: string
  label: string
  icon: string
}

export interface PadSidebarGroup {
  label: string
  items: PadSidebarItem[]
}

interface Props {
  groups: PadSidebarGroup[]
  /** 固定在底部的入口（设置） */
  bottomItems: PadSidebarItem[]
  activeId: string
  onChange: (id: string) => void
}

/**
 * 平板侧边栏（原型 .sidebar）：替代底部标签栏。
 * 顶部应用名，中间分组入口列表，底部固定设置入口。
 * 无原生模糊库，用不透明底色 + hairline 分隔（面板保持不透明）。
 */
export default memo(({ groups, bottomItems, activeId, onChange }: Props) => {
  const { colors, accent, spacing, radius, hairline } = useIOSTheme()

  const renderTab = (item: PadSidebarItem) => {
    const active = item.id == activeId
    return (
      <Pressable
        key={item.id}
        accessibilityRole="tab"
        accessibilityState={{ selected: active }}
        onPress={() => { onChange(item.id) }}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          height: 44,
          marginHorizontal: spacing.sm,
          paddingHorizontal: 12,
          borderRadius: radius.control,
          backgroundColor: active ? colors.quaternaryFill : pressed ? colors.secondaryFill : 'transparent',
        })}
      >
        <IOSIcon name={item.icon} size={22} color={active ? accent : colors.label} />
        <IOSText
          size={16}
          weight={active ? '600' : '500'}
          color={active ? accent : colors.label}
          numberOfLines={1}
        >{item.label}</IOSText>
      </Pressable>
    )
  }

  const renderGroup = (group: PadSidebarGroup) => (
    <View key={group.label}>
      <IOSText
        variant="caption2"
        size={12}
        color={colors.secondaryLabel}
        style={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: 6,
        }}
      >{group.label}</IOSText>
      {group.items.map(renderTab)}
    </View>
  )

  return (
    <View style={{
      width: iosPad.sidebarWidth,
      height: '100%',
      backgroundColor: colors.barBackgroundOpaque,
      borderRightWidth: hairline,
      borderRightColor: colors.separator,
    }}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: spacing.xl,
      }}>
        <IOSIcon name="logo" size={20} color={accent} />
        <IOSText size={19} weight="700" style={{ letterSpacing: 0.6 }}>LX Music</IOSText>
      </View>
      <ScrollView
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ paddingBottom: spacing.sm }}
        showsVerticalScrollIndicator={false}
      >
        {groups.map(renderGroup)}
      </ScrollView>
      <View style={{ flex: 1 }} />
      <View style={{
        borderTopWidth: hairline,
        borderTopColor: colors.separator,
        paddingTop: spacing.md,
        paddingBottom: spacing.xl,
      }}>
        {bottomItems.map(renderTab)}
      </View>
    </View>
  )
})
