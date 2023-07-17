import { AppBskyEmbedExternal } from '@atproto/api'
import clsx from 'clsx'

export default function External({ external }: AppBskyEmbedExternal.Main): JSX.Element {
  if (!external.uri) return <></>

  return (
    <div className="py-2">
      <a
        onClick={e => {
          e.stopPropagation()
        }}
        href={external.uri}
        target="_blank"
        rel="noreferrer"
        className="block overflow-hidden rounded-xl border hover:border-brand-500"
      >
        {external?.thumb ? (
          <div
            style={{ background: `url(${external.thumb}) center`, backgroundSize: 'cover' }}
            className="h-80 overflow-hidden bg-cover bg-center"
          />
        ) : null}

        <div className={clsx('p-4', external.thumb ? 'border-t' : '')}>
          <div className="text-base font-semibold">{external.title}</div>
          {external.description ? (
            <div className="space-y-2">
              <div className="truncate text-sm text-zinc-500">{external.description}</div>
              <div className="truncate text-xs text-zinc-400 dark:text-zinc-600">{external.uri}</div>
            </div>
          ) : (
            <div className="truncate text-sm text-zinc-500">{external.uri}</div>
          )}
        </div>
      </a>
    </div>
  )
}
