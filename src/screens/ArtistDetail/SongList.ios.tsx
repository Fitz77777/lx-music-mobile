import { memo, useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'

import OnlineList, { type OnlineListType } from '@/components/OnlineList'
import AlbumList from './AlbumList'
import IOSSegmentedControl from '@/components/ios/SegmentedControl'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view'

interface SongListProps {
  componentId: string
  songs: { list: LX.Music.MusicInfoOnline[], hasMore: boolean, page: number, loading: boolean, sort: string, error: boolean }
  albums: { list: any[], hasMore: boolean, page: number, loading: boolean, error: boolean }
  activeTab: 'songs' | 'albums'
  onTabChange: (tab: 'songs' | 'albums') => void
  onLoadMoreSongs: () => void
  onLoadMoreAlbums: () => void
  onSortChange: (sort: 'hot' | 'time') => void
  onRefresh: () => void
  onPlayList: (index: number) => void
}

const TABS = ['所有歌曲', '所有专辑'] as const
const SORTS = ['热门', '时间'] as const

/** iOS 歌手详情列表：分段控件切换歌曲/专辑 */
export default memo(({
  componentId, songs, albums, activeTab, onTabChange,
  onLoadMoreSongs, onLoadMoreAlbums,
  onSortChange, onRefresh, onPlayList,
}: SongListProps) => {
  const songListRef = useRef<OnlineListType>(null)
  const pagerViewRef = useRef<PagerView>(null)
  const { spacing } = useIOSTheme()

  useEffect(() => {
    if (activeTab === 'songs') {
      if (songs.loading && songs.list.length === 0) {
        songListRef.current?.setStatus('loading')
      } else if (songs.error && songs.list.length === 0) {
        // 加载失败时不能停在 idle（列表为空又一直转圈），要显示错误态让用户可以下拉重试
        songListRef.current?.setStatus('error')
      } else {
        songListRef.current?.setStatus(songs.hasMore ? 'idle' : 'end')
      }
      songListRef.current?.setList(songs.list, songs.page > 1, false)
    }
  }, [songs.list, songs.loading, songs.hasMore, songs.page, songs.error, activeTab])

  useEffect(() => {
    const pageIndex = activeTab === 'songs' ? 0 : 1
    pagerViewRef.current?.setPage(pageIndex)
  }, [activeTab])

  const onPageSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    const newTab = event.nativeEvent.position === 0 ? 'songs' : 'albums'
    if (newTab !== activeTab) {
      onTabChange(newTab)
    }
  }, [activeTab, onTabChange])

  const handleTabChange = useCallback((index: number) => {
    onTabChange(index === 0 ? 'songs' : 'albums')
  }, [onTabChange])

  const handleSortChange = useCallback((index: number) => {
    onSortChange(index === 0 ? 'hot' : 'time')
  }, [onSortChange])

  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
        <IOSSegmentedControl
          values={TABS}
          selectedIndex={activeTab === 'songs' ? 0 : 1}
          onChange={handleTabChange}
        />
      </View>
      {activeTab === 'songs'
        ? (
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: spacing.lg,
              paddingBottom: spacing.sm,
            }}>
              <View style={{ width: 140 }}>
                <IOSSegmentedControl
                  values={SORTS}
                  selectedIndex={songs.sort === 'hot' ? 0 : 1}
                  onChange={handleSortChange}
                  small
                />
              </View>
            </View>
          )
        : null}
      <PagerView
        ref={pagerViewRef}
        style={{ flex: 1 }}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        <View key="1" style={{ flex: 1 }}>
          <OnlineList
            ref={songListRef}
            onPlayList={onPlayList}
            onRefresh={onRefresh}
            onLoadMore={onLoadMoreSongs}
          />
        </View>
        <View key="2" style={{ flex: 1 }}>
          <AlbumList
            componentId={componentId}
            albums={albums.list}
            loading={albums.loading}
            error={albums.error}
            hasMore={albums.hasMore}
            onRefresh={onRefresh}
            onLoadMore={onLoadMoreAlbums}
          />
        </View>
      </PagerView>
    </View>
  )
})
