#!/usr/bin/env node
/**
 * Fork 版本号工具
 *
 * 版本格式：<上游版本>-fork.<fork 序号>，例如 1.9.2-fork.3
 * 规则：
 *   - 合并上游新版本后：version:sync <上游版本> <上游 versionCode>
 *   - 发布 fork 自己的改动：version:bump
 *
 * versionCode 规则：max(当前 versionCode + 1, 上游 versionCode × 100)
 * 这样既保证单调递增，又给每个上游版本预留 100 个 fork 版本。
 */

const fs = require('fs')
const path = require('path')

const pkgPath = path.join(__dirname, '..', 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))

const FORK_VERSION_RE = /^(\d+\.\d+\.\d+)-fork\.(\d+)$/
const UPSTREAM_VERSION_RE = /^\d+\.\d+\.\d+$/

const fail = (message) => {
  console.error(`\n[fork-version] ${message}\n`)
  process.exit(1)
}

const readForkVersion = () => {
  const match = FORK_VERSION_RE.exec(pkg.version)
  if (!match) {
    fail(`当前版本 "${pkg.version}" 不是 <上游版本>-fork.<序号> 格式。\n` +
      '首次使用前请先手动改成例如 1.9.2-fork.1，或运行 version:sync <上游版本> <上游 versionCode>。')
  }
  return { base: match[1], revision: Number(match[2]) }
}

const readVersionCode = () => {
  const code = Number(pkg.versionCode)
  if (!Number.isInteger(code) || code <= 0) fail(`versionCode "${pkg.versionCode}" 不是有效的正整数。`)
  return code
}

const write = () => {
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf-8')
}

const printResult = (oldVersion, oldCode) => {
  console.log(`[fork-version] version:     ${oldVersion} -> ${pkg.version}`)
  console.log(`[fork-version] versionCode: ${oldCode} -> ${pkg.versionCode}`)
}

const bump = () => {
  const { base, revision } = readForkVersion()
  const oldVersion = pkg.version
  const oldCode = readVersionCode()

  pkg.version = `${base}-fork.${revision + 1}`
  pkg.versionCode = oldCode + 1

  write()
  printResult(oldVersion, oldCode)
}

const sync = (base, upstreamCodeArg) => {
  if (!base || !UPSTREAM_VERSION_RE.test(base)) {
    fail('用法: node scripts/fork-version.js sync <上游版本> <上游 versionCode>\n例如: node scripts/fork-version.js sync 1.9.3 80')
  }
  const upstreamCode = Number(upstreamCodeArg)
  if (!Number.isInteger(upstreamCode) || upstreamCode <= 0) {
    fail('上游 versionCode 必须是正整数，例如: node scripts/fork-version.js sync 1.9.3 80')
  }

  const oldVersion = pkg.version
  const oldCode = readVersionCode()
  const nextCode = Math.max(oldCode + 1, upstreamCode * 100)

  if (nextCode <= oldCode) fail(`计算出的 versionCode (${nextCode}) 没有大于当前值 (${oldCode})。`)

  pkg.version = `${base}-fork.1`
  pkg.versionCode = nextCode

  write()
  printResult(oldVersion, oldCode)
}

const [command, ...args] = process.argv.slice(2)

switch (command) {
  case 'bump':
    bump()
    break
  case 'sync':
    sync(args[0], args[1])
    break
  default:
    console.log(`用法:
  node scripts/fork-version.js bump
      发布 fork 改动：fork 序号 +1，versionCode +1

  node scripts/fork-version.js sync <上游版本> <上游 versionCode>
      合并上游新版本：重置为 <上游版本>-fork.1
      versionCode = max(当前 versionCode + 1, 上游 versionCode × 100)`)
    if (command) process.exit(1)
}
