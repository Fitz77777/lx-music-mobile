import { memo, useMemo } from 'react'

import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

/** iOS 添加歌曲位置选择：行内显示当前值，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const value = useSettingValue('list.addMusicLocationType')

  const options = useMemo<SelectRowOption[]>(() => [
    { value: 'top', label: t('setting_list_add_music_location_type_top') },
    { value: 'bottom', label: t('setting_list_add_music_location_type_bottom') },
  ], [t])

  return (
    <SelectRow
      label={t('setting_list_add_music_location_type')}
      value={value}
      options={options}
      onSelect={next => { updateSetting({ 'list.addMusicLocationType': next as LX.AddMusicLocationType }) }}
    />
  )
})
