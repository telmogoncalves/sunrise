import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/com/atproto/server/getSession'

import agent from './lib/agent'

export async function getSession(): Promise<OutputSchema> {
  const { data } = await (await agent()).com.atproto.server.getSession()

  return data
}

export async function getProfile(handle: string): Promise<ProfileView> {
  const { data } = await (await agent()).getProfile({ actor: `${handle}` })

  return data
}

export async function getPost(uri: string): Promise<PostView | null> {
  try {
    const { data } = await (await agent()).getPostThread({ uri, depth: 1 })

    return data?.thread?.post as PostView
  } catch {
    return null
  }
}
