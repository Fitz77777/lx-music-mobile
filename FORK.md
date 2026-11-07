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

版本检查读取的是 `release` 分支上的 `publish/version.json`。

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

## 发布流程

1. `git fetch upstream --tags`
2. 更新纯上游镜像：在 `master` 上合并 `upstream/master` 并推送
3. 把 `master` 合并进 `release`
4. 合并上游版本时执行 `npm run version:sync -- <上游版本> <上游 versionCode>`
5. fork 自己迭代时执行 `npm run version:bump`
6. 更新 `publish/changeLog.md`，运行 `npm run publish` 写入更新日志和 `publish/version.json`
7. 推送到 `release` 分支
8. `.github/workflows/release.yml` 构建 Android 包，并创建 `v<version>` tag 与 GitHub Release

> 不要直接向 `master` 推送 fork 改动；`master` 只作为上游镜像。

## 与上游的差异

- `package.json` 增加了 `fork.owner` / `fork.repo`，更新检查和安装包下载地址都指向 fork 仓库。
- `src/utils/version.js` 从 fork 仓库的 `release` 分支读取 `publish/version.json`，下载地址指向 fork 的 Releases。
- `src/utils/request.js` 不再把 `-fork.N` 后缀拼进上游请求签名。
- `publish-version-info.yml` 已移除（它原本会把 release 事件转发到上游的 version-info 仓库）。
- `publish/utils/parseChangelog.js` 支持解析带 `-fork.N` 的版本号。
- `publish/utils/updateChangeLog.js` 不再自动递增 `versionCode`，统一由 `scripts/fork-version.js` 维护。

## 注意

- 本 fork 仍使用 `cn.toside.music.mobile` 包名，签名与上游不同，无法覆盖安装上游版本。
- `src/core/version.ts` 的自动更新检查目前是关闭状态；如需启用，必须使用 fork 自己的 `version.json`，并按 `versionCode` 而不是 semver 字符串比较版本。
