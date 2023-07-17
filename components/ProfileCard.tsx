import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

import agent from '@/lib/agent'

import Avatar from './Avatar'
import Connections from './Connections'
import Follow from './Follow'
import Markup from './Markup'
import ProfileSkeleton from './ProfileSkeleton'
import Username from './Username'

async function getProfile(handle: string): Promise<ProfileView> {
  const { data } = await (await agent()).getProfile({ actor: `${handle}` })

  return data
}

export default function ProfileCard({ handle }: { handle: string }): JSX.Element {
  const { asPath } = useRouter()
  const { data, isLoading } = useQuery([asPath, 'card', handle], () => getProfile(handle))

  if (isLoading) return <ProfileSkeleton />

  return (
    <div className="w-full space-y-5">
      <div className="flex items-start space-x-3">
        <div className="w-12">
          <Avatar {...data} className="w-12 rounded-full" />
        </div>

        <div className="flex-1 grow space-y-3 overflow-clip">
          <div className="space-y-2">
            <div className="flex w-full justify-between space-x-3">
              <div className="break-words">
                <Username {...(data as ProfileView)} displayFollowedBy={!!data?.viewer?.followedBy} blocks />
              </div>

              <div>{data ? <Follow {...data} /> : null}</div>
            </div>

            <div className="w-full break-words">
              <Markup className="text-sm">{data?.description as string}</Markup>
            </div>

            <Connections {...(data as ProfileView)} />
          </div>
        </div>
      </div>
    </div>
  )
}
