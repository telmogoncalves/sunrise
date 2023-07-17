import { PropsWithChildren } from 'react'

type Props = PropsWithChildren & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
}

export default function EmptyProfileSection({ children, icon: Icon }: Props): JSX.Element {
  return (
    <div className="flex justify-center space-x-2 py-8 text-center text-sm text-zinc-500">
      {Icon ? <Icon className="h-5 w-5" /> : null}
      <div>{children}</div>
    </div>
  )
}
