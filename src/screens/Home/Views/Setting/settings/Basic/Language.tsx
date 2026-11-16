import { memo, useMemo } from 'react'

import type { I18n } from '@/lang'
import { useI18n, langList } from '@/lang'
import { setLanguage } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

/** iOS 语言选择：行内显示当前语言，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const activeId = useSettingValue('common.langId')

  const options = useMemo<SelectRowOption[]>(() => langList.map(({ locale, name }) => ({
    value: locale,
    label: name,
  })), [])

  return (
    <SelectRow
      label={t('setting_basic_lang')}
      value={activeId ?? ''}
      options={options}
      onSelect={value => { setLanguage(value as I18n['locale']) }}
    />
  )
})
