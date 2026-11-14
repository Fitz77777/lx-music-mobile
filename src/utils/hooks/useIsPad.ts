import { isPadDevice } from '@/utils/tools'
import useWindowSize from './useWindowSize'

/**
 * 当前是否处于平板（iPad / Android 平板）布局。
 * 窗口尺寸由 SizeView（iOS）/ windowSizeTools（Android）维护，
 * 旋转 / 分屏尺寸变化时会触发重渲染。
 */
export default function useIsPad(): boolean {
  const { width, height } = useWindowSize()
  return isPadDevice(width, height)
}
