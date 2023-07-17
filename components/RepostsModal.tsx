import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getRepostedBy'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import TextTransition from 'react-text-transition'

import agent from '@/lib/agent'

import Avatar from './Avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import Username from './Username'

type Props = {
  reposts: number
  uri: string
}

async function getData(uri: string): Promise<OutputSchema> {
  const { data } = await (await agent()).getRepostedBy({ uri, limit: 100 })

  return data
}

export default function RepostsModal({ reposts, uri }: Props): JSX.Element {
  const { asPath } = useRouter()
  const [opened, setOpened] = useState(false)
  const { data } = useQuery([asPath, 'reposts'], () => getData(uri))

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger>
        <button className="flex space-x-1 hover:underline">
          <span className="font-medium">
            <TextTransition>{reposts}</TextTransition>
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">{t`reskeets`}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader className="py-2">
          <DialogTitle>
            {reposts} {t`reskeets`}
          </DialogTitle>
        </DialogHeader>

        <DialogDescription className="scrollbar-hide max-h-[50vh] space-y-4 overflow-auto">
          {data?.repostedBy?.map(actor => {
            return (
              <Link className="flex items-center space-x-3" key={`like--${actor.handle}`} href={`/u/${actor.handle}`}>
                <div>
                  <Avatar {...actor} className="h-9 w-9 rounded-full" />
                </div>

                <div>
                  <Username {...actor} disableHoverCard />
                </div>
              </Link>
            )
          })}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
