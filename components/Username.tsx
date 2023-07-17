import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import clsx from 'clsx'
import { useRouter } from 'next/router'

import { verifiedDids } from '@/constants/Verified'

import FollowsYou from './FollowsYou'
import ProfileCard from './ProfileCard'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'
import Verified from './Verified'

type Props = ProfileView & {
  blocks?: boolean
  hideHandle?: boolean
  displayFollowedBy?: boolean
  disableHoverCard?: boolean
  disableCta?: boolean
}

export default function Username({
  did,
  handle,
  displayName,
  blocks,
  hideHandle = false,
  displayFollowedBy,
  disableHoverCard,
  disableCta,
}: Props): JSX.Element {
  const { push } = useRouter()
  // For testing purposes for now.
  const isVerified = verifiedDids.includes(did) || handle?.includes('.bsky.team')

  if (!handle) return <div className="text-sm font-medium">User not found</div>

  function Button(): JSX.Element {
    return (
      <button
        {...(!disableCta
          ? {
              onClick: e => {
                e.stopPropagation()
                push(`/u/${handle}`)
              },
            }
          : null)}
        className={clsx('not-prose group', {
          'flex items-center space-x-2': !blocks,
        })}
      >
        {displayName ? (
          <div
            className={clsx('flex items-center space-x-1 truncate font-semibold dark:text-white', {
              'group-hover:underline': !blocks && !disableCta,
              'text-lg': blocks,
            })}
          >
            <div>{displayName}</div>
            {isVerified ? <Verified className="h-[14px] w-[14px] text-brand-500 dark:text-white" /> : null}
          </div>
        ) : null}

        {hideHandle ? null : (
          <div className="flex items-center space-x-2">
            <div className="truncate text-sm text-zinc-400">@{handle}</div>
            {displayFollowedBy ? (
              <div>
                <FollowsYou />
              </div>
            ) : null}
          </div>
        )}
      </button>
    )
  }

  if (blocks || disableHoverCard) return <Button />

  return (
    <HoverCard>
      <HoverCardTrigger className="cursor-pointer">
        <Button />
      </HoverCardTrigger>

      <HoverCardContent className="w-[420px]">
        <ProfileCard handle={handle} />
      </HoverCardContent>
    </HoverCard>
  )
}
