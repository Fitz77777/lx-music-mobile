import { useEffect } from 'react'
import { useIsPad } from '@/utils/hooks'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import IOS from './IOS'
import Pad from './Pad'
import { navigations } from '@/navigation'
import settingState from '@/store/setting/state'


interface Props {
  componentId: string
}


export default ({ componentId }: Props) => {
  const isPad = useIsPad()
  useEffect(() => {
    setComponentId(COMPONENT_IDS.home, componentId)
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (settingState.setting['player.startupPushPlayDetailScreen']) {
      navigations.pushPlayDetailScreen(componentId, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isPad
    ? <Pad />
    : <IOS />
}
