import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/graph/getList'
import { useQuery } from '@tanstack/react-query'
import { ScrollText } from 'lucide-react'
import { useRouter } from 'next/router'

import Avatar from '@/components/Avatar'
import Page from '@/components/Page'
import ProfileCard from '@/components/ProfileCard'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import Username from '@/components/Username'
import agent from '@/lib/agent'

async function getData(handle: string, id: string): Promise<OutputSchema> {
  const { data: profile } = await (await agent()).getProfile({ actor: `${handle}` })
  const list = `at://${profile.did}/app.bsky.graph.list/${id}`

  const { data } = await (await agent()).api.app.bsky.graph.getList({ list })

  return data
}

export default function List(): JSX.Element {
  const { asPath, query } = useRouter()
  const { data, isLoading } = useQuery([asPath, 'list', query.id], () => getData(`${query.handle}`, `${query.id}`))

  if (isLoading || !data)
    return (
      <div>
        <div className="px-12">
          <Page icon={ScrollText} title={<Skeleton className="h-6 w-56 rounded-md" />}>
            <div className="my-2 space-y-6">
              <Skeleton className="h-4 w-2/3 rounded-md" />

              <div className="space-y-6 rounded-lg border p-6">
                <ProfileSkeleton />
                <ProfileSkeleton />
              </div>
            </div>
          </Page>
        </div>
      </div>
    )

  return (
    <div>
      <div className="px-12">
        <Page icon={ScrollText} title={data.list.name}>
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-sm">
              <div>by</div>

              <div className="flex items-center space-x-1">
                <Avatar {...data.list.creator} className="h-6 w-6 rounded-full" />
                <Username {...data.list.creator} />
              </div>
            </div>

            <div className="rounded-lg border">
              {data.items.map(({ subject }) => {
                return (
                  <div key={subject.did} className="border-b p-6 last:border-none">
                    <ProfileCard handle={subject.handle} />
                  </div>
                )
              })}
            </div>
          </div>
        </Page>
      </div>
    </div>
  )
}
