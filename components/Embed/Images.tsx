/* eslint-disable @next/next/no-img-element */
import { AppBskyEmbedImages } from '@atproto/api'
import { Image } from '@atproto/api/dist/client/types/app/bsky/embed/images'
import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { Fragment, useState } from 'react'

type Props = AppBskyEmbedImages.Main & {
  fullHeight?: boolean
}

export default function Images({ images, fullHeight = false }: Props): JSX.Element {
  const [selectedImage, setSelectedImage] = useState<Image | undefined>()

  return (
    <>
      <div
        className={clsx('grid gap-4 py-1', {
          'grid-cols-2': images.length === 2 || images.length > 3,
          'grid-cols-3': images.length === 3,
        })}
      >
        {images?.map((image, index) => {
          return (
            <button
              className={clsx(
                'post-image-button relative overflow-hidden rounded-lg',
                images?.length > 1 || fullHeight ? 'h-48' : 'max-h-[450px]',
              )}
              key={index}
              onClickCapture={e => {
                setSelectedImage(image)
                e.stopPropagation()
              }}
              title={image.alt}
            >
              <div>
                <img
                  src={`${image.thumb}`}
                  alt={image.alt}
                  className={clsx('rounded-lg', {
                    'h-full w-full object-cover': images.length > 1,
                  })}
                />

                {image.alt ? (
                  <div className="absolute bottom-2 left-2 rounded-md bg-zinc-900 bg-opacity-20 px-2 py-1 text-sm font-semibold leading-none text-white">
                    ALT
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      <Transition appear show={!!selectedImage} as={Fragment}>
        <Dialog
          onClick={e => {
            e.stopPropagation()
          }}
          as="div"
          className="relative z-50"
          onClose={() => setSelectedImage(undefined)}
        >
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
            <div className="flex h-screen items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:bg-black">
                  <div className="relative w-auto p-4">
                    <div>
                      <img
                        className="mx-auto max-h-[80vh] rounded-lg"
                        src={`${selectedImage?.fullsize}`}
                        alt={selectedImage?.alt}
                      />
                    </div>

                    <div className="w-auto overflow-hidden">
                      {selectedImage?.alt ? <div className="px-2 py-4 text-sm">{selectedImage?.alt}</div> : null}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
