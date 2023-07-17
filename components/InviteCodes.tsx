import { OutputSchema } from '@atproto/api/dist/client/types/com/atproto/server/getAccountInviteCodes'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import sortBy from 'lodash/sortBy'
import { Ticket } from 'lucide-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'

import agent from '@/lib/agent'

import { Button } from './ui/button'
import { Skeleton } from './ui/skeleton'
import { toast } from './ui/use-toast'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.com.atproto.server.getAccountInviteCodes()

  return data
}

export default function InviteCodes(): JSX.Element {
  const { data, isLoading } = useQuery(['invite-codes'], getData)

  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div className="flex items-center space-x-2">
        <Ticket className="h-5 w-5" />
        <div className="font-medium">
          {data?.codes?.length
            ? t`You have ${data?.codes?.filter(a => !a.uses.length).length} invite codes available`
            : t`Invite codes`}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
        </div>
      ) : data?.codes?.length ? (
        <div className="space-y-5">
          {sortBy(data?.codes, 'uses')?.map(({ code, uses }) => {
            return (
              <div key={code} className="flex items-center justify-between">
                <div className={clsx('font-mono text-sm', uses?.length ? 'line-through opacity-30' : '')}>{code}</div>

                {uses?.length ? null : (
                  <div>
                    <CopyToClipboard
                      text={code}
                      onCopy={() => {
                        toast({
                          title: t`Success`,
                          description: t`Code copied to clipboard`,
                        })
                      }}
                    >
                      <Button className="h-auto px-2 py-1" size="sm">{t`Copy code`}</Button>
                    </CopyToClipboard>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-zinc-400 dark:text-zinc-500">{t`You don't have any invite codes available`}</div>
      )}
    </div>
  )
}
