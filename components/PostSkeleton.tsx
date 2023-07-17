import clsx from 'clsx'

import { Skeleton } from './ui/skeleton'

type Props = {
  bordered?: boolean
}

export default function PostSkeleton({ bordered = true }: Props): JSX.Element {
  return (
    <div className={clsx(bordered ? 'rounded-lg border p-6' : '')}>
      <div className="flex space-x-4">
        <div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>

        <div className="w-full space-y-8">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>

            <Skeleton className="h-2 w-20 rounded-md" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md" />
            <Skeleton className="h-4 w-4/5 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  )
}
