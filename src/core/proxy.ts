import settingState from '@/store/setting/state'
import { setProxyConfig, type ProxyConfig } from '@/utils/nativeModules/proxy'

/**
 * 由设置项组装原生代理配置
 */
export const getProxyConfigFromSetting = (setting = settingState.setting): ProxyConfig => {
  const port = Number.parseInt(setting['network.proxy.port'])
  return {
    enabled: setting['network.proxy.enable'],
    type: setting['network.proxy.type'],
    host: (setting['network.proxy.host'] ?? '').trim(),
    port: Number.isNaN(port) ? 0 : port,
    username: setting['network.proxy.username'] ?? '',
    password: setting['network.proxy.password'] ?? '',
  }
}

/**
 * 把当前设置同步给原生层。
 *
 * 原生层会自己持久化配置，所以这里只负责“设置变化后通知”；应用启动时也需要调用一次，
 * 以纠正原生持久化配置与当前设置不一致的情况。
 */
export const applyProxySetting = (setting = settingState.setting) => {
  setProxyConfig(getProxyConfigFromSetting(setting))
}
