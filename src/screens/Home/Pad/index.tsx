import { SafeAreaView, View } from 'react-native'
import { useI18n } from '@/lang'
import { NAV_MENUS } from '@/config/constant'
import { useNavActiveId } from '@/store/common/hook'
import { setNavActiveId } from '@/core/common'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { isHorizontalMode, isPadDevice } from '@/utils/tools'
import { iosPad, iosPadBottomInset } from '@/theme/ios/tokens'
import IOSBackdrop from '@/components/ios/Backdrop'
import IOSToast from '@/components/ios/Toast'
import PadPlayerBar from '@/components/player/PadPlayerBar'
import useWindowSize from '@/utils/hooks/useWindowSize'
import SizeView from '@/components/SizeView'
import Main from '../Vertical/Main'
import Header from '../IOS/Header'

import Sidebar, { type PadSidebarGroup, type PadSidebarItem } from './Sidebar'
import type { InitState } from '@/store/common/state'

/**
 * 平板主页外壳（原型 iPad 版）：侧边栏 + 内容区。
 * 侧边栏替代底部标签栏（设置固定在底部）；内容区沿用大标题头 + 分页视图，
 * 宽屏下列表内容限宽居中，迷你播放器悬浮在内容区右下。
 * 平板组件不区分平台，iPad 与 Android 平板共用此布局。
 */
export default () => {
  const t = useI18n()
  const activeId = useNavActiveId()
  const { colors } = useIOSTheme()
  const { width: winWidth, height: winHeight } = useWindowSize()
  // 宽屏（横屏 / 大内容区）下列表限宽居中；窄内容区不额外限宽
  const isLandscape = isPadDevice(winWidth, winHeight) && isHorizontalMode(winWidth, winHeight)

  const toItem = (id: string): PadSidebarItem => {
    const menu = NAV_MENUS.find(menu => menu.id == id)!
    return { id, label: t(menu.id), icon: menu.icon }
  }

  const groups: PadSidebarGroup[] = [
    {
      label: t('nav_group_library'),
      items: ['nav_songlist', 'nav_top', 'nav_love'].map(toItem),
    },
    {
      label: t('nav_discover'),
      items: ['nav_search'].map(toItem),
    },
  ]
  const bottomItems: PadSidebarItem[] = [toItem('nav_setting')]

  const handleChange = (id: string) => {
    setNavActiveId(id as InitState['navActiveId'])
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <IOSBackdrop />
      <SizeView />
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <SafeAreaView style={{ width: iosPad.sidebarWidth }}>
          <Sidebar
            groups={groups}
            bottomItems={bottomItems}
            activeId={activeId}
            onChange={handleChange}
          />
        </SafeAreaView>
        <View style={{ flex: 1, backgroundColor: colors.canvas }}>
          <SafeAreaView>
            <Header />
          </SafeAreaView>
          {/* 横屏下列表限宽居中，避免行内元素被拉得太开 */}
          <View style={{
            flex: 1,
            width: '100%',
            maxWidth: isLandscape ? iosPad.maxContentWidth : undefined,
            alignSelf: 'center',
            backgroundColor: colors.canvas,
          }}>
            <Main />
          </View>
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              left: iosPad.contentPadding,
              right: iosPad.contentPadding,
              bottom: iosPad.miniPlayerBottom,
            }}
          >
            <PadPlayerBar />
          </View>
        </View>
      </View>
      <IOSToast bottomOffset={iosPadBottomInset} />
    </View>
  )
}
