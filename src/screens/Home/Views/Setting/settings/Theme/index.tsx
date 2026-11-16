import { memo } from 'react'

import Section from '../../components/Section'
import Theme from './Theme'
import IsDynamicBg from './IsDynamicBg'
import IsHideBgDark from './IsHideBgDark'
import { useI18n } from '@/lang'

/**
 * iOS 主题设置：强调色选择 + 背景相关开关。
 * 亮暗跟随系统，字体阴影这类在 iOS 界面层不生效的选项不展示。
 */
export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_basic_theme')}>
      <Theme />
      <IsDynamicBg />
      <IsHideBgDark />
    </Section>
  )
})
