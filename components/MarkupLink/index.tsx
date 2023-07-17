import ExternalLink from './ExternalLink'
import Mention from './Mention'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MarkupLink({ href, title = href }: any): JSX.Element | null {
  if (!href) {
    return null
  }

  // Mentions
  if (href.startsWith('@')) {
    return <Mention href={href} title={title} />
  }

  return <ExternalLink href={href} title={title} />
}
