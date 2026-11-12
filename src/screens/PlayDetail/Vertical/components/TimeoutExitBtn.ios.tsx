import { memo, useRef } from 'react'

import TimeoutExitEditModal, { type TimeoutExitEditModalType, useTimeInfo } from '@/components/TimeoutExitEditModal'
import IOSIconButton from '@/components/ios/IconButton'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'

/** iOS 定时退出按钮：激活时使用强调色 */
export default memo(() => {
  const { accent, colors } = useIOSTheme()
  const modalRef = useRef<TimeoutExitEditModalType>(null)

  const timeInfo = useTimeInfo()

  const handleShow = () => {
    modalRef.current?.show()
  }

  return (
    <>
      <IOSIconButton
        name="music_time"
        size={20}
        color={timeInfo.active ? accent : colors.label}
        onPress={handleShow}
      />
      <TimeoutExitEditModal ref={modalRef} timeInfo={timeInfo} />
    </>
  )
})
