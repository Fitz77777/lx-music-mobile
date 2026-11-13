import { SafeAreaView, View } from 'react-native'
import { useI18n } from '@/lang'
import { NAV_MENUS } from '@/config/constant'
import { useNavActiveId } from '@/store/common/hook'
import { setNavActiveId } from '@/core/common'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { type TabBarItem } from '@/components/ios/TabBar'
import IOSTabBar from '@/components/ios/TabBar'
import IOSToast from '@/components/ios/Toast'
import SizeView from '@/components/SizeView'
import PlayerBar from '@/components/player/PlayerBar'
import Main from '../Vertical/Main'
import Header from './Header'
import type { InitState } from '@/store/common/state'

/**
 * iOS 主页外壳：大标题 + 内容分页 + 浮动播放卡片 + 底部标签栏。
 * 不使用抽屉；页面内容仍复用 Vertical/Main 的懒加载分页逻辑。
 * 顶栏单独放在一个 SafeAreaView 里，内容区一直延伸到屏幕底部，
 * 迷你播放器与标签栏绝对定位覆盖在内容之上，形成沉浸式底栏。
 * 项目没有原生模糊库，底部浮层用不透明背板替代毛玻璃，
 * 避免列表内容从迷你播放器边缘和标签栏下方透出来（底部漏风）。
 */
export default () => {
  const t = useI18n()
  const activeId = useNavActiveId()
  const { colors } = useIOSTheme()

  const items: TabBarItem[] = NAV_MENUS.map(menu => ({
    id: menu.id,
    label: t(menu.id),
    icon: menu.icon,
  }))

  const handleChange = (id: string) => {
    setNavActiveId(id as InitState['navActiveId'])
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
      <SizeView />
      <SafeAreaView style={{ backgroundColor: colors.groupedBackground }}>
        <Header />
      </SafeAreaView>
      <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
        <Main />
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <PlayerBar isHome />
        <SafeAreaView style={{ backgroundColor: colors.barBackgroundOpaque }}>
          <IOSTabBar items={items} activeId={activeId} onChange={handleChange} />
        </SafeAreaView>
      </View>
      <IOSToast bottomOffset={168} />
    </View>
  )
}
