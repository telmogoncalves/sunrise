import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { t } from '@lingui/macro'
import { useQueryClient } from '@tanstack/react-query'
import { MoreHoriz, Trash } from 'iconoir-react'
import { useRouter } from 'next/router'
import { useState } from 'react'

import agent from '@/lib/agent'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { useToast } from './ui/use-toast'

export default function PostActions({ uri }: PostView): JSX.Element {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { asPath, pathname, push } = useRouter()
  const [deletePostModalOpened, setDeletePostModalOpened] = useState(false)

  async function deletePost(): Promise<void> {
    await (await agent()).deletePost(uri)

    await queryClient.refetchQueries([asPath])
    setDeletePostModalOpened(false)

    toast({
      title: t`Skeet`,
      description: t`Successfully deleted skeet`,
    })

    if (pathname === '/u/[handle]/skeet/[id]') {
      push('/')
    }
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="secondary" size="sm" className="flex h-auto items-center space-x-1 px-1.5 py-0.5">
            <MoreHoriz className="stroke-2 text-xs" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={e => {
              e.stopPropagation()
              setDeletePostModalOpened(true)
            }}
            className="flex items-center space-x-2"
          >
            <Trash className="h-4 w-4 stroke-2" />
            <div>{t`Delete skeet`}</div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deletePostModalOpened} onOpenChange={setDeletePostModalOpened}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t`Are you sure absolutely sure?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {t`This action cannot be undone. This will permanently delete your post.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={e => {
                e.stopPropagation()
                setDeletePostModalOpened(false)
              }}
            >{t`Cancel`}</AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.stopPropagation()
                deletePost()
              }}
            >{t`Continue`}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
