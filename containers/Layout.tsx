import { AppBskyFeedDefs } from '@atproto/api'
import { t } from '@lingui/macro'
import va from '@vercel/analytics'
import clsx from 'clsx'
import { BrightStar, Computer, FireFlame, HalfMoon, HomeSimple, Search, Settings, Star, SunLight } from 'iconoir-react'
import { LogOutIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useLocalStorage } from 'usehooks-ts'

import GlobalCompose from '@/components/GlobalCompose'
import Logo from '@/components/Logo'
import Notifications from '@/components/Menu/Notifications'
import Profile from '@/components/Menu/Profile'
import Spotlight from '@/components/Spotlight'
import { Badge } from '@/components/ui/badge'
import useSession from '@/hooks/useSession'

export default function Layout({ children }: PropsWithChildren): JSX.Element {
  const { pathname } = useRouter()
  const isAuthPath = pathname === '/auth/login'

  return (
    <div className={clsx('mx-auto flex', isAuthPath ? '' : 'max-w-5xl')}>
      {isAuthPath ? null : (
        <>
          <Menu />
          <MobileMenu />
          <Spotlight />
          <GlobalCompose />
        </>
      )}
      <div className="flex-1 grow overflow-auto">{children}</div>
    </div>
  )
}

function Menu(): JSX.Element {
  const { asPath, pathname, push } = useRouter()
  const { data: session } = useSession()
  const [feeds] = useLocalStorage<AppBskyFeedDefs.GeneratorView[]>('FEEDS', [])

  function logout(): void {
    localStorage.removeItem('sessionData')
    push('/auth/login')
  }

  const [mounted, setMounted] = useState(false)
  const { setTheme, systemTheme, theme } = useTheme()

  function toggleTheme(): void {
    const picks: { [key: string]: string } = {
      dark: 'light',
      light: 'system',
      system: systemTheme === 'light' ? 'dark' : 'light',
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTheme(picks[theme])
  }

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!session) return

    va.track('Logged in', { handle: session.handle })
  }, [session])

  return (
    <div className="sticky top-0 hidden h-screen w-[220px] flex-col space-y-12 py-7 lg:flex">
      <div>
        <Link href="/">
          <Logo className="h-7 w-7 text-brand-500" />
        </Link>
      </div>

      <div className="flex grow overflow-auto">
        <div className="flex w-full flex-col space-y-7">
          <div>
            <Link
              href="/"
              className={clsx(
                'flex items-center space-x-2 text-lg font-light',
                pathname === '/'
                  ? 'font-medium text-black dark:text-white'
                  : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
              )}
            >
              <HomeSimple className="h-5 w-5 stroke-2" />
              <div>{t`Home`}</div>
            </Link>
          </div>

          <div>
            <Link
              href="/hot"
              className={clsx(
                'flex items-center space-x-2 text-lg font-light',
                pathname === '/hot'
                  ? 'font-medium text-black dark:text-white'
                  : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
              )}
            >
              <FireFlame className="h-5 w-5 stroke-2" />
              <div>{t`What's Hot`}</div>
            </Link>
          </div>

          {feeds?.map(feed => {
            const feedName = feed.uri.split('/').at(-1)
            const path = `/u/${feed.creator.handle}/feed/${feedName}`

            return (
              <div key={feed.cid}>
                <Link
                  href={path}
                  className={clsx(
                    'flex items-center space-x-2 text-lg font-light',
                    asPath === path
                      ? 'font-medium text-black dark:text-white'
                      : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
                  )}
                >
                  <BrightStar className="h-5 w-5 stroke-2" />
                  <div className="truncate">{feed.displayName}</div>
                </Link>
              </div>
            )
          })}

          <div>
            <Notifications />
          </div>

          {/* <div>
            <Link
              href="/spaces"
              className={clsx(
                'flex items-center space-x-2 text-lg font-light',
                pathname === '/spaces'
                  ? 'font-medium text-black dark:text-white'
                  : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
              )}
            >
              <Mic className="h-5 w-5 stroke-2" />
              <div>{t`Spaces`}</div>
            </Link>
          </div> */}

          <div>
            <Link
              href="/search"
              className={clsx(
                'flex items-center space-x-2 text-lg font-light',
                pathname === '/search'
                  ? 'font-medium text-black dark:text-white'
                  : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
              )}
            >
              <Search className="h-5 w-5 stroke-2" />
              <div>{t`Search`}</div>
            </Link>
          </div>

          <div>
            <Profile />
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <Link
          href="/feeds/popular"
          className={clsx(
            'flex items-center space-x-2 text-sm',
            pathname === '/feeds/popular'
              ? 'font-medium text-black dark:text-white'
              : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
          )}
        >
          <BrightStar className="h-4 w-4 stroke-2" />
          <div className="grow">{t`Popular Feeds`}</div>
          <div>
            <Badge>New</Badge>
          </div>
        </Link>

        <Link
          href="/settings"
          className={clsx(
            'flex items-center space-x-2 text-sm',
            pathname === '/settings'
              ? 'font-medium text-black dark:text-white'
              : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
          )}
        >
          <Settings className="h-4 w-4 stroke-2" />
          <div>{t`Settings`}</div>
        </Link>

        {mounted ? (
          <button
            onClick={toggleTheme}
            className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
          >
            {theme === 'light' ? (
              <SunLight className="h-4 w-4 stroke-2" />
            ) : theme === 'dark' ? (
              <HalfMoon className="h-4 w-4 stroke-2" />
            ) : theme === 'system' ? (
              <Computer className="h-4 w-4 stroke-2" />
            ) : null}
            <div>
              {theme === 'light'
                ? t`Light theme`
                : theme === 'dark'
                ? t`Dark theme`
                : theme === 'system'
                ? t`System theme`
                : null}
            </div>
          </button>
        ) : null}

        <a
          href="mailto:telmo@hey.com"
          className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
        >
          <Star className="h-4 w-4 stroke-2" />
          <div>{t`Send feedback`}</div>
        </a>

        <button
          onClick={logout}
          className="flex items-center space-x-1.5 text-sm text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white"
        >
          <LogOutIcon className="ml-0.5 h-4 w-4" />
          <div>{t`Logout`}</div>
        </button>
      </div>
    </div>
  )
}

function MobileMenu(): JSX.Element {
  const { pathname } = useRouter()

  return (
    <div className="fixed bottom-0 z-50 w-full border-t bg-white p-4 dark:bg-background lg:hidden">
      <div className="flex w-full">
        <div className="flex-1">
          <Link
            href="/"
            className={clsx(
              'flex items-center justify-center',
              pathname === '/'
                ? 'font-medium text-black dark:text-white'
                : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
            )}
          >
            <HomeSimple className="h-5 w-5 stroke-2" />
          </Link>
        </div>

        <div className="flex-1">
          <Link
            href="/hot"
            className={clsx(
              'flex items-center justify-center',
              pathname === '/hot'
                ? 'font-medium text-black dark:text-white'
                : 'text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white',
            )}
          >
            <FireFlame className="h-5 w-5 stroke-2" />
          </Link>
        </div>

        <div className="flex flex-1 justify-center">
          <Notifications />
        </div>

        <div className="flex flex-1 justify-center">
          <Profile />
        </div>
      </div>
    </div>
  )
}
