import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { MessageCircle } from 'lucide-react'
import millify from 'millify'
import { useEffect, useState } from 'react'
import TextTransition, { presets } from 'react-text-transition'

export default function Reply({ cid, replyCount }: PostView): JSX.Element {
  const arr = millify(Number(replyCount)).split('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <></>

  return (
    <button className="-mx-1 flex items-center space-x-1.5 p-1 text-left leading-none transition-all hover:text-sky-500">
      <MessageCircle className="h-[15px] w-[15px] stroke-2" />

      <div className="flex items-center">
        {arr.map((n, index) => {
          return (
            <TextTransition
              key={`replies--${cid}--${index}`}
              style={{ fontSize: 13 }}
              className="font-medium"
              springConfig={presets.stiff}
            >
              {n}
            </TextTransition>
          )
        })}
      </div>
    </button>
  )
}
