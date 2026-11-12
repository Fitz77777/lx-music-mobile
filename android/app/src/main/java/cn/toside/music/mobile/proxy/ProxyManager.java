package cn.toside.music.mobile.proxy;

import android.content.Context;
import android.util.Log;

import com.facebook.react.modules.network.CustomClientBuilder;
import com.facebook.react.modules.network.NetworkingModule;
import com.facebook.react.modules.websocket.WebSocketModule;

import java.net.Authenticator;
import java.net.ProxySelector;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import okhttp3.OkHttpClient;

/**
 * 代理总入口：安装全局 ProxySelector 与认证器，并保存当前配置。
 *
 * <p>必须在 Application#onCreate 中、任何网络组件初始化之前调用。
 */
public final class ProxyManager {
  private static final String TAG = "LXProxy";
  private static final Pattern IPV4_PATTERN =
    Pattern.compile("^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$");

  private static final okhttp3.Authenticator OKHTTP_AUTHENTICATOR = new ProxyOkHttpAuthenticator();
  private static volatile AppProxySelector selector;
  private static final CustomClientBuilder CLIENT_BUILDER = new CustomClientBuilder() {
    @Override
    public void apply(OkHttpClient.Builder builder) {
      builder.proxyAuthenticator(OKHTTP_AUTHENTICATOR);
      // 显式指定，避免依赖 OkHttp 在构造客户端时读取默认 selector 的时机
      AppProxySelector current = selector;
      if (current != null) builder.proxySelector(current);
    }
  };

  private static volatile ProxyConfig config = new ProxyConfig();
  private static volatile boolean installed = false;
  private static Context appContext;

  private ProxyManager() {}

  public static void init(Context context) {
    if (installed) return;

    synchronized (ProxyManager.class) {
      if (installed) return;

      if (context != null) appContext = context.getApplicationContext();
      config = ProxyConfig.load(appContext);

      // 1. 全局 ProxySelector：覆盖 HttpURLConnection 以及所有取默认 selector 的 OkHttp 客户端
      ProxySelector origin = ProxySelector.getDefault();
      selector = new AppProxySelector(origin);
      ProxySelector.setDefault(selector);

      // 2. HttpURLConnection 的代理认证（下载、播放）
      Authenticator.setDefault(new ProxyHttpAuthenticator());

      // 3. OkHttp 的代理认证（fetch、同步 WebSocket）
      NetworkingModule.setCustomClientBuilder(CLIENT_BUILDER);
      WebSocketModule.setCustomClientBuilder(CLIENT_BUILDER);

      installed = true;
      Log.i(TAG, "installed, enabled=" + config.enabled
        + ", type=" + config.type + ", host=" + config.host + ", port=" + config.port);
    }
  }

  public static ProxyConfig getConfig() {
    return config;
  }

  public static void setConfig(Context context, ProxyConfig newConfig) {
    config = newConfig == null ? new ProxyConfig() : newConfig;
    config.save(context != null ? context : appContext);
    Log.i(TAG, "updated, enabled=" + config.enabled
      + ", type=" + config.type + ", host=" + config.host + ", port=" + config.port);
  }

  /**
   * 是否应该绕过代理访问该主机。
   *
   * <p>本机、局域网、链路本地、CGNAT 以及 .local 域名都直连，
   * 否则内网同步、本地音源之类的功能会被代理打断。
   */
  public static boolean shouldBypass(String rawHost) {
    if (rawHost == null) return true;

    String host = rawHost.trim().toLowerCase(Locale.US);
    if (host.isEmpty()) return true;

    if (host.startsWith("[") && host.endsWith("]") && host.length() > 2) {
      host = host.substring(1, host.length() - 1);
    }

    if (host.equals("localhost") || host.equals("::1") || host.equals("0.0.0.0")) return true;
    if (host.endsWith(".local") || host.endsWith(".localhost")) return true;

    if (host.contains(":")) {
      // IPv6 回环、链路本地、唯一本地地址
      return host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd");
    }

    Matcher matcher = IPV4_PATTERN.matcher(host);
    if (!matcher.matches()) return false;

    try {
      int a = Integer.parseInt(matcher.group(1));
      int b = Integer.parseInt(matcher.group(2));
      return a == 0
        || a == 10
        || a == 127
        || (a == 169 && b == 254)
        || (a == 172 && b >= 16 && b <= 31)
        || (a == 192 && b == 168)
        || (a == 100 && b >= 64 && b <= 127);
    } catch (NumberFormatException e) {
      return false;
    }
  }
}
