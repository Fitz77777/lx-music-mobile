import { NativeModules, Platform } from 'react-native'

const { ProxyModule } = NativeModules

export interface ProxyConfig {
  enabled: boolean
  type: 'http' | 'socks5'
  host: string
  port: number
  username: string
  password: string
}

export interface ProxyTestResult {
  /** 代理返回的状态码，200 表示隧道正常 */
  code: number
  /** 代理要求认证（407） */
  authRequired: boolean
}

export const isProxySupported = Platform.OS == 'android' && !!ProxyModule

const unsupportedError = () => new Error(`Proxy is not supported on ${Platform.OS}`)

export const setProxyConfig = (config: ProxyConfig) => {
  if (!isProxySupported) return
  ProxyModule.setConfig(config)
}

export const getProxyConfig = async(): Promise<ProxyConfig | null> => {
  if (!isProxySupported) return null
  return ProxyModule.getConfig()
}

export const testProxyConnection = async(config: ProxyConfig): Promise<ProxyTestResult> => {
  if (!isProxySupported) throw unsupportedError()
  return ProxyModule.testConnection(config)
}
