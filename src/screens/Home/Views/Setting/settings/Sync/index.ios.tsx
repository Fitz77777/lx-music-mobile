import { memo, useState } from 'react'

import IsEnable from './IsEnable'

/**
 * iOS 数据同步页：一张分组卡片，历史地址按钮并入「地址」行。
 */
export default memo(() => {
  const [host, setHost] = useState('')

  return <IsEnable host={host} setHost={setHost} />
})
