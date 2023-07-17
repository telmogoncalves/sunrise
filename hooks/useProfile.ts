import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/com/atproto/server/getSession'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import agent from '@/lib/agent'

async function getData(handle: string): Promise<ProfileView> {
  const { data } = await (await agent()).getProfile({ actor: `${handle}` })

  return data
}

export default function useProfile({ handle }: { handle: string }): UseQueryResult<OutputSchema> {
  const result = useQuery(['profile', handle], () => getData(handle))

  return result
}
