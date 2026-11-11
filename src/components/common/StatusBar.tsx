import { useTheme } from '@/store/theme/hook'
import { Platform, StatusBar as RNStatusBar } from 'react-native'

const StatusBar = function() {
  const theme = useTheme()
  // iOS 的状态栏样式由 react-native-navigation 的 statusBar 选项控制，
  // RN 的 StatusBar 模块在 UIViewControllerBasedStatusBarAppearance=true 时无法生效
  if (Platform.OS != 'android') return null
  const statusBarStyle = theme.isDark ? 'light-content' : 'dark-content'
  return <RNStatusBar backgroundColor="rgba(0,0,0,0)" barStyle={statusBarStyle} translucent={Platform.OS == 'android'} />
}

StatusBar.currentHeight = RNStatusBar.currentHeight ?? 0
StatusBar.setBarStyle = RNStatusBar.setBarStyle

export default StatusBar
