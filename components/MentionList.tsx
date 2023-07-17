/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { t } from '@lingui/macro'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

import Avatar from './Avatar'
import Username from './Username'

type Props = {
  items: ProfileView[]
  command: (props: unknown) => void
}

// eslint-disable-next-line react/display-name
export default forwardRef((props: Props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  function selectItem(index: number): void {
    const item = props.items[index]

    if (item) {
      props.command({ id: item.handle })
    }
  }

  function upHandler(): void {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  function downHandler(): void {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  function enterHandler(): void {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    // @ts-ignore
    onKeyDown: ({ event }: unknown) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="z-50 min-w-[450px] flex-col rounded-lg border bg-white p-1 shadow-lg dark:bg-background">
      {props.items.length ? (
        props.items.map((item, index) => (
          <button
            className={`block w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              index === selectedIndex ? 'bg-zinc-100 dark:bg-zinc-800' : ''
            }`}
            key={index}
            onClick={() => selectItem(index)}
          >
            <div className="flex items-center space-x-3">
              <Avatar {...item} className="h-8 w-8 rounded-full" />
              <Username {...item} disableCta disableHoverCard />
            </div>
          </button>
        ))
      ) : (
        <div className="item p-3 text-sm">{t`No result`}</div>
      )}
    </div>
  )
})
