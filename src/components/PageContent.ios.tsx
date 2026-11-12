import { SafeAreaView, View } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import SizeView from './SizeView'

interface Props {
  children: React.ReactNode
}

/**
 * iOS 页面容器：系统背景色，不渲染主题背景图。
 * 整屏（含上下安全区）使用同一个背景色，避免播放页/详情页出现上下色带。
 */
export default ({ children }: Props) => {
  const { colors } = useIOSTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SizeView />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {children}
        </View>
      </SafeAreaView>
    </View>
  )
}
