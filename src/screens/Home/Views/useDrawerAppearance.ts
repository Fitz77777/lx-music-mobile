import { useTheme } from '@/store/theme/hook'
import { scaleSizeW } from '@/utils/pixelRatio'

export type DrawerKind = 'mylist' | 'leaderboard' | 'songlist'

const CONFIG = {
  mylist: { widthPercentage: 0.82, maxWidth: scaleSizeW(400) },
  leaderboard: { widthPercentage: 0.82, maxWidth: scaleSizeW(200) },
  songlist: { widthPercentage: 0.8, maxWidth: scaleSizeW(560) },
} as const

/**
 * Android 抽屉外观：沿用 LX 主题背景与按屏幕缩放后的宽度上限。
 * iOS 版本见 useDrawerAppearance.ios.ts。
 */
export const useDrawerAppearance = (kind: DrawerKind) => {
  const theme = useTheme()
  return {
    ...CONFIG[kind],
    backgroundColor: theme['c-content-background'],
  }
}
