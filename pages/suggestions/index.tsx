import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/actor/getSuggestions'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { AddUser } from 'iconoir-react'
import Link from 'next/link'

import Page from '@/components/Page'
import ProfileCard from '@/components/ProfileCard'
import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).getSuggestions()

  return data
}

export default function Suggestions(): JSX.Element {
  const { data } = useQuery(['who-to-follow-all'], getData)

  return (
    <div className="mx-auto xl:w-2/5">
      <Page icon={AddUser} title={t`Who to follow`}>
        <div className="rounded-lg border">
          {data?.actors?.map(actor => {
            return (
              <Link href={`/u/${actor.handle}`} key={actor.did} className="block border-b p-6 last:border-none">
                <ProfileCard {...actor} />
              </Link>
            )
          })}
        </div>
      </Page>
    </div>
  )
}
