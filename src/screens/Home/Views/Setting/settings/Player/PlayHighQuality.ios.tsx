import { memo, useMemo } from 'react'

import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { useI18n } from '@/lang'
import { TRY_QUALITYS_LIST } from '@/core/music/utils'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

/** iOS 优先播放音质选择：行内显示当前音质，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const value = useSettingValue('player.playQuality')

  const options = useMemo<SelectRowOption[]>(() => {
    const list = [...TRY_QUALITYS_LIST, '128k'].reverse() as LX.Quality[]
    return list.map(quality => ({ value: quality, label: quality }))
  }, [])

  return (
    <SelectRow
      label={t('setting_play_play_quality')}
      value={value}
      options={options}
      onSelect={next => { updateSetting({ 'player.playQuality': next as LX.Quality }) }}
    />
  )
})
