import { useIsPad } from '@/utils/hooks'
import { iosHomeBottomInset, iosPadBottomInset } from './tokens'

/**
 * 首页内容底部留白：
 * 手机需要留出「浮动迷你播放器 + 底部标签栏 + 底部安全区」；
 * 平板只有悬浮在内容区右下的迷你播放器，留白要小得多，
 * 否则列表底部会空出一大截。
 */
export const useIOSHomeBottomInset = () => {
  const isPad = useIsPad()
  return isPad ? iosPadBottomInset : iosHomeBottomInset
}
