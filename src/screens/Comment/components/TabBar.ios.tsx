import { memo, useMemo } from 'react'
import { Pressable, View } from 'react-native'

import IOSIcon from '@/components/ios/Icon'
import IOSSegmentedControl from '@/components/ios/SegmentedControl'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export type CommentTabId = 'hot' | 'new'

export interface TabBarProps {
  tabs: ReadonlyArray<{ id: CommentTabId, label: string }>
  activeId: CommentTabId
  onTabChange: (id: CommentTabId) => void
  onRefresh: () => void
}

/** iOS 评论页标签栏：分段控件 + 刷新按钮 */
export default memo(({ tabs, activeId, onTabChange, onRefresh }: TabBarProps) => {
  const { colors, spacing } = useIOSTheme()
  const values = useMemo(() => tabs.map(tab => tab.label), [tabs])
  const selectedIndex = useMemo(() => Math.max(tabs.findIndex(tab => tab.id == activeId), 0), [tabs, activeId])

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    }}>
      <View style={{ flex: 1 }}>
        <IOSSegmentedControl
          values={values}
          selectedIndex={selectedIndex}
          onChange={index => { onTabChange(tabs[index].id) }}
        />
      </View>
      <Pressable
        onPress={onRefresh}
        hitSlop={8}
        accessibilityRole="button"
        style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
      >
        <IOSIcon name="available_updates" size={20} color={colors.secondaryLabel} />
      </Pressable>
    </View>
  )
})
