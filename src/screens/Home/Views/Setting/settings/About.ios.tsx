import { memo } from 'react'
import { View, type StyleProp, type TextStyle } from 'react-native'

import Section from '../components/Section'
import { IOSListRow } from '@/components/ios'
import IOSText from '@/components/ios/Text'
import { useIOSTheme } from '@/theme/ios/useIOSTheme'
import { openUrl } from '@/utils/tools'
import { useI18n } from '@/lang'
import { showPactModal } from '@/core/common'

const REPO_URL = 'https://github.com/lyswhut/lx-music-mobile'
const RELEASE_URL = 'https://github.com/lyswhut/lx-music-mobile/releases'
const FAQ_URL = 'https://lyswhut.github.io/lx-music-doc/mobile/faq'
const ISSUE_URL = 'https://github.com/lyswhut/lx-music-mobile/issues?q=is%3Aissue+'
const PACT_URL = 'https://github.com/lyswhut/lx-music-mobile#%E9%A1%B9%E7%9B%AE%E5%8D%8F%E8%AE%AE'

/**
 * iOS 关于页：链接做成设置行，说明文字放在下面的卡片里。
 */
export default memo(() => {
  const t = useI18n()
  const { colors, spacing } = useIOSTheme()

  const Paragraph = ({ children, style }: { children: React.ReactNode, style?: StyleProp<TextStyle> }) => (
    <IOSText
      variant="footnote"
      color={colors.secondaryLabel}
      style={[{ lineHeight: 19, marginBottom: 10 }, style]}
    >{children}</IOSText>
  )
  const Strong = ({ children }: { children: React.ReactNode }) => (
    <IOSText variant="footnote" weight="600" color={colors.label}>{children}</IOSText>
  )

  return (
    <>
      <Section title={t('setting_about')}>
        <IOSListRow
          showSeparator={false}
          title="GitHub 仓库"
          subtitle={REPO_URL.replace('https://', '')}
          accessory="chevron"
          onPress={() => { void openUrl(REPO_URL) }}
        />
        <IOSListRow
          showSeparator={false}
          title="GitHub Releases"
          accessory="chevron"
          onPress={() => { void openUrl(RELEASE_URL) }}
        />
        <IOSListRow
          showSeparator={false}
          title={t('setting_about_faq')}
          accessory="chevron"
          onPress={() => { void openUrl(FAQ_URL) }}
        />
        <IOSListRow
          showSeparator={false}
          title={t('setting_about_issue')}
          accessory="chevron"
          onPress={() => { void openUrl(ISSUE_URL) }}
        />
        <IOSListRow
          showSeparator={false}
          title={t('setting_about_pact')}
          accessory="chevron"
          onPress={showPactModal}
        />
        <IOSListRow
          showSeparator={false}
          title={t('setting_about_pact_online')}
          accessory="chevron"
          onPress={() => { void openUrl(PACT_URL) }}
        />
      </Section>
      <Section title={t('setting_about')}>
        <View style={{ padding: spacing.lg }}>
          <Paragraph>本软件完全免费，代码已开源。</Paragraph>
          <Paragraph>
            本软件没有客服，但我们整理了一些常见的使用问题。<Strong>仔细、仔细、仔细</Strong>地阅读常见问题后，仍有问题可到 GitHub <Strong>提交 Issue</Strong>。
          </Paragraph>
          <Paragraph>由于软件开发的初衷仅是为了对新技术的学习与研究，因此软件直至停止维护都将会一直保持纯净。</Paragraph>
          <Paragraph>
            目前本项目的原始发布地址<Strong>只有 GitHub</Strong>，其他渠道均为第三方转载发布，可信度请自行鉴别。
          </Paragraph>
          <Paragraph>
            <Strong>本项目没有微信公众号之类的所谓「官方账号」，也未在小米、华为、vivo 等应用商店发布同名应用，谨防被骗！</Strong>
          </Paragraph>
          <Paragraph>
            若你使用过程中遇到<Strong>广告</Strong>或者<Strong>引流</Strong>（如需要加群、关注公众号之类才能使用或者升级）的信息，则表明你当前运行的软件是「第三方修改版」。
          </Paragraph>
          <Paragraph>
            若在升级新版本时提示「<Strong>签名不一致</Strong>」，则表明你手机上的旧版本或者将要安装的新版本中<Strong>有一方</Strong>是「<Strong>第三方修改版</Strong>」。
          </Paragraph>
          <Paragraph style={{ marginBottom: 0 }}>By: 落雪无痕</Paragraph>
        </View>
      </Section>
    </>
  )
})
