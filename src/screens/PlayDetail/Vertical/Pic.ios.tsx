import { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

import { usePlayerMusicInfo } from '@/store/player/hook'
import { useWindowSize } from '@/utils/hooks'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useNavigationComponentDidAppear } from '@/navigation'
import { useIOSPanDown } from '@/navigation/iosGestures'
import { HEADER_HEIGHT } from './components/Header'
import Image from '@/components/common/Image'
import { useStatusbarHeight } from '@/store/common/hook'
import commonState from '@/store/common/state'

/** 原型 .art-wrap 的左右内边距 */
const ART_WRAP_HORIZONTAL = 34
/** 封面圆角（原型 .art border-radius:18px） */
const ART_RADIUS = 18

/**
 * iOS 播放页封面（原型 .art-wrap / .art）：
 * 左右 34pt、圆角 18、大范围柔和阴影。
 */
export default ({ componentId }: { componentId: string }) => {
  const musicInfo = usePlayerMusicInfo()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const statusBarHeight = useStatusbarHeight()
  const panDown = useIOSPanDown(componentId)

  const [animated, setAnimated] = useState(!!commonState.componentIds.playDetail)
  const [pic, setPic] = useState(musicInfo.pic)
  useEffect(() => {
    if (animated) setPic(musicInfo.pic)
  }, [musicInfo.pic, animated])

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })

  const size = useMemo(() => {
    return Math.min(
      winWidth - ART_WRAP_HORIZONTAL * 2,
      (winHeight - statusBarHeight - HEADER_HEIGHT) * 0.56,
    )
  }, [statusBarHeight, winHeight, winWidth])

  return (
    <View style={{ flexGrow: 1, flexShrink: 1, justifyContent: 'center', alignItems: 'center' }} {...panDown.panHandlers}>
      <View style={{
        borderRadius: ART_RADIUS,
        backgroundColor: 'transparent',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: animated ? 10 : 0 },
        shadowOpacity: animated ? 0.24 : 0,
        shadowRadius: animated ? 18 : 0,
      }}>
        <Image
          url={pic}
          nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pic}
          style={{ width: size, height: size, borderRadius: ART_RADIUS }}
        />
      </View>
    </View>
  )
}
