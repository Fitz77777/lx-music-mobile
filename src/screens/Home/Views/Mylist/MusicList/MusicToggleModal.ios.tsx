import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native'

import Image from '@/components/common/Image'
import IOSBottomSheet from '@/components/ios/BottomSheet'
import IOSIcon from '@/components/ios/Icon'
import { getSourceColor } from '@/components/ios/sourceColor'
import IOSText from '@/components/ios/Text'
import { useSourceListI18n } from '@/components/SourceSelector'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useUnmounted } from '@/utils/hooks'
import { searchMusic } from '@/utils/musicSdk'
import { toNewMusicInfo } from '@/utils'
import { addTempPlayList } from '@/core/player/tempPlayList'
import { playNext } from '@/core/player/player'
import playerState from '@/store/player/state'
import { LIST_IDS } from '@/config/constant'
import { handleShowMusicSourceDetail, handleToggleSource } from './listAction'

export interface SelectInfo {
  musicInfo: LX.Music.MusicInfo
  listId: string
}

export interface MusicToggleModalType {
  show: (listInfo: SelectInfo) => void
}

const ROW_HEIGHT = 62

/**
 * iOS 歌曲换源面板（原型 .sheet）。
 * 聚合搜索各音源的同名歌曲，用音源 chips 切换结果，选中候选后确认替换。
 */
export default forwardRef<MusicToggleModalType, {}>((props, ref) => {
  const t = useI18n()
  const { colors, accent, spacing, withAlpha, radius } = useIOSTheme()
  const { height: windowHeight } = useWindowDimensions()
  const isUnmountedRef = useUnmounted()
  const requestIdRef = useRef(0)
  const infoRef = useRef<SelectInfo | null>(null)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [sources, setSources] = useState<LX.OnlineSource[]>([])
  const [lists, setLists] = useState<Partial<Record<LX.OnlineSource, LX.Music.MusicInfoOnline[]>>>({})
  const [source, setSource] = useState<LX.OnlineSource | ''>('')
  const [selected, setSelected] = useState<LX.Music.MusicInfoOnline | null>(null)

  const sourceList = useSourceListI18n(sources)
  const sourceLabel = sourceList.find(item => item.action == source)?.label ?? ''

  const loadData = useCallback((info: SelectInfo) => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(false)
    setSources([])
    setLists({})
    setSource('')
    setSelected(null)
    searchMusic({
      name: info.musicInfo.name,
      singer: info.musicInfo.singer,
      source: '',
    }).then((result: Array<{ source: LX.OnlineSource, list: LX.Music.MusicInfoOnline[] }>) => {
      if (isUnmountedRef.current || requestId != requestIdRef.current) return
      const tags: LX.OnlineSource[] = []
      const nextLists: Partial<Record<LX.OnlineSource, LX.Music.MusicInfoOnline[]>> = {}
      for (const item of result) {
        if (!item.list.length) continue
        tags.push(item.source)
        nextLists[item.source] = item.list.map(s => toNewMusicInfo(s) as LX.Music.MusicInfoOnline)
      }
      setSources(tags)
      setLists(nextLists)
      setSource(tags[0] ?? '')
      setLoading(false)
    }).catch(() => {
      if (isUnmountedRef.current || requestId != requestIdRef.current) return
      setError(true)
      setLoading(false)
    })
  }, [isUnmountedRef])

  useImperativeHandle(ref, () => ({
    show(info) {
      infoRef.current = info
      setVisible(true)
      loadData(info)
    },
  }))

  const handleClose = () => {
    setVisible(false)
  }

  const handlePlay = useCallback((musicInfo: LX.Music.MusicInfoOnline) => {
    setSelected(musicInfo)
    const isPlaying = !!playerState.playMusicInfo.musicInfo
    addTempPlayList([{ listId: LIST_IDS.PLAY_LATER, musicInfo, isTop: true }])
    if (isPlaying) void playNext()
  }, [])

  const handleConfirm = async() => {
    if (!selected || !infoRef.current) return
    const isClose = await handleToggleSource(infoRef.current.listId, infoRef.current.musicInfo, selected)
    if (isClose) setVisible(false)
  }

  const handleShowDetail = (musicInfo: LX.Music.MusicInfoOnline) => {
    void handleShowMusicSourceDetail(musicInfo)
  }

  const currentList = source ? lists[source] ?? [] : []
  const listMaxHeight = Math.min(360, Math.round(windowHeight * 0.4))

  const sourceChips = sources.length
    ? sourceList.map(item => {
      const active = item.action == source
      return (
        <Pressable
          key={item.action}
          onPress={() => {
            setSource(item.action as LX.OnlineSource)
            setSelected(null)
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            height: 30,
            paddingHorizontal: 11,
            marginRight: spacing.sm,
            borderRadius: radius.pill,
            backgroundColor: active ? accent : colors.fill,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: active ? colors.onAccent : getSourceColor(item.action),
          }} />
          <IOSText
            variant="footnote"
            weight={active ? '600' : '400'}
            color={active ? colors.onAccent : colors.label}
          >{item.label}</IOSText>
        </Pressable>
      )
    })
    : null

  return (
    <IOSBottomSheet
      visible={visible}
      onClose={handleClose}
      title={t('toggle_source')}
      description={infoRef.current
        ? `${infoRef.current.musicInfo.name} · ${infoRef.current.musicInfo.singer}`
        : undefined}
    >
      {
        sources.length
          ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                  style={{ flexGrow: 0, marginBottom: spacing.md }}
                >
                  {sourceChips}
                </ScrollView>
                <ScrollView
                  style={{ maxHeight: listMaxHeight, flexGrow: 0 }}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="always"
                >
                  <View style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    backgroundColor: colors.groupedBackground,
                  }}>
                    {
                      currentList.map((item, index) => {
                        const active = selected?.id == item.id
                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => { setSelected(item) }}
                            style={({ pressed }) => ({
                              height: ROW_HEIGHT,
                              flexDirection: 'row',
                              alignItems: 'center',
                              paddingHorizontal: spacing.md,
                              backgroundColor: active
                                ? withAlpha(accent, 0.1)
                                : pressed
                                  ? colors.tertiaryFill
                                  : 'transparent',
                            })}
                          >
                            <Image
                              url={item.meta.picUrl}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 8,
                                backgroundColor: colors.tertiaryFill,
                              }}
                            />
                            <View style={{ flex: 1, marginLeft: spacing.md, marginRight: spacing.sm }}>
                              <IOSText
                                variant="subheadline"
                                weight={active ? '600' : '400'}
                                color={active ? accent : colors.label}
                                numberOfLines={1}
                              >{item.name}</IOSText>
                              <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1} style={{ marginTop: 3 }}>
                                {item.singer}
                                {item.meta.albumName ? ` · ${item.meta.albumName}` : ''}
                              </IOSText>
                            </View>
                            <IOSText variant="caption1" color={colors.secondaryLabel}>{item.interval}</IOSText>
                            <Pressable
                              onPress={() => { handleShowDetail(item) }}
                              hitSlop={6}
                              accessibilityRole="button"
                              style={({ pressed }) => ({
                                width: 30,
                                height: 30,
                                marginLeft: 6,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.6 : 1,
                              })}
                            >
                              <IOSIcon name="share" size={15} color={colors.secondaryLabel} />
                            </Pressable>
                            <Pressable
                              onPress={() => { handlePlay(item) }}
                              hitSlop={6}
                              accessibilityRole="button"
                              style={({ pressed }) => ({
                                width: 30,
                                height: 30,
                                marginRight: -6,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: pressed ? 0.6 : 1,
                              })}
                            >
                              <IOSIcon name="play" size={17} color={active ? accent : colors.secondaryLabel} />
                            </Pressable>
                            {active
                              ? (
                                  <IOSIcon
                                    name="checkbox-marked"
                                    size={16}
                                    color={accent}
                                    style={{ marginLeft: 2 }}
                                  />
                                )
                              : null}
                          </Pressable>
                        )
                      })
                    }
                  </View>
                </ScrollView>
                <IOSText
                  variant="caption1"
                  color={colors.secondaryLabel}
                  align="center"
                  style={{ marginTop: spacing.sm }}
                >{sourceLabel} · {currentList.length}</IOSText>
              </>
            )
          : (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
                {
                  loading
                    ? <IOSText variant="subheadline" color={colors.secondaryLabel}>{t('list_loading')}</IOSText>
                    : error
                      ? (
                          <Pressable onPress={() => { if (infoRef.current) loadData(infoRef.current) }}>
                            <IOSText variant="subheadline" color={colors.secondaryLabel}>{t('list_error')}</IOSText>
                          </Pressable>
                        )
                      : <IOSText variant="subheadline" color={colors.secondaryLabel}>{t('no_item')}</IOSText>
                }
              </View>
            )
      }
      <Pressable
        onPress={() => { void handleConfirm() }}
        disabled={!selected}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 50,
          borderRadius: radius.control,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: accent,
          marginTop: spacing.lg,
          opacity: !selected ? 0.4 : pressed ? 0.85 : 1,
        })}
      >
        <IOSText variant="headline" color={colors.onAccent}>{t('music_toggle__confirm')}</IOSText>
      </Pressable>
      <Pressable
        onPress={handleClose}
        accessibilityRole="button"
        style={({ pressed }) => ({
          height: 44,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: spacing.xs,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <IOSText color={accent}>{t('cancel')}</IOSText>
      </Pressable>
    </IOSBottomSheet>
  )
})
