import { useMemo } from 'react'
import { useColorScheme, type ImageSourcePropType } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useSettingValue } from '@/store/setting/hook'
import { useBgPic } from '@/store/common/hook'
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
  /**
   * 页面背景图：自定义背景图优先，其次是主题自带的背景图。
   * 存在时 iOS 页面底色会变成半透明，让背景图透出来。
   */
  backdrop?: ImageSourcePropType
  isDark: boolean
  withAlpha: (color: string, alpha: number) => string
}

export const useIOSTheme = (): IOSTheme => {
  const theme = useTheme()
  // iOS 始终跟随系统外观：不使用 LX 主题里的亮暗标记，也不依赖「自动主题」开关。
  // LX 主题在这里只提供强调色。
  const scheme = useColorScheme()
  const isDark = scheme == 'dark'
  const bgPic = useBgPic()

  // 自定义背景图优先，其次使用主题配置里的背景图
  const backdrop = useMemo<ImageSourcePropType | undefined>(() => {
    if (bgPic) return { uri: bgPic }
    return theme['bg-image']
  }, [bgPic, theme])

  const colors = useMemo(() => {
    const base = getIOSColors(isDark)
    // 没有背景图时保持原本的分组灰；
    // 有背景图时只有页面画布变透明（背景图 + 蒙版由 Backdrop 绘制），
    // 分组底色/卡片/面板仍然不透明，保证文字可读。
    if (!backdrop) return base
    return { ...base, canvas: 'transparent' }
  }, [isDark, backdrop])

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
    backdrop,
    isDark,
    withAlpha,
  }), [theme, colors, accent, backdrop, isDark])
}
