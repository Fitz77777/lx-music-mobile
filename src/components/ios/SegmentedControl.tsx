import { memo, useEffect, useRef, useState } from 'react'
import { Animated, Pressable, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'

export interface SegmentedControlProps {
  values: readonly string[]
  selectedIndex: number
  onChange: (index: number) => void
  style?: StyleProp<ViewStyle>
  /** 更紧凑的尺寸，用于工具栏 */
  small?: boolean
}

const HEIGHT = 32
const SMALL_HEIGHT = 28
const PADDING = 2

/** iOS 分段控件（UISegmentedControl 风格） */
export default memo(({ values, selectedIndex, onChange, style, small = false }: SegmentedControlProps) => {
  const { colors, isDark, typography } = useIOSTheme()
  const height = small ? SMALL_HEIGHT : HEIGHT
  const thumbHeight = height - PADDING * 2
  const cornerRadius = small ? 8 : 9
  const [width, setWidth] = useState(0)
  const animation = useRef(new Animated.Value(selectedIndex)).current

  const thumbWidth = width > 0 ? (width - PADDING * 2) / Math.max(values.length, 1) : 0

  useEffect(() => {
    Animated.timing(animation, {
      toValue: selectedIndex,
      duration: 180,
      useNativeDriver: true,
    }).start()
  }, [animation, selectedIndex])

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width)
  }

  const translateX = animation.interpolate({
    inputRange: values.length > 1 ? values.map((_, index) => index) : [0, 1],
    outputRange: values.length > 1 ? values.map((_, index) => index * thumbWidth) : [0, 0],
    extrapolate: 'clamp',
  })

  return (
    <View
      onLayout={handleLayout}
      style={[{
        height,
        borderRadius: cornerRadius,
        padding: PADDING,
        backgroundColor: colors.tertiaryFill,
        flexDirection: 'row',
      }, style]}
    >
      {width > 0
        ? (
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: PADDING,
                left: PADDING,
                width: thumbWidth,
                height: thumbHeight,
                borderRadius: cornerRadius - 1,
                backgroundColor: isDark ? '#636366' : '#FFFFFF',
                transform: [{ translateX }],
                shadowColor: '#000',
                shadowOpacity: isDark ? 0 : 0.12,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
              }}
            />
          )
        : null}
      {
        values.map((value, index) => {
          const selected = index == selectedIndex
          return (
            <Pressable
              key={`${index}-${value}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => { onChange(index) }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <IOSText
                variant={small ? 'footnote' : 'subheadline'}
                size={small ? typography.footnote.fontSize : 13}
                weight={selected ? '600' : '400'}
                color={selected ? colors.label : colors.secondaryLabel}
                numberOfLines={1}
              >{value}</IOSText>
            </Pressable>
          )
        })
      }
    </View>
  )
})
