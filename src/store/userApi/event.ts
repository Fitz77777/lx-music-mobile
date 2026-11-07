import Event from '@/event/Event'


class UserApiEvent extends Event {
  status_changed(status: { status: boolean, message?: string }) {
    this.emit('status_changed', status)
  }

  list_changed(list: LX.UserApi.UserApiInfo[]) {
    this.emit('list_changed', list)
  }

  user_api_add(info: LX.UserApi.UserApiInfo, isRemote: boolean = false) {
    this.emit('user_api_add', info, isRemote)
  }

  user_api_update(info: LX.UserApi.UserApiInfo, script?: string, isRemote: boolean = false) {
    this.emit('user_api_update', info, script, isRemote)
  }

  user_api_remove(ids: string[], isRemote: boolean = false) {
    this.emit('user_api_remove', ids, isRemote)
  }
}


type EventMethods = Omit<EventType, keyof Event>


declare class EventType extends UserApiEvent {
  on<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): any
  off<K extends keyof EventMethods>(event: K, listener: EventMethods[K]): any
}

type UserApiEventTypes = Omit<EventType, keyof Omit<Event, 'on' | 'off'>>


export const event: UserApiEventTypes = new UserApiEvent()
