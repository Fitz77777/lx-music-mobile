/**
 * 已解析封面地址的内存缓存。
 *
 * 歌单/排行榜等在线列表的歌曲常常没带封面（源站接口不返回），
 * 播放时才会通过源站 getPic 换取真实封面。这里把换到的地址记下来，
 * 列表行订阅后即可在同一会话内显示封面，无需额外网络请求或持久化。
 */
const cache = new Map<string, string>()

export const getMusicPicKey = (source: string, id: string) => `${source}_${id}`

export const getCachedMusicPic = (source: string, id: string): string | undefined => {
  return cache.get(getMusicPicKey(source, id))
}

export const setCachedMusicPic = (source: string, id: string, url?: string | null) => {
  if (!url) return
  const key = getMusicPicKey(source, id)
  if (cache.get(key) === url) return
  cache.set(key, url)
  global.state_event.musicPicUpdated(key)
}
