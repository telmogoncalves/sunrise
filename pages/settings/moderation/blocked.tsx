import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/graph/getBlocks'
import { t } from '@lingui/macro'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Prohibition } from 'iconoir-react'

import Avatar from '@/components/Avatar'
import Page from '@/components/Page'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Username from '@/components/Username'
import useSession from '@/hooks/useSession'
import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.app.bsky.graph.getBlocks()

  return data
}

export default function Blocked(): JSX.Element {
  const { data, isLoading } = useQuery(['blocked-accounts'], getData)
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  async function triggerUnblock({ did, handle, viewer }: ProfileView): Promise<void> {
    const rkey = viewer?.blocking?.split('/').slice(-1)[0]

    await (
      await agent()
    ).api.app.bsky.graph.block.delete(
      { rkey: rkey, repo: session?.did },
      { createdAt: new Date().toISOString(), subject: did },
    )

    await queryClient.refetchQueries(['blocked-accounts'])

    toast({
      title: t`Unblock`,
      description: t`Successfully unblocked @${handle}`,
    })
  }

  return (
    <div className="px-12">
      <Page icon={Prohibition} title={t`Blocked accounts`}>
        <div className="rounded-lg border">
          {isLoading ? (
            <div className="space-y-6 p-6">
              <ProfileSkeleton />
              <ProfileSkeleton />
              <ProfileSkeleton />
            </div>
          ) : data?.blocks?.length ? (
            <div>
              {data?.blocks?.map(user => {
                return (
                  <div key={user.did} className="flex items-center justify-between border-b p-6 last:border-none">
                    <div className="flex items-center space-x-3">
                      <Avatar {...user} className="h-12 w-12 rounded-full" />
                      <Username {...user} blocks />
                    </div>

                    <div>
                      <Button size="sm" onClick={() => triggerUnblock(user)}>
                        Unblock
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-sm text-zinc-500">
              {t`You have not blocked any accounts yet. To block an account, go to their profile and selected "Block" from the menu on their account.`}
            </div>
          )}
        </div>
      </Page>
    </div>
  )
}
