import { memo, useMemo } from 'react'

import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

type Position = LX.AppSetting['common.drawerLayoutPosition']

/** iOS 弹出方向选择：行内显示当前值，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const value = useSettingValue('common.drawerLayoutPosition')

  const options = useMemo<SelectRowOption[]>(() => [
    { value: 'left', label: t('setting_basic_drawer_layout_position_left') },
    { value: 'right', label: t('setting_basic_drawer_layout_position_right') },
  ], [t])

  return (
    <SelectRow
      label={t('setting_basic_drawer_layout_position')}
      value={value}
      options={options}
      onSelect={next => { updateSetting({ 'common.drawerLayoutPosition': next as Position }) }}
    />
  )
})
