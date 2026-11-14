import { forwardRef, useImperativeHandle, useRef, useState, useCallback, memo } from 'react'
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native'
import musicSdk from '@/utils/musicSdk'
import IOSText from '@/components/ios/Text'
import Image from '@/components/common/Image'
import Badge from '@/components/common/Badge'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { iosHomeBottomInset } from '@/theme/ios/tokens'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'
import { useI18n } from '@/lang'

type SearchType = 'artist' | 'album'

interface ArtistItem {
  id: number | string
  name: string
  picUrl: string
  alias?: string[]
  albumSize?: number
  musicSize?: number
  source: string
}

interface AlbumItem {
  id: number | string
  name: string
  picUrl: string
  artistName: string
  artistId?: string | number
  size?: number
  publishTime?: string
  source: string
}

type ListItem = ArtistItem | AlbumItem

interface SearchResult {
  list: ListItem[]
  total: number
  allPage: number
  limit: number
  source: string
}

export interface SearchResultListType {
  loadList: (text: string, source: string) => void
}

interface SearchResultListProps {
  searchType: SearchType
}

const IMG_SIZE = 52

const ARTIST_ALBUM_SOURCES: LX.OnlineSource[] = ['kw', 'wy', 'tx', 'kg', 'mg']

const handleItemPress = (searchType: SearchType, item: ListItem) => {
  const componentId = commonState.componentIds.home
  if (!componentId) return

  if (searchType === 'artist') {
    navigations.pushArtistDetailScreen(componentId, { id: String(item.id), name: item.name, source: item.source })
  } else {
    const albumItem = item as AlbumItem
    navigations.pushAlbumDetailScreen(componentId, {
      id: String(albumItem.id),
      name: albumItem.name,
      author: albumItem.artistName,
      img: albumItem.picUrl,
      size: albumItem.size,
      publishTime: albumItem.publishTime ? new Date(albumItem.publishTime).getTime() : undefined,
      source: albumItem.source,
    })
  }
}

const ArtistItemComp = memo(({ item, showSource }: { item: ArtistItem, showSource: boolean }) => {
  const { colors, spacing } = useIOSTheme()
  const t = useI18n()
  const alias = item.alias?.length ? item.alias.join('/') : ''
  const countInfo = (item.albumSize != null || item.musicSize != null)
    ? t('search_artist_count', { album: item.albumSize ?? 0, music: item.musicSize ?? 0 })
    : ''

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }}
      activeOpacity={0.5}
      onPress={() => { handleItemPress('artist', item) }}
    >
      <Image
        url={item.picUrl}
        style={{
          width: IMG_SIZE,
          height: IMG_SIZE,
          borderRadius: IMG_SIZE / 2,
          backgroundColor: colors.tertiaryFill,
        }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <IOSText variant="body" numberOfLines={1}>{item.name}</IOSText>
        {alias ? <IOSText variant="footnote" color={colors.secondaryLabel} numberOfLines={1}>{alias}</IOSText> : null}
        {countInfo ? <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1}>{countInfo}</IOSText> : null}
      </View>
      {showSource ? <Badge type="tertiary">{item.source}</Badge> : null}
    </TouchableOpacity>
  )
})

const AlbumItemComp = memo(({ item, showSource }: { item: AlbumItem, showSource: boolean }) => {
  const { colors, spacing } = useIOSTheme()

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
      }}
      activeOpacity={0.5}
      onPress={() => { handleItemPress('album', item) }}
    >
      <Image
        url={item.picUrl}
        style={{
          width: IMG_SIZE,
          height: IMG_SIZE,
          borderRadius: 8,
          backgroundColor: colors.tertiaryFill,
        }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, marginLeft: spacing.md }}>
        <IOSText variant="body" numberOfLines={1}>{item.name}</IOSText>
        {item.artistName ? <IOSText variant="footnote" color={colors.secondaryLabel} numberOfLines={1}>{item.artistName}</IOSText> : null}
        {item.publishTime ? (
          <IOSText variant="caption1" color={colors.secondaryLabel}>{item.publishTime}</IOSText>
        ) : null}
      </View>
      {showSource ? <Badge type="tertiary">{item.source}</Badge> : null}
    </TouchableOpacity>
  )
})

export default forwardRef<SearchResultListType, SearchResultListProps>(({ searchType }, ref) => {
  const [list, setList] = useState<ListItem[]>([])
  const [showSource, setShowSource] = useState(false)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const searchInfoRef = useRef({ text: '', page: 1, hasMore: true, source: 'kw' as string })
  // 用 ref 做并发锁，避免 onEndReached 连发时重复请求同一页
  const loadingRef = useRef(false)
  // 请求序号，用于丢弃过期响应
  const genRef = useRef(0)
  const { colors, accent, spacing } = useIOSTheme()

  const doSearch = useCallback(async(text: string, page: number, source: string): Promise<SearchResult> => {
    if (source === 'all') {
      const tasks = ARTIST_ALBUM_SOURCES.map(async(s) => {
        const sdk = musicSdk[s] as any
        const method = searchType === 'artist' ? sdk.musicSearch.searchArtist : sdk.musicSearch.searchAlbum
        return (method.call(sdk.musicSearch, text, page) as Promise<SearchResult>).catch(() => ({ list: [], total: 0, allPage: 0, limit: 20, source: s }))
      })
      return Promise.all(tasks).then(results => ({
        list: results.flatMap(r => r.list),
        total: results.reduce((sum, r) => sum + r.total, 0),
        allPage: Math.max(...results.map(r => r.allPage)),
        limit: 20,
        source: 'all',
      }))
    }
    const sdk = musicSdk[source as keyof typeof musicSdk] as any
    if (!sdk?.musicSearch) return Promise.reject(new Error('source not found'))

    if (searchType === 'artist') {
      return sdk.musicSearch.searchArtist(text, page)
    } else {
      return sdk.musicSearch.searchAlbum(text, page)
    }
  }, [searchType])

  const handleLoad = useCallback((text: string, page: number, source: string, isRefresh = false) => {
    if (!isRefresh) {
      if (loadingRef.current || !searchInfoRef.current.hasMore) return
    }
    // 每次加载分配一个序号，新的搜索/刷新会让旧请求的结果失效，避免旧响应覆盖新列表
    const gen = ++genRef.current
    loadingRef.current = true
    setLoading(true)
    if (isRefresh) setRefreshing(true)

    doSearch(text, page, source).then(result => {
      if (gen !== genRef.current) return
      setList(prev => isRefresh ? result.list : [...prev, ...result.list])
      searchInfoRef.current.page = page + 1
      searchInfoRef.current.hasMore = result.list.length > 0 && page < result.allPage
    }).catch((err) => {
      if (gen !== genRef.current) return
      // 请求失败后停止自动翻页，否则列表为空时 onEndReached 会被反复触发，表现为一直刷新
      searchInfoRef.current.hasMore = false
      console.log('SearchResultList error:', err)
    }).finally(() => {
      if (gen !== genRef.current) return
      loadingRef.current = false
      setLoading(false)
      setRefreshing(false)
    })
  }, [doSearch])

  useImperativeHandle(ref, () => ({
    loadList(text: string, source: string) {
      searchInfoRef.current = { text, page: 1, hasMore: true, source }
      setList([])
      // 聚合搜索时才展示来源标签，与歌曲/歌单列表保持一致
      setShowSource(source === 'all')
      handleLoad(text, 1, source, true)
    },
  }))

  const handleRefresh = useCallback(() => {
    const { text, source } = searchInfoRef.current
    searchInfoRef.current.page = 1
    searchInfoRef.current.hasMore = true
    handleLoad(text, 1, source, true)
  }, [handleLoad])

  const handleLoadMore = useCallback(() => {
    const { text, page, source } = searchInfoRef.current
    handleLoad(text, page, source)
  }, [handleLoad])

  const renderItem = ({ item }: { item: ListItem }) => {
    if (searchType === 'artist') {
      return <ArtistItemComp item={item as ArtistItem} showSource={showSource} />
    }
    return <AlbumItemComp item={item as AlbumItem} showSource={showSource} />
  }

  const keyExtractor = (item: ListItem) => `${item.source}_${item.id}`

  return (
    <FlatList
      data={list}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingBottom: spacing.xxxl + iosHomeBottomInset }}
      refreshControl={
        <RefreshControl
          colors={[accent]}
          tintColor={accent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      }
      ListEmptyComponent={
        !loading ? (
          <View style={{ alignItems: 'center', paddingTop: 60 }}>
            <IOSText variant="body" color={colors.secondaryLabel}>No results</IOSText>
          </View>
        ) : null
      }
    />
  )
})
