/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AppBskyFeedDefs, Facet } from '@atproto/api'
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { FeedViewPost, PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { ReplyRef } from '@atproto/api/dist/client/types/app/bsky/feed/post'
import { t } from '@lingui/macro'
import clsx from 'clsx'
import { format, formatDistanceToNow } from 'date-fns'
import { direction } from 'direction'
import { ChatBubbleEmpty } from 'iconoir-react'
import { Repeat } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { getPost } from '@/api'
import useSession from '@/hooks/useSession'
import { getEmbed } from '@/utils/getEmbed'
import { getPostUrl } from '@/utils/post'

import Avatar from './Avatar'
import Compose from './Compose'
import Like from './Like'
import Markup from './Markup'
import PostActions from './PostActions'
import Reply from './Reply'
import Repost from './Repost'
import Share from './Share'
import { Skeleton } from './ui/skeleton'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import Username from './Username'

export type Props = FeedViewPost & {
  reason?: {
    by?: ProfileView
  }
  post: PostView & {
    record?: {
      text: string
      facets: Facet[]
    }
  }
  reply?: {
    parent?: {
      record?: {
        reply: ReplyRef
      }
    }
  }
  highlight?: boolean
  hideActions?: boolean
  hideImages?: boolean
  hideAuthor?: boolean
}

export default function Post({ ...item }: Props): JSX.Element {
  const { push } = useRouter()
  const [parentReply, setParentReply] = useState<PostView | null>()

  useEffect(() => {
    if (parentReply) return
    if (!item?.reply?.parent?.record?.reply) return

    async function get(): Promise<void> {
      const data = await getPost(`${item.reply?.parent.record?.reply.parent.uri}`)

      setParentReply(data)
    }

    get()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  if (!item) return <div>Something sent wrong</div>

  const { uri, author } = item.post
  const hasReply = !!item.reply
  const isRepost = item.reason?.$type === 'app.bsky.feed.defs#reasonRepost' && !!item.reason?.by
  const hasParentReply = !!item?.reply?.parent?.record?.reply

  const parentData = {
    ...(parentReply ? { reply: { parent: parentReply } } : hasParentReply ? { reply: {} } : null),
    post: item?.reply?.parent as PostView,
  }

  return (
    <div className="relative space-y-8">
      <div className="z-50">
        {hasReply && !isRepost && parentData ? (
          <div className="relative pb-6">
            <div className="absolute left-6 top-0 -z-10 h-full border-l-2" />
            <button
              onClick={e => {
                e.stopPropagation()
                push(getPostUrl(parentData.post.author, parentData.post.uri))
              }}
              className="relative w-full space-y-8 text-left"
            >
              {/*@ts-ignore*/}
              <PostContainer {...parentData} />
            </button>
          </div>
        ) : null}

        <div>
          <button
            onClick={e => {
              e.stopPropagation()
              push(getPostUrl(author, uri))
            }}
            className="relative w-full space-y-8 outline-none"
          >
            <PostContainer {...item} />
          </button>
        </div>
      </div>
    </div>
  )
}

export function PostContainer(item: Props): JSX.Element {
  const { push } = useRouter()
  const { post, reason, reply, highlight, hideActions, hideImages } = item
  const { author, record, embed } = post
  const { data: session } = useSession()
  const isOwner = session?.did === author.did
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [text, setText] = useState<string | undefined>()
  const isRepost = AppBskyFeedDefs.isReasonRepost(reason)
  const hasReply = !!reply
  const hideAuthor = item.hideAuthor

  const replyRef = {
    uri: post.uri,
    cid: post.cid,
  }

  useEffect(() => {
    setText(record.text)

    record?.facets?.map(facet => {
      facet?.features?.map(feature => {
        if (record.text === feature.uri) {
          setText(record.text.replace(`${feature.uri}`, ''))
        }
      })
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.text])

  return (
    <>
      <div className="space-y-8">
        {isRepost ? (
          <div className="-mb-6 flex space-x-6">
            <div className="w-12" />

            <div className="flex items-center space-x-2 text-sm text-zinc-500">
              <Repeat className="h-4 w-4 text-green-500" />
              <div className="whitespace-nowrap">
                {t`Reskeet'd by`}{' '}
                <Link onClick={e => e.stopPropagation()} className="hover:underline" href={`/u/${reason?.by?.handle}`}>
                  {reason?.by?.displayName}
                </Link>
              </div>
            </div>
          </div>
        ) : null}

        <div className="relative flex items-start space-x-6">
          {hideAuthor ? null : (
            <div className="w-12">
              <button
                onClick={e => {
                  e.stopPropagation()
                  push(`/u/${author.handle}`)
                }}
              >
                <Avatar {...author} className="h-12 w-12 rounded-full" hoverCard />
              </button>
            </div>
          )}

          <div className="flex-1 grow overflow-hidden whitespace-normal">
            {hideAuthor ? null : (
              <>
                <div className="flex items-center space-x-6 leading-none">
                  <div className="grow">
                    <Username {...author} />
                  </div>

                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="text-xs text-zinc-400">
                            {post.indexedAt ? formatDistanceToNow(new Date(post.indexedAt)) : null}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-xs">{format(new Date(post.indexedAt), 'dd MMM yyyy ∙ HH:mm')}</div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {isOwner ? (
                      <div className="mt-[3px]">
                        <PostActions {...post} />
                      </div>
                    ) : null}
                  </div>
                </div>

                {hasReply ? (
                  <div className="flex items-center space-x-1 py-1 text-xs text-zinc-400">
                    <ChatBubbleEmpty className="-mt-px h-3 w-3 stroke-2" />
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        push(getPostUrl(reply?.parent?.author as ProfileView, reply?.parent?.uri as string))
                      }}
                      className="flex items-center space-x-1 hover:underline"
                    >
                      <div>{t`Replying to`}</div>{' '}
                      {reply?.parent ? (
                        // @ts-ignore
                        <div>{reply?.parent?.author?.displayName || reply?.parent?.author?.handle}</div>
                      ) : (
                        <Skeleton className="mt-px h-3 w-24 rounded-md" />
                      )}
                    </button>
                  </div>
                ) : null}
              </>
            )}

            <div>
              <div
                className={clsx('space-y-1', {
                  'text-right': text && direction(text) === 'rtl',
                })}
              >
                <Markup className={`break-words ${highlight ? 'mt-2 text-lg' : hideAuthor ? 'text-sm' : ''}`}>
                  {text as string}
                </Markup>

                {!embed ? (
                  <>
                    {record?.facets?.map((facet, index) => {
                      return facet?.features?.map(feature => {
                        return (
                          <div className="my-3 h-full" key={`${post.uri}--${index}`}>
                            {getEmbed(feature, post)}
                          </div>
                        )
                      })
                    })}
                  </>
                ) : null}

                {/*@ts-ignore*/}
                {getEmbed(record.embed, post)}
                {hideImages && embed?.$type === 'app.bsky.embed.images#view' ? null : getEmbed(embed, post)}
              </div>

              {hideActions ? null : (
                <div className="flex items-center space-x-4 pt-1">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setShowReplyForm(!showReplyForm)
                    }}
                    className="min-w-[50px]"
                  >
                    <Reply {...post} />
                  </button>

                  <div className="min-w-[50px]">
                    <Repost {...item} />
                  </div>

                  <div className="min-w-[50px]">
                    <Like {...post} />
                  </div>

                  <div className="mt-px min-w-[50px]">{post.uri ? <Share {...post} /> : null}</div>
                </div>
              )}

              {showReplyForm ? (
                <div className="px-1 pt-2">
                  <button
                    className="w-full"
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    <Compose onDone={() => setShowReplyForm(false)} reply={{ root: replyRef, parent: replyRef }} />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
