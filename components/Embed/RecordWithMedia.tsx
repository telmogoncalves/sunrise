import { AppBskyEmbedRecord } from '@atproto/api'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'

import MediaWithThread from './MediaWithThread'
import Record from './Record'

export default function RecordWithMedia(post: PostView): JSX.Element {
  return (
    <>
      <MediaWithThread {...post} />
      {post.embed?.record ? <Record {...(post.embed.record as AppBskyEmbedRecord.Main)} /> : null}
    </>
  )
}
