import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import BoringAvatar from 'boring-avatars'

import ProfileCard from './ProfileCard'
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card'

type Props = Partial<ProfileView> & {
  className?: string
  hoverCard?: boolean
}

export default function Avatar({ hoverCard, ...rest }: Props): JSX.Element {
  if (hoverCard && rest.handle) {
    return (
      <HoverCard>
        <HoverCardTrigger className="cursor-pointer">
          <Trigger {...rest} />
        </HoverCardTrigger>
        <HoverCardContent className="w-[420px]">
          <ProfileCard handle={rest.handle} />
        </HoverCardContent>
      </HoverCard>
    )
  }

  return <Trigger {...rest} />
}

function Trigger({ avatar, handle, displayName, className }: Props): JSX.Element {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt={displayName} className={className} />
    )
  }

  return (
    <div className={className}>
      <BoringAvatar
        size="100%"
        name={displayName ?? handle}
        variant="beam"
        colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
      />
    </div>
  )
}
