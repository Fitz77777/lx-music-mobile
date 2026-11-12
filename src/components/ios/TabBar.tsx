import { memo } from 'react'
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSIcon from './Icon'
import IOSText from './Text'

export interface TabBarItem {
  id: string
  label: string
  icon: string
}

export interface TabBarProps {
  items: readonly TabBarItem[]
  activeId: string
  onChange: (id: string) => void
  style?: StyleProp<ViewStyle>
}

/**
 * iOS 底部标签栏（56pt 内容高度，底部安全区由外层 SafeAreaView 提供）。
 * 注意：这里不使用 SafeAreaView，避免和页面容器的安全区重复计算。
 * 原型为 88pt 毛玻璃；项目未引入原生模糊库，这里用半透明栏底色近似。
 */
export default memo(({ items, activeId, onChange, style }: TabBarProps) => {
  const { colors, accent, hairline, barHeight } = useIOSTheme()

  return (
    <View
      style={[{
        height: barHeight.tabBar,
        flexDirection: 'row',
        backgroundColor: colors.barBackground,
        borderTopWidth: hairline,
        borderTopColor: colors.separator,
      }, style]}
    >
      {
        items.map(item => {
          const active = item.id == activeId
          const color = active ? accent : colors.secondaryLabel
          return (
            <Pressable
              key={item.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => { onChange(item.id) }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <IOSIcon name={item.icon} size={25} color={color} />
              <IOSText
                variant="caption2"
                size={10}
                color={color}
                numberOfLines={1}
                style={{ marginTop: 3 }}
              >{item.label}</IOSText>
            </Pressable>
          )
        })
      }
    </View>
  )
})
