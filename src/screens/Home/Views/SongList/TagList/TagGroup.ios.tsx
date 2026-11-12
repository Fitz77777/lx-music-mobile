import { Pressable, View } from 'react-native'

import { type TagInfoItem } from '@/store/songlist/state'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

export interface TagGroupProps {
  name: string
  list: TagInfoItem[]
  onTagChange: (name: string, id: string) => void
  activeId: string
}

/** iOS 歌单标签组：分组标题 + 胶囊标签 */
export default ({ name, list, onTagChange, activeId }: TagGroupProps) => {
  const { colors, accent, spacing } = useIOSTheme()

  return (
    <View style={{ marginBottom: spacing.md }}>
      {
        name
          ? (
              <IOSText
                variant="footnote"
                color={colors.secondaryLabel}
                style={{
                  marginTop: spacing.lg,
                  marginBottom: spacing.sm,
                  textTransform: 'uppercase',
                }}
              >{name}</IOSText>
            )
          : null
      }
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {
          list.map(item => {
            const active = activeId == item.id
            return (
              <Pressable
                key={item.id}
                onPress={() => { onTagChange(item.name, item.id) }}
                style={({ pressed }) => ({
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm - 1,
                  marginRight: spacing.sm,
                  marginBottom: spacing.sm,
                  borderRadius: 999,
                  backgroundColor: active ? accent : pressed ? colors.tertiaryFill : colors.secondaryFill,
                })}
              >
                <IOSText
                  variant="subheadline"
                  weight={active ? '600' : '400'}
                  color={active ? '#FFFFFF' : colors.label}
                >{item.name}</IOSText>
              </Pressable>
            )
          })
        }
      </View>
    </View>
  )
}
