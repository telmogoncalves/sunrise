import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { t } from '@lingui/macro'
import Link from 'next/link'

import { formatFollows } from '@/utils/follows'

export default function Connections({ handle, followsCount, followersCount }: ProfileView): JSX.Element {
  return (
    <div className="flex items-center space-x-4 text-sm">
      <Link title={`${followsCount} Following`} href={`/u/${handle}/following`} className="hover:underline">
        <span className="font-semibold dark:text-white">
          {isNaN(Number(followsCount)) ? '—' : formatFollows(Number(followsCount))}
        </span>{' '}
        <span className="text-zinc-400">{t`Following`}</span>
      </Link>

      <Link title={`${followersCount} Followers`} href={`/u/${handle}/followers`} className="hover:underline">
        <span className="font-semibold dark:text-white">
          {isNaN(Number(followersCount)) ? '—' : formatFollows(Number(followersCount))}
        </span>{' '}
        <span className="text-zinc-400">{t`Followers`}</span>
      </Link>
    </div>
  )
}
