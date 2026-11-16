import { memo, useEffect, useState } from 'react'
import { View } from 'react-native'

import Section from '../../components/Section'
import Button from '../../components/Button'
import { IOSListRow } from '@/components/ios'
import { toast } from '@/utils/tools'
import { useI18n } from '@/lang'
import { clearLyric, clearOtherSource, getMetaCache } from '@/utils/data'

/**
 * iOS 其他缓存：两行数量信息 + 两个整行按钮，行高与其他设置行一致。
 */
export default memo(() => {
  const t = useI18n()
  const [otherSourceCleaning, setOtherSourceCleaning] = useState(false)
  const [lyricCleaning, setLyricCleaning] = useState(false)
  const [cacheInfo, setCacheInfo] = useState<{
    otherSourceKeys: null | string[]
    lyricKeys: null | string[]
  }>({ otherSourceKeys: null, lyricKeys: null })

  const handleGetMetaCache = () => {
    void getMetaCache().then((info) => {
      setCacheInfo(info)
    })
  }

  const handleCleanOtherSourceCache = () => {
    if (!cacheInfo.otherSourceKeys?.length) return
    setOtherSourceCleaning(true)
    void clearOtherSource(cacheInfo.otherSourceKeys).then(() => {
      toast(t('setting_other_cache_clear_success_tip'))
    }).finally(() => {
      handleGetMetaCache()
      setOtherSourceCleaning(false)
    })
  }

  const handleCleanLyricKeysCache = () => {
    if (!cacheInfo.lyricKeys?.length) return
    setLyricCleaning(true)
    void clearLyric(cacheInfo.lyricKeys).then(() => {
      toast(t('setting_other_cache_clear_success_tip'))
    }).finally(() => {
      handleGetMetaCache()
      setLyricCleaning(false)
    })
  }

  useEffect(() => {
    handleGetMetaCache()
  }, [])

  return (
    <Section title={t('setting__other_meta_cache')}>
      <IOSListRow
        showSeparator={false}
        title={cacheInfo.otherSourceKeys == null
          ? t('setting_other_cache_getting')
          : `${t('setting__other_other_source_label')}${cacheInfo.otherSourceKeys.length}`}
      />
      <IOSListRow
        showSeparator={false}
        title={cacheInfo.lyricKeys == null
          ? t('setting_other_cache_getting')
          : `${t('setting__other_lyric_raw_label')}${cacheInfo.lyricKeys.length}`}
      />
      <View style={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        <Button
          style={{ alignSelf: 'stretch' }}
          disabled={otherSourceCleaning}
          onPress={handleCleanOtherSourceCache}
        >{t('setting__other_other_source_clear_btn')}</Button>
        <Button
          style={{ alignSelf: 'stretch' }}
          disabled={lyricCleaning}
          onPress={handleCleanLyricKeysCache}
        >{t('setting__other_lyric_raw_clear_btn')}</Button>
      </View>
    </Section>
  )
})
