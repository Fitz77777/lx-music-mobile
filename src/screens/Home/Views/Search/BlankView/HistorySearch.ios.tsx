import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { type InitState } from '@/store/hotSearch/state'
import IOSText from '@/components/ios/Text'
import IOSIcon from '@/components/ios/Icon'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { useI18n } from '@/lang'
import { clearHistoryList, getSearchHistory, removeHistoryWord } from '@/core/search/search'

export type List = NonNullable<InitState['sourceList'][keyof InitState['sourceList']]>

const ListItem = ({ keyword, onSearch, onRemove }: {
  keyword: string
  onSearch: (keyword: string) => void
  onRemove: (keyword: string) => void
}) => {
  const { colors, spacing } = useIOSTheme()
  return (
    <Pressable
      onPress={() => { onSearch(keyword) }}
      onLongPress={() => { onRemove(keyword) }}
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

interface HistorySearchProps {
  onSearch: (keyword: string) => void
}
export interface HistorySearchType {
  show: () => void
}

/** iOS 历史搜索：胶囊标签 + 清空按钮，长按删除单条 */
export default forwardRef<HistorySearchType, HistorySearchProps>((props, ref) => {
  const [list, setList] = useState<List>([])
  const isUnmountedRef = useRef(false)
  const t = useI18n()
  const { colors, spacing } = useIOSTheme()

  useEffect(() => {
    isUnmountedRef.current = false
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  useImperativeHandle(ref, () => ({
    show() {
      void getSearchHistory().then((list) => {
        if (isUnmountedRef.current) return
        setList(list)
      })
    },
  }), [])

  const handleClear = () => {
    clearHistoryList()
    setList([])
  }

  const handleRemove = useCallback((keyword: string) => {
    setList(list => {
      list = [...list]
      const index = list.indexOf(keyword)
      list.splice(index, 1)
      removeHistoryWord(index)
      return list
    })
  }, [])

  if (!list.length) return null

  return (
    <View>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xs,
      }}>
        <IOSText variant="headline" style={{ flex: 1 }}>{t('search_history_search')}</IOSText>
        <Pressable onPress={handleClear} hitSlop={10} style={{ padding: spacing.xs }}>
          <IOSIcon name="eraser" size={17} color={colors.secondaryLabel} />
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {
          list.map(keyword => <ListItem keyword={keyword} key={keyword} onSearch={props.onSearch} onRemove={handleRemove} />)
        }
      </View>
    </View>
  )
})
