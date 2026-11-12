import { memo } from 'react'
import { View } from 'react-native'

import CheckBoxItem from '../../components/CheckBoxItem'
import { updateSetting } from '@/core/common'
import { useSetting } from '@/store/setting/hook'
import { useI18n } from '@/lang'
import { createStyle, toast } from '@/utils/tools'

export default memo(() => {
  const t = useI18n()
  const setting = useSetting()
  const enable = setting['network.proxy.enable']

  const handleChange = (checked: boolean) => {
    // 配置不完整时不允许打开，否则看起来像开了代理但实际上全部直连
    if (checked) {
      const host = setting['network.proxy.host'].trim()
      const port = Number.parseInt(setting['network.proxy.port'])
      if (!host) {
        toast(t('setting_proxy_error_host'), 'long')
        return
      }
      if (!(port > 0 && port <= 65535)) {
        toast(t('setting_proxy_error_port'), 'long')
        return
      }
    }
    updateSetting({ 'network.proxy.enable': checked })
  }

  return (
    <View style={styles.content}>
      <CheckBoxItem
        check={enable}
        label={t('setting_proxy_enable')}
        onChange={handleChange} />
    </View>
  )
})

const styles = createStyle({
  content: {
    marginTop: 5,
  },
})
