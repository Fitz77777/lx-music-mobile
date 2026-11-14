import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'

import PlayQueueModal, { type PlayQueueModalType } from '@/components/player/PlayQueueModal'
import IOSIcon from '@/components/ios/Icon'
import IOSHeart from '@/components/ios/Heart'
import { navigations } from '@/navigation'
import { toast } from '@/utils/tools'
import commonState from '@/store/common/state'
import { MUSIC_TOGGLE_MODE_LIST, MUSIC_TOGGLE_MODE, LIST_IDS } from '@/config/constant'
import { getListMusics } from '@/core/list'
import { collectMusic, uncollectMusic } from '@/core/player/player'
import { updateSetting } from '@/core/common'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { usePlayerMusicInfo } from '@/store/player/hook'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'

const BTN_WIDTH = 44
const BTN_ICON_SIZE = 24

/** 当前歌曲是否已在我的收藏里 */
const useIsLove = (musicId: string | null) => {
  const [isLove, setIsLove] = useState(false)

  useEffect(() => {
    if (!musicId) {
      setIsLove(false)
      return
    }
    let cancelled = false
    const check = () => {
      void getListMusics(LIST_IDS.LOVE).then(list => {
        if (cancelled) return
        setIsLove(list.some(item => item.id == musicId))
      })
    }
    const handleUpdate = (ids: string[]) => {
      if (ids.includes(LIST_IDS.LOVE)) check()
    }
    check()
    global.app_event.on('myListMusicUpdate', handleUpdate)
    return () => {
      cancelled = true
      global.app_event.off('myListMusicUpdate', handleUpdate)
    }
  }, [musicId])

  return isLove
}

const ActionBtn = ({ icon, color, onPress, children }: {
  icon: string
  color?: string
  onPress: () => void
  /** 自定义图标内容（如选中态实心爱心），不传则用 icon */
  children?: React.ReactNode
}) => {
  const { colors } = useIOSTheme()

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: BTN_WIDTH,
        height: BTN_WIDTH,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.6 : 1,
      })}
      onPress={onPress}
    >
      {children ?? <IOSIcon name={icon} size={BTN_ICON_SIZE} color={color ?? colors.label} />}
    </Pressable>
  )
}

/**
 * 播放页底部操作行（原型 .secondary）：
 * 收藏 / 播放模式 / 评论 / 播放队列。
 * 歌词页通过左右滑动封面切换，不提供独立的歌词按钮。
 */
export default memo(() => {
  const { colors, accent } = useIOSTheme()
  const musicInfo = usePlayerMusicInfo()
  const isLove = useIsLove(musicInfo.id)
  const queueRef = useRef<PlayQueueModalType>(null)
  const togglePlayMethod = useSettingValue('player.togglePlayMethod')
  const t = useI18n()

  const handleToggleLove = () => {
    if (isLove) uncollectMusic()
    else collectMusic()
  }

  const toggleNextPlayMode = () => {
    let index = MUSIC_TOGGLE_MODE_LIST.indexOf(togglePlayMethod)
    if (++index >= MUSIC_TOGGLE_MODE_LIST.length) index = 0
    const mode = MUSIC_TOGGLE_MODE_LIST[index]
    updateSetting({ 'player.togglePlayMethod': mode })
    let modeName: 'play_list_loop' | 'play_list_random' | 'play_list_order' | 'play_single_loop' | 'play_single'
    switch (mode) {
      case MUSIC_TOGGLE_MODE.listLoop:
        modeName = 'play_list_loop'
        break
      case MUSIC_TOGGLE_MODE.random:
        modeName = 'play_list_random'
        break
      case MUSIC_TOGGLE_MODE.list:
        modeName = 'play_list_order'
        break
      case MUSIC_TOGGLE_MODE.singleLoop:
        modeName = 'play_single_loop'
        break
      default:
        modeName = 'play_single'
        break
    }
    toast(t(modeName))
  }

  const playModeIcon = useMemo(() => {
    switch (togglePlayMethod) {
      case MUSIC_TOGGLE_MODE.listLoop:
        return 'list-loop'
      case MUSIC_TOGGLE_MODE.random:
        return 'list-random'
      case MUSIC_TOGGLE_MODE.list:
        return 'list-order'
      case MUSIC_TOGGLE_MODE.singleLoop:
        return 'single-loop'
      default:
        return 'single'
    }
  }, [togglePlayMethod])

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 34,
      paddingTop: 22,
      paddingBottom: 6,
    }}>
      <ActionBtn
        icon="love"
        color={isLove ? accent : colors.label}
        onPress={handleToggleLove}
      >
        {isLove ? <IOSHeart size={BTN_ICON_SIZE} color={accent} /> : undefined}
      </ActionBtn>
      <ActionBtn
        icon={playModeIcon}
        onPress={toggleNextPlayMode}
      />
      <ActionBtn
        icon="comment"
        onPress={() => { navigations.pushCommentScreen(commonState.componentIds.playDetail!) }}
      />
      <ActionBtn icon="list-order" onPress={() => { queueRef.current?.show() }} />
      <PlayQueueModal ref={queueRef} />
    </View>
  )
})

