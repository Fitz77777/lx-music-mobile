import { memo, useMemo } from 'react'

import { useI18n } from '@/lang'
import { setFontSize } from '@/core/common'
import { useFontSize } from '@/store/common/hook'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

const LIST = [
  { size: 0.8, name: 'setting_basic_font_size_80' },
  { size: 0.9, name: 'setting_basic_font_size_90' },
  { size: 1, name: 'setting_basic_font_size_100' },
  { size: 1.1, name: 'setting_basic_font_size_110' },
  { size: 1.2, name: 'setting_basic_font_size_120' },
  { size: 1.3, name: 'setting_basic_font_size_130' },
] as const

/** iOS 字体大小选择：行内显示当前档位，点击下拉切换。 */
export default memo(() => {
  const t = useI18n()
  const fontSize = useFontSize()

  const options = useMemo<SelectRowOption[]>(() => LIST.map(({ size, name }) => ({
    value: String(size),
    label: t(name),
  })), [t])

  return (
    <SelectRow
      label={t('setting_basic_font_size')}
      value={String(fontSize)}
      options={options}
      onSelect={value => { setFontSize(Number(value)) }}
    />
  )
})
