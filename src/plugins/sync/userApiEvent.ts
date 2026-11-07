import { addUserApiData, updateUserApiData, removeUserApi as removeUserApiData, overwriteUserApiData, getUserApiData, getUserApiScript } from '@/utils/data'
import { action } from '@/store/userApi'
import { setApiSource } from '@/core/apiSource'
import settingState from '@/store/setting/state'
import apiSourceInfo from '@/utils/musicSdk/api-source-info'
import { event as userApiEvent } from '@/store/userApi/event'
import { toMD5 } from '@/utils/tools'

// setApiSource 通过 requestAnimationFrame 延迟派发 apiSourceUpdated，
// 因此需要把“远端正在设置的激活源”记录下来，等对应的延迟事件到达时忽略它。
// 用 Set 而非单个值：连续切换多个远端源时，每个延迟事件都能被正确识别。
const pendingRemoteApiSources = new Set<string>()

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

export const getUserApiDataMD5 = async(): Promise<string> => {
  const data = await getUserApiData()
  return toMD5(serializeUserApiData(data))
}

export const getLocalUserApiData = async(): Promise<LX.UserApi.UserApiData> => {
  return getUserApiData()
}

/**
 * 应用同步数据携带的激活源选择：
 * - 携带且目标源存在 → 切换
 * - 未携带 → 保持本机选择
 * - 本机激活源已被同步删除 → 回退到可用源
 */
const applyApiSource = (apiSource: string | null | undefined, list: LX.UserApi.UserApiInfo[]) => {
  const currentSource = settingState.setting['common.apiSource']
  if (apiSource != null && /^user_api/.test(apiSource) && list.some(api => api.id == apiSource)) {
    if (apiSource == currentSource) return
    pendingRemoteApiSources.add(apiSource)
    setApiSource(apiSource)
    return
  }
  if (/^user_api/.test(currentSource) && !list.some(api => api.id == currentSource)) {
    const fallback = apiSourceInfo.find(api => !api.disabled)
    const nextSource = fallback?.id ?? ''
    if (nextSource == currentSource) return
    pendingRemoteApiSources.add(nextSource)
    setApiSource(nextSource)
  }
}

// 应用一份完整数据（初始同步/完全覆盖）
const writeLocalData = async(data: LX.UserApi.UserApiData, apiSource?: string | null) => {
  const list = await overwriteUserApiData(data)
  action.setUserApiList(list)
  applyApiSource(apiSource, list)
}

export const setLocalUserApiData = async(data: LX.UserApi.UserApiData, apiSource?: string | null) => {
  await writeLocalData(data, apiSource)
}

// 把服务端下发的细粒度 action 应用到本地数据
const applyRemoteAction = async(actionData: LX.Sync.UserApi.ActionList) => {
  switch (actionData.action) {
    case 'user_api_add': {
      if (!await addUserApiData(actionData.data.api, actionData.data.script)) break
      action.addUserApi(actionData.data.api, true)
      break
    }
    case 'user_api_update': {
      if (!await updateUserApiData(actionData.data.api, actionData.data.script)) break
      action.updateUserApi(actionData.data.api, actionData.data.script, true)
      break
    }
    case 'user_api_remove': {
      const list = await removeUserApiData(actionData.data.ids)
      action.removeUserApi(actionData.data.ids, true)
      // 当前激活源被同步删除时回退
      applyApiSource(null, list)
      break
    }
    case 'user_api_active': {
      if (actionData.data.id == null) return
      const data = await getUserApiData()
      if (data.apis.some(api => api.id == actionData.data.id)) applyApiSource(actionData.data.id, data.apis)
      break
    }
    case 'user_api_data_overwrite':
      await writeLocalData(actionData.data, actionData.data.apiSource ?? null)
      break
    default:
      throw new Error('unknown user api sync action')
  }
}

export const handleRemoteUserApiAction = applyRemoteAction

export const registerUserApiActionEvent = (sendUserApiAction: (action: LX.Sync.UserApi.ActionList) => (void | Promise<void>)) => {
  // 本地事件按触发顺序串行处理，避免 add 需要异步读取脚本时与随后的 remove 乱序
  let localQueue: Promise<void> = Promise.resolve()
  const enqueue = (task: () => Promise<void>) => {
    localQueue = localQueue.then(task).catch(err => {
      console.log(err.message)
    })
  }

  // 本地增删改直接对应一个增量 action；isRemote 为 true 的事件来自同步应用，忽略以防回声
  const user_api_add = (info: LX.UserApi.UserApiInfo, isRemote: boolean = false) => {
    if (isRemote) return
    enqueue(async() => {
      const script = await getUserApiScript(info.id)
      await sendUserApiAction({ action: 'user_api_add', data: { api: info, script } })
    })
  }
  const user_api_update = (info: LX.UserApi.UserApiInfo, script?: string, isRemote: boolean = false) => {
    if (isRemote) return
    enqueue(async() => {
      await sendUserApiAction({ action: 'user_api_update', data: script != null ? { api: info, script } : { api: info } })
    })
  }
  const user_api_remove = (ids: string[], isRemote: boolean = false) => {
    if (isRemote || !ids.length) return
    enqueue(async() => {
      await sendUserApiAction({ action: 'user_api_remove', data: { ids } })
    })
  }
  const api_source_updated = (source: string) => {
    if (pendingRemoteApiSources.has(source)) {
      pendingRemoteApiSources.delete(source)
      return
    }
    enqueue(async() => {
      await sendUserApiAction({ action: 'user_api_active', data: { id: getLocalActive() } })
    })
  }

  userApiEvent.on('user_api_add', user_api_add)
  userApiEvent.on('user_api_update', user_api_update)
  userApiEvent.on('user_api_remove', user_api_remove)
  global.state_event.on('apiSourceUpdated', api_source_updated)
  return () => {
    userApiEvent.off('user_api_add', user_api_add)
    userApiEvent.off('user_api_update', user_api_update)
    userApiEvent.off('user_api_remove', user_api_remove)
    global.state_event.off('apiSourceUpdated', api_source_updated)
  }
}
