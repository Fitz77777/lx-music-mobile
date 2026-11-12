import { memo, useRef } from 'react'
import { View } from 'react-native'

import { pop } from '@/navigation'
import StatusBar from '@/components/common/StatusBar'
import IOSIconButton from '@/components/ios/IconButton'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import commonState from '@/store/common/state'
import SettingPopup, { type SettingPopupType } from '../../components/SettingPopup'
import SoundEffectPopup, { type SoundEffectPopupType } from '../../components/SoundEffectPopup'
import { useSetting } from '@/store/setting/hook'
import { isSoundEffectActive } from '@/plugins/player/soundEffect'
import TimeoutExitBtn from './TimeoutExitBtn'

/** 头部高度（pt），Pic 用它计算封面尺寸 */
export const HEADER_HEIGHT = 44

/** iOS 播放页头部：返回 + 歌曲信息 + 定时/音效/设置 */
export default memo(() => {
  const popupRef = useRef<SettingPopupType>(null)
  const soundEffectPopupRef = useRef<SoundEffectPopupType>(null)
  const { colors, accent, spacing } = useIOSTheme()
  const musicInfo = usePlayerMusicInfo()
  const setting = useSetting()

  const back = () => {
    void pop(commonState.componentIds.playDetail!)
  }
  const showSetting = () => {
    popupRef.current?.show()
  }
  const showSoundEffect = () => {
    soundEffectPopupRef.current?.show()
  }

  return (
    <View nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_header}>
      <StatusBar />
      <View style={{
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xs,
      }}>
        <IOSIconButton name="chevron-left" size={22} color={accent} onPress={back} accessibilityLabel={global.i18n.t('back')} />
        <View style={{ flex: 1, paddingHorizontal: spacing.sm }}>
          <IOSText variant="headline" numberOfLines={1}>{musicInfo.name}</IOSText>
          <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1}>{musicInfo.singer}</IOSText>
        </View>
        <TimeoutExitBtn />
        <IOSIconButton
          name="slider"
          size={20}
          color={isSoundEffectActive(setting) ? accent : colors.label}
          onPress={showSoundEffect}
        />
        <IOSIconButton name="setting" size={19} onPress={showSetting} />
      </View>
      <SoundEffectPopup ref={soundEffectPopupRef} layoutMode="stacked" />
      <SettingPopup ref={popupRef} direction="vertical" />
    </View>
  )
})
