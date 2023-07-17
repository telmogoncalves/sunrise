import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { Label } from '@atproto/api/dist/client/types/com/atproto/label/defs'

export function getPostId(uri: string): string {
  if (!uri) return ''

  const s = uri.split('/')
  const [, , , , id] = s

  return id
}

export function buildPostAtUri(did: string, postId: string): string {
  return `at://${did}/app.bsky.feed.post/${postId}`
}

export function getPostUrl(author: ProfileView, uri: string): string {
  return `/u/${author?.handle}/skeet/${getPostId(uri)}`
}

export function isPostNsfw(labels: Label[] | undefined): boolean {
  if (!labels?.length) return false

  return labels.some(l => l.val === 'sexual')
}
