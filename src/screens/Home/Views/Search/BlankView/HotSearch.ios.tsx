import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { type Source, type InitState } from '@/store/hotSearch/state'
import { getList } from '@/core/hotSearch'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'

interface ListProps {
  onSearch: (keyword: string) => void
}
export interface HotSearchType {
  show: (source: Source) => void
}

export type List = NonNullable<InitState['sourceList'][keyof InitState['sourceList']]>

const ListItem = ({ keyword, onSearch }: {
  keyword: string
  onSearch: (keyword: string) => void
}) => {
  const { colors, spacing } = useIOSTheme()
  return (
    <Pressable
      onPress={() => { onSearch(keyword) }}
      style={({ pressed }) => ({
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm - 1,
        borderRadius: 999,
        backgroundColor: pressed ? colors.tertiaryFill : colors.secondaryFill,
        marginRight: spacing.sm,
        marginTop: spacing.sm,
      })}
    >
      <IOSText variant="subheadline" numberOfLines={1}>{keyword}</IOSText>
    </Pressable>
  )
}

/** iOS 热门搜索：胶囊标签 */
export default forwardRef<HotSearchType, ListProps>((props, ref) => {
  const [list, setList] = useState<List>([])
  const { colors, spacing } = useIOSTheme()
  const t = useI18n()

  const isUnmountedRef = useRef(false)
  useEffect(() => {
    isUnmountedRef.current = false
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  useImperativeHandle(ref, () => ({
    show(source) {
      void getList(source).then((list) => {
        if (isUnmountedRef.current) return
        setList(list)
      })
    },
  }), [])

  if (!list.length) return null

  return (
    <View>
      <IOSText
        variant="headline"
        color={colors.label}
        style={{ marginTop: spacing.xl, marginBottom: spacing.xs }}
      >{t('search_hot_search')}</IOSText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {
          list.map(keyword => <ListItem keyword={keyword} key={keyword} onSearch={props.onSearch} />)
        }
      </View>
    </View>
  )
})
