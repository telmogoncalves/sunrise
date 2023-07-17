import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/actor/getSuggestions'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

import agent from '@/lib/agent'

import ProfileCard from './ProfileCard'
import { Button } from './ui/button'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).getSuggestions({ limit: 10 })

  return data
}

export default function WhoToFollow(): JSX.Element {
  const { data } = useQuery(['who-to-follow'], getData)

  return (
    <div className="w-full space-y-4">
      <div className="text-lg font-semibold">{t`Who to follow`}</div>

      {data?.actors?.map(actor => {
        return (
          <Link href={`/u/${actor.handle}`} className="block space-y-5 rounded-md border p-4" key={actor.did}>
            <ProfileCard {...actor} />
          </Link>
        )
      })}

      <div className="">
        <Link href="/suggestions">
          <Button className="w-full" variant="secondary">
            {t`See more`}
          </Button>
        </Link>
      </div>
    </div>
  )
}
