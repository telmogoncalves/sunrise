import { AppBskyFeedDefs } from '@atproto/api'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/unspecced/getPopularFeedGenerators'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { BrightStar, Heart } from 'iconoir-react'
import Link from 'next/link'
import { useLocalStorage } from 'usehooks-ts'

import Avatar from '@/components/Avatar'
import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Username from '@/components/Username'
import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.app.bsky.unspecced.getPopularFeedGenerators()

  return data
}

export default function PopularFeeds(): JSX.Element {
  const { data, isLoading } = useQuery(['popular-feeds'], getData)
  const [feeds, setFeeds] = useLocalStorage<AppBskyFeedDefs.GeneratorView[]>('FEEDS', [])

  if (isLoading)
    return (
      <div className="w-full px-12">
        <Page icon={BrightStar} title={t`Popular Feeds`}>
          <div className="space-y-8 rounded-lg border p-6">
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
            <FeedSkeleton />
          </div>
        </Page>
      </div>
    )

  return (
    <div className="w-full px-12">
      <Page icon={BrightStar} title={t`Popular Feeds`}>
        <div className="rounded-lg border">
          {data?.feeds?.map(feed => {
            const feedName = feed.uri.split('/').at(-1)
            const feedPath = `/u/${feed.creator.handle}/feed/${feedName}`
            const isFollowing = feeds?.find(f => f.cid === feed.cid)

            return (
              <Link
                href={feedPath}
                className="block border-b px-4 py-6 last:border-none hover:bg-gray-50 dark:hover:bg-slate-900"
                key={feed.cid}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex w-12">
                    {feed.avatar ? (
                      <>
                        {/*eslint-disable-next-line @next/next/no-img-element*/}
                        <img className="h-10 w-10 rounded-full" src={feed.avatar} alt={feed.displayName} />
                      </>
                    ) : null}
                  </div>

                  <div className="flex-1 grow space-y-3">
                    <div className="space-y-1">
                      <div className="font-semibold">{feed.displayName}</div>
                      <div className="break-all text-sm text-zinc-500">{feed.description}</div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <div className="text-xs font-medium">{feed.likeCount}</div>
                      </div>

                      <div className="flex items-center space-x-2 text-sm">
                        <Avatar {...feed.creator} className="h-5 w-5 rounded-full" hoverCard />
                        <Username {...feed.creator} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      variant={isFollowing ? 'secondary' : 'default'}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()

                        if (isFollowing) {
                          setFeeds(feeds.filter(f => f.cid !== feed.cid))

                          return
                        }

                        setFeeds([...feeds, feed])
                      }}
                      size="sm"
                    >
                      {isFollowing ? t`Unfollow` : t`Follow`}
                    </Button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Page>
    </div>
  )
}

function FeedSkeleton(): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <div className="w-12">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      <div className="grow space-y-2">
        <Skeleton className="h-4 w-48 rounded-md" />
        <Skeleton className="h-3 w-72 rounded-md" />
      </div>

      <div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  )
}
