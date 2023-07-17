import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { t } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'

import agent from '@/lib/agent'

import { Button } from './ui/button'

export default function Follow({ did, viewer }: ProfileView): JSX.Element {
  const isFollowing = !!viewer?.following
  const queryClient = useQueryClient()

  return (
    <div>
      <Button
        size="sm"
        variant={isFollowing ? 'secondary' : 'default'}
        onClick={async e => {
          e.stopPropagation()
          e.preventDefault()

          if (isFollowing && viewer?.following) {
            await (await agent()).deleteFollow(viewer.following)
          } else {
            await (await agent()).follow(did)
          }
          await queryClient.refetchQueries()
        }}
        className="group flex h-auto items-center space-x-1 px-2.5 py-1.5 text-left text-xs"
      >
        <div>{isFollowing ? t`Unfollow` : t`Follow`}</div>
      </Button>
    </div>
  )
}
