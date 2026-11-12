package cn.toside.music.mobile.proxy;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Proxy;
import java.net.ProxySelector;
import java.net.SocketAddress;
import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

/**
 * 全局代理选择器。
 *
 * <p>安装后对所有使用默认 ProxySelector 的网络栈生效：
 * <ul>
 *   <li>{@code HttpURLConnection}（react-native-fs 下载、ExoPlayer 播放）</li>
 *   <li>{@code OkHttp}（RN 的 fetch、图片加载、WebSocket）</li>
 * </ul>
 *
 * <p>未启用代理、配置非法、或目标是本机/局域网地址时，会把选择交给原有选择器，
 * 保证系统代理与内网访问不受影响。
 */
public class AppProxySelector extends ProxySelector {
  private static final List<Proxy> DIRECT = Collections.singletonList(Proxy.NO_PROXY);

  private final ProxySelector origin;

  public AppProxySelector(ProxySelector origin) {
    this.origin = origin;
  }

  @Override
  public List<Proxy> select(URI uri) {
    if (uri == null) return selectOrigin(null);

    String scheme = uri.getScheme();
    if (scheme == null) return selectOrigin(uri);
    scheme = scheme.toLowerCase(Locale.US);
    // 只接管 HTTP/HTTPS，其它协议（ftp、file 等）保持原样
    if (!scheme.equals("http") && !scheme.equals("https")) return selectOrigin(uri);

    ProxyConfig config = ProxyManager.getConfig();
    if (!config.isValid()) return selectOrigin(uri);

    String host = uri.getHost();
    // 本机与局域网地址直连，否则跟本地同步服务、本地音源之类的访问会被代理打断
    if (host == null || ProxyManager.shouldBypass(host)) return DIRECT;

    try {
      Proxy.Type type = config.isSocks() ? Proxy.Type.SOCKS : Proxy.Type.HTTP;
      // 使用未解析地址，避免在 selector 里做 DNS 解析阻塞调用线程
      SocketAddress address = InetSocketAddress.createUnresolved(config.host, config.port);
      return Collections.singletonList(new Proxy(type, address));
    } catch (IllegalArgumentException e) {
      return selectOrigin(uri);
    }
  }

  @Override
  public void connectFailed(URI uri, SocketAddress sa, IOException ioe) {
    if (origin == null) return;
    try {
      origin.connectFailed(uri, sa, ioe);
    } catch (Exception ignored) {
      // 原选择器的实现不应该影响我们的代理逻辑
    }
  }

  private List<Proxy> selectOrigin(URI uri) {
    if (origin != null) {
      try {
        List<Proxy> result = origin.select(uri);
        if (result != null && !result.isEmpty()) return result;
      } catch (Exception ignored) {
        // 退化为直连
      }
    }
    return DIRECT;
  }
}
