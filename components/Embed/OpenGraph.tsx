import { BlobRef } from '@atproto/api'
import axios from 'axios'
import { useEffect, useState } from 'react'

import External from './External'

type Props = {
  url: string
}

export default function OpenGraph({ url }: Props): JSX.Element {
  const [data, setData] = useState<{
    ogImage?: { url: BlobRef }
    ogTitle: string
    ogDescription: string
    ogUrl: string
  }>()

  useEffect(() => {
    async function run(): Promise<void> {
      const { data } = await axios.post('/api/open-graph', { url })

      setData(data)
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!data) return <></>

  return (
    <External
      external={{
        thumb: data?.ogImage?.url,
        title: data?.ogTitle,
        description: data?.ogDescription,
        uri: data?.ogUrl,
      }}
    />
  )
}
