import { useEffect, useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import { Navigation } from 'react-native-navigation'

import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { getIOSNavigationOptions } from '@/navigation/iosOptions'
import Basic from '@/screens/Home/Views/Setting/settings/Basic'
import Network from '@/screens/Home/Views/Setting/settings/Network'
import Player from '@/screens/Home/Views/Setting/settings/Player'
import LyricDesktop from '@/screens/Home/Views/Setting/settings/LyricDesktop'
import Search from '@/screens/Home/Views/Setting/settings/Search'
import List from '@/screens/Home/Views/Setting/settings/List'
import Sync from '@/screens/Home/Views/Setting/settings/Sync'
import Backup from '@/screens/Home/Views/Setting/settings/Backup'
import Other from '@/screens/Home/Views/Setting/settings/Other'
import Version from '@/screens/Home/Views/Setting/settings/Version'
import About from '@/screens/Home/Views/Setting/settings/About'
import { findIOSSettingSection } from '@/screens/Home/Views/Setting/iosSections'
import type { SettingScreenIds } from '@/screens/Home/Views/Setting/Main'

interface Props {
  componentId: string
  id: SettingScreenIds
}

const SettingContent = ({ id }: { id: SettingScreenIds }) => {
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
}

/**
 * iOS 设置二级页：原生大标题导航栏 + 系统分组背景。
 * 内容仍复用各设置分组组件，由 iOS 版设置原语负责外观。
 */
export default ({ componentId, id }: Props) => {
  const t = useI18n()
  const theme = useTheme()
  const { colors } = useIOSTheme()

  const title = useMemo(() => {
    const section = findIOSSettingSection(id)
    return section ? t(section.titleKey) : ''
  }, [id, t])

  useEffect(() => {
    if (!title) return
    Navigation.mergeOptions(componentId, getIOSNavigationOptions(theme, title))
  }, [componentId, theme, title])

  return (
    <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
        keyboardShouldPersistTaps="always"
        contentInsetAdjustmentBehavior="automatic"
      >
        <SettingContent id={id} />
      </ScrollView>
    </View>
  )
}
