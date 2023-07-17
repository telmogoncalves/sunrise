/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { Heart } from 'lucide-react'
import millify from 'millify'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import TextTransition, { presets } from 'react-text-transition'
import { v4 } from 'uuid'

import agent from '@/lib/agent'

export default function Like({ uri, cid, likeCount, viewer }: PostView): JSX.Element {
  const hasLiked = !!viewer?.like
  const queryClient = useQueryClient()
  const { pathname, asPath } = useRouter()
  const [mounted, setMounted] = useState(false)

  const { mutate, isLoading } = useMutation({
    mutationFn: async function () {
      if (hasLiked && viewer.like) {
        await (await agent()).deleteLike(viewer.like)
      } else {
        await (await agent()).like(uri, cid)
      }
    },
    onMutate: async function () {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [asPath] })

      // Snapshot the previous value
      const previous = queryClient.getQueryData([asPath])

      const queryKey = pathname === '/u/[handle]' ? [asPath, 'posts'] : [asPath]

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, data => {
        // @ts-ignore
        return optimisticLike(data, hasLiked, cid)
      })

      // Return a context object with the snapshotted value
      return { previous }
    },
    onSuccess: async function () {
      await queryClient.refetchQueries([asPath])
    },
    onSettled: function () {
      queryClient.invalidateQueries({ queryKey: [asPath] })
    },
  })

  const arr = millify(Number(likeCount)).split('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <></>

  return (
    <div>
      <button
        onClick={async e => {
          e.stopPropagation()
          e.preventDefault()

          mutate()
        }}
        disabled={isLoading}
        className={clsx(
          '-mx-1 flex items-center space-x-1.5 p-1 text-left leading-none transition-all hover:text-red-500',
          {
            'text-red-500': hasLiked,
          },
        )}
      >
        <Heart
          className={clsx('h-[15px] w-[15px] stroke-2', {
            'fill-red-500 text-red-500': hasLiked,
          })}
        />

        <div className="mt-px flex items-center">
          {arr.map((n, index) => {
            return (
              <TextTransition
                key={`likes--${cid}--${index}`}
                style={{ fontSize: 13 }}
                className="font-medium"
                springConfig={presets.stiff}
                inline
              >
                {n}
              </TextTransition>
            )
          })}
        </div>
      </button>
    </div>
  )
}

function optimisticLike(
  data: { pages: { feed: PostView[] }[] },
  hasLiked: boolean,
  cid: string,
): { pages: { feed: PostView[] }[] } {
  return {
    ...data,
    pages: data.pages?.map(group => {
      return {
        feed: group.feed?.map(f => {
          // @ts-ignore
          if (f.post.cid === cid) {
            return {
              ...f,
              post: {
                // @ts-ignore
                ...f.post,
                // @ts-ignore
                likeCount: hasLiked ? Number(f.post.likeCount) - 1 : Number(f.post.likeCount) + 1,
                viewer: {
                  like: hasLiked ? undefined : v4(),
                },
              },
            }
          }

          return f
        }),
      }
    }),
  }
}
