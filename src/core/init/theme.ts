
import { getAppearance, getIsSupportedAutoTheme, isAndroid, onAppearanceChange } from '@/utils/tools'
import { setShouldUseDarkColors, applyTheme } from '@/core/theme'
import { getTheme } from '@/theme/themes/index'
import settingState from '@/store/setting/state'
import commonState from '@/store/common/state'
import StatusBar from '@/components/common/StatusBar'
import { Navigation } from 'react-native-navigation'
// import { Dimensions, PixelRatio } from 'react-native'

const updateStatusBarStyle = (isDark: boolean) => {
  if (isAndroid) {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content')
    return
  }
  // iOS 下 RN 的 StatusBar 模块受 UIViewControllerBasedStatusBarAppearance 限制，
  // 需要通过 react-native-navigation 的 statusBar 选项更新已挂载页面的状态栏样式
  const style = isDark ? 'light' : 'dark'
  for (const componentId of Object.values(commonState.componentIds)) {
    if (componentId) Navigation.mergeOptions(componentId, { statusBar: { style } })
  }
}

export default async(setting: LX.AppSetting) => {
  if (getIsSupportedAutoTheme()) {
    setShouldUseDarkColors(getAppearance() == 'dark')

    onAppearanceChange(color => {
      setShouldUseDarkColors((color ?? 'light') == 'dark')
      if (settingState.setting['common.isAutoTheme']) void getTheme().then(applyTheme)
    })
  }

  applyTheme(await getTheme())

  global.state_event.on('themeUpdated', (theme) => {
    updateStatusBarStyle(theme.isDark)
  })
  // onDimensionChange(({ window }) => {
  //   let screenW = window.width
  //   let screenH = window.height
  //   if (screenW > screenH) {
  //     const temp = screenW
  //     screenW = screenH
  //     screenH = temp
  //   }
  //   global.lx.windowInfo.screenW = screenW
  //   global.lx.windowInfo.screenH = screenH
  //   global.lx.windowInfo.screenPxW = PixelRatio.getPixelSizeForLayoutSize(screenW)
  //   global.lx.windowInfo.screenPxH = PixelRatio.getPixelSizeForLayoutSize(screenH)
  //   console.log('change', global.lx.windowInfo)
  // })
}
