/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getPostThread'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { ChatBubbleEmpty } from 'iconoir-react'
import { useRouter } from 'next/router'

import Compose from '@/components/Compose'
import LikesModal from '@/components/LikesModal'
import Post from '@/components/Post'
import PostSkeleton from '@/components/PostSkeleton'
import RepostsModal from '@/components/RepostsModal'
import { Skeleton } from '@/components/ui/skeleton'
import agent from '@/lib/agent'

async function getData(handle: string, id: string): Promise<OutputSchema> {
  const { data: profile } = await (await agent()).getProfile({ actor: `${handle}` })
  const uri = `at://${profile.did}/app.bsky.feed.post/${id}`
  const { data } = await (await agent()).getPostThread({ uri })

  return data
}

export default function Thread(): JSX.Element {
  const { query, asPath } = useRouter()
  const { data, isLoading } = useQuery([asPath], () => getData(query?.handle as string, query?.id as string), {
    refetchInterval: 10000,
  })

  if (isLoading)
    return (
      <div className="space-y-4 px-12 py-8">
        <div className="text-lg font-semibold">{t`Thread`}</div>

        <div className="rounded-lg border p-6">
          <div className="flex space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />

            <div className="space-y-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-48 rounded-md" />
                <Skeleton className="h-6 w-96 rounded-md" />
              </div>

              <div className="flex space-x-6">
                <Skeleton className="h-3 w-8 rounded-md" />
                <Skeleton className="h-3 w-8 rounded-md" />
                <Skeleton className="h-3 w-8 rounded-md" />
              </div>
            </div>
          </div>

          <hr className="-mx-6 my-8" />

          <div className="space-y-16">
            <PostSkeleton bordered={false} />
            <PostSkeleton bordered={false} />
          </div>
        </div>
      </div>
    )

  const replyRef = {
    // @ts-ignore
    uri: data?.thread?.post?.uri,
    // @ts-ignore
    cid: data?.thread?.post?.cid,
  }

  // @ts-ignore
  const hasParent = data?.thread?.parent && !data.thread.parent.notFound
  // @ts-ignore
  const parent = data?.thread?.parent?.post
  // @ts-ignore
  const parentReply = data?.thread?.parent?.parent?.post
  const post = data?.thread?.post

  return (
    <div className="space-y-4 px-12 py-8">
      <div className="text-lg font-semibold">{t`Thread`}</div>

      <div className="rounded-lg border pb-8">
        {hasParent ? (
          <div className="border-b p-8">
            {/*@ts-ignore*/}
            <Post
              {...({
                post: parent,
                ...(parentReply ? { reply: { parent: parentReply } } : null),
              } as FeedViewPost)}
            />
          </div>
        ) : null}

        <div className="space-y-8 p-8">
          <div>
            {parent ? (
              <div className="mb-1 flex space-x-4">
                <div className="w-14" />

                <div className="flex items-center space-x-1 text-xs text-zinc-500">
                  <ChatBubbleEmpty className="h-3 w-3 stroke-2 text-zinc-500" />
                  <div>Replying to @{parent?.author?.handle}</div>
                </div>
              </div>
            ) : null}

            {/*@ts-ignore*/}
            <Post {...{ post }} highlight />
          </div>

          <div className="-mx-8 space-x-8 border-b border-t px-10 py-3 text-sm">
            {/*@ts-ignore*/}
            <RepostsModal reposts={post?.repostCount ?? 0} uri={post?.uri} />

            {/*@ts-ignore*/}
            <LikesModal likes={post?.likeCount ?? 0} uri={post?.uri} />
          </div>

          <div>
            <Compose reply={{ root: replyRef, parent: replyRef }} />
          </div>
        </div>

        {/* @ts-ignore */}
        {data?.thread?.replies?.length ? (
          <div className="border-t">
            {/* @ts-ignore */}
            {data?.thread.replies.map(reply => (
              <div key={reply.id} className="border-b px-8 py-6 last:border-none">
                <div className="mb-1 flex space-x-4">
                  <div className="w-14" />

                  <div className="flex items-center space-x-1 text-xs text-zinc-500">
                    <ChatBubbleEmpty className="h-3 w-3 stroke-2 text-zinc-500" />
                    {/* @ts-ignore */}
                    <div>Replying to @{post?.author?.handle}</div>
                  </div>
                </div>
                <Post {...{ post: reply.post }} isReply />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
