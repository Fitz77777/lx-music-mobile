import { SafeAreaView, View } from 'react-native'
import { useI18n } from '@/lang'
import { NAV_MENUS } from '@/config/constant'
import { useNavActiveId } from '@/store/common/hook'
import { setNavActiveId } from '@/core/common'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { type TabBarItem } from '@/components/ios/TabBar'
import IOSTabBar from '@/components/ios/TabBar'
import SizeView from '@/components/SizeView'
import PlayerBar from '@/components/player/PlayerBar'
import Main from '../Vertical/Main'
import Header from './Header'
import type { InitState } from '@/store/common/state'

/**
 * iOS 主页外壳：大标题 + 内容分页 + 播放条 + 底部标签栏。
 * 不使用抽屉；页面内容仍复用 Vertical/Main 的懒加载分页逻辑。
 * 整个外壳放在同一个 SafeAreaView 里，安全区只在最上方和最下方各生效一次，
 * 避免顶栏/标签栏各自叠加上下内边距。
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SizeView />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.barBackground }}>
        <Header />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <Main />
        </View>
        <PlayerBar isHome />
        <IOSTabBar items={items} activeId={activeId} onChange={handleChange} />
      </SafeAreaView>
    </View>
  )
}
