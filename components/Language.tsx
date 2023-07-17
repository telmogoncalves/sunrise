import { t } from '@lingui/macro'
import { ChatBubbleTranslate } from 'iconoir-react'
import { useRouter } from 'next/router'

import { setLocale, supportedLocales } from '@/utils/i18n'

import Mention from './MarkupLink/Mention'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export default function Language(): JSX.Element {
  const { asPath } = useRouter()

  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div className="flex items-center space-x-2">
        <ChatBubbleTranslate className="h-6 w-6" />
        <div className="font-medium">{t`Language`}</div>
      </div>

      <Select
        onValueChange={val => {
          setLocale(val)
          window.location.assign(asPath)
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue
            placeholder={
              typeof window !== 'undefined'
                ? localStorage.getItem('LOCALE')
                  ? supportedLocales[JSON.parse(`${localStorage.getItem('LOCALE')}`)]
                  : 'English'
                : null
            }
          />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(supportedLocales).map(key => {
            return (
              <SelectItem key={key} value={key}>
                {supportedLocales[key]}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <div className="text-xs text-zinc-400 dark:text-zinc-500">
        {t`If you would like to help with translations please reach out to`} <Mention href="@telmo.is" />
      </div>
    </div>
  )
}
