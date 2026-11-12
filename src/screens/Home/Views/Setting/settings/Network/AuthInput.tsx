import { memo } from 'react'
import { View } from 'react-native'

import InputItem, { type InputItemProps } from '../../components/InputItem'
import { updateSetting } from '@/core/common'
import { useSettingValue } from '@/store/setting/hook'
import { useI18n } from '@/lang'

export default memo(() => {
  const t = useI18n()
  const username = useSettingValue('network.proxy.username')
  const password = useSettingValue('network.proxy.password')

  const setUsername: InputItemProps['onChanged'] = (value, callback) => {
    const newValue = value.trim()
    callback(newValue)
    if (newValue == username) return
    updateSetting({ 'network.proxy.username': newValue })
  }

  const setPassword: InputItemProps['onChanged'] = (value, callback) => {
    callback(value)
    if (value == password) return
    updateSetting({ 'network.proxy.password': value })
  }

  return (
    <View>
      <InputItem
        value={username}
        label={t('setting_proxy_username_label')}
        onChanged={setUsername}
        placeholder={t('setting_proxy_auth_tip')}
        autoCapitalize="none"
        autoCorrect={false} />
      <InputItem
        value={password}
        label={t('setting_proxy_password_label')}
        onChanged={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false} />
    </View>
  )
})
