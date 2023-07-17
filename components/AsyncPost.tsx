/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { useEffect, useState } from 'react'

import { getPost } from '@/api'

import Post from './Post'
import PostSkeleton from './PostSkeleton'

type Props = {
  uri: string
  hideAuthor?: boolean
}

export default function AsyncPost({ uri, hideAuthor = false }: Props): JSX.Element {
  const [item, setItem] = useState<PostView | null>()

  useEffect(() => {
    async function get(): Promise<void> {
      const data = await getPost(uri)

      setItem(data)
    }

    get()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!item) return <PostSkeleton bordered={false} />

  // @ts-ignore
  return <Post {...{ post: item }} hideAuthor={hideAuthor} />
}
