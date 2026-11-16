import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'

import Image, { getSize } from '@/components/common/Image'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'

const MAX_IMAGE_HEIGHT = 260

/** iOS 评论图片：默认显示占位，点击后加载原图 */
export default ({ url, maxWidth }: { url: string, maxWidth: number }) => {
  const [show, setShow] = useState(false)
  const [wh, setWH] = useState({ width: 0, height: 0 })
  const { colors, accent } = useIOSTheme()
  const t = useI18n()

  useEffect(() => {
    getSize(url, (realWidth, realHeight) => {
      let w = 0
      let h = 0

      if (w && !h) {
        h = realHeight * (w / realWidth)
      } else if (!w && h) {
        w = realWidth * (h / realHeight)
      } else {
        if (maxWidth && realWidth > maxWidth) {
          w = maxWidth
          h = realHeight * (w / realWidth)

          if (MAX_IMAGE_HEIGHT && h > MAX_IMAGE_HEIGHT) {
            w = realWidth * (MAX_IMAGE_HEIGHT / realHeight)
            h = MAX_IMAGE_HEIGHT
          }
        } else if (MAX_IMAGE_HEIGHT && realHeight > MAX_IMAGE_HEIGHT) {
          w = realWidth * (h / realHeight)
          h = MAX_IMAGE_HEIGHT
        }
      }
      setWH({ width: w || realWidth, height: h || realHeight })
    })
  }, [maxWidth, url])

  if (!wh.width) return null

  return (
    <View style={{ height: wh.height, width: wh.width }}>
      {
        show
          ? <Image url={url} style={{ height: wh.height, width: wh.width, borderRadius: 8 }} />
          : (
              <Pressable
                onPress={() => { setShow(true) }}
                style={{
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                  backgroundColor: colors.tertiaryFill,
                }}
              >
                <IOSText variant="subheadline" color={accent}>{t('comment_show_image')}</IOSText>
              </Pressable>
            )
      }
    </View>
  )
}
