import { t } from '@lingui/macro'
import { Settings as SettingsIcon } from 'iconoir-react'

import InviteCodes from '@/components/InviteCodes'
import Language from '@/components/Language'
import LoggedInAccounts from '@/components/LoggedInAccounts'
import Moderations from '@/components/Moderations'
import Page from '@/components/Page'
import Themes from '@/components/Theme'

export default function Settings(): JSX.Element {
  return (
    <div className="px-12">
      <Page icon={SettingsIcon} title={t`Settings`}>
        <div className="space-y-6">
          <LoggedInAccounts />
          <InviteCodes />
          <Moderations />
          <Language />
          <Themes />
        </div>
      </Page>
    </div>
  )
}
