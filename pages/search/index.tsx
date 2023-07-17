import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/actor/searchActorsTypeahead'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { DotPulse } from '@uiball/loaders'
import { Search as SearchIcon } from 'iconoir-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

import Page from '@/components/Page'
import ProfileCard from '@/components/ProfileCard'
import { Input } from '@/components/ui/input'
import WhoToFollow from '@/components/WhoToFollow'
import agent from '@/lib/agent'

async function getData(term: string): Promise<OutputSchema> {
  const { data } = await (await agent()).searchActorsTypeahead({ limit: 20, term })

  return data
}

export default function Search(): JSX.Element {
  const [term, setTerm] = useState('')
  const { data, refetch, isRefetching } = useQuery(['search-results'], () => getData(term))
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!term || term === '') return

    refetch?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term])

  return (
    <div className="px-12">
      <Page icon={SearchIcon} title={t`Search`}>
        <div className="space-y-6">
          <div className="relative">
            <Input
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  const value = e.target.value
                  setTerm(value)
                }
              }}
              placeholder="Search users. Enter to submit"
            />

            {isRefetching ? (
              <div className="absolute right-[18px] top-[18px]">
                <DotPulse size={16} speed={1.3} color={resolvedTheme === 'dark' ? '#fff' : '#000'} />
              </div>
            ) : null}
          </div>

          {data?.actors?.length ? (
            <div className="rounded-lg border">
              {data?.actors?.map(actor => {
                return (
                  <div key={actor.did} className="border-b p-6 last:border-none">
                    <ProfileCard {...actor} />
                  </div>
                )
              })}
            </div>
          ) : (
            <WhoToFollow />
          )}
        </div>
      </Page>
    </div>
  )
}
