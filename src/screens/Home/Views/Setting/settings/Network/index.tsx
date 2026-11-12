import { memo } from 'react'
import { View } from 'react-native'

import Section from '../../components/Section'
import SubTitle from '../../components/SubTitle'
import Text from '@/components/common/Text'
import IsEnable from './IsEnable'
import HostInput from './HostInput'
import PortInput from './PortInput'
import AuthInput from './AuthInput'
import TestConnection from './TestConnection'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'

export default memo(() => {
  const t = useI18n()

  return (
    <Section title={t('setting_network')}>
      <IsEnable />
      <View style={styles.form}>
        <HostInput />
        <PortInput />
        <AuthInput />
        <TestConnection />
      </View>
      <SubTitle title={t('setting_proxy_tips')}>
        <View>
          <Text size={13} style={styles.tip}>{t('setting_proxy_bypass_tip')}</Text>
          <Text size={13} style={styles.tip}>{t('setting_proxy_restart_tip')}</Text>
        </View>
      </SubTitle>
    </Section>
  )
})

const styles = createStyle({
  form: {
    marginTop: 8,
  },
  tip: {
    marginTop: 3,
  },
})
