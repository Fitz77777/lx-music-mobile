import { memo, useCallback, useMemo, useState } from 'react'
import { View } from 'react-native'

import Image from '@/components/common/Image'
import IOSIcon from '@/components/ios/Icon'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'
import { useLayout } from '@/utils/hooks'
import { type Comment } from '../utils'
import CommentImage from './CommentImage'
import CommentText from './CommentText'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const defaultUser = require('@/resources/images/defaultUser.jpg')

const GAP = 12
const AVATAR_SIZE = 36

/** iOS 评论楼层：头像 + 昵称/时间/点赞 + 正文/图片 + 回复 */
const CommentFloor = memo(({ comment, isLast }: {
  comment: Comment
  isLast?: boolean
}) => {
  const { colors, spacing, hairline } = useIOSTheme()
  const [isAvatarError, setIsAvatarError] = useState(false)
  const { onLayout, width } = useLayout()
  const t = useI18n()

  const handleAvatarError = useCallback(() => {
    setIsAvatarError(true)
  }, [])

  const replyComments = useMemo(() => {
    if (!comment.reply?.length) return null
    const endIndex = comment.reply.length - 1
    return (
      <View style={{
        marginTop: GAP,
        marginLeft: spacing.xl,
        paddingLeft: spacing.md,
        borderLeftWidth: 2,
        borderLeftColor: colors.quaternaryFill,
      }}>
        {
          comment.reply.map((c, index) => (
            <CommentFloor comment={c} isLast={index === endIndex} key={`${comment.id}_${c.id}`} />
          ))
        }
      </View>
    )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={{
      marginTop: GAP,
      paddingBottom: GAP,
      borderBottomWidth: isLast ? 0 : hairline,
      borderBottomColor: colors.separator,
    }}>
      <View style={{ flexDirection: 'row' }}>
        <Image
          url={comment.avatar && !isAvatarError ? comment.avatar : defaultUser}
          onError={handleAvatarError}
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }}
        />
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <IOSText variant="subheadline" weight="600" numberOfLines={1}>{comment.userName}</IOSText>
              <View style={{ flexDirection: 'row', marginTop: 2 }}>
                <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1}>{comment.timeStr}</IOSText>
                {comment.location
                  ? (
                      <IOSText variant="caption1" color={colors.secondaryLabel} numberOfLines={1} style={{ marginLeft: spacing.sm }}>
                        {t('location', { location: comment.location })}
                      </IOSText>
                    )
                  : null}
              </View>
            </View>
            {comment.likedCount != null
              ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm }}>
                    <IOSIcon name="thumbs-up" size={12} color={colors.tertiaryLabel} />
                    <IOSText variant="caption1" color={colors.tertiaryLabel} style={{ marginLeft: 2 }}>{comment.likedCount}</IOSText>
                  </View>
                )
              : null}
          </View>
          <CommentText text={comment.text} />
          {
            comment.images?.length
              ? (
                  <View style={{ flexDirection: 'row', paddingTop: spacing.xs, width: '100%' }} onLayout={onLayout}>
                    {
                      comment.images.map((url, index) => <CommentImage key={String(index)} url={url} maxWidth={width} />)
                    }
                  </View>
                )
              : null
          }
        </View>
      </View>
      {replyComments}
    </View>
  )
})

export default CommentFloor
