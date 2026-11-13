/** 各在线音源的品牌色，用于弹出菜单里的圆点（原型 .src-pop .dot） */
const SOURCE_COLORS: Record<string, string> = {
  kw: '#FF8B00',
  kg: '#2CA2F9',
  tx: '#31C27C',
  qq: '#31C27C',
  wy: '#D33A31',
  mg: '#FF5A5F',
  bd: '#2932E1',
  all: '#AF52DE',
}

/** 聚合搜索用多彩圆点近似原型里的 conic-gradient */
const FALLBACK_COLOR = '#8E8E93'

export const getSourceColor = (source: string) => SOURCE_COLORS[source] ?? FALLBACK_COLOR
