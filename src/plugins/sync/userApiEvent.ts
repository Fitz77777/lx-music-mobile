import { getUserApiData, overwriteUserApiData } from '@/utils/data'
import { setUserApiList } from '@/core/userApi'
import { setApiSource } from '@/core/apiSource'
import settingState from '@/store/setting/state'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { event as userApiEvent } from '@/store/userApi/event'
import { toMD5 } from '@/utils/tools'

// 应用远端数据期间拦截 list_changed 事件的回推，避免 A/B 双端应答死循环
let isRemoteApplying = false

const serializeUserApiData = (data: LX.UserApi.UserApiData) => {
  // 与 server 端快照 key 的序列化方式保持一致（scripts 按 id 排序）
  const scripts: Record<string, string> = {}
  for (const id of Object.keys(data.scripts).sort()) scripts[id] = data.scripts[id]
  return JSON.stringify({
    apis: data.apis,
    scripts,
  })
}

export const getUserApiDataMD5 = async(): Promise<string> => {
  const data = await getUserApiData()
  return toMD5(serializeUserApiData(data))
}

export const getLocalUserApiData = async(): Promise<LX.UserApi.UserApiData> => {
  return getUserApiData()
}

export const setLocalUserApiData = async(data: LX.UserApi.UserApiData) => {
  isRemoteApplying = true
  try {
    const list = await overwriteUserApiData(data)

    // 当前使用中的源被同步删除时，回退到内置源（与 setUserApi 失败路径的行为一致）
    const currentSource = settingState.setting['common.apiSource']
    if (/^user_api/.test(currentSource) && !list.some(api => api.id == currentSource)) {
      const fallback = apiSourceInfo.find(api => !api.disabled)
      if (fallback) setApiSource(fallback.id)
    }

    setUserApiList(list)
  } finally {
    isRemoteApplying = false
  }
}

export const registerUserApiActionEvent = (sendUserApiAction: (action: LX.Sync.UserApi.ActionList) => (void | Promise<void>)) => {
  const list_changed = async(_list: LX.UserApi.UserApiInfo[]) => {
    if (isRemoteApplying) return
    await sendUserApiAction({ action: 'user_api_data_overwrite', data: await getUserApiData() })
  }

  userApiEvent.on('list_changed', list_changed)
  return () => {
    userApiEvent.off('list_changed', list_changed)
  }
}

export const handleRemoteUserApiAction = async(event: LX.Sync.UserApi.ActionList) => {
  switch (event.action) {
    case 'user_api_data_overwrite':
      await setLocalUserApiData(event.data)
      break
    default:
      throw new Error('unknown user api sync action')
  }
}
