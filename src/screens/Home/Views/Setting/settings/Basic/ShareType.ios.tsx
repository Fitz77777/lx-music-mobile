import { memo, useMemo } from 'react'

import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

type ShareType = LX.AppSetting['common.shareType']

/** iOS 分享方式选择：行内显示当前值，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const value = useSettingValue('common.shareType')

  const options = useMemo<SelectRowOption[]>(() => [
    { value: 'system', label: t('setting_basic_share_type_system') },
    { value: 'clipboard', label: t('setting_basic_share_type_clipboard') },
  ], [t])

  return (
    <SelectRow
      label={t('setting_basic_share_type')}
      value={value}
      options={options}
      onSelect={next => { updateSetting({ 'common.shareType': next as ShareType }) }}
    />
  )
})
