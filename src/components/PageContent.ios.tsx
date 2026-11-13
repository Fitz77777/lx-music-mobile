import { SafeAreaView, View } from 'react-native'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSToast from './ios/Toast'
import IOSBackdrop from './ios/Backdrop'
import SizeView from './SizeView'

interface Props {
  children: React.ReactNode
}

/**
 * iOS 页面容器：分组灰背景，不渲染主题背景图。
 * 整屏（含上下安全区）使用同一个背景色，避免播放页/详情页出现上下色带。
 */
export default ({ children }: Props) => {
  const { colors } = useIOSTheme()

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <IOSBackdrop />
      <SizeView />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
        <View style={{ flex: 1, backgroundColor: colors.canvas }}>
          {children}
        </View>
      </SafeAreaView>
      <IOSToast />
    </View>
  )
}
