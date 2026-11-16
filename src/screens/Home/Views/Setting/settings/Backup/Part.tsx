import { memo, useRef } from 'react'
import { View } from 'react-native'

import Section from '../../components/Section'
import Button from '../../components/Button'
import { useI18n } from '@/lang'
import ListImportExport, { type ListImportExportType } from './ListImportExport'

/** iOS 列表备份：两个等宽按钮并排，不再是两行文字链接 */
export default memo(() => {
  const t = useI18n()
  const listImportExportRef = useRef<ListImportExportType>(null)

  return (
    <>
      <Section title={t('setting_backup_part')}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', gap: 10 }}>
          <Button
            style={{ flex: 1, alignSelf: 'stretch' }}
            onPress={() => listImportExportRef.current?.import()}
          >{t('setting_backup_part_import_list')}</Button>
          <Button
            style={{ flex: 1, alignSelf: 'stretch' }}
            onPress={() => listImportExportRef.current?.export()}
          >{t('setting_backup_part_export_list')}</Button>
        </View>
      </Section>
      <ListImportExport ref={listImportExportRef} />
    </>
  )
})
