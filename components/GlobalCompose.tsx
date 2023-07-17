import { Dialog, Transition } from '@headlessui/react'
import { t } from '@lingui/macro'
import { EditPencil } from 'iconoir-react'
import { Fragment, useState } from 'react'

import Compose from './Compose'

export default function GlobalCompose(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)

  function closeModal(): void {
    setIsOpen(false)
  }

  function openModal(): void {
    setIsOpen(true)
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center">
        <button
          type="button"
          onClick={openModal}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white hover:bg-brand-700"
        >
          <EditPencil />
        </button>
      </div>

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
                <Dialog.Panel className="w-full max-w-2xl transform space-y-3 overflow-hidden rounded-2xl border bg-white p-6 text-left align-middle shadow-xl transition-all dark:border-zinc-700 dark:bg-black">
                  <div className="text-lg font-semibold">{t`Share a skeet`}</div>
                  <Compose onDone={() => setIsOpen(false)} autoFocus />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
