import { getUserApiData, overwriteUserApiData } from '@/utils/data'
import { setUserApiList } from '@/core/userApi'
import { setApiSource } from '@/core/apiSource'
import settingState from '@/store/setting/state'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { event as userApiEvent } from '@/store/userApi/event'
import { toMD5 } from '@/utils/tools'

// 应用远端数据期间拦截 list_changed 事件的回推，避免 A/B 双端应答死循环。
// 用计数而非布尔：并发应用多份远端数据时，先完成的一份不能提前解除抑制。
let remoteApplyingCount = 0
// 远端应用激活源时 setApiSource 的 apiSourceUpdated 是异步（rAF）派发的，
// 用该标记避免把远端选择又回推给其他设备。
let lastRemoteApiSource: string | null = null
// 最近一次已与远端对齐（发送或接收）的状态签名，用于阻止把相同内容反复推回
let lastSyncedSignature: string | null = null

const serializeUserApiData = (data: LX.UserApi.UserApiData) => {
  // 与 server 端快照 key 的序列化方式保持一致（scripts 按 id 排序）
  const scripts: Record<string, string> = {}
  for (const id of Object.keys(data.scripts).sort()) scripts[id] = data.scripts[id]
  return JSON.stringify({
    apis: data.apis,
    scripts,
  })
}

const getSignature = (data: LX.UserApi.UserApiData) => toMD5(serializeUserApiData(data) + '|' + (data.apiSource ?? ''))

export const getUserApiDataMD5 = async(): Promise<string> => {
  const data = await getUserApiData()
  return toMD5(serializeUserApiData(data))
}

export const getLocalUserApiData = async(): Promise<LX.UserApi.UserApiData> => {
  return getUserApiData()
}

export const setLocalUserApiData = async(data: LX.UserApi.UserApiData, apiSource?: string | null) => {
  remoteApplyingCount++
  try {
    const list = await overwriteUserApiData(data)

    // 完全覆盖类同步流程携带的激活源：目标脚本存在于同步数据中时跟随远端选择，否则保持本机选择
    if (apiSource != null && /^user_api/.test(apiSource) && list.some(api => api.id == apiSource)) {
      if (apiSource != settingState.setting['common.apiSource']) {
        lastRemoteApiSource = apiSource
        setApiSource(apiSource)
      }
    }

    // 当前使用中的源被同步删除时，回退到内置源（与 setUserApi 失败路径的行为一致）
    const currentSource = settingState.setting['common.apiSource']
    if (/^user_api/.test(currentSource) && !list.some(api => api.id == currentSource)) {
      const fallback = apiSourceInfo.find(api => !api.disabled)
      if (fallback) {
        // 回退也属于远端应用结果，不应回推
        lastRemoteApiSource = fallback.id
        setApiSource(fallback.id)
      }
    }

    setUserApiList(list)

    // 记录应用后的本机状态，避免后续事件把相同内容再推回
    const localData = await getUserApiData()
    lastSyncedSignature = getSignature(localData)
  } finally {
    remoteApplyingCount--
  }
}

export const registerUserApiActionEvent = (sendUserApiAction: (action: LX.Sync.UserApi.ActionList) => (void | Promise<void>)) => {
  const sendLocalData = async() => {
    if (remoteApplyingCount > 0) return
    const data = await getUserApiData()
    const signature = getSignature(data)
    // 与上次已同步状态一致则无需推送（可避免事件抖动/回声造成重复请求）
    if (signature == lastSyncedSignature) return
    lastSyncedSignature = signature
    await sendUserApiAction({ action: 'user_api_data_overwrite', data })
  }

  const list_changed = async(_list: LX.UserApi.UserApiInfo[]) => {
    await sendLocalData()
  }
  const api_source_updated = async(source: string) => {
    // 远端应用带来的选择变更不再回推
    if (lastRemoteApiSource != null && source == lastRemoteApiSource) {
      lastRemoteApiSource = null
      return
    }
    await sendLocalData()
  }

  userApiEvent.on('list_changed', list_changed)
  global.state_event.on('apiSourceUpdated', api_source_updated)
  return () => {
    userApiEvent.off('list_changed', list_changed)
    global.state_event.off('apiSourceUpdated', api_source_updated)
  }
}

export const handleRemoteUserApiAction = async(event: LX.Sync.UserApi.ActionList) => {
  switch (event.action) {
    case 'user_api_data_overwrite':
      // 广播/推送同样应用激活源选择（脚本存在时）
      await setLocalUserApiData(event.data, event.data.apiSource ?? null)
      break
    default:
      throw new Error('unknown user api sync action')
  }
}
