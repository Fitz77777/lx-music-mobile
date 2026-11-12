import type { Message } from '@/lang'
import type { SettingScreenIds } from './Main'

export interface IOSSettingSection {
  id: SettingScreenIds
  titleKey: keyof Message
  /** icomoon 图标名 */
  icon: string
}

export interface IOSSettingGroup {
  titleKey: keyof Message
  items: IOSSettingSection[]
}

/**
 * iOS 设置首页的分组结构。
 * 网络代理目前只有 Android 实现，因此 iOS 不展示 network 分组。
 * 图标统一使用中性灰底 + 线性图标（原型规范），不再使用彩色方块。
 */
export const IOS_SETTING_GROUPS: IOSSettingGroup[] = [
  {
    titleKey: 'setting_group_general',
    items: [
      { id: 'basic', titleKey: 'setting_basic', icon: 'setting' },
    ],
  },
  {
    titleKey: 'setting_group_playback',
    items: [
      { id: 'player', titleKey: 'setting_player', icon: 'play' },
      // 桌面歌词仅有 Android 原生实现，iOS 不展示该入口
    ],
  },
  {
    titleKey: 'setting_group_content',
    items: [
      { id: 'search', titleKey: 'setting_search', icon: 'search-2' },
      { id: 'list', titleKey: 'setting_list', icon: 'list-order' },
    ],
  },
  {
    titleKey: 'setting_group_data',
    items: [
      { id: 'sync', titleKey: 'setting_sync', icon: 'share' },
      { id: 'backup', titleKey: 'setting_backup', icon: 'sd-card' },
    ],
  },
  {
    titleKey: 'setting_group_more',
    items: [
      { id: 'other', titleKey: 'setting_other', icon: 'dots-vertical' },
      { id: 'version', titleKey: 'setting_version', icon: 'available_updates' },
      { id: 'about', titleKey: 'setting_about', icon: 'logo' },
    ],
  },
]

export const findIOSSettingSection = (id: SettingScreenIds): IOSSettingSection | undefined => {
  for (const group of IOS_SETTING_GROUPS) {
    const item = group.items.find(item => item.id == id)
    if (item) return item
  }
  return undefined
}
