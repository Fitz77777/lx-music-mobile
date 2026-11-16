import { memo, useCallback, useState, useEffect, useRef, useMemo } from 'react'
import { TextInput, View } from 'react-native'

import CheckBoxItem from '../../components/CheckBoxItem'
import Button from '../../components/Button'
import Section from '../../components/Section'
import ConfirmAlert, { type ConfirmAlertType } from '@/components/common/ConfirmAlert'
import Input from '@/components/common/Input'
import IOSText from '@/components/ios/Text'
import { IOSListRow } from '@/components/ios'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { connectServer, disconnectServer } from '@/plugins/sync'
import { getWIFIIPV4Address } from '@/utils/nativeModules/utils'
import { toast } from '@/utils/tools'
import { useI18n } from '@/lang'
import { updateSetting } from '@/core/common'
import { addSyncHostHistory, getSyncHost, setSyncHost } from '@/utils/data'
import { setSyncMessage } from '@/core/sync'
import { useSettingValue } from '@/store/setting/hook'
import { useStatus } from '@/store/sync/hook'
import { SYNC_CODE } from '@/plugins/sync/constants'
import { HistoryList, type HistoryListType, type SyncHistoryItem } from './History'

const addressRxp = /^https?:\/\/\S+/i

/**
 * iOS 数据同步：
 * 启用同步开关 / 「地址」输入行（右侧跟一个「历史」按钮）/ 当前设备地址与状态。
 * 逻辑与 Android 版一致，只是排布改成设置行样式。
 */
export default memo(({ host, setHost }: {
  host: string
  setHost: (host: string) => void
}) => {
  const t = useI18n()
  const { colors, spacing, typography, radius } = useIOSTheme()
  const syncStatus = useStatus()
  const isEnableSync = useSettingValue('sync.enable')
  const isUnmountedRef = useRef(true)
  const [address, setAddress] = useState('')
  const [authCode, setAuthCode] = useState('')
  const [hostText, setHostText] = useState('')
  const confirmAlertRef = useRef<ConfirmAlertType>(null)
  const historyRef = useRef<HistoryListType>(null)

  useEffect(() => {
    isUnmountedRef.current = false
    void getSyncHost().then(host => {
      if (!isUnmountedRef.current) return
      setHost(host)
    })
    void getWIFIIPV4Address().then(address => {
      if (!isUnmountedRef.current) return
      setAddress(address)
    })

    return () => {
      isUnmountedRef.current = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 外部（历史记录选择）更新 host 时同步输入框
  useEffect(() => {
    setHostText(addressRxp.test(host) ? host : '')
  }, [host])

  useEffect(() => {
    switch (syncStatus.message) {
      case SYNC_CODE.authFailed:
        toast(t('setting_sync_code_fail'))
      case SYNC_CODE.missingAuthCode:
        confirmAlertRef.current?.setVisible(true)
        break
      case SYNC_CODE.msgBlockedIp:
        toast(t('setting_sync_code_blocked_ip'))
        break
      default:
        break
    }
  }, [syncStatus.message, t])

  const setIsEnableSync = useCallback((enable: boolean) => {
    updateSetting({ 'sync.enable': enable })
  }, [])

  const handleSetEnableSync = useCallback((enable: boolean) => {
    setIsEnableSync(enable)
    if (enable) void addSyncHostHistory(host)
    void (enable ? connectServer(host) : disconnectServer())
  }, [host, setIsEnableSync])

  const handleUpdateHost = useCallback((h: string) => {
    if (h == host) return
    void setSyncHost(h)
    setHost(h)
  }, [host, setHost])

  const commitHost = useCallback(() => {
    const value = hostText.trim()
    if (value == host) return
    if (!value) {
      handleUpdateHost('')
      return
    }
    if (!addressRxp.test(value)) {
      toast(t('setting_sync_host_value_error_tip'), 'long')
      setHostText(addressRxp.test(host) ? host : '')
      return
    }
    handleUpdateHost(value)
  }, [hostText, host, handleUpdateHost, t])

  const handleSelectHistory = useCallback((item: SyncHistoryItem) => {
    setHost(item)
    void setSyncHost(item)
  }, [setHost])

  const status = useMemo(() => {
    let status
    switch (syncStatus.message) {
      case SYNC_CODE.msgBlockedIp:
        status = t('setting_sync_code_blocked_ip')
        break
      case SYNC_CODE.authFailed:
        status = t('setting_sync_code_fail')
        break
      default:
        status = syncStatus.message
          ? syncStatus.message
          : syncStatus.status
            ? t('setting_sync_status_enabled')
            : t('sync_status_disabled')
        break
    }
    return status
  }, [syncStatus.message, syncStatus.status, t])

  const handleCancelSetCode = useCallback(() => {
    setSyncMessage('')
    confirmAlertRef.current?.setVisible(false)
  }, [])
  const handleSetCode = useCallback(() => {
    void connectServer(host, authCode)
    setAuthCode('')
    confirmAlertRef.current?.setVisible(false)
  }, [host, authCode])

  return (
    <>
      <Section title={t('setting_sync')}>
        <CheckBoxItem
          disabled={!host}
          check={isEnableSync}
          label={t('setting_sync_enable')}
          onChange={handleSetEnableSync}
        />
        <View style={{
          minHeight: 48,
          paddingHorizontal: spacing.lg,
          paddingVertical: 7,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
          <IOSText variant="body">{t('setting_sync_host_label_short')}</IOSText>
          <TextInput
            value={hostText}
            onChangeText={setHostText}
            editable={!isEnableSync}
            placeholder={t('setting_sync_host_value_tip')}
            placeholderTextColor={colors.placeholderText}
            onBlur={commitHost}
            onSubmitEditing={commitHost}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            inputMode="url"
            style={{
              flex: 1,
              minWidth: 0,
              marginLeft: spacing.md,
              padding: 0,
              fontSize: typography.body.fontSize,
              textAlign: 'right',
              color: isEnableSync ? colors.tertiaryLabel : colors.label,
            }}
          />
          <Button
            style={{
              minHeight: 32,
              paddingVertical: 0,
              paddingHorizontal: 12,
              marginLeft: spacing.sm,
            }}
            disabled={isEnableSync}
            onPress={() => { historyRef.current?.show() }}
          >{t('setting_sync_history_short')}</Button>
        </View>
        <IOSListRow showSeparator={false} title={t('setting_sync_address', { address })} />
        <IOSListRow showSeparator={false} title={t('setting_sync_status', { status })} />
      </Section>
      <HistoryList ref={historyRef} onSelect={handleSelectHistory} />
      <ConfirmAlert
        onCancel={handleCancelSetCode}
        onConfirm={handleSetCode}
        ref={confirmAlertRef}
      >
        <View style={{ flexGrow: 1, flexShrink: 1, flexDirection: 'column' }}>
          <IOSText variant="footnote" style={{ marginBottom: 5 }}>{t('setting_sync_code_label')}</IOSText>
          <Input
            placeholder={t('setting_sync_code_input_tip')}
            value={authCode}
            onChangeText={setAuthCode}
            style={{
              flexGrow: 1,
              flexShrink: 1,
              minWidth: 260,
              borderRadius: radius.control,
              backgroundColor: colors.fill,
            }}
          />
        </View>
      </ConfirmAlert>
    </>
  )
})
