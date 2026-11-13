import { memo, useState, useEffect } from 'react'
import { View } from 'react-native'

import Section from '../components/Section'
import Button from '../components/Button'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { sizeFormate } from '@/utils'

import { useI18n } from '@/lang'
import { useVersionDownloadProgressUpdated, useVersionInfo } from '@/store/version/hook'
import { showModal } from '@/core/version'

const currentVer = process.versions.app

/**
 * iOS 版本页：状态、当前/最新版本放在一张卡片里，下面一个整行按钮。
 */
export default memo(() => {
  const t = useI18n()
  const { colors, spacing } = useIOSTheme()
  const versionInfo = useVersionInfo()
  const [title, setTitle] = useState('')
  const [tip, setTip] = useState('')
  const progress = useVersionDownloadProgressUpdated()

  const handleOpenVersionModal = () => {
    showModal()
  }

  useEffect(() => {
    if (versionInfo.isLatest) {
      setTitle(t('version_tip_latest'))
      setTip('')
    } else if (versionInfo.isUnknown) {
      setTitle(t('version_title_unknown'))
      setTip(t('version_tip_unknown'))
    } else {
      switch (versionInfo.status) {
        case 'downloading':
          setTitle(t('version_title_new'))
          setTip(t('version_btn_downloading', {
            total: sizeFormate(progress.total),
            current: sizeFormate(progress.current),
            progress: progress.total ? (progress.current / progress.total * 100).toFixed(2) : '0',
          }))
          break
        case 'downloaded':
          setTitle(t('version_title_update'))
          setTip('')
          break
        case 'checking':
          setTitle(t('version_title_checking'))
          setTip('')
          break
        case 'error':
          setTitle(t('version_title_failed'))
          setTip(t('version_tip_failed'))
          break
        default:
          setTitle(t('version_title_new'))
          setTip('')
          break
      }
    }
  }, [t, versionInfo, progress])

  return (
    <Section title={t('setting_version')}>
      <View style={{ padding: spacing.lg }}>
        <IOSText variant="subheadline" weight="600">{title}</IOSText>
        <IOSText variant="footnote" color={colors.secondaryLabel} style={{ marginTop: 6 }}>
          {t('version_label_latest_ver')}{versionInfo.newVersion?.version ?? '-'}
        </IOSText>
        <IOSText variant="footnote" color={colors.secondaryLabel}>
          {t('version_label_current_ver')}{currentVer}
        </IOSText>
        {tip
          ? (
              <IOSText variant="footnote" color={colors.secondaryLabel} style={{ marginTop: 4 }}>
                {tip}
              </IOSText>
            )
          : null}
        <View style={{ marginTop: spacing.md }}>
          <Button style={{ alignSelf: 'stretch' }} onPress={handleOpenVersionModal}>
            {t('setting_version_show_ver_modal')}
          </Button>
        </View>
      </View>
    </Section>
  )
})
