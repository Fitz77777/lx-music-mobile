import type { Message } from '@/lang'
import type { SettingScreenIds } from './Main'

export interface IOSSettingSection {
  id: SettingScreenIds
  titleKey: keyof Message
  /** icomoon 图标名 */
  icon: string
  /** iOS 设置风格的彩色图标底色 */
  tint: string
}

export interface IOSSettingGroup {
  titleKey: keyof Message
  items: IOSSettingSection[]
}

/**
 * iOS 设置首页的分组结构。
 * 网络代理目前只有 Android 实现，因此 iOS 不展示 network 分组。
 */
export const IOS_SETTING_GROUPS: IOSSettingGroup[] = [
  {
    titleKey: 'setting_group_general',
    items: [
      { id: 'basic', titleKey: 'setting_basic', icon: 'setting', tint: '#8E8E93' },
    ],
  },
  {
    titleKey: 'setting_group_playback',
    items: [
      { id: 'player', titleKey: 'setting_player', icon: 'play', tint: '#FF3B30' },
      { id: 'lyric_desktop', titleKey: 'setting_lyric_desktop', icon: 'lyric-on', tint: '#FF9500' },
    ],
  },
  {
    titleKey: 'setting_group_content',
    items: [
      { id: 'search', titleKey: 'setting_search', icon: 'search-2', tint: '#007AFF' },
      { id: 'list', titleKey: 'setting_list', icon: 'list-order', tint: '#34C759' },
    ],
  },
  {
    titleKey: 'setting_group_data',
    items: [
      { id: 'sync', titleKey: 'setting_sync', icon: 'share', tint: '#5AC8FA' },
      { id: 'backup', titleKey: 'setting_backup', icon: 'sd-card', tint: '#AF52DE' },
    ],
  },
  {
    titleKey: 'setting_group_more',
    items: [
      { id: 'other', titleKey: 'setting_other', icon: 'dots-vertical', tint: '#8E8E93' },
      { id: 'version', titleKey: 'setting_version', icon: 'available_updates', tint: '#FF2D55' },
      { id: 'about', titleKey: 'setting_about', icon: 'logo', tint: '#5856D6' },
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
