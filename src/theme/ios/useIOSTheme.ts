import { useMemo } from 'react'
import { useColorScheme } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'
import { getSelectedThemePrimary } from '@/theme/themes'
import {
  getIOSColors,
  iosBarHeight,
  iosHairline,
  iosMotion,
  iosRadius,
  iosRowHeight,
  iosSpacing,
  iosTypography,
  resolveIOSAccent,
  withAlpha,
  type IOSColors,
  type IOSTextStyle,
  type IOSTextStyleName,
} from './tokens'

export interface IOSTheme {
  /** 原始 LX 主题，仅在确实需要主题扩展色时使用 */
  theme: LX.ActiveTheme
  colors: IOSColors
  /** 强调色：优先取 LX 主题主色，不可用时回退系统蓝 */
  accent: string
  typography: Record<IOSTextStyleName, IOSTextStyle>
  spacing: typeof iosSpacing
  radius: typeof iosRadius
  rowHeight: typeof iosRowHeight
  barHeight: typeof iosBarHeight
  hairline: number
  motion: typeof iosMotion
  isDark: boolean
  withAlpha: (color: string, alpha: number) => string
}

export const useIOSTheme = (): IOSTheme => {
  const theme = useTheme()
  // iOS 始终跟随系统外观：不使用 LX 主题里的亮暗标记，也不依赖「自动主题」开关。
  // LX 主题在这里只提供强调色。
  const scheme = useColorScheme()
  const isDark = scheme == 'dark'
  const colors = useMemo(() => getIOSColors(isDark), [isDark])
  // 订阅主题选择：iOS 深色下基础主题被强制为内置深色主题，
  // 强调色仍需取用户真正选择的主题主色。
  const selectedThemeId = useSettingValue('theme.id')
  const accent = useMemo(
    () => resolveIOSAccent(getSelectedThemePrimary() ?? theme['c-primary'], isDark),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [theme, isDark, selectedThemeId],
  )

  return useMemo(() => ({
    theme,
    colors,
    accent,
    typography: iosTypography,
    spacing: iosSpacing,
    radius: iosRadius,
    rowHeight: iosRowHeight,
    barHeight: iosBarHeight,
    hairline: iosHairline,
    motion: iosMotion,
    isDark,
    withAlpha,
  }), [theme, colors, accent, isDark])
}
