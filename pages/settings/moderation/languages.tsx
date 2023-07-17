/* eslint-disable @typescript-eslint/ban-ts-comment */
import { t } from '@lingui/macro'
import { Translate } from 'iconoir-react'
import { sortBy, uniqBy } from 'lodash'
import { useEffect, useState } from 'react'

import Page from '@/components/Page'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Language, LANGUAGES_MAP_CODE2 } from '@/constants/Languages'

export default function Languages(): JSX.Element {
  const [term, setTerm] = useState<string | undefined>()
  const [languages, setLanguages] = useState<Language[]>()
  const [contentLanguages, setContentLanguages] = useState<string[]>(
    // @ts-ignore
    (typeof localStorage !== 'undefined' && JSON.parse(localStorage.getItem('CONTENT_LANGUAGES'))) ?? [],
  )

  useEffect(() => {
    localStorage.setItem('CONTENT_LANGUAGES', JSON.stringify(contentLanguages))
  }, [contentLanguages])

  useEffect(() => {
    if (!term || term === '') {
      setLanguages(LANGUAGES_MAP_CODE2)
      return
    }

    setLanguages(
      LANGUAGES_MAP_CODE2.filter(a => {
        if (a.name.toLowerCase().includes(term.toLowerCase())) {
          return a
        }
      }),
    )
  }, [term])

  return (
    <div className="px-12">
      <Page icon={Translate} title={t`Content languages`}>
        <div className="space-y-2">
          <Input placeholder="Search languages" onChange={e => setTerm(e.target.value)} />

          <div className="rounded-lg border p-1">
            {sortBy(uniqBy(languages, 'name'), 'name')?.map(lang => {
              const isChecked = contentLanguages.includes(lang.code2)

              return (
                <div key={lang.code2} className="flex items-center p-4">
                  <div className="grow text-sm">{lang.name}</div>

                  <div>
                    <Switch
                      onCheckedChange={() => {
                        setContentLanguages(
                          isChecked
                            ? contentLanguages.filter(a => a !== lang.code2)
                            : [...contentLanguages, lang.code2],
                        )
                      }}
                      checked={isChecked}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Page>
    </div>
  )
}
