import { memo, useCallback, useState } from 'react'
import { View } from 'react-native'

import Button from '../../components/Button'
import { createStyle, toast } from '@/utils/tools'
import { useI18n } from '@/lang'
import { useSetting } from '@/store/setting/hook'
import { getProxyConfigFromSetting } from '@/core/proxy'
import { testProxyConnection } from '@/utils/nativeModules/proxy'

export default memo(() => {
  const t = useI18n()
  const setting = useSetting()
  const [testing, setTesting] = useState(false)

  const handleTest = useCallback(() => {
    if (testing) return

    const config = getProxyConfigFromSetting(setting)
    // 测试时忽略“总开关”，只要填了地址端口就可以验证
    config.enabled = true
    if (!config.host) {
      toast(t('setting_proxy_error_host'))
      return
    }
    if (!(config.port > 0 && config.port <= 65535)) {
      toast(t('setting_proxy_error_port'))
      return
    }

    setTesting(true)
    void testProxyConnection(config).then(({ code, authRequired }) => {
      if (authRequired) {
        toast(t('setting_proxy_test_auth_failed'), 'long')
      } else if (code == 200) {
        toast(t('setting_proxy_test_success'))
      } else {
        toast(t('setting_proxy_test_code', { code }), 'long')
      }
    }).catch((err: any) => {
      toast(t('setting_proxy_test_failed', { msg: String(err?.message ?? err) }), 'long')
    }).finally(() => {
      setTesting(false)
    })
  }, [setting, testing, t])

  return (
    <View style={styles.content}>
      <Button disabled={testing} onPress={handleTest}>
        {t(testing ? 'setting_proxy_testing' : 'setting_proxy_test')}
      </Button>
    </View>
  )
})

const styles = createStyle({
  content: {
    flexDirection: 'row',
    marginTop: 10,
    marginLeft: 10,
  },
})
