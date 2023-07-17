import { PropsWithChildren } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import linkifyRegex from 'remark-linkify-regex'
import stripMarkdown from 'strip-markdown'

import { hashtagRegex, mentionRegex, urlRegex } from '@/utils/markup'
import trimify from '@/utils/trimify'

import MarkupLink from './MarkupLink'

const plugins = [
  [stripMarkdown, { keep: ['strong', 'emphasis', 'inlineCode'] }],
  remarkBreaks,
  linkifyRegex(mentionRegex),
  linkifyRegex(hashtagRegex),
  linkifyRegex(urlRegex),
]

interface MarkupProps {
  children: string
  className?: string
}

const components = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  a: (props: any) => <MarkupLink {...props} />,
  strong: ({ children }: PropsWithChildren) => <strong className="dark:text-white">{children}</strong>,
}

export default function Markup({ children, className = '' }: MarkupProps): JSX.Element {
  return (
    <ReactMarkdown className={`${className} prose dark:text-white`} components={components} remarkPlugins={plugins}>
      {trimify(children)}
    </ReactMarkdown>
  )
}
