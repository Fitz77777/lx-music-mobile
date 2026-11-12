import { memo } from 'react'

import InputItem, { type InputItemProps } from '../../components/InputItem'
import { updateSetting } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'

const nonDigitRxp = /\D/g

export default memo(() => {
  const t = useI18n()
  const port = useSettingValue('network.proxy.port')

  const setPort: InputItemProps['onChanged'] = (value, callback) => {
    const digits = value.replace(nonDigitRxp, '').slice(0, 5)
    const num = Number.parseInt(digits)
    const newPort = Number.isNaN(num) ? '' : String(Math.min(65535, num))
    callback(newPort)
    if (newPort == port) return
    updateSetting({ 'network.proxy.port': newPort })
  }

  return (
    <InputItem
      value={port}
      label={t('setting_proxy_port_label')}
      onChanged={setPort}
      placeholder={t('setting_proxy_port_tip')}
      keyboardType="number-pad"
      maxLength={5} />
  )
})
