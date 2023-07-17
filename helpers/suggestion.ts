/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ReactRenderer } from '@tiptap/react'
import { RefAttributes } from 'react'
import tippy from 'tippy.js'

import MentionList from '@/components/MentionList'
import agent from '@/lib/agent'

export default {
  items: async ({ query }: { query: string }) => {
    const { data } = await (
      await agent()
    ).searchActorsTypeahead({
      term: query.toLowerCase(),
      limit: 10,
    })

    return data?.actors
  },

  render: () => {
    let component: ReactRenderer<
      unknown,
      { items: unknown[]; command: (props: unknown) => void } & RefAttributes<unknown>
    >
    let popup: { destroy: () => void }[]

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onStart: (props: { editor: any; clientRect: any }) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onUpdate(props: Record<string, any> | undefined) {
        component.updateProps(props)

        if (!props?.clientRect) {
          return
        }

        // @ts-ignore
        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: { event: { key: string } }) {
        if (props.event.key === 'Escape') {
          // @ts-ignore
          popup[0].hide()

          return true
        }

        // @ts-ignore
        return component.ref?.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
        component.destroy()
      },
    }
  },
}
