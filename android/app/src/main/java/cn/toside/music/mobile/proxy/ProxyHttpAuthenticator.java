package cn.toside.music.mobile.proxy;

import java.net.Authenticator;
import java.net.PasswordAuthentication;

/**
 * 供 {@code HttpURLConnection} 使用的代理认证。
 *
 * <p>react-native-fs 的下载、ExoPlayer 的 DefaultHttpDataSource 都基于
 * HttpURLConnection，只能通过全局 Authenticator 拿到代理账号密码。
 */
class ProxyHttpAuthenticator extends Authenticator {
  @Override
  protected PasswordAuthentication getPasswordAuthentication() {
    if (getRequestorType() != RequestorType.PROXY) return null;

    ProxyConfig config = ProxyManager.getConfig();
    if (!config.isValid() || !config.hasAuth()) return null;

    return new PasswordAuthentication(config.username, config.password.toCharArray());
  }
}
