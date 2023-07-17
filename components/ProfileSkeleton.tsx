import { Skeleton } from './ui/skeleton'

export default function ProfileSkeleton(): JSX.Element {
  return (
    <div className="flex items-center space-x-3">
      <Skeleton className="h-12 w-12 rounded-full" />

      <div className="space-y-2">
        <Skeleton className="h-3 w-48 rounded-md" />
        <Skeleton className="h-3 w-72 rounded-md" />
      </div>
    </div>
  )
}
