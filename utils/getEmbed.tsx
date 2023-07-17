import { AppBskyEmbedExternal, AppBskyEmbedRecord } from '@atproto/api'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import Vimeo from '@u-wave/react-vimeo'
import { TwitterEmbed, YouTubeEmbed } from 'react-social-media-embed'
import { Spotify } from 'react-spotify-embed'

import AsyncPost from '@/components/AsyncPost'
import External from '@/components/Embed/External'
import Images from '@/components/Embed/Images'
import MediaWithThread from '@/components/Embed/MediaWithThread'
import OpenGraph from '@/components/Embed/OpenGraph'
import Record from '@/components/Embed/Record'
import RecordWithMedia from '@/components/Embed/RecordWithMedia'
import useProfile from '@/hooks/useProfile'

import { buildPostAtUri } from './post'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEmbed(embed: any, post: PostView): JSX.Element | null {
  if (!embed) return null

  switch (embed.$type) {
    case 'app.bsky.embed.external#view':
      return <SocialEmbed uri={embed.external.uri} fallback={<External {...(embed as AppBskyEmbedExternal.Main)} />} />
    case 'app.bsky.embed.record#view':
      return <Record {...(embed as AppBskyEmbedRecord.Main)} />
    case 'app.bsky.embed.images#view':
      if (post) return <MediaWithThread {...(post as PostView)} />

      return <Images images={embed.images} />
    case 'app.bsky.embed.recordWithMedia#view':
      return <RecordWithMedia {...post} />
    case 'app.bsky.richtext.facet#link':
      if (embed.uri.includes('bsky.app')) return <AsyncEmbedPost uri={embed.uri} />

      return <SocialEmbed uri={embed.uri} fallback={<OpenGraph url={embed.uri} />} />
    default:
      return null
  }
}

type AsyncEmbedPostProps = {
  uri: string
}

function AsyncEmbedPost({ uri }: AsyncEmbedPostProps): JSX.Element {
  const [, , , , handle, , postId] = uri.split('/')
  const { data, isLoading } = useProfile({ handle })

  if (isLoading || !data) return <></>

  const atUri = buildPostAtUri(data.did, postId)

  return (
    <div className="rounded-lg border p-4">
      <AsyncPost uri={atUri} />
    </div>
  )
}

type SocialEmbedProps = {
  uri: string
  fallback: JSX.Element
}

function SocialEmbed({ uri, fallback: Fallback }: SocialEmbedProps): JSX.Element {
  if (['youtube', 'youtu.be'].some(s => uri.includes(s))) {
    return (
      <div className="my-2 w-full overflow-hidden rounded-lg">
        <YouTubeEmbed url={uri} width="100%" />
      </div>
    )
  }

  if (['twitter.com'].some(s => uri.includes(s))) {
    return (
      <div className="w-full overflow-hidden rounded-lg py-2">
        <TwitterEmbed url={uri} width="100%" />
      </div>
    )
  }

  if (['spotify'].some(s => uri.includes(s))) {
    return (
      <div className="mt-2 w-full overflow-hidden rounded-xl">
        <Spotify link={uri} wide className="!m-0" />
      </div>
    )
  }

  if (['vimeo'].some(s => uri.includes(s)) && !!uri) {
    try {
      return (
        <div className="mt-2 w-full overflow-hidden rounded-xl">
          <Vimeo video={uri} responsive autopause={false} className="!rounded-xl" />
        </div>
      )
    } catch {
      // Empty
    }
  }

  return Fallback
}
