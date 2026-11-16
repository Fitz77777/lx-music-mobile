import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Animated, ScrollView, Text, View } from 'react-native'

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

/** CJK / 全角字符按 1em 估算，其余按 0.56em（略偏大，宁可少显示也不溢出） */
const CJK_CHAR_RE = /[\u1100-\u11ff\u2e80-\ua4cf\ua960-\ua97f\uac00-\ud7ff\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/

interface DescLayout {
  text: string
  truncated: boolean
}

/**
 * 按容器宽度模拟换行，取前 4 行。
 * 不依赖任何文本测量事件（iOS 上 onTextLayout / 隐藏文本高度都不可靠）：
 * 字符宽度偏大估算 ⇒ 真实排版行数不会多于估算行数，截断点一定落在 4 行内。
 */
const layoutDesc = (full: string, width: number, fontSize: number): DescLayout => {
  if (!full) return { text: '', truncated: false }
  // 宽度未知时先按全文渲染，等 onLayout 回来后重算
  if (width <= fontSize) return { text: full, truncated: false }
  const avail = width - 1
  const ellipsisW = fontSize
  const widthOf = (ch: string) => CJK_CHAR_RE.test(ch) ? fontSize : fontSize * 0.56

  const lines: Array<{ start: number, end: number }> = []
  let pos = 0
  while (pos < full.length) {
    const start = pos
    let w = 0
    while (pos < full.length && full[pos] != '\n') {
      const cw = widthOf(full[pos])
      if (pos > start && w + cw > avail) break
      w += cw
      pos++
    }
    lines.push({ start, end: pos })
    if (pos >= full.length) break
    pos++ // 跳过换行符
  }
  if (lines.length <= MAX_DESC_LINES) return { text: full, truncated: false }

  const line4 = lines[MAX_DESC_LINES - 1]
  // 第 4 行是空行（含「换行后无内容」）：省略号直接落在第 4 行行首
  if (full.slice(line4.start, line4.end).trim() == '') {
    return { text: full.slice(0, line4.start), truncated: true }
  }
  // 第 4 行有文字：从行尾回退几个字，给省略号腾出位置
  let w = 0
  let end = line4.start
  for (let i = line4.start; i < line4.end; i++) {
    const cw = widthOf(full[i])
    if (w + cw + ellipsisW > avail) break
    w += cw
    end = i + 1
  }
  return { text: full.slice(0, end).replace(/[ \t]+$/, ''), truncated: true }
}

const CountText = memo(({ count }: { count: string }) => {
  const [animFade] = useAnimateOnecNumber(0, 1, 250, false)
  const [animTranslateY] = useAnimateOnecNumber(10, 0, 250, false)
  const { colors } = useIOSTheme()

  return (
    // 注意：样式里绑定了 Animated.Value，必须用 Animated.View，
    // 普通 View 在 Android 上会把动画对象当数值传给原生导致崩溃
    <Animated.View style={{
      flexDirection: 'row',
      alignItems: 'center',
      height: COUNT_ROW_H,
      opacity: animFade,
      transform: [{ translateY: animTranslateY }],
    }}>
      <IOSIcon name="play" size={11} color={colors.secondaryLabel} />
      <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1} style={{ marginLeft: 3 }}>{count}</IOSText>
    </Animated.View>
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
  const { colors, accent, spacing, typography } = useIOSTheme()
  const t = useI18n()
  const info = useListInfo()
  const [detailInfo, setDetailInfo] = useState<DetailInfo>({ name: '', desc: '', playCount: '', imgUrl: info.img })
  const [descVisible, setDescVisible] = useState(false)

  // 简介：固定最多 4 行，超出时把省略号「…」内联在截断处（强调色、可点击看全文）
  const descWidthRef = useRef(0)
  const [descWidth, setDescWidth] = useState(0)
  const descLayout = useMemo(
    () => layoutDesc(cleanDesc(detailInfo.desc), descWidth, typography.footnote.fontSize),
    [detailInfo.desc, descWidth, typography.footnote.fontSize],
  )

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
                {descLayout.text}
                {
                  descLayout.truncated
                    ? (
                        // 省略号内联在截断处，带链接样式可点击查看全文
                        <Text onPress={() => { setDescVisible(true) }} style={{ color: accent }}>…</Text>
                      )
                    : null
                }
              </IOSText>
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
