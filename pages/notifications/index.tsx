import {
  Notification,
  OutputSchema as NotificationOutputSchema,
} from '@atproto/api/dist/client/types/app/bsky/notification/listNotifications'
import { t } from '@lingui/macro'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Ring } from '@uiball/loaders'
import clsx from 'clsx'
import { AddUser, AppNotification, AtSign, ChatLines, Heart, Quote } from 'iconoir-react'
import uniqBy from 'lodash/uniqBy'
import { Repeat } from 'lucide-react'
import InfiniteScroll from 'react-infinite-scroller'

import AsyncPost from '@/components/AsyncPost'
import Avatar from '@/components/Avatar'
import Page from '@/components/Page'
import { Skeleton } from '@/components/ui/skeleton'
import agent from '@/lib/agent'

async function getData({ pageParam = '' }): Promise<NotificationOutputSchema> {
  const { data } = await (await agent()).listNotifications({ limit: 20, cursor: pageParam })
  await (await agent()).updateSeenNotifications()

  return data
}

const GROUPABLE_REASONS = ['like', 'repost', 'follow']

type GroupedNotification = Notification & {
  additional?: Notification[]
}

export default function Notifications(): JSX.Element {
  const { data, hasNextPage, fetchNextPage, isLoading } = useInfiniteQuery(['list-notifications'], getData, {
    getNextPageParam: lastPage => lastPage.cursor,
    refetchInterval: 10000,
  })

  if (isLoading)
    return (
      <div className="px-12">
        <Page icon={AppNotification} title={t`Notifications`}>
          <div className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-full rounded-md" />
            <Skeleton className="h-5 w-full rounded-md" />
          </div>
        </Page>
      </div>
    )

  function getIcon(reason: string): JSX.Element {
    if (reason === 'like') return <Heart className="h-4 w-4 stroke-2 text-red-500" />
    if (reason === 'follow') return <AddUser className="h-4 w-4 stroke-2 text-sky-500" />
    if (reason === 'reply') return <ChatLines className="h-4 w-4 stroke-2 text-indigo-500" />
    if (reason === 'repost') return <Repeat className="h-4 w-4 text-green-500" />
    if (reason === 'mention') return <AtSign className="h-4 w-4 stroke-2 text-brand-500" />
    if (reason === 'quote') return <Quote className="h-4 w-4 stroke-2 text-amber-500" />

    return <div>{reason}</div>
  }

  function getLabel(reason: string): string | undefined {
    if (reason === 'like') return t`liked your skeet`
    if (reason === 'follow') return t`followed you`
    if (reason === 'reply') return t`replied to your skeet`
    if (reason === 'repost') return t`reskeet'd your skeet`
    if (reason === 'mention') return t`mentioned you`
    if (reason === 'quote') return t`quoted your skeet`
  }

  function groupedNotifications(): GroupedNotification[] {
    const result: GroupedNotification[] = []

    data?.pages?.map(page => {
      page?.notifications?.map(notification => {
        let grouped = false

        if (GROUPABLE_REASONS.includes(notification.reason)) {
          for (const item2 of result) {
            if (
              notification.reason === item2.reason &&
              notification.reasonSubject === item2.reasonSubject &&
              notification.author.did !== item2.author.did
            ) {
              item2.additional = item2.additional || []
              item2.additional.push(notification)
              grouped = true
              break
            }
          }
        }

        if (!grouped) result.push(notification)
      })
    })

    return result
  }

  return (
    <div className="px-12">
      <Page icon={AppNotification} title={t`Notifications`}>
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
            <>
              {groupedNotifications()?.map(notification => {
                const { cid, author, reason, isRead, additional } = notification
                const uniqueAuthors = additional?.length
                  ? uniqBy([author, ...additional.map(({ author }) => author)], 'did')
                  : [author]

                return (
                  <div
                    key={cid}
                    className={clsx('flex items-start space-x-4 border-t px-8 py-4 text-sm first:border-none', {
                      'bg-sky-50 bg-opacity-50 dark:bg-opacity-10': !isRead,
                    })}
                  >
                    <div className="mt-1 w-8">{getIcon(reason)}</div>

                    <div className="w-full space-y-3">
                      <div className="flex flex-1 grow items-center space-x-2">
                        <div className="flex -space-x-1.5">
                          {uniqueAuthors?.length > 3 ? (
                            <>
                              {uniqueAuthors.slice(0, 3).map(author => {
                                return (
                                  <Avatar
                                    key={author.did}
                                    {...author}
                                    className={clsx('z-50 h-6 w-6 rounded-full ring-2', {
                                      'ring-sky-50 ring-opacity-50 dark:ring-opacity-10': !isRead,
                                      'ring-white dark:ring-background': isRead,
                                    })}
                                    hoverCard
                                  />
                                )
                              })}

                              <div
                                className={clsx(
                                  'z-50 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-semibold tracking-tighter ring-2 dark:bg-zinc-800',
                                  {
                                    'ring-sky-50 ring-opacity-50 dark:ring-opacity-10': !isRead,
                                    'ring-white dark:ring-background': isRead,
                                  },
                                )}
                              >
                                +{uniqueAuthors.length - 3}
                              </div>
                            </>
                          ) : (
                            uniqueAuthors.map(author => {
                              return (
                                <Avatar
                                  key={author.did}
                                  {...author}
                                  className={clsx('z-50 h-6 w-6 rounded-full ring-2', {
                                    'ring-sky-50 ring-opacity-50 dark:ring-opacity-10': !isRead,
                                    'ring-white dark:ring-background': isRead,
                                  })}
                                  hoverCard
                                />
                              )
                            })
                          )}
                        </div>

                        <div className="flex space-x-1 truncate">
                          <div className="font-medium">
                            {uniqueAuthors
                              ? uniqueAuthors?.length > 3
                                ? `${uniqueAuthors
                                    .slice(0, 3)
                                    .map(user => user.displayName ?? user.handle)
                                    .join(', ')} and ${uniqueAuthors?.length - 3} more`
                                : new Intl.ListFormat().format(
                                    uniqueAuthors.map(user => user.displayName ?? user.handle),
                                  )
                              : null}
                          </div>

                          <div className="text-zinc-400">{getLabel(reason)}</div>
                        </div>
                      </div>

                      {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                      {/*@ts-ignore*/}
                      {notification.record.subject?.uri ? (
                        <div className="rounded-md">
                          {/*eslint-disable-next-line @typescript-eslint/ban-ts-comment*/}
                          {/*@ts-ignore*/}
                          <AsyncPost uri={notification.record.subject.uri} hideAuthor />
                        </div>
                      ) : null}

                      {['mention', 'reply', 'quote'].includes(notification.reason) ? (
                        <AsyncPost uri={notification.uri} hideAuthor />
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </>
          </InfiniteScroll>
        </div>
      </Page>
    </div>
  )
}
