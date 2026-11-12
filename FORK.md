# Fork 版本管理

本仓库是 [`lyswhut/lx-music-mobile`](https://github.com/lyswhut/lx-music-mobile) 的 fork。
版本号遵循以下约定：

```
<上游版本>-fork.<fork 序号>
```

例如上游 `v1.9.2` 对应的第一个 fork 版本是 `1.9.2-fork.1`。

## 分支策略

| 分支 | 用途 |
| --- | --- |
| `master` | **只用于同步上游**，保持与 `lyswhut/lx-music-mobile` 一致，不提交 fork 改动，不触发发布 |
| `release` | fork 的正式发布分支，所有构建与 Release 都由推送到该分支触发 |

版本检查按以下顺序读取版本信息，任一源失败自动切换到下一个：

1. `https://github.com/Fitz77777/lx-music-mobile/releases/latest/download/version.json`（随 Release 发布，最新）
2. `https://raw.githubusercontent.com/Fitz77777/lx-music-mobile/release/publish/version.json`
3. jsdelivr / fastly / gcore 镜像（有 CDN 分支缓存延迟，作为最后兜底）

无论走哪个源，`publish/version.json` 都必须与 `package.json` 的 `version` / `versionCode` 完全一致。

## 版本规则

- `1.9.2` 跟随上游，不自行修改。
- `fork.N` 只统计当前上游版本下的 fork 发布次数。
- 每次合并上游新版本后，`fork.N` 重置为 `1`。
- Git tag 使用 `v<完整版本号>`，例如 `v1.9.2-fork.1`，由发布工作流自动创建。
- `versionCode` 必须单调递增，规则见下文。

## 发版命令

```bash
# fork 自己的改动发版：fork 序号 +1，versionCode +1
npm run version:bump

# 合并上游新版本后：重置为 <上游版本>-fork.1
# 第二个参数是上游 package.json 里的 versionCode
npm run version:sync -- 1.9.3 80
```

`versionCode` 的计算规则：

```
versionCode = max(当前 versionCode + 1, 上游 versionCode × 100)
```

这样既保证 Android 升级判断始终递增，又给每个上游版本预留 100 个 fork 版本。

- `publish/version.json` 必须包含 `versionCode`，且与 `package.json` 保持一致；不一致时 `release.yml` 的 `verify` job 会直接失败。
- 客户端按 `versionCode` 判断是否有新版本，`version` 只用于展示；远端数据缺少 `versionCode` 时才回退到版本号字符串比较。

## 发布流程

1. `git fetch upstream --tags`
2. 更新纯上游镜像：在 `master` 上合并 `upstream/master` 并推送
3. 把 `master` 合并进 `release`
4. 合并上游版本时执行 `npm run version:sync -- <上游版本> <上游 versionCode>`
5. fork 自己迭代时执行 `npm run version:bump`
6. 更新 `publish/changeLog.md`，写入本版面向用户的更新说明
7. 运行 `npm run publish` 生成 `publish/version.json` 与 `CHANGELOG.md` 条目
8. 运行 `npm run verify:version` 确认版本元数据一致
9. 提交改动后推送到 `release` 分支
10. `.github/workflows/release.yml` 先跑 `verify` job 校验版本元数据，再构建 Android/iOS 包，最后创建 `v<version>` tag 与 GitHub Release，并把 `publish/version.json` 作为 Release asset 一并上传

> 不要直接向 `master` 推送 fork 改动；`master` 只作为上游镜像。

## CI 配置

Android Release 构建需要以下仓库 secrets（Settings → Secrets and variables → Actions）：

| Secret | 说明 |
| --- | --- |
| `KEYSTORE_STORE_FILE_BASE64` | keystore 文件的 base64 内容，用 `base64 -w0 xxx.keystore` 生成，必须是单行 |
| `KEYSTORE_STORE_FILE` | keystore 文件名，例如 `lx-music-release.keystore`（只写文件名，不要带路径） |
| `KEYSTORE_STORE_PASSWORD` | keystore 密码 |
| `KEYSTORE_KEY_ALIAS` | key alias |
| `KEYSTORE_KEY_PASSWORD` | key 密码 |

生成示例：

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore lx-music-release.keystore \
  -alias lxmusic -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 lx-music-release.keystore
```

iOS 只构建未签名 IPA，使用 `macos-15` runner，不需要 secrets。

## 与上游的差异

- `package.json` 增加了 `fork.owner` / `fork.repo`，更新检查和安装包下载地址都指向 fork 仓库。
- `src/utils/version.js` 优先读取 Release asset 里的 `version.json`，其次 fork `release` 分支的 raw 文件，再用 jsdelivr 镜像兜底；下载地址指向 fork 的 Releases。
- 新增 `scripts/verify-version.js`，并在 `release.yml` 里作为 `verify` job 运行，校验 `publish/version.json` 与 `package.json` 的版本元数据一致。
- `.github/workflows/beta-pack.yml` 的 iOS 构建会去掉 `-fork.N` 后缀，避免非法 `CFBundleShortVersionString`。
- `src/utils/request.js` 不再把 `-fork.N` 后缀拼进上游请求签名。
- `publish-version-info.yml` 已移除；版本信息直接随 GitHub Release 发布，不再依赖 npm 包或 version-info 仓库。
- `publish/utils/parseChangelog.js` 支持解析带 `-fork.N` 的版本号。
- `publish/utils/updateChangeLog.js` 不再自动递增 `versionCode`，统一由 `scripts/fork-version.js` 维护，并会写入 `publish/version.json`。

## 注意

- 本 fork 仍使用 `cn.toside.music.mobile` 包名，签名与上游不同，无法覆盖安装上游版本。
- 应用内更新只在 Android 上生效：按设备 ABI 下载对应 APK 并交给系统安装器；iOS 只会打开 fork 的 Releases 页面。
- Android 8+ 首次使用应用内安装需要授予"安装未知应用"权限；如果设备上装的是 debug 签名的测试包，无法直接覆盖安装正式签名包（`INSTALL_FAILED_UPDATE_INCOMPATIBLE`），需先卸载。
- `universal` APK 的 `versionCode` 低于各 ABI 包（不叠加 ABI 偏移），手动安装时不要用它去覆盖 ABI 包。
