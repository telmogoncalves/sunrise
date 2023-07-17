import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { t } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import { CheckCircle, EyeAlt, EyeOff, MoreHoriz, Prohibition } from 'iconoir-react'

import useSession from '@/hooks/useSession'
import agent from '@/lib/agent'

import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { useToast } from './ui/use-toast'

export default function UserActions({ did, handle, viewer }: ProfileView): JSX.Element {
  const { data: session } = useSession()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isMuted = viewer?.muted
  const isBlocked = viewer?.blocking

  async function triggerMute(): Promise<void> {
    if (viewer?.muted) {
      await (await agent()).unmute(did)
    } else {
      await (await agent()).mute(did)
    }

    await queryClient.refetchQueries(['profile-header'])

    toast({
      title: viewer?.muted ? t`Unmute` : t`Mute`,
      description: viewer?.muted ? t`Successfully unmuted @${handle}` : t`Successfully muted @${handle}`,
    })
  }

  async function triggerBlock(): Promise<void> {
    if (isBlocked) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const rkey = viewer.blocking.split('/').slice(-1)[0]

      await (
        await agent()
      ).api.app.bsky.graph.block.delete(
        { rkey: rkey, repo: session?.did },
        { createdAt: new Date().toISOString(), subject: did },
      )
    } else {
      await (
        await agent()
      ).api.app.bsky.graph.block.create({ repo: session?.did }, { createdAt: new Date().toISOString(), subject: did })
    }

    await queryClient.refetchQueries(['profile-header'])

    toast({
      title: viewer?.muted ? t`Unblock` : t`Block`,
      description: isBlocked ? t`Successfully unblocked @${handle}` : t`Successfully blocked @${handle}`,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="secondary" size="sm" className="flex h-auto items-center space-x-1 px-2.5 py-[5.5px]">
          <MoreHoriz className="stroke-2 text-xs" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="cursor-pointer" onClick={triggerMute}>
          <div className="flex items-center space-x-2">
            <div>{isMuted ? <EyeAlt className="h-4 w-4 stroke-2" /> : <EyeOff className="h-4 w-4 stroke-2" />}</div>
            <div>{isMuted ? t`Unmute` : t`Mute`}</div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer" onClick={triggerBlock}>
          <div className="flex items-center space-x-2">
            <div>
              {isBlocked ? <CheckCircle className="h-4 w-4 stroke-2" /> : <Prohibition className="h-4 w-4 stroke-2" />}
            </div>
            <div>{isBlocked ? t`Unblock` : t`Block`}</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
