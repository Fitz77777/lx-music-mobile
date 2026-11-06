// 这个文件导出的方法将暴露给服务端调用，第一个参数固定为当前 socket 对象
import { handleRemoteUserApiAction, getLocalUserApiData, setLocalUserApiData, getUserApiDataMD5 } from '../../../userApiEvent'
import log from '../../../log'
import { removeSyncModeEvent, selectSyncMode } from '@/core/sync'
import { registerEvent, unregisterEvent } from './localEvent'

const logInfo = (eventName: string, success = false) => {
  log.info(`[${eventName}]${eventName.replace('userApi:sync:user_api_sync_', '').replace(/_/g, ' ')}${success ? ' success' : ''}`)
}
const handler: LX.Sync.ClientSyncHandlerUserApiActions<LX.Sync.Socket> = {
  async onUserApiSyncAction(socket, action) {
    if (!socket.moduleReadys?.userApi) return
    await handleRemoteUserApiAction(action)
  },

  async user_api_sync_get_md5(socket) {
    logInfo('userApi:sync:user_api_sync_get_md5')
    return getUserApiDataMD5()
  },

  async user_api_sync_get_sync_mode(socket) {
    logInfo('userApi:sync:user_api_sync_get_sync_mode')
    const unsubscribe = socket.onClose(() => {
      removeSyncModeEvent()
    })
    return selectSyncMode(socket.data.keyInfo.serverName, 'userApi').finally(unsubscribe)
  },

  async user_api_sync_get_list_data(socket) {
    logInfo('userApi:sync:user_api_sync_get_list_data')
    return getLocalUserApiData()
  },

  async user_api_sync_set_list_data(socket, data) {
    logInfo('userApi:sync:user_api_sync_set_list_data')
    await setLocalUserApiData(data)
  },

  async user_api_sync_finished(socket) {
    logInfo('userApi:sync:finished')
    socket.moduleReadys.userApi = true
    registerEvent(socket)
    socket.onClose(() => {
      unregisterEvent()
    })
  },
}

export default handler
