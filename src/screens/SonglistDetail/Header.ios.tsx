import { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

import Image from '@/components/common/Image'
import IOSBottomSheet from '@/components/ios/BottomSheet'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { getIOSStatusBarHeight } from '@/theme/ios/insets'
import { useI18n } from '@/lang'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import { useNavigationComponentDidAppear } from '@/navigation'
import { useListInfo } from './state'
import { useAnimateOnecNumber } from '@/utils/hooks/useAnimateNumber'
import { cleanDesc } from '@/utils'
import ActionBar from './ActionBar'

const PIC_SIZE = 96
/** 播放量行恒定占位高（caption1 一行，上下留白居中） */
const COUNT_ROW_H = 20
/** 封面列总高恒定：封面 + 间距 + 播放量行，右侧文字列与其对齐，加载时不跳动 */
const COVER_COLUMN_H = PIC_SIZE + 4 + COUNT_ROW_H
/** 简介固定最多 4 行（footnote 行高 18） */
const MAX_DESC_LINES = 4
const DESC_LINE_H = 18
const DESC_MAX_H = MAX_DESC_LINES * DESC_LINE_H
/** 右侧文字列恒定高：歌名 2 行 + 间距 + 简介 4 行 */
const TEXT_COLUMN_H = 22 * 2 + 4 + DESC_MAX_H

const CountText = memo(({ count }: { count: string }) => {
  const [animFade] = useAnimateOnecNumber(0, 1, 250, false)
  const [animTranslateY] = useAnimateOnecNumber(10, 0, 250, false)
  const { colors } = useIOSTheme()

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: COUNT_ROW_H,
      opacity: animFade,
      transform: [{ translateY: animTranslateY }],
    }}>
      <IOSIcon name="play" size={11} color={colors.secondaryLabel} />
      <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1} style={{ marginLeft: 3 }}>{count}</IOSText>
    </View>
  )
}, () => true)

const Pic = ({ componentId, playCount, imgUrl }: {
  componentId: string
  playCount: string
  imgUrl?: string
}) => {
  const { colors } = useIOSTheme()
  const [pic, setPic] = useState(imgUrl)
  const [animated, setAnimated] = useState(false)
  const info = useListInfo()

  useEffect(() => {
    if (animated) setPic(imgUrl)
  }, [imgUrl, animated])

  useNavigationComponentDidAppear(componentId, () => {
    setAnimated(true)
  })

  return (
    <View style={{ height: COVER_COLUMN_H }}>
      <View style={{
        width: PIC_SIZE,
        height: PIC_SIZE,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: colors.tertiaryFill,
      }}>
        <Image
          nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_to_${info.id}`}
          url={pic}
          style={{ width: '100%', height: '100%' }}
        />
      </View>
      {/* 播放量行恒定占位，避免出现/消失时头部高度跳动 */}
      <View style={{ height: COUNT_ROW_H, marginTop: 4 }}>
        {playCount && animated ? <CountText count={playCount} /> : null}
      </View>
    </View>
  )
}

export interface HeaderProps {
  componentId: string
}

export interface HeaderType {
  setInfo: (info: DetailInfo) => void
}
export interface DetailInfo {
  name: string
  desc: string
  playCount: string
  imgUrl?: string
}

/** iOS 歌单详情头部：返回 + 封面/简介 + 操作按钮 */
export default forwardRef<HeaderType, HeaderProps>(({ componentId }, ref) => {
  const { colors, accent, spacing } = useIOSTheme()
  const t = useI18n()
  const info = useListInfo()
  const [detailInfo, setDetailInfo] = useState<DetailInfo>({ name: '', desc: '', playCount: '', imgUrl: info.img })
  const [descVisible, setDescVisible] = useState(false)

  // 简介截断：先用隐藏文本测全文高度，超 4 行时二分搜索最大可容纳前缀，
  // 省略号「…」内联在文字末尾（强调色、可点击），不固定在角落
  const descText = cleanDesc(detailInfo.desc)
  const [displayText, setDisplayText] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [searchText, setSearchText] = useState<string | null>(null)
  const searchStateRef = useRef<{ lo: number, hi: number } | null>(null)
  const probeMidRef = useRef(0)
  const descWidthRef = useRef(0)
  const [descWidth, setDescWidth] = useState(0)

  const probeSearch = (full: string) => {
    const { lo, hi } = searchStateRef.current!
    const mid = Math.floor((lo + hi) / 2)
    probeMidRef.current = mid
    setSearchText(`${full.slice(0, mid)}…`)
  }

  const handleSearchMeasure = (h: number) => {
    const full = descText
    if (searchStateRef.current == null) {
      // 全文测量阶段
      if (h <= DESC_MAX_H + 1) {
        setDisplayText(full)
        setTruncated(false)
        setSearchText(null)
        return
      }
      searchStateRef.current = { lo: 0, hi: full.length }
      probeSearch(full)
      return
    }
    // 二分搜索阶段
    const mid = probeMidRef.current
    const fits = h <= DESC_MAX_H + 1
    const state = { lo: fits ? mid : searchStateRef.current.lo, hi: fits ? searchStateRef.current.hi : mid }
    searchStateRef.current = state
    if (state.hi - state.lo <= 1) {
      // 尾部空白收敛：去掉末尾空白，最多保留一个换行（省略号落在空行行首或上一行行尾）
      const prefix = full.slice(0, state.lo).replace(/[ \t\r]+$/, '').replace(/\n+$/, '\n')
      setDisplayText(prefix)
      setTruncated(true)
      setSearchText(null)
      searchStateRef.current = null
      return
    }
    probeSearch(full)
  }

  // 简介内容或可用宽度变化时重新测量
  useEffect(() => {
    searchStateRef.current = null
    setTruncated(false)
    setDisplayText(descText)
    setSearchText(descText)
  }, [descText, descWidth])

  useImperativeHandle(ref, () => ({
    setInfo(info) {
      setDetailInfo(info)
    },
  }), [])

  return (
    /* 二级页里 RN SafeAreaView 拿不到安全区，用原生状态栏高度显式下移 */
    <View style={{ paddingTop: getIOSStatusBarHeight() }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg }}>
          <Pic componentId={componentId} playCount={detailInfo.playCount} imgUrl={detailInfo.imgUrl} />
          <View
            style={{ flex: 1, marginLeft: spacing.lg, height: TEXT_COLUMN_H, overflow: 'hidden' }}
            nativeID={NAV_SHEAR_NATIVE_IDS.songlistDetail_title}
          >
            <IOSText variant="headline" numberOfLines={2}>{detailInfo.name}</IOSText>
            <View
              style={{ height: DESC_MAX_H, marginTop: spacing.xs, overflow: 'hidden' }}
              onLayout={e => {
                const w = e.nativeEvent.layout.width
                if (Math.abs(w - descWidthRef.current) > 0.5) {
                  descWidthRef.current = w
                  setDescWidth(w)
                }
              }}
            >
              <IOSText
                variant="footnote"
                color={colors.secondaryLabel}
                numberOfLines={MAX_DESC_LINES}
              >
                {displayText}
                {
                  truncated
                    ? (
                        // 省略号内联在文字末尾，带链接样式可点击查看全文
                        <Text onPress={() => { setDescVisible(true) }} style={{ color: accent }}>…</Text>
                      )
                    : null
                }
              </IOSText>
              {/* 隐藏文本用于测量（全文 / 二分候选） */}
              {
                searchText != null
                  ? (
                      <IOSText
                        variant="footnote"
                        color="transparent"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0 }}
                        onLayout={e => { handleSearchMeasure(e.nativeEvent.layout.height) }}
                      >{searchText}</IOSText>
                    )
                  : null
              }
            </View>
          </View>
        </View>
        <ActionBar />
        <IOSBottomSheet visible={descVisible} onClose={() => { setDescVisible(false) }} title={detailInfo.name || t('songlist_desc')}>
          <ScrollView
            style={{ maxHeight: 320 }}
            showsVerticalScrollIndicator={false}
          >
            <IOSText variant="subheadline" color={colors.secondaryLabel}>{cleanDesc(detailInfo.desc)}</IOSText>
          </ScrollView>
        </IOSBottomSheet>
    </View>
  )
})
