package cn.toside.music.mobile.proxy;

import java.nio.charset.StandardCharsets;

import okhttp3.Authenticator;
import okhttp3.Credentials;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.Route;

/**
 * 供 OkHttp 使用的代理认证。
 *
 * <p>RN 的 fetch 与同步使用的 WebSocket 都走 OkHttp，代理返回 407 时由它补上
 * Proxy-Authorization 重试一次。
 */
class ProxyOkHttpAuthenticator implements Authenticator {
  @Override
  public Request authenticate(Route route, Response response) {
    if (response == null || response.code() != 407) return null;

    ProxyConfig config = ProxyManager.getConfig();
    if (!config.isValid() || !config.hasAuth()) return null;

    // 已经带过认证信息仍然 407，说明账号密码不对，不再重试
    if (response.request().header("Proxy-Authorization") != null) return null;

    String credential = Credentials.basic(config.username, config.password, StandardCharsets.UTF_8);
    return response.request().newBuilder()
      .header("Proxy-Authorization", credential)
      .build();
  }
}
