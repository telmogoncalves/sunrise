import { useRouter } from 'next/router'

import ProfileCard from '../ProfileCard'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Mention({ href, title = href }: any): JSX.Element | null {
  const handle = title?.slice(1)
  const { push } = useRouter()

  if (!handle) {
    return null
  }

  return (
    <HoverCard>
      <HoverCardTrigger
        onClick={e => {
          e.stopPropagation()
          push(`/u/${handle}`)
        }}
        className="not-prose cursor-pointer text-brand-500 no-underline hover:underline dark:text-brand-500"
      >
        @{handle}
      </HoverCardTrigger>

      <HoverCardContent className="not-prose w-[420px]">
        <ProfileCard handle={handle} />
      </HoverCardContent>
    </HoverCard>
  )
}
