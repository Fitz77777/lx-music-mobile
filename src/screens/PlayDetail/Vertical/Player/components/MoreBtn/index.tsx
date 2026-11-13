import { createStyle } from '@/utils/tools'
import { View } from 'react-native'
import PlayModeBtn from './PlayModeBtn'
import MusicAddBtn from './MusicAddBtn'
import DesktopLyricBtn from './DesktopLyricBtn'
import CommentBtn from './CommentBtn'

export interface MoreBtnProps {
  /** iOS：切换封面 / 歌词页，Android 忽略 */
  onToggleLyric?: () => void
  /** iOS：当前是否显示歌词页，Android 忽略 */
  showingLyric?: boolean
}

export default ({ onToggleLyric, showingLyric }: MoreBtnProps) => {
  // 这两个参数仅 iOS 使用，Android 侧忽略
  void onToggleLyric
  void showingLyric
  return (
    <View style={styles.container}>
      <DesktopLyricBtn />
      <MusicAddBtn />
      <PlayModeBtn />
      <CommentBtn />
    </View>
  )
}


const styles = createStyle({
  container: {
    // flexShrink: 0,
    // flexGrow: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // backgroundColor: 'rgba(0,0,0,0.1)',
  },
})
