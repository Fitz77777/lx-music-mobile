import { memo, useCallback, useEffect, useState } from 'react'

import { setTheme } from '@/core/theme'
import { useI18n } from '@/lang'
import { useSettingValue } from '@/store/setting/hook'
import { getAllThemes } from '@/theme/themes'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'

/**
 * iOS 主题颜色选择：行内显示当前主题色点与名称，点击下拉切换。
 * 亮暗仍跟随系统，这里只切换强调色。
 */
export default memo(() => {
  const t = useI18n()
  const activeId = useSettingValue('theme.id')
  const [options, setOptions] = useState<SelectRowOption[]>([])

  useEffect(() => {
    let isUnmounted = false
    void getAllThemes().then(({ themes, userThemes }) => {
      if (isUnmounted) return
      setOptions([
        ...themes.map(({ id, config }) => ({
          value: id,
          label: t(`theme_${id}`),
          color: config.themeColors['c-theme'],
        })),
        ...userThemes.map(({ id, name, config }) => ({
          value: id,
          label: name,
          color: config.themeColors['c-theme'],
        })),
      ])
    })
    return () => {
      isUnmounted = true
    }
  }, [t])

  const handleSelect = useCallback((id: string) => {
    requestAnimationFrame(() => {
      setTheme(id)
    })
  }, [])

  return (
    <SelectRow
      label={t('setting_basic_theme')}
      value={activeId}
      options={options}
      onSelect={handleSelect}
    />
  )
})
