import { t } from '@lingui/macro'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'

import { getProfile } from '@/api'
import useSession from '@/hooks/useSession'
import agent from '@/lib/agent'
import { compressImage } from '@/utils/compressImage'
import { uploadImage } from '@/utils/uploadImage'

import Avatar from './Avatar'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { toast } from './ui/use-toast'

export default function EditProfile(): JSX.Element {
  const [opened, setOpened] = useState(false)
  const { data: session } = useSession()
  const { data: profile, refetch } = useQuery(['profile'], () => getProfile(session?.handle as string), {
    enabled: !!session?.handle,
  })
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm()

  useEffect(() => {
    reset(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => {
    if (!session?.handle) return

    refetch?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  async function onSubmit(values: FieldValues): Promise<void> {
    const avatar = values.avatar?.[0] ? await uploadImage(await compressImage(values.avatar[0])) : null

    await (
      await agent()
    ).upsertProfile(existing => ({
      ...existing,
      ...(avatar
        ? {
            avatar: avatar?.blobRef,
          }
        : null),
      displayName: values.displayName,
      description: values.description,
    }))

    toast({
      title: t`Profile`,
      description: t`Successfully updated profile`,
    })

    setOpened(false)
    await queryClient.refetchQueries()
  }

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger className="text-zinc-500 hover:text-zinc-900">
        <Button size="sm" variant="secondary">
          {t`Edit profile`}
        </Button>
      </DialogTrigger>

      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>{t`Edit profile`}</DialogTitle>
        </DialogHeader>

        <DialogDescription className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t`Avatar`}</Label>
              <Avatar {...profile} className="h-14 w-14 rounded-full" />
              <Input type="file" {...register('avatar')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t`Display name`}</Label>
              <Input defaultValue={`${profile?.displayName}`} {...register('displayName', { required: true })} />
              {errors.name && <div className="text-xs italic text-red-500">This field is required</div>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t`Bio`}</Label>
              <Textarea defaultValue={`${profile?.description}`} {...register('description')} />
            </div>

            <Button type="submit" className="w-full">
              {t`Update`}
            </Button>
          </form>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
