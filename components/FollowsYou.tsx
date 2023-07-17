import { t } from '@lingui/macro'

export default function FollowsYou(): JSX.Element {
  return (
    <div className="rounded-sm bg-zinc-100 px-1 py-0.5 text-[11px] font-medium leading-none text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
      {t`Follows You`}
    </div>
  )
}
