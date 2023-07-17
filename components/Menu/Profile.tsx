import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { ProfileCircle } from 'iconoir-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { getProfile } from '@/api'
import useSession from '@/hooks/useSession'

import Avatar from '../Avatar'

export default function Profile(): JSX.Element {
  const { asPath } = useRouter()
  const { data: session } = useSession()
  const { data: profile, isLoading } = useQuery(['profile'], () => getProfile(session?.handle as string), {
    enabled: !!session?.handle,
  })

  return (
    <Link
      href={`/u/${session?.handle}`}
      className={clsx(
        'flex items-center space-x-2 text-lg font-light',
        asPath === `/u/${session?.handle}`
          ? 'font-medium text-black dark:text-white'
          : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
      )}
    >
      {isLoading ? (
        <ProfileCircle className="h-5 w-5 stroke-2" />
      ) : (
        <Avatar {...profile} className="-mt-0.5 h-[21px] w-[21px] rounded-full" />
      )}

      <div className="hidden lg:block">{t`Profile`}</div>
    </Link>
  )
}
