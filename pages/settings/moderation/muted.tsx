import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/graph/getMutes'
import { t } from '@lingui/macro'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { EyeOff } from 'iconoir-react'

import Avatar from '@/components/Avatar'
import Page from '@/components/Page'
import ProfileSkeleton from '@/components/ProfileSkeleton'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import Username from '@/components/Username'
import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.app.bsky.graph.getMutes()

  return data
}

export default function Muted(): JSX.Element {
  const { data, isLoading } = useQuery(['muted-accounts'], getData)
  const queryClient = useQueryClient()

  async function triggerUnmute(did: string, handle: string): Promise<void> {
    await (await agent()).unmute(did)

    await queryClient.refetchQueries(['muted-accounts'])

    toast({
      title: t`Unmute`,
      description: t`Successfully unmuted @${handle}`,
    })
  }

  return (
    <div className="px-12">
      <Page icon={EyeOff} title={t`Muted accounts`}>
        <div className="rounded-lg border">
          {isLoading ? (
            <div className="space-y-6 p-6">
              <ProfileSkeleton />
              <ProfileSkeleton />
              <ProfileSkeleton />
            </div>
          ) : data?.mutes?.length ? (
            <div>
              {data?.mutes?.map(user => {
                return (
                  <div key={user.did} className="flex items-center justify-between border-b p-6 last:border-none">
                    <div className="flex items-center space-x-3">
                      <Avatar {...user} className="h-12 w-12 rounded-full" />
                      <Username {...user} blocks />
                    </div>

                    <div>
                      <Button size="sm" onClick={() => triggerUnmute(user.did, user.handle)}>
                        Unmute
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-6 text-sm text-zinc-500">
              {t`You have not muted any accounts yet. To mute an account, go to their profile and selected "Mute" from the menu on their account.`}
            </div>
          )}
        </div>
      </Page>
    </div>
  )
}
