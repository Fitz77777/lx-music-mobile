import { memo, type ReactNode } from 'react'
import { Modal, Pressable, View } from 'react-native'
import { useI18n } from '@/lang'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import IOSText from './Text'

export interface SheetProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  /** 右上角操作，例如“完成” */
  headerRight?: ReactNode
  /** 是否显示顶部拖动条 */
  grabber?: boolean
}

/**
 * iOS pageSheet 封装。
 * 使用原生 Modal 的 pageSheet 呈现，保留系统下拉关闭手势。
 */
export default memo(({ visible, onClose, title, children, headerRight, grabber = true }: SheetProps) => {
  const t = useI18n()
  const { colors, accent, spacing, hairline } = useIOSTheme()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: colors.groupedBackground }}>
        {grabber
          ? (
              <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
                <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: colors.tertiaryLabel }} />
              </View>
            )
          : null}
        <View style={{
          height: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          borderBottomWidth: hairline,
          borderBottomColor: colors.separator,
        }}>
          <Pressable onPress={onClose} hitSlop={8} style={{ minWidth: 56 }}>
            <IOSText variant="body" color={accent}>{t('cancel')}</IOSText>
          </Pressable>
          <IOSText variant="headline" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{title ?? ''}</IOSText>
          <View style={{ minWidth: 56, alignItems: 'flex-end' }}>{headerRight}</View>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </Modal>
  )
})
