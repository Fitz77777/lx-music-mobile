/**
 * iOS 设计令牌（经典 HIG）
 *
 * 这里的尺寸全部使用 iOS point，不经过 Android 的 scaleSize/setSpText 缩放。
 * 颜色遵循 Apple 系统语义色，亮/暗两套，供 iOS 视图层使用。
 */
import { StyleSheet, type TextStyle } from 'react-native'

export interface IOSColors {
  // 背景
  background: string
  secondaryBackground: string
  tertiaryBackground: string
  /**
   * 页面画布底色：没有主题背景图时等于 groupedBackground；
   * 有背景图时为 transparent，让最底层的背景图透出来。
   */
  canvas: string
  /**
   * 页面底色（原型 --bg，分组灰）。
   * 亮色 #F2F2F7 / 暗色 #000000，卡片用 secondaryGroupedBackground。
   */
  groupedBackground: string
  /** 卡片底色（原型 --card） */
  secondaryGroupedBackground: string
  tertiaryGroupedBackground: string
  /** 卡片内行按下时的底色 */
  cardPressed: string

  // 文本
  label: string
  secondaryLabel: string
  tertiaryLabel: string
  quaternaryLabel: string
  placeholderText: string

  // 分隔线
  separator: string
  opaqueSeparator: string
  /** 卡片内的行分隔线（原型 --separator） */
  rowSeparator: string

  // 填充
  fill: string
  secondaryFill: string
  tertiaryFill: string
  quaternaryFill: string

  // 固定系统色
  systemBlue: string
  systemGreen: string
  systemRed: string
  systemOrange: string
  systemYellow: string
  systemPurple: string
  systemGray: string

  // 设置图标 / 开关
  /** 设置行图标底色（中性灰） */
  iconTileBackground: string
  /** 设置行图标颜色 */
  iconTileForeground: string
  /** 开关关闭态轨道色 */
  switchTrackOff: string

  // 导航栏 / 标签栏
  /**
   * 导航栏 / 标签栏 / 底部浮层背板底色。
   * 项目没有原生模糊库，用不透明底色替代毛玻璃，避免内容从栏后透出。
   */
  barBackgroundOpaque: string

  // 遮罩 / 阴影
  overlay: string
  shadow: string

  // Toast
  toastBackground: string
  toastLabel: string
}

export const iosColorsLight: IOSColors = {
  background: '#FFFFFF',
  secondaryBackground: '#F2F2F7',
  tertiaryBackground: '#FFFFFF',
  canvas: '#F2F2F7',
  groupedBackground: '#F2F2F7',
  secondaryGroupedBackground: '#FFFFFF',
  tertiaryGroupedBackground: '#F2F2F7',
  cardPressed: '#F2F2F7',

  label: '#000000',
  secondaryLabel: 'rgba(60, 60, 67, 0.6)',
  tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
  quaternaryLabel: 'rgba(60, 60, 67, 0.18)',
  placeholderText: 'rgba(60, 60, 67, 0.3)',

  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',
  rowSeparator: 'rgba(60, 60, 67, 0.12)',

  fill: 'rgba(120, 120, 128, 0.2)',
  secondaryFill: 'rgba(120, 120, 128, 0.16)',
  tertiaryFill: 'rgba(118, 118, 128, 0.12)',
  quaternaryFill: 'rgba(116, 116, 128, 0.08)',

  systemBlue: '#007AFF',
  systemGreen: '#34C759',
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemPurple: '#AF52DE',
  systemGray: '#8E8E93',

  iconTileBackground: 'rgba(120, 120, 128, 0.13)',
  iconTileForeground: '#6E6E73',
  switchTrackOff: '#E9E9EB',

  barBackgroundOpaque: '#F9F9F9',

  overlay: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.12)',

  toastBackground: 'rgba(28, 28, 30, 0.92)',
  toastLabel: '#FFFFFF',
}

export const iosColorsDark: IOSColors = {
  background: '#000000',
  secondaryBackground: '#1C1C1E',
  tertiaryBackground: '#2C2C2E',
  canvas: '#000000',
  groupedBackground: '#000000',
  secondaryGroupedBackground: '#1C1C1E',
  tertiaryGroupedBackground: '#2C2C2E',
  cardPressed: '#2C2C2E',

  label: '#FFFFFF',
  secondaryLabel: 'rgba(235, 235, 245, 0.6)',
  tertiaryLabel: 'rgba(235, 235, 245, 0.3)',
  quaternaryLabel: 'rgba(235, 235, 245, 0.16)',
  placeholderText: 'rgba(235, 235, 245, 0.3)',

  separator: 'rgba(84, 84, 88, 0.6)',
  opaqueSeparator: '#38383A',
  rowSeparator: 'rgba(84, 84, 88, 0.65)',

  fill: 'rgba(120, 120, 128, 0.36)',
  secondaryFill: 'rgba(120, 120, 128, 0.32)',
  tertiaryFill: 'rgba(118, 118, 128, 0.24)',
  quaternaryFill: 'rgba(118, 118, 128, 0.18)',

  systemBlue: '#0A84FF',
  systemGreen: '#30D158',
  systemRed: '#FF453A',
  systemOrange: '#FF9F0A',
  systemYellow: '#FFD60A',
  systemPurple: '#BF5AF2',
  systemGray: '#8E8E93',

  iconTileBackground: 'rgba(120, 120, 128, 0.24)',
  iconTileForeground: '#AEAEB2',
  switchTrackOff: 'rgba(120, 120, 128, 0.32)',

  barBackgroundOpaque: '#161618',

  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.5)',

  toastBackground: 'rgba(58, 58, 60, 0.94)',
  toastLabel: '#FFFFFF',
}

export const getIOSColors = (isDark: boolean): IOSColors => isDark ? iosColorsDark : iosColorsLight

export type IOSTextStyleName =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2'

export interface IOSTextStyle {
  fontSize: number
  lineHeight: number
  fontWeight: TextStyle['fontWeight']
  letterSpacing?: number
}

/** Apple 默认文本样式（SF Pro，pt） */
export const iosTypography: Record<IOSTextStyleName, IOSTextStyle> = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700', letterSpacing: 0.37 },
  title1: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: 0.36 },
  title2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.26 },
  title3: { fontSize: 20, lineHeight: 25, fontWeight: '600', letterSpacing: -0.45 },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.41 },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400', letterSpacing: -0.41 },
  callout: { fontSize: 16, lineHeight: 21, fontWeight: '400', letterSpacing: -0.32 },
  subheadline: { fontSize: 15, lineHeight: 20, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400', letterSpacing: -0.08 },
  caption1: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  caption2: { fontSize: 11, lineHeight: 13, fontWeight: '400', letterSpacing: 0.07 },
}

export const iosSpacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const

export const iosRadius = {
  small: 6,
  medium: 10,
  large: 14,
  /** 列表卡片 */
  card: 12,
  /** 歌曲行封面 */
  cover: 8,
  /** 歌单网格封面 */
  coverLarge: 14,
  sheet: 22,
  popover: 14,
  miniPlayer: 16,
  pill: 999,
} as const

/** 1 物理像素（2x/3x 屏为 0.5pt） */
export const iosHairline = StyleSheet.hairlineWidth

export const iosRowHeight = {
  /** 只有标题 */
  standard: 44,
  /** 标题 + 副标题 */
  subtitle: 52,
  /** 标题 + 副标题 + 封面 */
  artwork: 60,
  /** 歌曲行（原型 68pt / 封面 56pt） */
  song: 68,
  /** 设置行（原型 48pt） */
  setting: 48,
} as const

export const iosBarHeight = {
  navBar: 44,
  largeTitle: 52,
  tabBar: 54,
  searchBar: 36,
  segmented: 32,
  playerBar: 56,
  /** 浮动迷你播放器卡片 */
  miniPlayer: 60,
} as const

/**
 * 首页内容底部留白：浮动迷你播放器 + 标签栏 + 底部安全区。
 * 列表内容可以滚到这两层浮层下面，最后一行仍能完整露出。
 */
export const iosHomeBottomInset = 168

export const iosMotion = {
  pressOpacity: 0.55,
  fast: 180,
  normal: 260,
  spring: {
    damping: 22,
    stiffness: 250,
    mass: 0.9,
  },
} as const

/** 给颜色追加透明度，支持 #rgb / #rrggbb / rgb() / rgba() */
export const withAlpha = (color: string, alpha: number): string => {
  const rgba = parseColor(color)
  if (!rgba) return color
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${alpha})`
}

/** 解析颜色为 [r, g, b] */
export const parseColor = (color: string): [number, number, number] | null => {
  const value = color.trim()
  if (value.startsWith('#')) {
    const hex = value.slice(1)
    if (hex.length == 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ]
    }
    if (hex.length == 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ]
    }
    return null
  }

  const match = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/** 相对亮度，用于判断强调色在亮/暗背景下是否可用 */
export const relativeLuminance = (color: string): number | null => {
  const rgb = parseColor(color)
  if (!rgb) return null
  const [r, g, b] = rgb.map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 把 LX 主题主色转成 iOS 强调色。
 * 主色过亮（浅色模式）或过暗（深色模式）时对比度不足，回退系统蓝。
 */
export const resolveIOSAccent = (primary: string, isDark: boolean): string => {
  const colors = getIOSColors(isDark)
  const luminance = relativeLuminance(primary)
  if (luminance == null) return colors.systemBlue
  if (isDark ? luminance < 0.16 : luminance > 0.82) return colors.systemBlue
  return primary
}
