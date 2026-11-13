import { memo, useEffect, useState } from 'react'
import { View } from 'react-native'

import Section from '../../components/Section'
import Button from '../../components/Button'
import { IOSListRow } from '@/components/ios'
import { toast, resetNotificationPermissionCheck, confirmDialog, resetIgnoringBatteryOptimizationCheck } from '@/utils/tools'
import { getAppCacheSize, clearAppCache } from '@/utils/nativeModules/cache'
import { getCacheSize, clearCache } from '@/plugins/player/utils'
import { sizeFormate } from '@/utils'
import { useI18n } from '@/lang'
import { clearMusicUrl } from '@/utils/data'

/**
 * iOS 资源缓存：一行只读信息 + 一个整行按钮，行高与其他设置行一致。
 */
export default memo(() => {
  const t = useI18n()
  const [cleaning, setCleaning] = useState(false)
  const [cacheSize, setCacheSize] = useState<string | null>(null)

  const handleGetAppCacheSize = () => {
    void Promise.all([
      getAppCacheSize().catch(() => 0),
      getCacheSize().catch(() => 0),
    ]).then(([size, size2]) => {
      setCacheSize(sizeFormate(size + size2))
    }).catch(() => {
      setCacheSize(sizeFormate(0))
    })
  }

  const handleCleanCache = () => {
    if (cacheSize == null) return
    void confirmDialog({
      message: t('confirm_tip'),
      confirmButtonText: t('list_remove_tip_button'),
    }).then(confirm => {
      if (!confirm) return
      setCleaning(true)
      void Promise.all([
        clearAppCache(),
        clearCache(),
        clearMusicUrl(),
        resetNotificationPermissionCheck(),
        resetIgnoringBatteryOptimizationCheck(),
      ]).then(() => {
        toast(t('setting_other_cache_clear_success_tip'))
      }).finally(() => {
        handleGetAppCacheSize()
        setCleaning(false)
      })
    })
  }

  useEffect(() => {
    handleGetAppCacheSize()
  }, [])

  return (
    <Section title={t('setting__other_resource_cache')}>
      <IOSListRow
        showSeparator={false}
        title={cacheSize == null ? t('setting_other_cache_getting') : t('setting_other_cache_size') + cacheSize}
      />
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <Button style={{ alignSelf: 'stretch' }} disabled={cleaning} onPress={handleCleanCache}>
          {t('setting_other_cache_clear_btn')}
        </Button>
      </View>
    </Section>
  )
})
