import { AtpSessionData } from '@atproto/api'
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { t } from '@lingui/macro'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import useSession from '@/hooks/useSession'
import agent from '@/lib/agent'

import Avatar from './Avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import Username from './Username'

export default function LoggedInAccounts(): JSX.Element {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<{ data: ProfileView; session: AtpSessionData }[] | undefined>([])

  useEffect(() => {
    async function run(): Promise<void> {
      const accs = await Promise.all(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        JSON.parse(localStorage.getItem('loggedInAccounts')).map(async (session: AtpSessionData) => {
          const { data } = await (await agent()).getProfile({ actor: `${session.handle}` })

          return { data, session }
        }),
      )

      setAccounts(accs)
    }
    run()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6 rounded-lg border py-6">
      <div className="flex items-center space-x-2 px-6">
        <Users className="h-5 w-5" />
        <div className="font-medium">{t`Logged in accounts`}</div>
      </div>

      <div className="space-y-2">
        {accounts?.length ? (
          accounts?.map(acc => {
            return (
              <button
                onClick={() => {
                  localStorage.setItem('sessionData', JSON.stringify(acc.session))
                  window.location.reload()
                }}
                className="w-full px-6 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                key={acc.data.did}
              >
                <div className="flex items-center">
                  <div className="flex grow items-center space-x-3">
                    <Avatar {...acc.data} className="h-10 w-10 rounded-full" />
                    <Username {...acc.data} disableCta disableHoverCard />
                  </div>

                  {session?.did === acc.data.did ? <Badge variant="outline">{t`Logged in`}</Badge> : null}
                </div>
              </button>
            )
          })
        ) : (
          <div className="space-y-2 px-6">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-full rounded-md" />
          </div>
        )}

        <div className="px-6">
          <Link href="/auth/login">
            <Button variant="secondary" className="w-full text-center">
              Add an account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
