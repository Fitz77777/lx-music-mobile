import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export type DrawerKind = 'mylist' | 'leaderboard' | 'songlist'

/**
 * 侧栏宽度按 HIG 的常用比例，直接以 pt 计。
 * 榜单名较长，所以比 Android 版宽一些。
 */
const CONFIG = {
  mylist: { widthPercentage: 0.82, maxWidth: 340 },
  leaderboard: { widthPercentage: 0.78, maxWidth: 300 },
  songlist: { widthPercentage: 0.8, maxWidth: 420 },
} as const

/** iOS 抽屉外观：系统分组背景 + pt 宽度上限 */
export const useDrawerAppearance = (kind: DrawerKind) => {
  const { colors } = useIOSTheme()
  return {
    ...CONFIG[kind],
    backgroundColor: colors.groupedBackground,
  }
}
