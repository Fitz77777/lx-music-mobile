export type IOSToastHandler = (message: string, duration: number) => void

let handlers: IOSToastHandler[] = []

/**
 * 注册 Toast 宿主。后注册的宿主（即最后挂载的页面）优先接收消息，
 * 页面卸载时自动退回上一层，保证 Toast 总在当前可见页面上显示。
 */
export const registerIOSToast = (handler: IOSToastHandler) => {
  handlers.push(handler)
  return () => {
    handlers = handlers.filter(item => item !== handler)
  }
}

/** 显示 iOS Toast；没有宿主时退回控制台输出 */
export const showIOSToast = (message: string, duration = 1500) => {
  const handler = handlers[handlers.length - 1]
  if (!handler) {
    console.log(`[toast] ${message}`)
    return
  }
  handler(message, duration)
}
