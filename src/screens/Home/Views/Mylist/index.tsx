import { useEffect, useRef } from 'react'
import settingState from '@/store/setting/state'
import MusicList from './MusicList'
import MyList from './MyList'
import DrawerLayoutFixed, { type DrawerLayoutFixedType } from '@/components/common/DrawerLayoutFixed'
import { COMPONENT_IDS } from '@/config/constant'
import { useDrawerAppearance } from '../useDrawerAppearance'
import type { InitState as CommonState } from '@/store/common/state'

export default () => {
  const drawer = useRef<DrawerLayoutFixedType>(null)
  const { backgroundColor: drawerBackgroundColor, maxWidth, widthPercentage } = useDrawerAppearance('mylist')
  // const [width, setWidth] = useState(0)

  useEffect(() => {
    const handleFixDrawer = (id: CommonState['navActiveId']) => {
      if (id == 'nav_love') drawer.current?.fixWidth()
    }
    const changeVisible = (visible: boolean) => {
      if (visible) {
        requestAnimationFrame(() => {
          drawer.current?.openDrawer()
        })
      } else {
        drawer.current?.closeDrawer()
      }
    }

    // setWidth(getWindowSise().width * 0.82)

    global.state_event.on('navActiveIdUpdated', handleFixDrawer)
    global.app_event.on('changeLoveListVisible', changeVisible)

    // 就放旋转屏幕后的宽度没有更新的问题
    // const changeEvent = onDimensionChange(({ window }) => {
    //   setWidth(window.width * 0.82)
    //   drawer.current?.setNativeProps({
    //     width: window.width,
    //   })
    // })

    return () => {
      global.state_event.off('navActiveIdUpdated', handleFixDrawer)
      global.app_event.off('changeLoveListVisible', changeVisible)
    // changeEvent.remove()
    }
  }, [])

  const navigationView = () => <MyList />
  // console.log('render drawer content')

  return (
    <DrawerLayoutFixed
      ref={drawer}
      visibleNavNames={[COMPONENT_IDS.home]}
      // drawerWidth={width}
      widthPercentage={widthPercentage}
      widthPercentageMax={maxWidth}
      drawerPosition={settingState.setting['common.drawerLayoutPosition']}
      renderNavigationView={navigationView}
      drawerBackgroundColor={drawerBackgroundColor}
      style={{ elevation: 1 }}
    >
      <MusicList />
    </DrawerLayoutFixed>
  )
}
