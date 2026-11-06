import { SYNC_CLOSE_CODE } from '@/plugins/sync/constants'
import { registerUserApiActionEvent } from '../../../userApiEvent'

let unregisterLocalUserApiAction: (() => void) | null

export const registerEvent = (socket: LX.Sync.Socket) => {
  unregisterEvent()
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

export const unregisterEvent = () => {
  unregisterLocalUserApiAction?.()
  unregisterLocalUserApiAction = null
}
