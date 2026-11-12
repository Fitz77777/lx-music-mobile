import { memo } from 'react'

import InputItem, { type InputItemProps } from '../../components/InputItem'
import { updateSetting } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'

const protocolRxp = /^[a-z][a-z0-9+.-]*:\/\//i
const pathRxp = /\/.*$/

export default memo(() => {
  const t = useI18n()
  const host = useSettingValue('network.proxy.host')

  const setHost: InputItemProps['onChanged'] = (value, callback) => {
    // 顺手清理掉用户从别处复制过来的 http:// 前缀与路径
    const newHost = value.trim().replace(protocolRxp, '').replace(pathRxp, '')
    callback(newHost)
    if (newHost == host) return
    updateSetting({ 'network.proxy.host': newHost })
  }

  return (
    <InputItem
      value={host}
      label={t('setting_proxy_host_label')}
      onChanged={setHost}
      placeholder={t('setting_proxy_host_tip')}
      keyboardType="url"
      autoCapitalize="none"
      autoCorrect={false} />
  )
})
