/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AppBskyEmbedRecord } from '@atproto/api'
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { format, formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

import { getEmbed } from '@/utils/getEmbed'
import { getPostId } from '@/utils/post'

import Avatar from '../Avatar'
import Markup from '../Markup'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import Username from '../Username'

export default function Record({ record }: AppBskyEmbedRecord.Main): JSX.Element {
  const { uri, value, embed, embeds } = record
  const author = record.author as ProfileView
  const postId = getPostId(uri)

  if (!author) return <></>

  return (
    <div className="pt-2">
      <Link
        onClick={e => {
          e.stopPropagation()
        }}
        href={`/u/${author.handle}/skeet/${postId}`}
        className="relative block w-full items-start space-y-2 rounded-md border p-4"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8">
            <Link href={`/u/${author.handle}`}>
              <Avatar {...author} className="h-8 w-8 rounded-full" hoverCard />
            </Link>
          </div>

          <div className="flex-1 grow overflow-hidden whitespace-normal">
            <div className="flex items-center justify-between space-x-3">
              <Username {...author} />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="whitespace-nowrap text-xs text-zinc-400">
                      {/*@ts-ignore*/}
                      {value?.createdAt ? formatDistanceToNow(new Date(value.createdAt)) : null}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {/*@ts-ignore*/}
                    <div className="text-xs">{format(new Date(value.createdAt), 'dd MMM yyyy ∙ HH:mm')}</div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm">
            {/* @ts-ignore */}
            <Markup>{value.text as string}</Markup>
          </div>

          {/*@ts-ignore*/}
          {embed && embed.$type !== 'app.bsky.embed.record#view'
            ? getEmbed(embed, record as PostView)
            : // @ts-ignore
            embeds?.length > 0
            ? // @ts-ignore
              embeds.map(e => {
                if (e.$type === 'app.bsky.embed.record#view') return

                return getEmbed(e, record as PostView)
              })
            : null}
        </div>
      </Link>
    </div>
  )
}
