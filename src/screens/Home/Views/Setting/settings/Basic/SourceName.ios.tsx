import { memo, useMemo } from 'react'

import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

type SourceNameType = LX.AppSetting['common.sourceNameType']

/** iOS 歌曲来源名称选择：行内显示当前值，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const value = useSettingValue('common.sourceNameType')

  const options = useMemo<SelectRowOption[]>(() => [
    { value: 'real', label: t('setting_basic_sourcename_real') },
    { value: 'alias', label: t('setting_basic_sourcename_alias') },
  ], [t])

  return (
    <SelectRow
      label={t('setting_basic_sourcename')}
      value={value}
      options={options}
      onSelect={next => { updateSetting({ 'common.sourceNameType': next as SourceNameType }) }}
    />
  )
})
