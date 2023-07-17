import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { AppNotification } from 'iconoir-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import agent from '@/lib/agent'

async function getData(): Promise<{ count: number }> {
  const { data } = await (await agent()).countUnreadNotifications()

  return data
}

export default function Notifications(): JSX.Element {
  const { pathname } = useRouter()
  const { data } = useQuery(['notifications'], getData, {
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (data?.count === 0) {
      document.title = `Sunrise`
      return
    }

    document.title = `(${data?.count}) Sunrise`
  }, [data?.count])

  return (
    <Link
      href="/notifications"
      className={clsx(
        'relative flex items-center space-x-2 text-lg font-light',
        pathname === '/notifications'
          ? 'font-medium text-black dark:text-white'
          : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
      )}
    >
      <AppNotification className="h-5 w-5 stroke-2" />
      <div className="hidden grow lg:block">{t`Notifications`}</div>

      {Number(data?.count) > 0 ? (
        <div className="absolute -top-1 left-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-brand-500 px-1 py-0 text-[11px] font-medium text-white lg:relative lg:left-auto lg:top-auto lg:h-auto lg:max-h-[18px] lg:px-2 lg:py-px">
          {Number(data?.count) > 20 ? '20+' : data?.count}
        </div>
      ) : null}
    </Link>
  )
}
