import { useEffect, useState } from 'react'

import { getCachedMusicPic, getMusicPicKey } from '@/core/music/picCache'

/**
 * 在线歌曲封面：优先用播放时解析出的封面缓存，回退到列表数据里的缩略图。
 * 列表行使用它之后，「播放过的歌曲」会在当前列表里显示出封面。
 */
export default function useMusicPic(source: string, id: string, fallback?: string | null) {
  const [pic, setPic] = useState(() => getCachedMusicPic(source, id) ?? fallback)

  useEffect(() => {
    setPic(getCachedMusicPic(source, id) ?? fallback)
    const key = getMusicPicKey(source, id)
    const handleUpdate = (updatedKey: string) => {
      if (updatedKey != key) return
      setPic(getCachedMusicPic(source, id) ?? fallback)
    }
    global.state_event.on('musicPicUpdated', handleUpdate)
    return () => {
      global.state_event.off('musicPicUpdated', handleUpdate)
    }
  }, [source, id, fallback])

  return pic
}
