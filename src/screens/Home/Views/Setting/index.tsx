import { useHorizontalMode, useIsPad } from '@/utils/hooks'
import Vertical from './Vertical'
import Horizontal from './Horizontal'
import Pad from './Pad'
import { useBackHandler } from '@/utils/hooks/useBackHandler'
import { useCallback } from 'react'
// import { AppColors } from '@/theme'
import commonState from '@/store/common/state'
import { setNavActiveId } from '@/core/common'

export type { SettingScreenIds } from './Main'

export default () => {
  const isHorizontalMode = useHorizontalMode()
  const isPad = useIsPad()
  useBackHandler(useCallback(() => {
    if (Object.keys(commonState.componentIds).length == 1 && commonState.navActiveId == 'nav_setting') {
      setNavActiveId(commonState.lastNavActiveId)
      return true
    }
    return false
  }, []))

  if (isPad) return <Pad />

  return isHorizontalMode
    ? <Horizontal />
    : <Vertical />
}
