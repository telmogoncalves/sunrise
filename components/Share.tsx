import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { t } from '@lingui/macro'
import { ShareIos } from 'iconoir-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import { getPostId } from '@/utils/post'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { toast } from './ui/use-toast'

export default function Share(post: PostView): JSX.Element {
  const bskyUrl = 'https://bsky.app'
  const handle = post.author.handle
  const postId = getPostId(post.uri)

  const shareUrl = `${bskyUrl}/profile/${handle}/post/${postId}`

  return (
    <TooltipProvider delayDuration={2000}>
      <Tooltip>
        <TooltipTrigger>
          <CopyToClipboard
            text={shareUrl}
            onCopy={() => {
              toast({
                title: t`Success`,
                description: t`URL copied to clipboard`,
              })
            }}
          >
            <button
              onClick={e => {
                e.stopPropagation()
              }}
              className="-mx-1 flex items-center space-x-1.5 p-1 text-left leading-none transition-all hover:text-green-500"
            >
              <ShareIos className="h-[15px] w-[15px] stroke-2" />
            </button>
          </CopyToClipboard>
        </TooltipTrigger>

        <TooltipContent>
          <div className="text-xs">{t`A bsky.app URL will be copied in order to embed the post`}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
