/* eslint-disable @typescript-eslint/ban-ts-comment */
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getAuthorFeed'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import { LayoutTemplate } from 'lucide-react'
import { useRouter } from 'next/router'
import InfiniteScroll from 'react-infinite-scroller'

import EmptyProfileSection from '@/components/EmptyProfileSection'
import Post from '@/components/Post'
import PostSkeleton from '@/components/PostSkeleton'
import ProfileHeader from '@/components/ProfileHeader'
import agent from '@/lib/agent'

async function getData({ handle = '', pageParam = '' }): Promise<OutputSchema> {
  const { data } = await (await agent()).getAuthorFeed({ actor: `${handle}`, cursor: pageParam, limit: 20 })

  return data
}

export default function Profile(): JSX.Element {
  const { query, asPath } = useRouter()
  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery(
    [asPath, 'posts'],
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
            <PostSkeleton bordered={false} />
          </div>
        ) : data?.pages?.[0]?.feed?.length ? (
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
                const onlyPosts = group?.feed?.filter(a => !a.reply || a.reason)

                return onlyPosts?.map((item, index) => {
                  return (
                    <div key={`${item.post.cid}--${index}`} className="border-b p-6 last:border-none">
                      {/*@ts-ignore*/}
                      <Post {...item} />
                    </div>
                  )
                })
              })}
            </InfiniteScroll>
          </div>
        ) : (
          <EmptyProfileSection icon={LayoutTemplate}>
            {t`Nothing to see here yet. When @${query.handle} shares a skeet you'll see it here.`}
          </EmptyProfileSection>
        )}
      </div>
    </div>
  )
}
