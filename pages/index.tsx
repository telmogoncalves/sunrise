import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getTimeline'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import { HomeSimple } from 'iconoir-react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'

import Compose from '@/components/Compose'
import Page from '@/components/Page'
import Post from '@/components/Post'
import PostSkeleton from '@/components/PostSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import agent from '@/lib/agent'

async function getData({ pageParam = '' }): Promise<OutputSchema> {
  const { data } = await (await agent()).getTimeline({ limit: 20, cursor: pageParam })

  return data
}

export default function Home(): JSX.Element {
  const { asPath } = useRouter()
  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery(
    [asPath],
    ({ pageParam }) => getData({ pageParam }),
    {
      getNextPageParam: lastPage => lastPage.cursor,
      refetchInterval: 10000,
    },
  )
  const [pages, setPages] = useState<OutputSchema[] | undefined>()

  useEffect(() => {
    // Gather all parents
    const parents = data?.pages?.map(data => data.feed?.map(a => a.reply?.root?.cid).filter(Boolean)).flat(Infinity)

    setPages(
      data?.pages?.map(group => {
        return {
          ...group,
          feed: group?.feed?.filter(a => !parents?.includes(a.post.cid)),
        }
      }),
    )
  }, [data])

  if (isLoading)
    return (
      <div className="w-full px-12">
        <Page icon={HomeSimple} title={t`Home`}>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-lg" />

            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        </Page>
      </div>
    )

  return (
    <div className="w-full px-12">
      <Page icon={HomeSimple} title={t`Home`}>
        <div className="space-y-4">
          <Compose />

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
              {pages?.map(group => (
                <>
                  {group?.feed?.map((item, index) => {
                    return (
                      <div key={`${item.post.cid}--${index}`} className="border-b p-6 last:border-none">
                        {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                        {/*@ts-ignore*/}
                        <Post {...item} />
                      </div>
                    )
                  })}
                </>
              ))}
            </InfiniteScroll>
          </div>
        </div>
      </Page>
    </div>
  )
}
