import { OutputSchema } from '@atproto/api/dist/client/types/com/atproto/server/listAppPasswords'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { Key } from 'lucide-react'

// import { FieldValues, useForm } from 'react-hook-form'
import Page from '@/components/Page'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.com.atproto.server.listAppPasswords()

  return data
}

export default function Passwords(): JSX.Element {
  const { data, isLoading, refetch } = useQuery(['app-passwords'], getData)
  // const { mutate, isLoading: isCreatingAppPassword } = useMutation({
  //   mutationFn: async function (data: FieldValues) {
  //     const response = await (await agent()).api.com.atproto.server.createAppPassword({ name: data.name })

  //     return response.data
  //   },
  //   onSuccess: function (data) {
  //     toast({
  //       title: t`App password`,
  //       description: t`Successfully created "${data.name}"`,
  //     })
  //   },
  // })

  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  //   reset,
  // } = useForm()

  // async function onSubmit(values: FieldValues): Promise<void> {
  //   mutate(values)
  //   reset()
  // }

  async function revokePassword(name: string): Promise<void> {
    await (await agent()).api.com.atproto.server.revokeAppPassword({ name })

    toast({
      title: 'App password',
      description: `Successfully revoked app password "${name}"`,
    })

    refetch?.()
  }

  return (
    <div className="px-12">
      <Page icon={Key} title={t`App passwords`}>
        <div className="space-y-6">
          <div className="rounded-lg border">
            {isLoading ? (
              <div className="space-y-4 p-6">
                <Skeleton className="h-6 w-full rounded-md" />
                <Skeleton className="h-6 w-full rounded-md" />
                <Skeleton className="h-6 w-full rounded-md" />
              </div>
            ) : data?.passwords?.length ? (
              <div>
                {data?.passwords?.map(password => {
                  return (
                    <div
                      key={password.name}
                      className="flex items-center justify-between border-b px-6 py-3 last:border-none"
                    >
                      <div className="flex items-center space-x-3">{password.name}</div>

                      <div>
                        <Button onClick={() => revokePassword(password.name)} size="sm">
                          Revoke
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 text-sm text-zinc-500">
                {t`You have not created any app passwords. Create one to safely login into any third party application without sharing your password.`}
              </div>
            )}
          </div>

          {/*<div className="space-y-4 rounded-lg border p-6">
            <div className="text-lg font-medium">{t`Create a new app password`}</div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t`App name`}</Label>
                <Input {...register('name', { required: true })} disabled={isCreatingAppPassword} />
                {errors.name && <div className="text-xs italic text-red-500">This field is required</div>}
              </div>

              <Button className="w-full" disabled={isCreatingAppPassword}>
                Create
              </Button>
            </form>
          </div>*/}
        </div>
      </Page>
    </div>
  )
}
