import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/graph/getFollowers'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'

import Avatar from '@/components/Avatar'
import ProfileCard from '@/components/ProfileCard'
import Username from '@/components/Username'
import agent from '@/lib/agent'

async function getData(handle: string): Promise<OutputSchema> {
  const { data } = await (await agent()).getFollowers({ actor: handle, limit: 100 })

  return data
}

export default function Followers(): JSX.Element {
  const { asPath, query } = useRouter()
  const { data, isLoading } = useQuery([asPath, 'followers'], () => getData(`${query.handle}`))

  if (isLoading) return <></>

  return (
    <>
      <div className="space-y-12 p-12">
        <div className="flex items-center space-x-4">
          <Link href={`/u/${query.handle}`} className="flex items-center space-x-2">
            <Avatar {...data?.subject} className="h-12 w-12 rounded-full" />

            <div>
              <Username {...(data?.subject as ProfileView)} blocks />
            </div>
          </Link>
        </div>

        <div className="flex w-full items-center space-x-2 rounded-md border p-1">
          <Link
            href={`/u/${query.handle}/following`}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': `/u/${query.handle}/following` === asPath,
            })}
          >
            {t`Following`}
          </Link>

          <Link
            href={`/u/${query.handle}/followers`}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': `/u/${query.handle}/followers` === asPath,
            })}
          >
            {t`Followers`}
          </Link>
        </div>

        <div className="rounded-lg border">
          {data?.followers?.map(user => {
            return (
              <Link href={`/u/${user.handle}`} key={user.did} className="block border-b p-8 last:border-none">
                <ProfileCard {...user} />
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
