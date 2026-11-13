import { memo } from 'react'
import { View } from 'react-native'

import MoreBtn, { type MoreBtnProps } from './components/MoreBtn'
import PlayInfo from './components/PlayInfo'
import ControlBtn from './components/ControlBtn'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'

/** iOS 播放页底部控制区（原型 .p-bottom）：左右内边距由各子块按原型设置 */
export default memo(({ onToggleLyric, showingLyric }: MoreBtnProps) => {
  return (
    <View
      style={{ flex: 0, width: '100%', flexDirection: 'column', paddingBottom: 22 }}
      nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_player}
    >
      <PlayInfo />
      <ControlBtn />
      <MoreBtn onToggleLyric={onToggleLyric} showingLyric={showingLyric} />
    </View>
  )
})
