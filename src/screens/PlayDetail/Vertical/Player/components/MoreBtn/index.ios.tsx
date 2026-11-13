import { memo, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

import PlayQueueModal, { type PlayQueueModalType } from '@/components/player/PlayQueueModal'
import { LIST_IDS } from '@/config/constant'
import { getListMusics } from '@/core/list'
import { collectMusic, uncollectMusic } from '@/core/player/player'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { usePlayerMusicInfo } from '@/store/player/hook'
import Btn from './Btn'
import PlayModeBtn from './PlayModeBtn'
import CommentBtn from './CommentBtn'

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

export interface MoreBtnProps {
  /** 切换封面 / 歌词页 */
  onToggleLyric?: () => void
  /** 当前是否显示歌词页 */
  showingLyric?: boolean
}

/**
 * iOS 播放页底部操作行（原型 .secondary）：
 * 收藏 / 播放模式 / 歌词 / 评论 / 播放队列。
 */
export default memo(({ onToggleLyric, showingLyric }: MoreBtnProps) => {
  const { colors, accent } = useIOSTheme()
  const musicInfo = usePlayerMusicInfo()
  const isLove = useIsLove(musicInfo.id)
  const queueRef = useRef<PlayQueueModalType>(null)

  const handleToggleLove = () => {
    if (isLove) uncollectMusic()
    else collectMusic()
  }

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 34,
      paddingTop: 22,
      paddingBottom: 6,
    }}>
      <Btn
        icon="love"
        color={isLove ? accent : colors.label}
        onPress={handleToggleLove}
      />
      <PlayModeBtn />
      <Btn
        icon="lyric-on"
        color={showingLyric ? accent : colors.label}
        onPress={() => { onToggleLyric?.() }}
      />
      <CommentBtn />
      <Btn icon="list-order" onPress={() => { queueRef.current?.show() }} />
      <PlayQueueModal ref={queueRef} />
    </View>
  )
})
