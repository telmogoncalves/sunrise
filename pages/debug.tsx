import { useQuery } from '@tanstack/react-query'

import agent from '@/lib/agent'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getData(): Promise<any> {
  const { data } = await (await agent()).api.app.bsky.unspecced.getPopularFeedGenerators()

  return data
}

export default function Debug(): JSX.Element {
  const { data } = useQuery(['debug'], getData)

  if (process.env.NODE_ENV === 'production') return <></>

  return <pre>{JSON.stringify({ data }, null, 2)}</pre>
}
