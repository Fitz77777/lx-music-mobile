import { Linking, Platform } from 'react-native'
import { httpGet } from '@/utils/request'
import pkg from '../../package.json'
import { downloadFile, stopDownload, temporaryDirectoryPath } from '@/utils/fs'
import { getSupportedAbis, installApk } from '@/utils/nativeModules/utils'
import { APP_PROVIDER_NAME } from '@/config/constant'

// fork 仓库地址；未配置 fork 字段时回退到 package.json 里的原仓库信息
const owner = pkg.fork?.owner ?? pkg.author.name
const repo = pkg.fork?.repo ?? pkg.name

export const isInternalUpdateSupported = Platform.OS == 'android'
export const openReleasePage = async(version) => Linking.openURL(version
  ? `https://github.com/${owner}/${repo}/releases/tag/v${version}`
  : `https://github.com/${owner}/${repo}/releases`)

const abis = [
  'arm64-v8a',
  'armeabi-v7a',
  'x86_64',
  'x86',
  'universal',
]

// 版本信息放在 release 分支；master 仅用于同步上游
// 优先读 Release asset：github.com 域名比 raw 更易访问，且发布后没有 CDN 分支缓存延迟
const address = [
  [`https://github.com/${owner}/${repo}/releases/latest/download/version.json`, 'direct'],
  [`https://raw.githubusercontent.com/${owner}/${repo}/release/publish/version.json`, 'direct'],
  [`https://cdn.jsdelivr.net/gh/${owner}/${repo}@release/publish/version.json`, 'direct'],
  [`https://fastly.jsdelivr.net/gh/${owner}/${repo}@release/publish/version.json`, 'direct'],
  [`https://gcore.jsdelivr.net/gh/${owner}/${repo}@release/publish/version.json`, 'direct'],
]


const request = async(url, retryNum = 0) => {
  return new Promise((resolve, reject) => {
    httpGet(url, {
      timeout: 10000,
    }, (err, resp, body) => {
      if (err || resp.statusCode != 200) {
        ++retryNum >= 3
          ? reject(err || new Error(resp.statusMessage || resp.statusCode))
          : request(url, retryNum).then(resolve).catch(reject)
      } else resolve(body)
    })
  })
}

const getDirectInfo = async(url) => {
  return request(url).then(info => {
    if (info.version == null) throw new Error('failed')
    return info
  })
}

const getNpmPkgInfo = async(url) => {
  return request(url).then(json => {
    if (!json.versionInfo) throw new Error('failed')
    const info = JSON.parse(json.versionInfo)
    if (info.version == null) throw new Error('failed')
    return info
  })
}

export const getVersionInfo = async(index = 0) => {
  const [url, source] = address[index]
  let promise
  switch (source) {
    case 'direct':
      promise = getDirectInfo(url)
      break
    case 'npm':
      promise = getNpmPkgInfo(url)
      break
  }

  return promise.catch(async(err) => {
    index++
    if (index >= address.length) throw err
    return getVersionInfo(index)
  })
}

const getTargetAbi = async() => {
  const supportedAbis = await getSupportedAbis()
  for (const abi of abis) {
    if (supportedAbis.includes(abi)) return abi
  }
  return abis[abis.length - 1]
}
let downloadJobId = null
const noop = (total, download) => {}
let apkSavePath

export const downloadNewVersion = async(version, onDownload = noop) => {
  if (!isInternalUpdateSupported) {
    await openReleasePage(version)
    return
  }
  const abi = await getTargetAbi()
  const url = `https://github.com/${owner}/${repo}/releases/download/v${version}/${pkg.name}-v${version}-${abi}.apk`
  let savePath = temporaryDirectoryPath + '/lx-music-mobile.apk'

  if (downloadJobId) stopDownload(downloadJobId)

  const { jobId, promise } = downloadFile(url, savePath, {
    progressInterval: 500,
    connectionTimeout: 20000,
    readTimeout: 30000,
    begin({ statusCode, contentLength }) {
      onDownload(contentLength, 0)
      // switch (statusCode) {
      //   case 200:
      //   case 206:
      //     break
      //   default:
      //     onDownload(null, contentLength, 0)
      //     break
      // }
    },
    progress({ contentLength, bytesWritten }) {
      onDownload(contentLength, bytesWritten)
    },
  })
  downloadJobId = jobId
  return promise.then(() => {
    apkSavePath = savePath
    return updateApp()
  })
}

export const updateApp = async() => {
  if (!isInternalUpdateSupported) {
    await openReleasePage()
    return
  }
  if (!apkSavePath) throw new Error('apk Save Path is null')
  await installApk(apkSavePath, APP_PROVIDER_NAME)
}
