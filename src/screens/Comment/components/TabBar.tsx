import { memo, useMemo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import { BorderWidths } from '@/theme'
import { scaleSizeH } from '@/utils/pixelRatio'

export type CommentTabId = 'hot' | 'new'

const BAR_HEIGHT = scaleSizeH(34)

export interface TabBarProps {
  tabs: ReadonlyArray<{ id: CommentTabId, label: string }>
  activeId: CommentTabId
  onTabChange: (id: CommentTabId) => void
  onRefresh: () => void
}

const HeaderItem = ({ id, label, isActive, onPress }: {
  id: CommentTabId
  label: string
  isActive: boolean
  onPress: (id: CommentTabId) => void
}) => {
  const theme = useTheme()
  const components = useMemo(() => (
    <TouchableOpacity style={styles.tabBtn} onPress={() => { !isActive && onPress(id) }}>
      <Text color={isActive ? theme['c-primary-font-active'] : theme['c-font']}>{label}</Text>
    </TouchableOpacity>
  ), [isActive, theme, label, onPress, id])

  return components
}

/** 评论页标签栏：热门 / 最新 + 刷新 */
export default memo(({ tabs, activeId, onTabChange, onRefresh }: TabBarProps) => {
  const theme = useTheme()

  return (
    <View style={{ ...styles.tabHeader, borderBottomColor: theme['c-border-background'], height: BAR_HEIGHT }}>
      <View style={styles.left}>
        {tabs.map(({ id, label }) => <HeaderItem id={id} label={label} key={id} isActive={activeId == id} onPress={onTabChange} />)}
      </View>
      <View>
        <TouchableOpacity onPress={onRefresh} style={{ ...styles.btn, width: BAR_HEIGHT }}>
          <Icon name="available_updates" size={20} color={theme['c-600']} />
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = createStyle({
  tabHeader: {
    flexDirection: 'row',
    paddingRight: 10,
    borderBottomWidth: BorderWidths.normal,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 5,
  },
  tabBtn: {
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
})
