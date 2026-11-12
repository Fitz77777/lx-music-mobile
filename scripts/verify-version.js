#!/usr/bin/env node
/**
 * 校验版本元数据一致性
 *
 * 移动端没有 electron-updater 之类的第二套更新通道，更新提示完全依赖
 * publish/version.json，因此它的 version / versionCode 必须与 package.json
 * 保持一致，否则发行出去的版本用户永远收不到更新提示。
 *
 * 只做只读校验，不会修改任何文件（发布前请运行 npm run publish 生成日志）。
 */

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'))
const info = JSON.parse(fs.readFileSync(path.join(root, 'publish/version.json'), 'utf-8'))

const FORK_VERSION_RE = /^\d+\.\d+\.\d+-fork\.\d+$/
const errors = []

if (pkg.version !== info.version) {
  errors.push(`version 不一致：package.json=${pkg.version}，publish/version.json=${info.version}`)
}
if (pkg.versionCode !== info.versionCode) {
  errors.push(`versionCode 不一致：package.json=${pkg.versionCode}，publish/version.json=${info.versionCode}`)
}
if (!FORK_VERSION_RE.test(pkg.version)) {
  errors.push(`版本号不符合 <上游版本>-fork.<N> 格式：${pkg.version}`)
}
if (!Number.isInteger(pkg.versionCode) || pkg.versionCode <= 0) {
  errors.push(`versionCode 必须是正整数：${pkg.versionCode}`)
}

if (errors.length) {
  console.error('\n[verify-version] 版本信息校验失败：')
  for (const error of errors) console.error(`- ${error}`)
  console.error('\n请更新 publish/changeLog.md 后运行 npm run publish\n')
  process.exit(1)
}

console.log(`[verify-version] 通过：${pkg.version} (versionCode ${pkg.versionCode})`)
