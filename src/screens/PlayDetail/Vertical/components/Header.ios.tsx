import { memo, useMemo, useRef, useState } from 'react'
import { Pressable, View, type View as ViewType } from 'react-native'

import StatusBar from '@/components/common/StatusBar'
import TimeoutExitEditModal, { type TimeoutExitEditModalType, useTimeInfo } from '@/components/TimeoutExitEditModal'
import IOSIcon from '@/components/ios/Icon'
import IOSPopover from '@/components/ios/Popover'
import IOSText from '@/components/ios/Text'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import commonState from '@/store/common/state'
import { useIOSPanDown } from '@/navigation/iosGestures'
import SettingPopup, { type SettingPopupType } from '../../components/SettingPopup'
import SoundEffectPopup, { type SoundEffectPopupType } from '../../components/SoundEffectPopup'
import { useSetting } from '@/store/setting/hook'
import { isSoundEffectActive } from '@/plugins/player/soundEffect'

/** 头部高度（pt），Pic 用它计算封面尺寸 */
export const HEADER_HEIGHT = 44

const BUTTON_SIZE = 32

/**
 * iOS 播放页头部（原型 .player .bar）：
 * 中间歌曲名/歌手、右侧「更多」下拉（定时退出 / 音效 / 播放器设置）。
 * 收起不再用按钮，改成在头部或封面上向下滑动。
 */
export default memo(() => {
  const t = useI18n()
  const panDown = useIOSPanDown(commonState.componentIds.playDetail)
  const popupRef = useRef<SettingPopupType>(null)
  const soundEffectPopupRef = useRef<SoundEffectPopupType>(null)
  const timeoutModalRef = useRef<TimeoutExitEditModalType>(null)
  const [menuVisible, setMenuVisible] = useState(false)
  const moreAnchorRef = useRef<ViewType>(null)
  const { colors, accent, spacing } = useIOSTheme()
  const musicInfo = usePlayerMusicInfo()
  const setting = useSetting()
  const timeInfo = useTimeInfo()

  const items = useMemo(() => [
    {
      key: 'timeout',
      label: timeInfo.active ? t('timeout_exit_btn_update') : t('timeout_exit_tip_off'),
      selected: timeInfo.active,
    },
    {
      key: 'soundEffect',
      label: t('setting_play_sound_effect'),
      selected: isSoundEffectActive(setting),
    },
    { key: 'setting', label: t('play_detail_setting_title') },
  ], [setting, t, timeInfo.active])

  const handleSelect = (key: string) => {
    setMenuVisible(false)
    // 等下拉菜单收起后再打开二级弹层，避免两个 Modal 叠加
    setTimeout(() => {
      switch (key) {
        case 'timeout':
          timeoutModalRef.current?.show()
          break
        case 'soundEffect':
          soundEffectPopupRef.current?.show()
          break
        case 'setting':
          popupRef.current?.show()
          break
      }
    }, 140)
  }

  return (
    <View nativeID={NAV_SHEAR_NATIVE_IDS.playDetail_header} {...panDown.panHandlers}>
      <StatusBar />
      <View style={{
        height: HEADER_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
      }}>
        {/* 播放页不再显示收起按钮，改为在封面上向下滑动收起 */}
        <View style={{ width: BUTTON_SIZE, height: BUTTON_SIZE }} />
        <View style={{ flex: 1, paddingHorizontal: spacing.sm, alignItems: 'center' }}>
          <IOSText size={16} weight="600" numberOfLines={1} align="center">{musicInfo.name}</IOSText>
          <IOSText size={12} color={colors.secondaryLabel} numberOfLines={1} align="center" style={{ marginTop: 1 }}>
            {musicInfo.singer}
          </IOSText>
        </View>
        <Pressable
          ref={moreAnchorRef}
          onPress={() => { setMenuVisible(true) }}
          hitSlop={8}
          accessibilityRole="button"
          style={({ pressed }) => ({
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <IOSIcon name="dots-vertical" size={22} color={accent} />
        </Pressable>
      </View>
      <IOSPopover
        visible={menuVisible}
        anchorRef={moreAnchorRef}
        items={items}
        onClose={() => { setMenuVisible(false) }}
        onSelect={handleSelect}
      />
      <SoundEffectPopup ref={soundEffectPopupRef} layoutMode="stacked" />
      <SettingPopup ref={popupRef} direction="vertical" />
      <TimeoutExitEditModal ref={timeoutModalRef} timeInfo={timeInfo} />
    </View>
  )
})
