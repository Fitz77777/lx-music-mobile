import { memo, useMemo } from 'react'
import { FlatList, View, RefreshControl, TouchableOpacity } from 'react-native'

import Image from '@/components/common/Image'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { dateFormat } from '@/utils/common'
import { navigations } from '@/navigation'

interface AlbumItem {
  id: string | number
  name: string
  picUrl: string
  artistName: string
  artists?: Array<{ id: string, name: string }>
  size?: number
  publishTime?: number
  source: string
}

interface Props {
  componentId: string
  albums: AlbumItem[]
  loading: boolean
  error?: boolean
  hasMore: boolean
  onRefresh: () => void
  onLoadMore: () => void
}

/** iOS 歌手专辑列表：两列封面卡片 */
export default memo(({ componentId, albums, loading, error, hasMore, onRefresh, onLoadMore }: Props) => {
  const { colors, accent, spacing } = useIOSTheme()

  const list = useMemo(() => [...albums], [albums])

  const handlePress = (item: AlbumItem) => {
    navigations.pushAlbumDetailScreen(componentId, {
      id: String(item.id),
      name: item.name,
      author: item.artistName,
      img: item.picUrl,
      artists: item.artists,
      size: item.size,
      publishTime: item.publishTime,
      // 漏传 source 会导致专辑详情页回退到网易接口，kg/tx/kw 的专辑都打不开
      source: item.source,
    })
  }

  const renderItem = ({ item }: { item: AlbumItem }) => (
    <TouchableOpacity
      style={{ flex: 1, padding: spacing.sm }}
      activeOpacity={0.6}
      onPress={() => { handlePress(item) }}
    >
      <Image
        url={item.picUrl}
        style={{
          width: '100%',
          aspectRatio: 1,
          borderRadius: 8,
          marginBottom: spacing.sm,
          backgroundColor: colors.tertiaryFill,
        }}
      />
      <IOSText variant="subheadline" numberOfLines={2}>{item.name}</IOSText>
      <IOSText variant="footnote" color={colors.secondaryLabel} numberOfLines={1} style={{ marginTop: 2 }}>{item.artistName}</IOSText>
      <IOSText variant="caption1" color={colors.tertiaryLabel} style={{ marginTop: 2 }}>
        {item.publishTime ? dateFormat(item.publishTime, 'Y.M.D') : ''}
      </IOSText>
    </TouchableOpacity>
  )

  const footer = () => {
    let text = ''
    if (loading && albums.length > 0) text = '加载中...'
    else if (error && albums.length === 0) text = '加载失败，下拉可重试'
    else if (!hasMore) text = '加载完毕'
    return (
      <View style={{ width: '100%', paddingVertical: spacing.md, alignItems: 'center' }}>
        <IOSText variant="footnote" color={colors.secondaryLabel}>{text}</IOSText>
      </View>
    )
  }

  return (
    <FlatList
      numColumns={2}
      data={list}
      renderItem={renderItem}
      keyExtractor={item => String(item.id)}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingBottom: spacing.xxxl }}
      ListFooterComponent={footer}
      refreshControl={
        <RefreshControl
          colors={[accent]}
          tintColor={accent}
          refreshing={loading && albums.length === 0}
          onRefresh={onRefresh}
        />
      }
    />
  )
})
