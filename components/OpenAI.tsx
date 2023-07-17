/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Dialog, Transition } from '@headlessui/react'
import { t } from '@lingui/macro'
import { DotPulse } from '@uiball/loaders'
import axios from 'axios'
import { KeyAlt, Sparks } from 'iconoir-react'
import { useTheme } from 'next-themes'
import { Fragment, useState } from 'react'

import { Button } from './ui/button'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDone: (data: any) => void
}

export default function OpenAI({ onDone }: Props): JSX.Element {
  const { resolvedTheme } = useTheme()
  const [requesting, setRequesting] = useState(false)
  const [openAiKey, setOpenAiKey] = useState(typeof localStorage !== 'undefined' && localStorage.getItem('OPENAI_KEY'))

  if (!openAiKey)
    return (
      <div className="rounded-lg bg-white p-2 dark:bg-background">
        <div className="p-2.5">
          <div className="flex grow items-center space-x-3">
            <KeyAlt className="h-5 w-5 stroke-2 text-brand-500" />

            <input
              autoFocus
              onKeyDown={e => {
                if (e.metaKey && e.key === 'Enter') {
                  // @ts-ignore
                  const key = e.target.value

                  localStorage.setItem('OPENAI_KEY', key)
                  setOpenAiKey(key)
                  return
                }
              }}
              type="text"
              className="w-full text-sm outline-none dark:bg-background"
              placeholder={t`Type your OpenAI key. ⌘ + Enter to submit`}
            />

            <LearnMoreModal />
          </div>
        </div>
      </div>
    )

  return (
    <div className="rounded-lg bg-white p-2 dark:bg-background">
      <div className="p-2.5">
        <div className="flex grow items-center space-x-3">
          <Sparks className="h-5 w-5 stroke-2 text-brand-500" />

          {requesting ? (
            <div>
              <div className="flex items-center space-x-2">
                <DotPulse size={16} speed={1.3} color={resolvedTheme === 'dark' ? '#fff' : '#000'} />
                <div className="text-sm font-medium">{t`Waiting for OpenAI, hang tight...`}</div>
              </div>
            </div>
          ) : (
            <input
              autoFocus
              onKeyDown={async e => {
                if (e.metaKey && e.key === 'Enter') {
                  setRequesting(true)

                  const { data } = await axios.post('/api/openai', {
                    // @ts-ignore
                    prompt: e.target.value,
                    key: openAiKey,
                  })

                  if (data.error) {
                    setRequesting(false)
                    alert(data.error.message)
                    return
                  }

                  onDone(data)
                }
              }}
              type="text"
              className="w-full text-sm outline-none dark:bg-background"
              placeholder={t`Ask OpenAI whatever you want! ⌘ + Enter to submit`}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function LearnMoreModal(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  function closeModal(): void {
    setIsOpen(false)
  }

  function openModal(): void {
    setIsOpen(true)
  }

  return (
    <>
      <button type="button" onClick={openModal} className="whitespace-nowrap text-sm text-zinc-500 hover:underline">
        {t`Learn more`}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl transform space-y-8 overflow-hidden rounded-2xl border bg-white p-6 text-left align-middle shadow-xl transition-all dark:border-zinc-700 dark:bg-black">
                  <div className="flex items-center space-x-3 text-lg font-medium">
                    <Sparks className="h-7 w-7" />
                    <div>OpenAI</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-lg font-medium">{t`It's secure to put my OpenAI key on Sunrise?`}</div>
                    <div className="text-zinc-500">{t`We don't store your key ourselves, we use local storage to save your key, which means it never leaves your browser. This means if you login from a different browser or computer you'll need to save your key again. It's safe.`}</div>
                  </div>

                  <Button type="button" onClick={closeModal} className="block w-full text-center">
                    {t`Got it`}
                  </Button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
