/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getTimeline'
import { UTCDate } from '@date-fns/utc'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import { ArrowUp, FireFlame } from 'iconoir-react'
import lande from 'lande'
import { orderBy, uniqBy } from 'lodash'
import { useRouter } from 'next/router'
import pluralize from 'pluralize'
import { useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroller'

import Avatar from '@/components/Avatar'
import Page from '@/components/Page'
import Post from '@/components/Post'
import PostSkeleton from '@/components/PostSkeleton'
import { LANGUAGES_MAP_CODE2 } from '@/constants/Languages'
import agent from '@/lib/agent'

async function getData({ pageParam = '' }): Promise<OutputSchema> {
  const { data } = await (
    await agent()
  ).api.app.bsky.feed.getFeed({
    feed: `at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot`,
    limit: 20,
    cursor: pageParam,
  })

  return data
}

export default function Hot(): JSX.Element {
  const { asPath } = useRouter()
  const { data, isLoading, fetchNextPage, hasNextPage } = useInfiniteQuery(
    [asPath],
    ({ pageParam }) => getData({ pageParam }),
    {
      getNextPageParam: lastPage => lastPage.cursor,
      refetchInterval: 10000,
      cacheTime: 0,
      staleTime: 0,
      networkMode: 'online',
    },
  )
  const [pages, setPages] = useState<OutputSchema[] | undefined>()
  const [newPosts, setNewPosts] = useState<FeedViewPost[] | undefined>()

  const langsCode3 =
    (typeof localStorage !== 'undefined' &&
      // @ts-ignore
      JSON.parse(localStorage.getItem('CONTENT_LANGUAGES'))?.map(
        (l: string) => LANGUAGES_MAP_CODE2.find(a => a.code2 === l)?.code3 || l,
      )) ??
    []

  useEffect(() => {
    const latestPostDate = orderBy(pages?.map(p => p.feed).flat(), 'post.indexedAt', 'desc').at(0)?.post.indexedAt

    setNewPosts(
      data?.pages
        ?.map(p => p.feed)
        .flat()
        .filter(({ post }) => {
          if (!latestPostDate) return

          if (langsCode3.length) {
            // @ts-ignore
            const res = lande(post.record.text)

            if (!langsCode3.includes(res[0][0])) return
          }

          return new UTCDate(new Date(post.indexedAt)) > new UTCDate(new Date(latestPostDate))
        }),
    )

    // Only update existing posts - for likes, reposts, replies
    setPages(
      pages?.map(group => {
        return {
          ...group,
          feed: group.feed.map(post => {
            // Find post in data
            const newPost = data?.pages
              ?.map(group => group.feed)
              .flat(Infinity)
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              .find(item => item.post.cid === post.post.cid)

            return newPost ?? post
          }),
        }
      }) as OutputSchema[],
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  if (isLoading)
    return (
      <div className="w-full px-12">
        <Page icon={FireFlame} title={t`Hot`}>
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        </Page>
      </div>
    )

  return (
    <div className="w-full px-12">
      <div className="top-0 z-40 flex items-center justify-center">
        {newPosts && newPosts?.length > 0 ? (
          <button
            onClick={() => {
              setPages(data?.pages)
              setNewPosts(undefined)
              window.scrollTo({ top: 0 })
            }}
            className="group fixed top-5 z-50 flex items-center space-x-2 rounded-full bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            <ArrowUp className="h-4 w-4 stroke-2" />

            <div className="flex items-center -space-x-1">
              {uniqBy(newPosts, 'post.author.did')
                ?.slice(0, 3)
                .map(({ post }) => {
                  return (
                    <div
                      key={post.author.did}
                      className="rounded-full ring-2 ring-brand-500 group-hover:ring-brand-700"
                    >
                      <Avatar {...post.author} className="h-6 w-6 rounded-full" />
                    </div>
                  )
                })}
            </div>

            <div>
              {newPosts.length} new {pluralize('post', newPosts.length)}
            </div>
          </button>
        ) : null}
      </div>

      <Page icon={FireFlame} title={t`Hot`}>
        <div>
          <InfiniteScroll
            pageStart={0}
            loadMore={async function () {
              const { data } = await fetchNextPage()
              setPages(data?.pages)
            }}
            hasMore={hasNextPage}
            loader={
              <div className="flex justify-center py-12">
                <Ring size={24} lineWeight={5} speed={2} color="var(--brand-500)" />
              </div>
            }
            threshold={500}
          >
            {pages?.map(group => (
              <>
                {orderBy(group?.feed, 'post.indexedAt', 'desc')?.map((item, index) => {
                  if (langsCode3.length) {
                    // @ts-ignore
                    const res = lande(item.post.record.text)

                    if (!langsCode3.includes(res[0][0])) return
                  }

                  return (
                    <div key={`${item.post.cid}--${index}`} className="my-4 rounded-lg border p-4">
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
      </Page>
    </div>
  )
}
