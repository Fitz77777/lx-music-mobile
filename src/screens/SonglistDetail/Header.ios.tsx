import { forwardRef, memo, useEffect, useImperativeHandle, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'

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
/** 播放量行恒定占位高（caption1 一行） */
const COUNT_ROW_H = 18
/** 封面列总高恒定：封面 + 间距 + 播放量行，右侧文字列与其对齐，加载时不跳动 */
const COVER_COLUMN_H = PIC_SIZE + 4 + COUNT_ROW_H

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
  const { colors, spacing } = useIOSTheme()
  const t = useI18n()
  const info = useListInfo()
  const [detailInfo, setDetailInfo] = useState<DetailInfo>({ name: '', desc: '', playCount: '', imgUrl: info.img })
  const [descVisible, setDescVisible] = useState(false)
  const [descBoxH, setDescBoxH] = useState(0)
  const [descTextH, setDescTextH] = useState(0)

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
            style={{ flex: 1, marginLeft: spacing.lg, height: COVER_COLUMN_H, overflow: 'hidden' }}
            nativeID={NAV_SHEAR_NATIVE_IDS.songlistDetail_title}
          >
            <IOSText variant="headline" numberOfLines={2}>{detailInfo.name}</IOSText>
            <View
              style={{ flex: 1, marginTop: spacing.xs, overflow: 'hidden' }}
              onLayout={e => { setDescBoxH(e.nativeEvent.layout.height) }}
            >
              <IOSText
                variant="footnote"
                color={colors.secondaryLabel}
                style={{ paddingRight: 20 }}
              >{cleanDesc(detailInfo.desc)}</IOSText>
              {/* 隐藏的完整文本用于测量实际高度，超出可视区才显示三点按钮 */}
              <IOSText
                variant="footnote"
                color="transparent"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0 }}
                onLayout={e => { setDescTextH(e.nativeEvent.layout.height) }}
              >{cleanDesc(detailInfo.desc)}</IOSText>
              {
                descTextH > descBoxH + 1 && descBoxH > 0
                  ? (
                      <Pressable
                        onPress={() => { setDescVisible(true) }}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('songlist_desc')}
                        style={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 18, alignItems: 'center', justifyContent: 'center' }}
                      >
                        {/* 字体里只有竖向三点，旋转成横向 */}
                        <IOSIcon name="dots-vertical" size={15} color={colors.secondaryLabel} style={{ transform: [{ rotate: '90deg' }] }} />
                      </Pressable>
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
