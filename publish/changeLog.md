### 新增

- 恢复应用内更新检查，版本比较改用 versionCode，避免 fork 版本号被误判
- 版本信息（version.json）随 GitHub Release 一同发布，发布前自动校验版本元数据

### 修复

- 修复 iOS 构建时版本号带 -fork.N 后缀导致 CFBundleShortVersionString 非法的问题
