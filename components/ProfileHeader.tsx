import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { EyeOff, Prohibition, Settings } from 'iconoir-react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { getProfile } from '@/api'
import useSession from '@/hooks/useSession'

import Avatar from './Avatar'
import Connections from './Connections'
import EditProfile from './EditProfile'
import Follow from './Follow'
import Markup from './Markup'
import { Skeleton } from './ui/skeleton'
import UserActions from './UserActions'
import Username from './Username'

export default function ProfileHeader(): JSX.Element {
  const { asPath, query } = useRouter()
  const { data: profile, isLoading } = useQuery(['profile-header', query.handle], () => getProfile(`${query.handle}`), {
    refetchOnWindowFocus: true,
  })
  const { data: session } = useSession()

  if (isLoading)
    return (
      <div className="flex justify-between">
        <div className="flex items-center space-x-6">
          <Skeleton className="h-24 w-24 rounded-full" />

          <div className="space-y-8">
            <div className="space-y-1">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>

            <div className="flex space-x-6">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>
    )

  const isOwn = session?.handle === profile?.handle

  const profilePath = `/u/${profile?.handle}`
  const repliesPath = `${profilePath}/replies`
  const likesPath = `${profilePath}/likes`
  const mediaPath = `${profilePath}/media`
  const listsPath = `${profilePath}/lists`

  return (
    <div className="space-y-5">
      <div className="flex items-start space-x-8">
        <div className="w-28">
          <a href={profile?.avatar} target="_blank" rel="noreferrer">
            <Avatar {...profile} className="h-28 w-28 rounded-full" />
          </a>
        </div>

        <div className="flex-1 grow space-y-3 overflow-clip">
          <div className="space-y-4">
            <div className="flex w-full justify-between">
              <div className="flex items-end space-x-2">
                <Username {...(profile as ProfileView)} displayFollowedBy={!!profile?.viewer?.followedBy} blocks />
              </div>

              {profile && !isOwn ? (
                <div className="flex items-start space-x-2">
                  <Follow {...profile} />
                  <UserActions {...profile} />
                </div>
              ) : null}

              {isOwn ? (
                <div className="flex items-center space-x-2">
                  <EditProfile />
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="break-words">
              <Markup className="text-sm">{profile?.description as string}</Markup>
            </div>

            <Connections {...(profile as ProfileView)} />
          </div>
        </div>
      </div>

      {profile?.viewer?.muted ? (
        <div className="flex items-center space-x-1 text-xs text-zinc-400 dark:text-zinc-500">
          <EyeOff className="text-[10px]" />
          <div>
            @{profile?.handle} {t`is muted, you won't see any posts`}
          </div>
        </div>
      ) : null}

      {profile?.viewer?.blocking ? (
        <div className="flex items-center space-x-1 text-xs text-zinc-400 dark:text-zinc-500">
          <Prohibition className="text-[10px]" />
          <div>
            @{profile?.handle} {t`is blocked, they'll not be able to see your posts`}
          </div>
        </div>
      ) : null}

      <div className="pt-6">
        <div className="flex w-full items-center space-x-2 rounded-md border p-1">
          <Link
            href={profilePath}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': profilePath === asPath,
            })}
          >
            {t`Skeets`}
          </Link>

          <Link
            href={repliesPath}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': repliesPath === asPath,
            })}
          >
            {t`Replies`}
          </Link>

          <Link
            href={likesPath}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': likesPath === asPath,
            })}
          >
            {t`Likes`}
          </Link>

          <Link
            href={mediaPath}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': mediaPath === asPath,
            })}
          >
            {t`Media`}
          </Link>

          <Link
            href={listsPath}
            className={clsx('flex-1 rounded-md px-3 py-1.5 text-center text-sm', {
              'bg-slate-100 dark:bg-slate-800': listsPath === asPath,
            })}
          >
            {t`Lists`}
          </Link>
        </div>
      </div>
    </div>
  )
}
