import { memo, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react'
import { AppState, View } from 'react-native'

import Header from './components/Header'
import Pic from './components/Pic'
import PlayInfo from './components/PlayInfo'
import ControlBtn from './components/ControlBtn'
import MoreBtn from './components/MoreBtn'
import Lyric from '../Vertical/Lyric'
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view'
import { screenkeepAwake, screenUnkeepAwake } from '@/utils/nativeModules/utils'
import { useWindowSize } from '@/utils/hooks'
import commonState, { type InitState as CommonState } from '@/store/common/state'
import { isHorizontalMode } from '@/utils/tools'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { iosPad } from '@/theme/ios/tokens'

/**
 * 平板播放页（原型 iPad 版）：
 * - 竖屏：沿用手机纵向布局（封面 / 歌词左右滑动 + 底部控制）；
 * - 横屏：左右分栏——左侧封面，右栏为歌词 + 控制，无需滑动。
 * 平板组件不区分平台；滑动封面下拉近收起在两种方向都可用。
 */

const Player = memo(() => {
  return (
    <View
      style={{ flex: 0, width: '100%', flexDirection: 'column', paddingBottom: 22 }}
      nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_player}
    >
      <PlayInfo />
      <ControlBtn />
      <MoreBtn />
    </View>
  )
})

const LyricPane = ({ active }: { active: number }) => {
  const initedRef = useRef(false)
  const lyric = useMemo(() => <Lyric />, [])
  if (active == 1) {
    if (!initedRef.current) initedRef.current = true
    return lyric
  }
  return initedRef.current ? lyric : null
}

export default memo(({ componentId }: { componentId: string }) => {
  const { width: winWidth, height: winHeight } = useWindowSize()
  const isLandscape = isHorizontalMode(winWidth, winHeight)
  const [pageIndex, setPageIndex] = useState(0)
  const showLyricRef = useRef(false)
  const pagerViewRef = useRef<ComponentRef<typeof PagerView>>(null)

  const onPageSelected = ({ nativeEvent }: PagerViewOnPageSelectedEvent) => {
    setPageIndex(nativeEvent.position)
    showLyricRef.current = nativeEvent.position == 1
    if (showLyricRef.current) {
      screenkeepAwake()
    } else {
      screenUnkeepAwake()
    }
  }

  useEffect(() => {
    const appstateListener = AppState.addEventListener('change', (state) => {
      switch (state) {
        case 'active':
          if (showLyricRef.current && !commonState.componentIds.comment) screenkeepAwake()
          break
        case 'background':
          screenUnkeepAwake()
          break
      }
    })

    const handleComponentIdsChange = (ids: CommonState['componentIds']) => {
      if (ids.comment) screenUnkeepAwake()
      else if (AppState.currentState == 'active') screenkeepAwake()
    }

    global.state_event.on('componentIdsUpdated', handleComponentIdsChange)

    return () => {
      global.state_event.off('componentIdsUpdated', handleComponentIdsChange)
      appstateListener.remove()
      screenUnkeepAwake()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 横屏歌词常驻，保持屏幕常亮
  useEffect(() => {
    if (!isLandscape) return
    screenkeepAwake()
    return () => {
      screenUnkeepAwake()
    }
  }, [isLandscape])

  if (isLandscape) {
    return (
      <>
        <Header />
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <Pic componentId={componentId} />
          </View>
          <View style={{
            width: iosPad.playerLandscapeSideWidth,
            maxWidth: '55%',
            justifyContent: 'center',
            paddingHorizontal: 10,
          }}>
            <View style={{ flexShrink: 1, maxHeight: 360 }}>
              <Lyric />
            </View>
            <Player />
          </View>
        </View>
      </>
    )
  }

  return (
    <>
      <Header />
      <View style={{ flex: 1, flexDirection: 'column' }}>
        <PagerView
          ref={pagerViewRef}
          onPageSelected={onPageSelected}
          style={{ flex: 1 }}
        >
          <View collapsable={false}>
            <Pic componentId={componentId} />
          </View>
          <View collapsable={false}>
            <LyricPane active={pageIndex} />
          </View>
        </PagerView>
        <Player />
      </View>
    </>
  )
})
