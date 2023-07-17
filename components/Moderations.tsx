import { t } from '@lingui/macro'
import { EyeAlt, EyeOff, Prohibition, ShieldEye, Translate } from 'iconoir-react'
import { Key } from 'lucide-react'
import Link from 'next/link'

export default function Moderations(): JSX.Element {
  return (
    <div className="space-y-6 rounded-lg border py-6">
      <div className="flex items-center space-x-2 px-6">
        <ShieldEye className="h-6 w-6" />
        <div className="font-medium">{t`Moderation`}</div>
      </div>

      <div>
        <Link
          href="/settings/moderation/filtering"
          className="flex w-full items-center space-x-2 px-7 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <EyeAlt className="h-4 w-4" />
          <div>{t`Content filtering`}</div>
        </Link>

        <Link
          href="/settings/moderation/languages"
          className="flex w-full items-center space-x-2 px-7 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <Translate className="h-4 w-4" />
          <div>{t`Content languages`}</div>
        </Link>

        <Link
          href="/settings/passwords"
          className="flex w-full items-center space-x-2 px-7 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <Key className="h-4 w-4" />
          <div>{t`App passwords`}</div>
        </Link>

        <Link
          href="/settings/moderation/muted"
          className="flex w-full items-center space-x-2 px-7 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <EyeOff className="h-4 w-4" />
          <div>{t`Muted accounts`}</div>
        </Link>

        <Link
          href="/settings/moderation/blocked"
          className="flex w-full items-center space-x-2 px-7 py-3 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900"
        >
          <Prohibition className="h-4 w-4" />
          <div>{t`Blocked accounts`}</div>
        </Link>
      </div>
    </div>
  )
}
