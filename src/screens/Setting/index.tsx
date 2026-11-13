import { SafeAreaView, ScrollView, View } from 'react-native'

import { useIOSTheme } from '@/theme/ios/useIOSTheme'
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
 * iOS 设置二级页：原生导航栏已隐藏（无返回按钮、无标题），
 * 内容顶部由 SafeAreaView 让出状态栏，返回依赖系统左滑手势。
 */
export default ({ id }: Props) => {
  const { colors } = useIOSTheme()

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
      <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          keyboardShouldPersistTaps="always"
          contentInsetAdjustmentBehavior="never"
        >
          <SettingContent id={id} />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
