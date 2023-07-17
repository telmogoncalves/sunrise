import { OutputSchema } from '@atproto/api/dist/client/types/com/atproto/server/getSession'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).com.atproto.server.getSession()

  return data
}

export default function useSession(): UseQueryResult<OutputSchema> {
  const result = useQuery(['session'], getData)

  return result
}
