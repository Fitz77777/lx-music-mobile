import { memo } from 'react'

import Theme from './Theme'

/**
 * iOS 主题设置：只保留强调色选择。
 * 亮暗跟随系统，背景图 / 动态背景 / 字体阴影在 iOS 界面层不生效，因此不展示。
 */
export default memo(() => {
  return (
    <>
      <Theme />
    </>
  )
})
