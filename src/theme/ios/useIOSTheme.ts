import { useMemo } from 'react'
import { useTheme } from '@/store/theme/hook'
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
  const isDark = theme.isDark
  const colors = useMemo(() => getIOSColors(isDark), [isDark])
  const accent = useMemo(() => resolveIOSAccent(theme['c-primary'], isDark), [theme, isDark])

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
