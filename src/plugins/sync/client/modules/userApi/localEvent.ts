import { SYNC_CLOSE_CODE } from '@/plugins/sync/constants'
import { registerUserApiActionEvent } from '../../../userApiEvent'

let registeredSocket: LX.Sync.Socket | null = null
let unregisterLocalUserApiAction: (() => void) | null = null

export const registerEvent = (socket: LX.Sync.Socket) => {
  unregisterEvent()
  registeredSocket = socket
  unregisterLocalUserApiAction = registerUserApiActionEvent((action) => {
    if (!socket.moduleReadys?.userApi) return
    void socket.remoteQueueUserApi.onUserApiSyncAction(action).catch(err => {
      // TODO send status
      socket.moduleReadys.userApi = false
      socket.close(SYNC_CLOSE_CODE.failed)
      console.log(err.message)
    })
  })
}

export const unregisterEvent = (socket?: LX.Sync.Socket) => {
  // 旧连接迟到的 close 事件不能注销新连接的监听
  if (socket && registeredSocket && socket !== registeredSocket) return
  registeredSocket = null
  unregisterLocalUserApiAction?.()
  unregisterLocalUserApiAction = null
}
