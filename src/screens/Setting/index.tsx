import { useMemo, useRef } from 'react'
import { Navigation } from 'react-native-navigation'
import { PanResponder, SafeAreaView, ScrollView, View } from 'react-native'

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
 * iOS 设置二级页：不显示标题和返回按钮，靠右滑手势返回。
 * 原生返回手势在隐藏导航栏时容易被列表的竖向滚动抢走（滑起来很生涩），
 * 这里自己接管右滑：横向位移明显时才拦截，竖向滚动不受影响。
 */
export default ({ componentId, id }: Props) => {
  const { colors } = useIOSTheme()
  const isPoppedRef = useRef(false)

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_evt, gesture) => {
      return !isPoppedRef.current && gesture.dx > 12 && gesture.dx > Math.abs(gesture.dy) * 1.6
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_evt, gesture) => {
      if (isPoppedRef.current) return
      if (gesture.dx > 72 || gesture.vx > 0.5) {
        isPoppedRef.current = true
        void Navigation.pop(componentId)
      }
    },
  }), [componentId])

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.groupedBackground }}
      {...panResponder.panHandlers}
    >
      <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
        <ScrollView
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="never"
        >
          <SettingContent id={id} />
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
