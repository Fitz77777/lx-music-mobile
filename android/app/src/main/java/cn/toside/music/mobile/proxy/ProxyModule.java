package cn.toside.music.mobile.proxy;

import android.util.Base64;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;

/**
 * 代理配置与连通性测试的 JS 接口。
 */
public class ProxyModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ProxyModule";

  private static final int TEST_TIMEOUT_MS = 6000;
  // 只是用来验证代理隧道是否可用，不需要目标站点的内容
  private static final String TEST_TARGET_HOST = "music.163.com";
  private static final int TEST_TARGET_PORT = 443;

  private final ReactApplicationContext reactContext;

  ProxyModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return NAME;
  }

  @ReactMethod
  public void setConfig(ReadableMap map) {
    ProxyManager.setConfig(reactContext, ProxyConfig.fromReadableMap(map));
  }

  @ReactMethod
  public void getConfig(Promise promise) {
    ProxyConfig config = ProxyManager.getConfig();
    WritableMap result = Arguments.createMap();
    result.putBoolean("enabled", config.enabled);
    result.putString("type", config.type);
    result.putString("host", config.host);
    result.putInt("port", config.port);
    result.putString("username", config.username);
    promise.resolve(result);
  }

  /**
   * 测试代理是否可用。
   *
   * <p>先建立 TCP 连接，再对 HTTP 代理发一次 CONNECT 请求：
   * 200 表示隧道正常，407 表示代理可用但认证失败。
   */
  @ReactMethod
  public void testConnection(ReadableMap map, final Promise promise) {
    final ProxyConfig config = ProxyConfig.fromReadableMap(map);
    if (!config.isValid()) {
      promise.reject("E_PROXY_INVALID", "invalid proxy config");
      return;
    }

    new Thread(new Runnable() {
      @Override
      public void run() {
        testConnectionOnBackgroundThread(config, promise);
      }
    }, "lx-proxy-test").start();
  }

  private void testConnectionOnBackgroundThread(ProxyConfig config, Promise promise) {
    if (config.isSocks()) {
      // SOCKS 没有可以直接探测的握手协议，只验证端口是否可连
      Socket socket = new Socket();
      try {
        socket.connect(new InetSocketAddress(config.host, config.port), TEST_TIMEOUT_MS);
        WritableMap result = Arguments.createMap();
        result.putInt("code", 200);
        result.putBoolean("authRequired", false);
        promise.resolve(result);
      } catch (SocketTimeoutException e) {
        promise.reject("E_PROXY_TIMEOUT", "timeout");
      } catch (IOException e) {
        promise.reject("E_PROXY_UNREACHABLE", messageOf(e));
      } finally {
        closeQuietly(socket);
      }
      return;
    }

    Socket socket = new Socket();
    try {
      socket.connect(new InetSocketAddress(config.host, config.port), TEST_TIMEOUT_MS);
      socket.setSoTimeout(TEST_TIMEOUT_MS);

      String authority = TEST_TARGET_HOST + ":" + TEST_TARGET_PORT;
      StringBuilder request = new StringBuilder();
      request.append("CONNECT ").append(authority).append(" HTTP/1.1\r\n");
      request.append("Host: ").append(authority).append("\r\n");
      if (config.hasAuth()) {
        String credential = Base64.encodeToString(
          (config.username + ":" + config.password).getBytes(StandardCharsets.UTF_8),
          Base64.NO_WRAP
        );
        request.append("Proxy-Authorization: Basic ").append(credential).append("\r\n");
      }
      request.append("Connection: close\r\n\r\n");

      OutputStream output = socket.getOutputStream();
      output.write(request.toString().getBytes(StandardCharsets.UTF_8));
      output.flush();

      String statusLine = readLine(socket.getInputStream());
      int code = parseStatusCode(statusLine);
      if (code <= 0) {
        promise.reject("E_PROXY_BAD_RESPONSE", statusLine.isEmpty() ? "empty response" : statusLine);
        return;
      }

      WritableMap result = Arguments.createMap();
      result.putInt("code", code);
      result.putBoolean("authRequired", code == 407);
      promise.resolve(result);
    } catch (SocketTimeoutException e) {
      promise.reject("E_PROXY_TIMEOUT", "timeout");
    } catch (IOException e) {
      promise.reject("E_PROXY_UNREACHABLE", messageOf(e));
    } finally {
      closeQuietly(socket);
    }
  }

  private static String messageOf(IOException e) {
    String message = e.getMessage();
    return message == null || message.isEmpty() ? e.getClass().getSimpleName() : message;
  }

  private static String readLine(InputStream input) throws IOException {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    int value;
    while ((value = input.read()) != -1) {
      if (value == '\n') break;
      if (value != '\r') buffer.write(value);
      if (buffer.size() > 512) break;
    }
    return buffer.toString("UTF-8");
  }

  private static int parseStatusCode(String statusLine) {
    if (statusLine == null || statusLine.isEmpty()) return -1;
    String[] parts = statusLine.split(" ");
    if (parts.length < 2) return -1;
    try {
      return Integer.parseInt(parts[1]);
    } catch (NumberFormatException e) {
      return -1;
    }
  }

  private static void closeQuietly(Socket socket) {
    try {
      socket.close();
    } catch (IOException ignored) {
      // ignore
    }
  }
}
