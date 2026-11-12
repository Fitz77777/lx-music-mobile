import { compareVer } from '@/utils'
import { downloadNewVersion, getVersionInfo, isInternalUpdateSupported, openReleasePage } from '@/utils/version'
import versionActions from '@/store/version/action'
import versionState, { type InitState } from '@/store/version/state'
import { getIgnoreVersion, getIgnoreVersionFailTipTime, saveIgnoreVersion, saveIgnoreVersionFailTipTime } from '@/utils/data'
import { showVersionModal } from '@/navigation'
import { Navigation } from 'react-native-navigation'
import { toast } from '@/utils/tools'
import { version as currentVersion, versionCode as currentVersionCode } from '../../package.json'

// Android 以 versionCode 作为升级依据，优先用它比较；
// 远端旧数据没有 versionCode 时回退到版本号字符串比较
const isNewerVersion = (info: { version: string, versionCode?: number }) => {
  if (typeof info.versionCode === 'number') return info.versionCode > currentVersionCode
  return compareVer(currentVersion, info.version) === -1
}

export const showModal = () => {
  if (versionState.showModal) return
  versionActions.setVisibleModal(true)
  showVersionModal()
}

export const hideModal = (componentId: string) => {
  if (!versionState.showModal) return
  versionActions.setVisibleModal(false)
  void Navigation.dismissOverlay(componentId)
}

export const checkUpdate = async() => {
  versionActions.setVersionInfo({ status: 'checking' })
  const versionInfo: InitState['versionInfo'] = { ...versionState.versionInfo }
  try {
    const { version, desc, history, versionCode } = await getVersionInfo()
    versionInfo.newVersion = {
      version,
      desc,
      history,
      versionCode,
    }
    versionInfo.isUnknown = false
    versionInfo.isLatest = !isNewerVersion({ version, versionCode })
    versionInfo.status = 'idle'
  } catch (err) {
    versionInfo.newVersion = {
      version: '0.0.0',
      desc: '',
      history: [],
    }
    versionInfo.isUnknown = true
    versionInfo.isLatest = false
    versionInfo.status = 'error'
  }

  versionActions.setVersionInfo(versionInfo)

  if (!versionInfo.isLatest) {
    if (versionInfo.isUnknown) {
      const time = await getIgnoreVersionFailTipTime()
      if (Date.now() - time < 7 * 86400000) return
      saveIgnoreVersionFailTipTime(Date.now())
      toast(global.i18n.t('version_tip_unknown'))
    } else if (versionInfo.newVersion.version != await getIgnoreVersion()) {
      showModal()
    }
  }
}

export const downloadUpdate = () => {
  if (!isInternalUpdateSupported) {
    void openReleasePage(versionState.versionInfo.newVersion?.version)
    return
  }
  versionActions.setVersionInfo({ status: 'downloading' })
  versionActions.setProgress({ total: 0, current: 0 })

  downloadNewVersion(versionState.versionInfo.newVersion!.version, (total: number, current: number) => {
    // console.log(total, current)
    versionActions.setProgress({ total, current })
  }).then(() => {
    versionActions.setVersionInfo({ status: 'downloaded' })
  }).catch(() => {
    versionActions.setVersionInfo({ status: 'error' })
    // console.log(err)
  })
}


export const setIgnoreVersion = (version: InitState['ignoreVersion']) => {
  versionActions.setIgnoreVersion(version)
  saveIgnoreVersion(version)
}
