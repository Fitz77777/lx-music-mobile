import { state } from './state'
import { event } from './event'

export const setStatus = (status: LX.UserApi.UserApiStatus['status'], message: LX.UserApi.UserApiStatus['message']) => {
  state.status.status = status
  state.status.message = message

  event.status_changed({ status, message })
}


export const setUserApiList = (list: LX.UserApi.UserApiInfo[]) => {
  state.list = list

  event.list_changed([...list])
}

export const addUserApi = (info: LX.UserApi.UserApiInfo, isRemote: boolean = false) => {
  const index = state.list.findIndex(api => api.id == info.id)
  if (index < 0) state.list.push(info)
  else state.list.splice(index, 1, info)

  event.user_api_add(info, isRemote)
  event.list_changed([...state.list])
}

export const updateUserApi = (info: LX.UserApi.UserApiInfo, script?: string, isRemote: boolean = false) => {
  const targetIndex = state.list.findIndex(api => api.id == info.id)
  if (targetIndex < 0) return
  state.list.splice(targetIndex, 1, info)

  event.user_api_update(info, script, isRemote)
  event.list_changed([...state.list])
}

export const removeUserApi = (ids: string[], isRemote: boolean = false) => {
  state.list = state.list.filter(api => !ids.includes(api.id))

  event.user_api_remove(ids, isRemote)
  event.list_changed([...state.list])
}

export const setUserApiAllowShowUpdateAlert = (id: string, enable: boolean) => {
  const targetIndex = state.list.findIndex(api => api.id == id)
  if (targetIndex < 0) return
  state.list.splice(targetIndex, 1, { ...state.list[targetIndex], allowShowUpdateAlert: enable })

  event.user_api_update(state.list[targetIndex])
  event.list_changed([...state.list])
}
