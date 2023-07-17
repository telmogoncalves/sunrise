/* eslint-disable @typescript-eslint/ban-ts-comment */
import { OutputSchema } from '@atproto/api/dist/client/types/com/atproto/repo/listRecords'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/router'
import InfiniteScroll from 'react-infinite-scroller'

import AsyncPost from '@/components/AsyncPost'
import EmptyProfileSection from '@/components/EmptyProfileSection'
import PostSkeleton from '@/components/PostSkeleton'
import ProfileHeader from '@/components/ProfileHeader'
import agent from '@/lib/agent'

async function getData({ handle = '', pageParam = '' }): Promise<OutputSchema> {
  const { data } = await (
    await agent()
  ).api.com.atproto.repo.listRecords({
    collection: 'app.bsky.feed.like',
    limit: 20,
    reverse: false,
    cursor: pageParam,
    repo: handle,
  })

  return data
}

export default function Likes(): JSX.Element {
  const { asPath, query } = useRouter()
  const { data, hasNextPage, isLoading, fetchNextPage } = useInfiniteQuery(
    [asPath, 'likes'],
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
          <div className="space-y-12 rounded-lg border p-6">
            <PostSkeleton bordered={false} />
            <PostSkeleton bordered={false} />
          </div>
        ) : data?.pages?.[0]?.records?.length ? (
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
                return group.records?.map((record, index) => {
                  return (
                    <div key={`${record.uri}--${index}`} className="border-b p-6 last:border-none">
                      {/*@ts-ignore*/}
                      <AsyncPost uri={record.value.subject.uri} />
                    </div>
                  )
                })
              })}
            </InfiniteScroll>
          </div>
        ) : (
          <EmptyProfileSection icon={Heart}>
            {t`Nothing to see here yet. When @${query.handle} likes a skeet you'll see it here.`}
          </EmptyProfileSection>
        )}
      </div>
    </div>
  )
}
