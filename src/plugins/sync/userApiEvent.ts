import { getUserApiData, overwriteUserApiData } from '@/utils/data'
import { setUserApiList } from '@/core/userApi'
import { setApiSource } from '@/core/apiSource'
import settingState from '@/store/setting/state'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { event as userApiEvent } from '@/store/userApi/event'
import { toMD5 } from '@/utils/tools'

// 应用远端数据期间拦截本地变更事件的回推，避免 A/B 双端应答死循环。
// 用计数而非布尔：并发应用多份远端数据时，先完成的一份不能提前解除抑制。
let remoteApplyingCount = 0

interface SyncState {
  apis: Map<string, LX.UserApi.UserApiInfo>
  scripts: Map<string, string>
  active: string | null
}
// 最近一次已知的本地同步状态：本地事件触发时与它做 diff，只发送增量
let lastSyncState: SyncState | null = null

const serializeUserApiData = (data: LX.UserApi.UserApiData) => {
  // 与 server 端快照 key 的序列化方式保持一致（scripts 按 id 排序）
  const scripts: Record<string, string> = {}
  for (const id of Object.keys(data.scripts).sort()) scripts[id] = data.scripts[id]
  return JSON.stringify({
    apis: data.apis,
    scripts,
  })
}

const getLocalActive = () => {
  const source = settingState.setting['common.apiSource']
  return /^user_api/.test(source) ? source : null
}

const readSyncState = async(): Promise<SyncState> => {
  const data = await getUserApiData()
  return {
    apis: new Map(data.apis.map(api => [api.id, api])),
    scripts: new Map(Object.entries(data.scripts)),
    active: getLocalActive(),
  }
}

export const getUserApiDataMD5 = async(): Promise<string> => {
  const data = await getUserApiData()
  return toMD5(serializeUserApiData(data))
}

export const getLocalUserApiData = async(): Promise<LX.UserApi.UserApiData> => {
  return getUserApiData()
}

// 应用一份完整数据（初始同步/完全覆盖）并抑制回推
const writeLocalData = async(data: LX.UserApi.UserApiData, apiSource?: string | null) => {
  remoteApplyingCount++
  try {
    const list = await overwriteUserApiData(data)

    // 完全覆盖类同步流程携带的激活源：目标脚本存在于同步数据中时跟随远端选择，否则保持本机选择
    if (apiSource != null && /^user_api/.test(apiSource) && list.some(api => api.id == apiSource)) {
      if (apiSource != settingState.setting['common.apiSource']) setApiSource(apiSource)
    }

    // 当前使用中的源被同步删除时，回退到内置源（与 setUserApi 失败路径的行为一致）
    const currentSource = settingState.setting['common.apiSource']
    if (/^user_api/.test(currentSource) && !list.some(api => api.id == currentSource)) {
      const fallback = apiSourceInfo.find(api => !api.disabled)
      if (fallback) setApiSource(fallback.id)
    }

    setUserApiList(list)
  } finally {
    remoteApplyingCount--
  }
  // 记录应用后的本机状态，后续事件与它对比即可忽略回声
  lastSyncState = await readSyncState()
}

export const setLocalUserApiData = async(data: LX.UserApi.UserApiData, apiSource?: string | null) => {
  await writeLocalData(data, apiSource)
}

// 把服务端下发的细粒度 action 应用到本地数据
const applyRemoteAction = async(action: LX.Sync.UserApi.ActionList) => {
  switch (action.action) {
    case 'user_api_add': {
      const current = await getLocalUserApiData()
      if (current.apis.some(api => api.id == action.data.api.id)) return
      await writeLocalData({
        apis: [...current.apis, action.data.api],
        scripts: { ...current.scripts, [action.data.api.id]: action.data.script },
        apiSource: current.apiSource ?? null,
      })
      break
    }
    case 'user_api_update': {
      const current = await getLocalUserApiData()
      const index = current.apis.findIndex(api => api.id == action.data.api.id)
      if (index < 0) return
      const apis = [...current.apis]
      apis[index] = action.data.api
      const scripts = { ...current.scripts }
      if (typeof action.data.script == 'string' && action.data.script != '') {
        scripts[action.data.api.id] = action.data.script
      }
      await writeLocalData({ apis, scripts, apiSource: current.apiSource ?? null })
      break
    }
    case 'user_api_remove': {
      const current = await getLocalUserApiData()
      const ids = new Set(action.data.ids)
      if (!current.apis.some(api => ids.has(api.id))) return
      const apis = current.apis.filter(api => !ids.has(api.id))
      const scripts = { ...current.scripts }
      for (const id of ids) delete scripts[id]
      await writeLocalData({ apis, scripts, apiSource: current.apiSource ?? null })
      break
    }
    case 'user_api_active': {
      if (action.data.id == null) return
      const current = await getLocalUserApiData()
      if (!current.apis.some(api => api.id == action.data.id)) return
      await writeLocalData(current, action.data.id)
      break
    }
    case 'user_api_data_overwrite':
      await writeLocalData(action.data, action.data.apiSource ?? null)
      break
    default:
      throw new Error('unknown user api sync action')
  }
}

export const handleRemoteUserApiAction = applyRemoteAction

export const registerUserApiActionEvent = (sendUserApiAction: (action: LX.Sync.UserApi.ActionList) => (void | Promise<void>)) => {
  // 与上次已知状态做 diff，只发送增量
  const flushLocalChanges = async() => {
    if (remoteApplyingCount > 0) return
    const next = await readSyncState()
    const prev = lastSyncState
    lastSyncState = next
    if (!prev) return

    const removedIds = [...prev.apis.keys()].filter(id => !next.apis.has(id))
    if (removedIds.length) await sendUserApiAction({ action: 'user_api_remove', data: { ids: removedIds } })

    for (const [id, api] of next.apis) {
      if (prev.apis.has(id)) continue
      await sendUserApiAction({ action: 'user_api_add', data: { api, script: next.scripts.get(id) ?? '' } })
    }

    for (const [id, api] of next.apis) {
      const prevApi = prev.apis.get(id)
      if (!prevApi) continue
      const scriptChanged = (prev.scripts.get(id) ?? '') != (next.scripts.get(id) ?? '')
      if (!scriptChanged && JSON.stringify(prevApi) == JSON.stringify(api)) continue
      await sendUserApiAction({ action: 'user_api_update', data: { api, script: next.scripts.get(id) ?? '' } })
    }

    if (prev.active != next.active) {
      await sendUserApiAction({ action: 'user_api_active', data: { id: next.active } })
    }
  }

  const list_changed = async(_list: LX.UserApi.UserApiInfo[]) => {
    await flushLocalChanges()
  }
  const api_source_updated = async(_source: string) => {
    await flushLocalChanges()
  }

  void readSyncState().then(state => {
    lastSyncState = state
  })

  userApiEvent.on('list_changed', list_changed)
  global.state_event.on('apiSourceUpdated', api_source_updated)
  return () => {
    userApiEvent.off('list_changed', list_changed)
    global.state_event.off('apiSourceUpdated', api_source_updated)
  }
}
