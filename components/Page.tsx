import { PropsWithChildren } from 'react'

type Props = PropsWithChildren & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
  title: string | JSX.Element
}

export default function Page({ icon: Icon, title, children }: Props): JSX.Element {
  return (
    <div className="space-y-4 py-6">
      <div className="flex items-center space-x-3">
        <Icon />
        <div className="text-xl font-semibold">{title}</div>
      </div>

      <div>{children}</div>
    </div>
  )
}
