import { SafeAreaView, View } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import SizeView from './SizeView'

interface Props {
  children: React.ReactNode
}

/**
 * iOS 页面容器：系统背景色，不渲染主题背景图。
 * 安全区由 SafeAreaView 处理；导航栏/播放条所在区域使用 bar 背景色。
 */
export default ({ children }: Props) => {
  const { colors } = useIOSTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.barBackground }}>
      <SizeView />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  )
}
