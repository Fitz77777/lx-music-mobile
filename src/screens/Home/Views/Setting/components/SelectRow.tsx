import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Pressable, View, type View as ViewType } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSPopover, { type IOSPopoverItem } from '@/components/ios/Popover'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface SelectRowOption {
  value: string
  label: string
  /** 左侧圆点颜色（主题色等） */
  color?: string
  /** 次要说明文字（版本号、状态等） */
  description?: string
}

export interface SelectRowProps {
  label: string
  value: string
  options: readonly SelectRowOption[]
  onSelect: (value: string) => void
  disabled?: boolean
}

/**
 * iOS 设置选择行：左侧标题，右侧当前值 + 下拉箭头。
 * 点击后贴着行弹出下拉菜单，选中即关闭（原型设置页交互）。
 */
export default memo(({ label, value, options, onSelect, disabled = false }: SelectRowProps) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const [visible, setVisible] = useState(false)
  const anchorRef = useRef<ViewType>(null)

  const selected = useMemo(() => options.find(item => item.value == value), [options, value])
  const items = useMemo<IOSPopoverItem[]>(() => options.map(item => ({
    key: item.value,
    label: item.label,
    color: item.color,
    description: item.description,
    selected: item.value == value,
  })), [options, value])

  const handleSelect = useCallback((key: string) => {
    setVisible(false)
    if (key == value) return
    onSelect(key)
  }, [onSelect, value])

  return (
    <View ref={anchorRef} collapsable={false}>
      <Pressable
        onPress={() => { setVisible(true) }}
        disabled={disabled}
        accessibilityRole="button"
        style={({ pressed }) => ({
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md - 1,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: disabled ? 0.45 : pressed ? 0.55 : 1,
        })}
      >
        <IOSText variant="callout" numberOfLines={1} style={{ flex: 1, marginRight: spacing.sm }}>{label}</IOSText>
        {selected?.color
          ? (
              <View style={{
                width: 13,
                height: 13,
                borderRadius: 8,
                marginRight: 7,
                backgroundColor: selected.color,
                borderWidth: hairline,
                borderColor: colors.separator,
              }} />
            )
          : null}
        <IOSText variant="callout" color={colors.secondaryLabel} numberOfLines={1} style={{ flexShrink: 1 }}>
          {selected?.label ?? ''}
        </IOSText>
        <IOSIcon
          name="chevron-right"
          size={13}
          color={colors.tertiaryLabel}
          style={{ marginLeft: 6, transform: [{ rotate: '90deg' }] }}
        />
      </Pressable>
      <IOSPopover
        visible={visible}
        onClose={() => { setVisible(false) }}
        anchorRef={anchorRef}
        items={items}
        onSelect={handleSelect}
        minWidth={220}
      />
    </View>
  )
})
