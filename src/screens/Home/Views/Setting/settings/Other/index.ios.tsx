import { memo } from 'react'

import ResourceCache from './ResourceCache'
import MetaCache from './MetaCache'
import DislikeList from './DislikeList'
import Log from './Log'

/**
 * iOS「其他」设置：每个主题各自一张分组卡片，行高统一，
 * 不再把所有内容塞进一张卡片里导致各段高度参差不齐。
 */
export default memo(() => {
  return (
    <>
      <ResourceCache />
      <MetaCache />
      <DislikeList />
      <Log />
    </>
  )
})
