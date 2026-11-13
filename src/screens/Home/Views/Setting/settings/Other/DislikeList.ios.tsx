import { memo, useRef } from 'react'
import { View } from 'react-native'

import Section from '../../components/Section'
import Button from '../../components/Button'
import { IOSListRow } from '@/components/ios'
import { toast } from '@/utils/tools'
import { useI18n } from '@/lang'
import { state, useRuleNum } from '@/store/dislikeList'
import DislikeEditModal, { type DislikeEditModalType } from './DislikeEditModal'
import { overwirteDislikeInfo } from '@/core/dislikeList'

/** iOS「不喜欢的歌曲」规则：一行规则数量 + 一个整行按钮 */
export default memo(() => {
  const t = useI18n()
  const modalRef = useRef<DislikeEditModalType>(null)
  const ruleNum = useRuleNum()

  const handleShow = () => {
    modalRef.current?.show(state.dislikeInfo.rules)
  }

  const handleSave = async(rules: string) => {
    if (state.dislikeInfo.rules.trim() == rules.trim()) return
    await overwirteDislikeInfo(rules)
    toast(t('setting__other_dislike_list_saved_tip'))
  }

  return (
    <>
      <Section title={t('setting__other_dislike_list')}>
        <IOSListRow
          showSeparator={false}
          title={t('setting__other_dislike_list_label', { num: ruleNum })}
        />
        <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          <Button style={{ alignSelf: 'stretch' }} onPress={handleShow}>
            {t('setting_other_dislike_list_show_btn')}
          </Button>
        </View>
      </Section>
      <DislikeEditModal ref={modalRef} onSave={handleSave} />
    </>
  )
})
