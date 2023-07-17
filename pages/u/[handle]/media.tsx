/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getAuthorFeed'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import { Image } from 'lucide-react'
import { useRouter } from 'next/router'
import InfiniteScroll from 'react-infinite-scroller'

import MediaWithThread from '@/components/Embed/MediaWithThread'
import EmptyProfileSection from '@/components/EmptyProfileSection'
import ProfileHeader from '@/components/ProfileHeader'
import { Skeleton } from '@/components/ui/skeleton'
import agent from '@/lib/agent'

async function getData({ handle = '', pageParam = '' }): Promise<OutputSchema> {
  const { data } = await (await agent()).getAuthorFeed({ actor: `${handle}`, cursor: pageParam, limit: 20 })

  return data
}

export default function Media(): JSX.Element {
  const { asPath, query } = useRouter()
  const { data, hasNextPage, isLoading, fetchNextPage } = useInfiniteQuery(
    [asPath, 'media'],
    ({ pageParam }) => getData({ handle: `${query.handle}`, pageParam }),
    {
      getNextPageParam: lastPage => lastPage?.cursor,
      enabled: !!query.handle,
    },
  )

  function getMedia(): FeedViewPost[] {
    const media: FeedViewPost[] = []

    data?.pages?.map(group => {
      group?.feed
        ?.filter(a => a.post.embed?.$type === 'app.bsky.embed.images#view' && !a.reason)
        .map(item => media.push(item))
    })

    return media
  }

  return (
    <div>
      <div className="space-y-4 p-12">
        <ProfileHeader />

        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
            <Skeleton className="h-48 w-full rounded-md" />
          </div>
        ) : data?.pages?.[0]?.feed?.length ? (
          <div className="rounded-lg border p-2">
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
              className="grid grid-cols-3 gap-3"
            >
              {getMedia().map((item, index) => {
                return (
                  <div key={`${item.post.cid}--${index}`}>
                    <MediaWithThread {...item.post} cover />
                  </div>
                )
              })}
            </InfiniteScroll>
          </div>
        ) : (
          <EmptyProfileSection icon={Image}>
            {t`Nothing to see here yet. When @${query.handle} skeets a picture you'll see it here.`}
          </EmptyProfileSection>
        )}
      </div>
    </div>
  )
}
