import { forwardRef, useImperativeHandle, useMemo, useState } from 'react'
import { Platform } from 'react-native'

import Basic from './settings/Basic'
import Network from './settings/Network'
import Player from './settings/Player'
import LyricDesktop from './settings/LyricDesktop'
import Search from './settings/Search'
import List from './settings/List'
import Sync from './settings/Sync'
import Backup from './settings/Backup'
import Other from './settings/Other'
import Version from './settings/Version'
import About from './settings/About'

export const SETTING_SCREENS = [
  'basic',
  'network',
  'player',
  'lyric_desktop',
  'search',
  'list',
  'sync',
  'backup',
  'other',
  'version',
  'about',
] as const

export type SettingScreenIds = typeof SETTING_SCREENS[number]

// 网络代理目前只有 Android 实现，其它平台不展示该分组
export const VISIBLE_SETTING_SCREENS: SettingScreenIds[] = Platform.OS == 'android'
  ? [...SETTING_SCREENS]
  : SETTING_SCREENS.filter(id => id != 'network')

// interface MainProps {
//   onUpdateActiveId: (id: string) => void
// }
export interface MainType {
  setActiveId: (id: SettingScreenIds) => void
}

const Main = forwardRef<MainType, {}>((props, ref) => {
  const [id, setId] = useState(global.lx.settingActiveId)

  useImperativeHandle(ref, () => ({
    setActiveId(id) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setId(id)
        })
      })
    },
  }))

  const component = useMemo(() => {
    switch (id) {
      case 'player': return <Player />
      case 'lyric_desktop': return <LyricDesktop />
      case 'search': return <Search />
      case 'list': return <List />
      case 'sync': return <Sync />
      case 'backup': return <Backup />
      case 'other': return <Other />
      case 'version': return <Version />
      case 'about': return <About />
      case 'network': return <Network />
      case 'basic':
      default: return <Basic />
    }
  }, [id])

  return component
})


export default Main

