/* eslint-disable @typescript-eslint/ban-ts-comment */
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/graph/getLists'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import { ScrollText } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import InfiniteScroll from 'react-infinite-scroller'

import Avatar from '@/components/Avatar'
import EmptyProfileSection from '@/components/EmptyProfileSection'
import ProfileHeader from '@/components/ProfileHeader'
import { Skeleton } from '@/components/ui/skeleton'
import agent from '@/lib/agent'

async function getData({ handle = '', pageParam = '' }): Promise<OutputSchema> {
  const { data } = await (await agent()).api.app.bsky.graph.getLists({ actor: handle, limit: 20, cursor: pageParam })

  return data
}

export default function Lists(): JSX.Element {
  const { asPath, query } = useRouter()
  const { data, hasNextPage, isLoading, fetchNextPage } = useInfiniteQuery(
    [asPath, 'lists'],
    ({ pageParam }) => getData({ handle: `${query.handle}`, pageParam }),
    {
      getNextPageParam: lastPage => lastPage?.cursor,
      enabled: !!query.handle,
    },
  )

  return (
    <div>
      <div className="space-y-4 p-12">
        <ProfileHeader />

        {isLoading ? (
          <div className="space-y-8 rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3 w-72 rounded-md" />
              </div>

              <div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-3 w-72 rounded-md" />
              </div>

              <div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </div>
        ) : data?.pages?.[0]?.lists?.length ? (
          <div className="rounded-lg border">
            <InfiniteScroll
              pageStart={0}
              loadMore={async function () {
                await fetchNextPage()
              }}
              hasMore={hasNextPage}
              loader={
                <div className="flex justify-center py-12">
                  <Ring size={24} lineWeight={5} speed={2} color="var(--brand-500)" />
                </div>
              }
            >
              {data?.pages?.map(group => {
                return group.lists?.map((list, index) => {
                  const listId = list.uri.split('/').at(-1)

                  return (
                    <Link
                      href={`/u/${query.handle}/lists/${listId}`}
                      key={`${list.uri}--${index}`}
                      className="m-1 flex items-center justify-between rounded-lg p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="max-w-[80%] grow space-y-1">
                        <div className="font-medium">{list.name}</div>
                        <div className="text-sm text-zinc-500">{list.description}</div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-sm">by</div>

                        <div className="flex items-center space-x-2 truncate overflow-ellipsis text-sm">
                          <Avatar {...list.creator} hoverCard className="h-6 w-6 rounded-full" />
                        </div>
                      </div>
                    </Link>
                  )
                })
              })}
            </InfiniteScroll>
          </div>
        ) : (
          <EmptyProfileSection icon={ScrollText}>
            {t`Nothing to see here yet. When @${query.handle} creates a list you'll see it here.`}
          </EmptyProfileSection>
        )}
      </div>
    </div>
  )
}
