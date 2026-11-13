import { useMemo, useRef } from 'react'
import { PanResponder } from 'react-native'
import { Navigation } from 'react-native-navigation'

/**
 * iOS 右滑返回手势：横向位移明显时才接管，纵向滚动不受影响。
 * 二级页统一用它代替左上角的返回按钮。
 * @param edgeWidth 只在左边缘多少 pt 内生效；0 表示整页任意位置都可以右滑
 */
export const useIOSPanBack = (componentId?: string | null, edgeWidth = 0) => {
  const poppedRef = useRef(false)

  return useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_evt, gesture) => {
      if (!componentId || poppedRef.current) return false
      if (edgeWidth > 0 && gesture.x0 > edgeWidth) return false
      return gesture.dx > 12 && gesture.dx > Math.abs(gesture.dy) * 1.6
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_evt, gesture) => {
      if (!componentId || poppedRef.current) return
      if (gesture.dx > 72 || gesture.vx > 0.5) {
        poppedRef.current = true
        void Navigation.pop(componentId)
      }
    },
  }), [componentId, edgeWidth])
}

/**
 * iOS 下拉收起手势：播放页用，向下拖动足够距离后收起。
 */
export const useIOSPanDown = (componentId?: string | null) => {
  const poppedRef = useRef(false)

  return useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_evt, gesture) => {
      return !!componentId && !poppedRef.current && gesture.dy > 10 && gesture.dy > Math.abs(gesture.dx) * 1.5
    },
    onPanResponderTerminationRequest: () => false,
    onPanResponderRelease: (_evt, gesture) => {
      if (!componentId || poppedRef.current) return
      if (gesture.dy > 90 || gesture.vy > 0.6) {
        poppedRef.current = true
        void Navigation.pop(componentId)
      }
    },
  }), [componentId])
}
