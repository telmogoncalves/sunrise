import { Transition } from '@headlessui/react'
import { t } from '@lingui/macro'
import { Command } from 'cmdk'
import {
  AppNotification,
  ArrowDown,
  ArrowUp,
  Computer,
  FireFlame,
  HalfMoon,
  HomeSimple,
  LogOut,
  ProfileCircle,
  SunLight,
} from 'iconoir-react'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useOnClickOutside } from 'usehooks-ts'

import useSession from '@/hooks/useSession'

export default function Spotlight(): JSX.Element {
  const { data: session } = useSession()

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { push } = useRouter()
  const { theme, setTheme, systemTheme } = useTheme()

  const ref = useRef(null)
  const toggle = (): void => setOpen(open => !open)

  useOnClickOutside(ref, toggle)

  const toggleTheme = (): void => {
    const picks: { [key: string]: string } = {
      dark: 'light',
      light: 'system',
      system: systemTheme === 'light' ? 'dark' : 'light',
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setTheme(picks[theme])
  }

  function logout(): void {
    localStorage.removeItem('sessionData')
    push('/auth/login')
  }

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault()
        toggle()
      }

      if (e.key === 'Escape' && open) {
        toggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [open])

  const mainMenu: {
    onClick?: () => void
    route?: string
    icon: unknown
    label: string
  }[] = [
    {
      onClick: () => {
        push(`/`)
      },
      icon: HomeSimple,
      label: t`Home`,
    },
    {
      onClick: () => {
        push(`/hot`)
      },
      icon: FireFlame,
      label: t`Hot`,
    },
    {
      onClick: () => {
        push(`/notifications`)
      },
      icon: AppNotification,
      label: t`Notifications`,
    },
    {
      onClick: () => {
        push(`/u/${session?.handle}`)
      },
      icon: ProfileCircle,
      label: t`Profile`,
    },
  ]

  return (
    <Transition appear show={open} as={Fragment}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div className="fixed left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-white bg-opacity-80 dark:bg-black dark:bg-opacity-80">
          <Command
            ref={ref}
            label={t`Global Command Menu`}
            className="max-h-[60vh] w-[70vw] overflow-auto rounded-lg border border-zinc-300 bg-white pb-3 shadow dark:border-zinc-800 dark:bg-black 2xl:w-[30vw]"
          >
            <div className="border-b dark:border-zinc-800">
              <Command.Input
                autoFocus
                placeholder={t`What are you looking for?`}
                className="w-full p-4 text-base outline-none dark:bg-black dark:text-white dark:placeholder:text-zinc-600"
                value={search}
                onValueChange={e => {
                  setSearch(e)
                }}
              />

              <div className="flex items-center space-x-2 p-4 text-xs text-zinc-500 dark:text-zinc-400">
                <kbd className="rounded-md border p-1 dark:border-zinc-700">
                  <ArrowUp className="h-3 w-3 fill-current" />
                </kbd>

                <kbd className="rounded-md border p-1 dark:border-zinc-700">
                  <ArrowDown className="h-3 w-3 fill-current" />
                </kbd>

                <div>{t`to navigate`}</div>

                <kbd className="text-xxs rounded-md border p-1 font-mono dark:border-zinc-700">enter</kbd>

                <div>{t`to select`}</div>
              </div>
            </div>

            <Command.List>
              <Command.Empty className="p-3 text-sm">{t`Nothing found!`}</Command.Empty>

              <Command.Group heading={t`Navigation`}>
                {[...mainMenu].map(({ label, onClick, route, icon: Icon }, index) => {
                  return (
                    <Command.Item
                      key={index}
                      value={label}
                      onSelect={() => {
                        if (route) {
                          push(route)
                          return
                        }

                        onClick?.()

                        toggle()
                      }}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                      {/* @ts-ignore */}
                      <div>{Icon ? <Icon className="h-4 w-4 stroke-2" /> : null}</div>
                      <div>
                        <div className="command-menu-title text-sm">{label}</div>
                      </div>
                    </Command.Item>
                  )
                })}
              </Command.Group>

              <Command.Group heading={t`System`}>
                <Command.Item value={t`Change theme`} onSelect={toggleTheme}>
                  {theme === 'light' ? (
                    <SunLight className="w-4 stroke-2" />
                  ) : theme === 'dark' ? (
                    <HalfMoon className="w-4 stroke-2" />
                  ) : theme === 'system' ? (
                    <Computer className="w-4 stroke-2" />
                  ) : null}
                  <div className="command-menu-title text-sm capitalize">
                    {t`Change theme`}{' '}
                    <span className="text-xs italic">
                      ({t`current`}: {theme})
                    </span>
                  </div>
                </Command.Item>

                <Command.Item value="Logout" onSelect={logout}>
                  <LogOut className="w-4 stroke-2" />
                  <div className="command-menu-title text-sm">{t`Logout`}</div>
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </div>
      </Transition.Child>
    </Transition>
  )
}
