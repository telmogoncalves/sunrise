/* eslint-disable @typescript-eslint/ban-ts-comment */
import { FeedViewPost } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { t } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import clsx from 'clsx'
import { ChatBubbleEmpty } from 'iconoir-react'
import { Repeat } from 'lucide-react'
import millify from 'millify'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import TextTransition, { presets } from 'react-text-transition'

import agent from '@/lib/agent'

import Compose from './Compose'
import { PostContainer } from './Post'
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from './ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { toast } from './ui/use-toast'

export default function Repost(item: FeedViewPost): JSX.Element {
  const { post } = item
  const { uri, cid, repostCount, viewer } = post
  const hasRepost = !!viewer?.repost
  const queryClient = useQueryClient()
  const { asPath } = useRouter()
  const [reskeetOpened, setReskeetOpened] = useState(false)
  const [mounted, setMounted] = useState(false)

  const arr = millify(Number(repostCount)).split('')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <></>

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-end">
          <div
            className={clsx(
              '-mx-1 flex items-center space-x-1.5 p-1 text-left leading-none transition-all hover:text-green-500',
              {
                'text-green-500': hasRepost,
              },
            )}
          >
            <Repeat
              className={clsx('h-[15px] w-[15px] stroke-2', {
                'fill-green-500 text-green-500': hasRepost,
              })}
            />

            <div className="flex items-center">
              {arr.map((n, index) => {
                return (
                  <TextTransition
                    key={`reposts--${item.cid}--${index}`}
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
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="top" className="w-32">
          <DropdownMenuItem
            className="w-full cursor-pointer space-x-2"
            onClick={async e => {
              e.stopPropagation()
              e.preventDefault()

              if (hasRepost && viewer.repost) {
                await (await agent()).deleteRepost(viewer.repost)
              } else {
                await (await agent()).repost(uri, cid)
              }
              await queryClient.refetchQueries([asPath])
            }}
          >
            <Repeat className="h-4 w-4" />
            <div>{t`Reskeet`}</div>
          </DropdownMenuItem>

          <Dialog open={reskeetOpened} onOpenChange={setReskeetOpened}>
            <DialogTrigger
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
              }}
              className="w-full"
            >
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation()
                  e.preventDefault()
                  setReskeetOpened(true)
                }}
                className="w-full cursor-pointer space-x-2"
              >
                <ChatBubbleEmpty className="h-4 w-4 stroke-2" />
                <div>{t`Quote`}</div>
              </DropdownMenuItem>
            </DialogTrigger>

            <DialogContent
              onClick={e => {
                e.stopPropagation()
                e.preventDefault()
              }}
              className="w-2/5 !max-w-none space-y-4"
            >
              <DialogDescription className="space-y-4 text-sm">
                <div>
                  <div className="py-2 text-lg font-semibold">{t`Reskeet`}</div>
                  <Compose
                    embedRecord={item.post}
                    onDone={() => {
                      setReskeetOpened(false)
                      toast({
                        title: t`Reskeet`,
                        description: t`Successfully reskeeted`,
                      })
                    }}
                  />
                </div>

                <div className="rounded-lg border p-3">
                  {/* @ts-ignore */}
                  <PostContainer {...item} highlight={false} hideActions />
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
