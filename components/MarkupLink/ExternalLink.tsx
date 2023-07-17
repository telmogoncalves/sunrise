import Link from 'next/link'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ExternalLink({ href, title = href }: any): JSX.Element | null {
  if (!href) {
    return null
  }

  if (!href.includes('://')) {
    href = `https://${href}`
  }

  return (
    <Link
      className="inline break-words text-brand-500"
      onClick={e => {
        e.stopPropagation()
      }}
      href={href}
      target={href.includes(location.host) ? '_self' : '_blank'}
      rel="noopener"
    >
      {title}
    </Link>
  )
}

export default ExternalLink
