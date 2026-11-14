import { memo, useMemo, useEffect, useRef, useState, useCallback } from 'react'
import { Pressable, View } from 'react-native'
import PagerView, { type PagerViewOnPageSelectedEvent } from 'react-native-pager-view'
import Header from './components/Header'
import TabBar from './components/TabBar'
import CommentHot from './CommentHot'
import CommentNew from './CommentNew'
import { createStyle, toast } from '@/utils/tools'
import Text from '@/components/common/Text'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'
import { COMPONENT_IDS } from '@/config/constant'
import { setComponentId } from '@/core/common'
import PageContent from '@/components/PageContent'
import { useIOSPanBack } from '@/navigation/iosGestures'
import playerState from '@/store/player/state'

type ActiveId = 'hot' | 'new'

const HotCommentPage = memo(({ activeId, musicInfo, onUpdateTotal }: {
  activeId: ActiveId
  musicInfo: LX.Music.MusicInfoOnline
  onUpdateTotal: (total: number) => void
}) => {
  const initedRef = useRef(false)
  const comment = useMemo(() => <CommentHot musicInfo={musicInfo} onUpdateTotal={onUpdateTotal} />, [musicInfo, onUpdateTotal])
  switch (activeId) {
    case 'hot':
      if (!initedRef.current) initedRef.current = true
      return comment
    default:
      return initedRef.current ? comment : null
  }
})

const NewCommentPage = memo(({ activeId, musicInfo, onUpdateTotal }: {
  activeId: ActiveId
  musicInfo: LX.Music.MusicInfoOnline
  onUpdateTotal: (total: number) => void
}) => {
  const initedRef = useRef(false)
  const comment = useMemo(() => <CommentNew musicInfo={musicInfo} onUpdateTotal={onUpdateTotal} />, [musicInfo, onUpdateTotal])
  switch (activeId) {
    case 'new':
      if (!initedRef.current) initedRef.current = true
      return comment
    default:
      return initedRef.current ? comment : null
  }
})

/** 平板浮层里的评论头部（iOS 风格：标题 + 关闭） */
const EmbeddedHeader = memo(({ musicInfo, onClose }: {
  musicInfo: LX.Music.MusicInfo | null
  onClose?: () => void
}) => {
  const t = useI18n()
  const { colors, accent, spacing } = useIOSTheme()
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: 48,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.rowSeparator,
    }}>
      <IOSText variant="headline" numberOfLines={1} style={{ flex: 1 }}>
        {musicInfo ? t('comment_title', { name: musicInfo.name, singer: musicInfo.singer }) : ''}
      </IOSText>
      <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => ({ padding: 6, opacity: pressed ? 0.6 : 1 })}>
        <IOSIcon name="close" size={20} color={accent} />
      </Pressable>
    </View>
  )
})
EmbeddedHeader.displayName = 'EmbeddedHeader'

const TABS = [
  'hot',
  'new',
] as const
const getMusicInfo = (musicInfo: LX.Player.PlayMusic | null) => {
  if (!musicInfo) return null
  return 'progress' in musicInfo ? musicInfo.metadata.musicInfo : musicInfo
}
export default memo(({ componentId, embedded = false, onClose }: {
  componentId: string
  /** 平板：嵌在浮层卡片里展示（非整页），不接管导航 */
  embedded?: boolean
  onClose?: () => void
}) => {
  const panBack = useIOSPanBack(embedded ? null : componentId, 40)
  const pagerViewRef = useRef<PagerView>(null)
  const [activeId, setActiveId] = useState<ActiveId>('hot')
  const [musicInfo, setMusicInfo] = useState<LX.Music.MusicInfo | null>(getMusicInfo(playerState.playMusicInfo.musicInfo))
  const t = useI18n()
  const { colors } = useIOSTheme()
  const [total, setTotal] = useState({ hot: 0, new: 0 })

  useEffect(() => {
    if (embedded) return
    setComponentId(COMPONENT_IDS.comment, componentId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tabs = useMemo(() => {
    return [
      { id: TABS[0], label: t('comment_tab_hot', { total: total.hot ? `(${total.hot})` : '' }) },
      { id: TABS[1], label: t('comment_tab_new', { total: total.new ? `(${total.new})` : '' }) },
    ] as const
  }, [total, t])

  const toggleTab = useCallback((id: ActiveId) => {
    setActiveId(id)
    pagerViewRef.current?.setPage(TABS.findIndex(tab => tab == id))
  }, [])

  const onPageSelected = useCallback(({ nativeEvent }: PagerViewOnPageSelectedEvent) => {
    setActiveId(TABS[nativeEvent.position])
  }, [])

  const refreshComment = useCallback(() => {
    if (!playerState.playMusicInfo.musicInfo) return
    let playerMusicInfo = playerState.playMusicInfo.musicInfo
    if ('progress' in playerMusicInfo) playerMusicInfo = playerMusicInfo.metadata.musicInfo

    if (musicInfo && musicInfo.id == playerMusicInfo.id) {
      toast(t('comment_refresh', { name: musicInfo.name }))
      return
    }
    setMusicInfo(playerMusicInfo)
  }, [musicInfo, t])

  const setHotTotal = useCallback((total: number) => {
    setTotal(totalInfo => ({ ...totalInfo, hot: total }))
  }, [])
  const setNewTotal = useCallback((total: number) => {
    setTotal(totalInfo => ({ ...totalInfo, new: total }))
  }, [])

  const commentComponent = useMemo(() => {
    return (
      <View style={styles.container}>
        <TabBar
          tabs={tabs}
          activeId={activeId}
          onTabChange={toggleTab}
          onRefresh={refreshComment}
        />
        <PagerView
          ref={pagerViewRef}
          onPageSelected={onPageSelected}
          // onPageScrollStateChanged={onPageScrollStateChanged}
          style={styles.pagerView}
        >
          <View collapsable={false} style={styles.pageStyle}>
            <HotCommentPage activeId={activeId} musicInfo={musicInfo as LX.Music.MusicInfoOnline} onUpdateTotal={setHotTotal} />
          </View>
          <View collapsable={false} style={styles.pageStyle}>
            <NewCommentPage activeId={activeId} musicInfo={musicInfo as LX.Music.MusicInfoOnline} onUpdateTotal={setNewTotal} />
          </View>
        </PagerView>
      </View>
    )
  }, [activeId, musicInfo, onPageSelected, refreshComment, setHotTotal, setNewTotal, tabs, toggleTab])

  if (embedded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
        <EmbeddedHeader musicInfo={musicInfo} onClose={onClose} />
        {
          musicInfo == null
            ? null
            : musicInfo.source == 'local'
              ? (
                  <View style={{ ...styles.container, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>{t('comment_not support')}</Text>
                  </View>
                )
              : commentComponent
        }
      </View>
    )
  }

  return (
    <PageContent>
      <View style={{ flex: 1 }} {...panBack.panHandlers}>
      {
        musicInfo == null
          ? null
          : <>
            <Header musicInfo={musicInfo} />
            {
              musicInfo.source == 'local'
                ? (
                <View style={{ ...styles.container, alignItems: 'center', justifyContent: 'center' }}>
                  <Text>{t('comment_not support')}</Text>
                </View>
                  )
                : commentComponent
            }
        </>
      }
      </View>
    </PageContent>
  )
})

const styles = createStyle({
  container: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  pageStyle: {
    overflow: 'hidden',
  },
})
