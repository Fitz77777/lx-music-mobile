import { Navigation } from 'react-native-navigation'

/**
 * iOS 状态栏高度（RNN 原生常量）。
 *
 * 通过 Navigation.push 打开、且 statusBar.drawBehind 的二级页里，
 * RN 的 SafeAreaView 拿不到有效安全区（insets 为 0），
 * 这些页面需要用它手动做顶部避让。
 */
export const getIOSStatusBarHeight = (): number => {
  try {
    return Navigation.constantsSync().statusBarHeight || 0
  } catch {
    return 0
  }
}
