package cn.toside.music.mobile.proxy;

import android.content.Context;
import android.content.SharedPreferences;

import com.facebook.react.bridge.ReadableMap;

/**
 * 应用代理配置。
 *
 * <p>配置会持久化到独立的 SharedPreferences 中，这样即使 React Native 还没有初始化
 * （例如后台被系统拉起继续播放），也能在 Application#onCreate 时先把代理装好。
 */
public class ProxyConfig {
  private static final String PREF_NAME = "lx_proxy_config";
  private static final String KEY_ENABLED = "enabled";
  private static final String KEY_TYPE = "type";
  private static final String KEY_HOST = "host";
  private static final String KEY_PORT = "port";
  private static final String KEY_USERNAME = "username";
  private static final String KEY_PASSWORD = "password";

  public boolean enabled;
  /** http 或 socks5 */
  public String type;
  public String host;
  public int port;
  public String username;
  public String password;

  public ProxyConfig() {
    this(false, "http", "", 0, "", "");
  }

  public ProxyConfig(boolean enabled, String type, String host, int port, String username, String password) {
    this.enabled = enabled;
    this.type = type == null || type.isEmpty() ? "http" : type;
    this.host = host == null ? "" : host;
    this.port = port;
    this.username = username == null ? "" : username;
    this.password = password == null ? "" : password;
  }

  /**
   * 配置是否可用。不可用时一律按“未启用代理”处理，
   * 避免写错的配置把整个应用的网络请求都拦下来。
   */
  public boolean isValid() {
    return this.enabled && !this.host.isEmpty() && this.port > 0 && this.port <= 65535;
  }

  public boolean hasAuth() {
    return !this.username.isEmpty();
  }

  public boolean isSocks() {
    return "socks5".equals(this.type) || "socks".equals(this.type);
  }

  public static ProxyConfig fromReadableMap(ReadableMap map) {
    if (map == null) return new ProxyConfig();

    String type = map.hasKey("type") && !map.isNull("type") ? map.getString("type") : "http";
    String host = map.hasKey("host") && !map.isNull("host") ? map.getString("host").trim() : "";
    int port = 0;
    if (map.hasKey("port") && !map.isNull("port")) {
      try {
        port = (int) map.getDouble("port");
      } catch (Exception ignored) {
        port = 0;
      }
    }
    String username = map.hasKey("username") && !map.isNull("username") ? map.getString("username") : "";
    String password = map.hasKey("password") && !map.isNull("password") ? map.getString("password") : "";

    return new ProxyConfig(
      map.hasKey("enabled") && !map.isNull("enabled") && map.getBoolean("enabled"),
      type,
      host,
      port,
      username,
      password
    );
  }

  public static ProxyConfig load(Context context) {
    if (context == null) return new ProxyConfig();
    SharedPreferences pref = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
    return new ProxyConfig(
      pref.getBoolean(KEY_ENABLED, false),
      pref.getString(KEY_TYPE, "http"),
      pref.getString(KEY_HOST, ""),
      pref.getInt(KEY_PORT, 0),
      pref.getString(KEY_USERNAME, ""),
      pref.getString(KEY_PASSWORD, "")
    );
  }

  public void save(Context context) {
    if (context == null) return;
    context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
      .edit()
      .putBoolean(KEY_ENABLED, this.enabled)
      .putString(KEY_TYPE, this.type)
      .putString(KEY_HOST, this.host)
      .putInt(KEY_PORT, this.port)
      .putString(KEY_USERNAME, this.username)
      .putString(KEY_PASSWORD, this.password)
      .apply();
  }
}
