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

const ListItem = ({ keyword, index, onSearch }: {
  keyword: string
  index: number
  onSearch: (keyword: string) => void
}) => {
  const { colors, accent, isDark, withAlpha } = useIOSTheme()
  const top = index < 3
  return (
    <Pressable
      onPress={() => { onSearch(keyword) }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 18,
        backgroundColor: top ? withAlpha(accent, 0.1) : colors.secondaryGroupedBackground,
        shadowColor: '#000000',
        shadowOpacity: top || isDark ? 0 : 0.07,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        opacity: pressed ? 0.62 : 1,
      })}
    >
      <IOSText
        size={10.5}
        weight="700"
        color={top ? accent : colors.secondaryLabel}
        style={{ opacity: top ? 0.8 : 1 }}
      >{index + 1}</IOSText>
      <IOSText size={14} weight={top ? '600' : '400'} color={top ? accent : colors.label} numberOfLines={1}>
        {keyword}
      </IOSText>
    </Pressable>
  )
}

/** iOS 热门搜索：带排名的胶囊标签，前三名强调色（原型 .hot-tag） */
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
      <View style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        marginTop: spacing.xl,
        marginBottom: spacing.md,
      }}>
        <IOSText size={20} weight="700" color={colors.label} style={{ letterSpacing: 0.2 }}>
          {t('search_hot_search')}
        </IOSText>
        <IOSText size={12.5} color={colors.secondaryLabel}>{t('search_hot_search_sub')}</IOSText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {
          list.map((keyword, index) => (
            <ListItem keyword={keyword} index={index} key={keyword} onSearch={props.onSearch} />
          ))
        }
      </View>
    </View>
  )
})
