import { useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'

import { usePlayerMusicInfo } from '@/store/player/hook'
import { useWindowSize } from '@/utils/hooks'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useNavigationComponentDidAppear } from '@/navigation'
import { HEADER_HEIGHT } from './components/Header'
import Image from '@/components/common/Image'
import { useStatusbarHeight } from '@/store/common/hook'
import commonState from '@/store/common/state'

/**
 * iOS 播放页封面：圆角卡片 + 系统阴影。
 * 尺寸沿用 Android 版的计算方式，但用 pt 与 iOS 阴影替代 elevation。
 */
export default ({ componentId }: { componentId: string }) => {
  const musicInfo = usePlayerMusicInfo()
  const { width: winWidth, height: winHeight } = useWindowSize()
  const statusBarHeight = useStatusbarHeight()

  const [animated, setAnimated] = useState(!!commonState.componentIds.playDetail)
  const [pic, setPic] = useState(musicInfo.pic)
  useEffect(() => {
    if (animated) setPic(musicInfo.pic)
  }, [musicInfo.pic, animated])

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })

  const size = useMemo(() => {
    return Math.min(winWidth * 0.8, (winHeight - statusBarHeight - HEADER_HEIGHT) * 0.5)
  }, [statusBarHeight, winHeight, winWidth])

  return (
    <View style={{ flexGrow: 1, flexShrink: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{
        borderRadius: 12,
        backgroundColor: 'transparent',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: animated ? 8 : 0 },
        shadowOpacity: animated ? 0.18 : 0,
        shadowRadius: animated ? 16 : 0,
      }}>
        <Image
          url={pic}
          nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_pic}
          style={{ width: size, height: size, borderRadius: 12 }}
        />
      </View>
    </View>
  )
}
