/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getPostThread'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import agent from '@/lib/agent'
import { getEmbed } from '@/utils/getEmbed'
import { getPostUrl } from '@/utils/post'

import Markup from './Markup'

type Props = {
  uri: string
}

async function getData(uri: string): Promise<OutputSchema> {
  const { data } = await (await agent()).getPostThread({ uri, depth: 1 })

  return data
}

export default function NotificationPost({ uri }: Props): JSX.Element {
  const { data } = useQuery(['notification-post', uri], () => getData(uri))
  const post = data?.thread?.post as PostView
  const [postUrl, setPostUrl] = useState<string>('')

  useEffect(() => {
    if (!post) return

    setPostUrl(getPostUrl(post.author, post.uri))
  }, [post])

  if (!post) return <></>

  return (
    <Link href={postUrl} className="relative flex w-full items-start space-x-3 hover:border-brand-500">
      <div className="space-y-4">
        <div className="text-sm">
          {/*@ts-ignore*/}
          <Markup className="text-sm">{post?.record?.text as string}</Markup>
          {getEmbed(post.embed, post)}
        </div>
      </div>
    </Link>
  )
}
