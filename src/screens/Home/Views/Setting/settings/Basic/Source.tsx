import { memo, useCallback, useMemo, useRef } from 'react'
import { View } from 'react-native'

import { useI18n } from '@/lang'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { useSettingValue } from '@/store/setting/hook'
import { useStatus, useUserApiList } from '@/store/userApi'
import { setApiSource } from '@/core/apiSource'
import { isUserApiSupported } from '@/utils/nativeModules/userApi'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import Button from '../../components/Button'
import SelectRow, { type SelectRowOption } from '../../components/SelectRow'
import UserApiEditModal, { type UserApiEditModalType } from './UserApiEditModal'

const apiSourceList = apiSourceInfo.map(api => ({
  id: api.id,
  name: api.name,
  disabled: api.disabled,
}))

/** iOS 自定义源选择：行内显示当前源，点击下拉切换；用户源带版本/状态说明。 */
export default memo(() => {
  const t = useI18n()
  const { colors, hairline } = useIOSTheme()
  const apiSourceSetting = useSettingValue('common.apiSource')
  const userApiListRaw = useUserApiList()
  const apiStatus = useStatus()
  const modalRef = useRef<UserApiEditModalType>(null)

  const options = useMemo<SelectRowOption[]>(() => {
    const base = apiSourceList.map(api => ({
      // @ts-expect-error 动态 i18n key
      label: t(`setting_basic_source_${api.id}`) || api.name,
      value: api.id,
    }))
    if (!isUserApiSupported) return base

    let status = ''
    if (apiStatus.status) status = t('setting_basic_source_status_success')
    else if (apiStatus.message == 'initing') status = t('setting_basic_source_status_initing')
    else status = t('setting_basic_source_status_failed')

    return [
      ...base,
      ...userApiListRaw.map(api => ({
        value: api.id,
        label: api.name,
        description: [
          [/^\d/.test(api.version) ? `v${api.version}` : api.version].filter(Boolean).join(', '),
          api.id == apiSourceSetting ? status : '',
        ].filter(Boolean).join(' · '),
      })),
    ]
  }, [apiSourceSetting, apiStatus, t, userApiListRaw])

  const handleSelect = useCallback((id: string) => {
    setApiSource(id)
  }, [])

  return (
    <>
      <SelectRow
        label={t('setting_basic_source')}
        value={apiSourceSetting}
        options={options}
        onSelect={handleSelect}
      />
      {
        isUserApiSupported
          ? (
              <>
                <View style={{
                  borderTopWidth: hairline,
                  borderTopColor: colors.rowSeparator,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                }}>
                  <Button style={{ alignSelf: 'stretch' }} onPress={() => { modalRef.current?.show() }}>
                    {t('setting_basic_source_user_api_btn')}
                  </Button>
                </View>
                <UserApiEditModal ref={modalRef} />
              </>
            )
          : null
      }
    </>
  )
})
