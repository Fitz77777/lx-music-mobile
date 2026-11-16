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

const CountText = memo(({ count }: { count: string }) => {
  const [animFade] = useAnimateOnecNumber(0, 1, 250, false)
  const [animTranslateY] = useAnimateOnecNumber(10, 0, 250, false)
  const { colors, spacing } = useIOSTheme()

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
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
    <View>
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
      {playCount && animated ? <CountText count={playCount} /> : null}
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
            style={{ flex: 1, marginLeft: spacing.lg, justifyContent: 'center' }}
            nativeID={NAV_SHEAR_NATIVE_IDS.songlistDetail_title}
          >
            <IOSText variant="headline" numberOfLines={2}>{detailInfo.name}</IOSText>
            <View style={{ marginTop: spacing.xs, position: 'relative' }}>
              <IOSText
                variant="footnote"
                color={colors.secondaryLabel}
                numberOfLines={3}
                style={{ paddingRight: 22 }}
              >{cleanDesc(detailInfo.desc)}</IOSText>
              {
                cleanDesc(detailInfo.desc)
                  ? (
                      <Pressable
                        onPress={() => { setDescVisible(true) }}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel={t('songlist_desc')}
                        style={{ position: 'absolute', right: 0, bottom: 0, width: 20, height: 18, alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IOSIcon name="dots-vertical" size={15} color={colors.secondaryLabel} />
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
