import { Appearance } from 'react-native'
import { type Options } from 'react-native-navigation'
import { getIOSColors, resolveIOSAccent } from '@/theme/ios/tokens'

/**
 * iOS 原生导航栏选项：大标题 + 毛玻璃背景 + 系统返回按钮。
 * 只用于 iOS，Android 继续使用各页面现有的自定义头部。
 * 亮暗跟随系统外观，LX 主题只提供强调色。
 */
export const getIOSNavigationOptions = (theme: LX.ActiveTheme, title?: string): Options => {
  const isDark = Appearance.getColorScheme() == 'dark'
  const colors = getIOSColors(isDark)
  const accent = resolveIOSAccent(theme['c-primary'], isDark)

  return {
    topBar: {
      visible: true,
      drawBehind: false,
      animate: true,
      noBorder: true,
      background: {
        color: colors.barBackgroundOpaque,
        translucent: true,
        blur: true,
      },
      title: {
        text: title,
        color: colors.label,
        fontSize: 17,
        fontWeight: 'bold',
      },
      largeTitle: {
        visible: true,
        color: colors.label,
        fontSize: 34,
        fontWeight: 'bold',
      },
      backButton: {
        color: accent,
        showTitle: true,
        title: global.i18n.t('back'),
      },
      leftButtonColor: accent,
      rightButtonColor: accent,
    },
    statusBar: {
      style: isDark ? 'light' : 'dark',
      animate: true,
    },
    layout: {
      componentBackgroundColor: colors.groupedBackground,
    },
  }
}
