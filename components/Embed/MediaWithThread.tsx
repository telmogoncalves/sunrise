/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Image } from '@atproto/api/dist/client/types/app/bsky/embed/images'
import { FeedViewPost, PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getPostThread'
import { Dialog, Transition } from '@headlessui/react'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import { ArrowLeft, ArrowRight, ChatBubbleEmpty } from 'iconoir-react'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'

import usePreferences from '@/hooks/usePreferences'
import agent from '@/lib/agent'
import { getPostId, isPostNsfw } from '@/utils/post'

import Compose from '../Compose'
import Post from '../Post'
import PostSkeleton from '../PostSkeleton'
import { Button } from '../ui/button'

async function getData(handle: string, id: string): Promise<OutputSchema> {
  const { data: profile } = await (await agent()).getProfile({ actor: `${handle}` })
  const uri = `at://${profile.did}/app.bsky.feed.post/${id}`
  const { data } = await (await agent()).getPostThread({ uri })

  return data
}

type Props = PostView & {
  cover?: boolean
}

export default function MediaWithThread({ cover, ...post }: Props): JSX.Element {
  const { asPath } = useRouter()
  const [showNsfw, setShowNsfw] = useState(false)
  const { data, isLoading } = useQuery(
    [asPath, 'thread-modal', post.uri],
    () => getData(post.author.handle, getPostId(post.uri)),
    {
      refetchInterval: 10000,
    },
  )
  const isNsfw = isPostNsfw(post.labels)
  const { warnNsfw } = usePreferences()

  const [openModal, setOpenModal] = useState(false)
  const [selected, setSelected] = useState<number>(0)

  const images = (post.embed?.images ??
    // @ts-ignore
    post.embeds?.[0]?.images ??
    // @ts-ignore
    post.embeds?.[0]?.media?.images ??
    // @ts-ignore
    post.embed?.media?.images) as Image[]
  const totalImages = images?.length
  const isMultiple = totalImages > 1

  // @ts-ignore
  const selectedImage = images?.[selected]

  const replyRef = {
    // @ts-ignore
    uri: data?.thread?.post?.uri,
    // @ts-ignore
    cid: data?.thread?.post?.cid,
  }

  // @ts-ignore
  const hasParent = data?.thread?.parent && !data.thread.parent.notFound
  // @ts-ignore
  const parent = data?.thread?.parent?.post
  // @ts-ignore
  const parentReply = data?.thread?.parent?.parent?.post

  const shouldWarn = isNsfw && warnNsfw && !showNsfw

  return (
    <>
      <div
        className={clsx('grid gap-4 pt-1', {
          'grid-cols-2': totalImages > 1,
          'grid-cols-3': totalImages === 3,
        })}
      >
        {images?.map((image, index) => {
          return (
            <button
              key={`${image.thumb}`}
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()

                setSelected(index)
                setOpenModal(true)
              }}
              className={clsx('relative overflow-hidden rounded-lg', {
                'h-48': isMultiple || cover,
              })}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${image.alt}`}
                src={`${image.thumb}`}
                className={clsx('rounded-lg', {
                  'h-full w-full object-cover': isMultiple || cover,
                  'overflow-hidden blur-xl': shouldWarn,
                })}
                onError={({ currentTarget }) => {
                  currentTarget.onerror = null // prevents looping
                  currentTarget.src = '/image_not_found.png'
                }}
              />

              {image.alt ? (
                <div className="absolute bottom-2 left-2 rounded-md bg-zinc-900 bg-opacity-20 px-2 py-1 text-sm font-semibold leading-none text-white">
                  ALT
                </div>
              ) : null}

              {shouldWarn ? (
                <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-30">
                  <div
                    className={clsx(
                      'space-y-3 text-center text-sm font-medium',
                      isMultiple || cover ? 'px-4' : 'px-24',
                    )}
                  >
                    <div>{t`NSFW content. If you want to see the content click the button below.`}</div>

                    <Button
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()

                        setShowNsfw(true)
                      }}
                      size="sm"
                    >
                      Show
                    </Button>
                  </div>
                </div>
              ) : null}
            </button>
          )
        })}
      </div>

      <Transition appear show={openModal} as={Fragment}>
        <Dialog
          onClick={e => {
            e.stopPropagation()
          }}
          as="div"
          className="relative z-50"
          onClose={setOpenModal}
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
                <Dialog.Panel className="h-[95vh] w-full transform overflow-hidden rounded-2xl border bg-white text-left align-middle shadow-xl transition-all dark:bg-black">
                  <div className="flex h-full">
                    <div className="relative h-full w-[65vw] grow border-r bg-black p-4">
                      <div className="flex h-full items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          className="mx-auto max-h-full max-w-full rounded-lg"
                          src={`${selectedImage?.fullsize}`}
                          alt={selectedImage?.alt}
                        />
                      </div>

                      {selectedImage?.alt ? (
                        <div className="absolute bottom-0 left-0 flex w-full items-center space-x-2 bg-black bg-opacity-60 p-4 text-sm text-white">
                          <div className="rounded-md bg-zinc-900 px-2 py-1 text-sm font-semibold leading-none text-white">
                            ALT
                          </div>
                          <div>{selectedImage.alt}</div>
                        </div>
                      ) : null}

                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()

                          setOpenModal(false)
                        }}
                        className="absolute left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-white"
                      >
                        <XIcon className="h-5 w-5 stroke-2" />
                      </button>

                      {isMultiple ? (
                        <>
                          {selected === 0 ? null : (
                            <button
                              onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()

                                setSelected(selected - 1)
                              }}
                              className="absolute left-6 top-1/2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black bg-opacity-50 text-white"
                            >
                              <ArrowLeft className="h-4 w-4 stroke-2" />
                            </button>
                          )}

                          {selected === totalImages - 1 ? null : (
                            <button
                              onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()

                                setSelected(selected + 1)
                              }}
                              className="absolute right-6 top-1/2 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-black bg-opacity-50 text-white"
                            >
                              <ArrowRight className="h-4 w-4 stroke-2" />
                            </button>
                          )}
                        </>
                      ) : null}
                    </div>

                    <div className="h-full w-[550px] overflow-scroll p-4">
                      {hasParent ? (
                        <div className="-mx-4 mb-4 border-b p-4">
                          {/*@ts-ignore*/}
                          <Post
                            {...({
                              post: parent,
                              ...(parentReply ? { reply: { parent: parentReply } } : null),
                            } as FeedViewPost)}
                          />
                        </div>
                      ) : null}

                      {parent ? (
                        <div className="mb-1 flex space-x-4">
                          <div className="w-14" />

                          <div className="flex items-center space-x-1 text-xs text-zinc-500">
                            <ChatBubbleEmpty className="h-3 w-3 stroke-2 text-zinc-500" />
                            <div>Replying to @{parent?.author?.handle}</div>
                          </div>
                        </div>
                      ) : null}

                      {/* @ts-ignore */}
                      {data?.thread?.post ? <Post {...{ post: data.thread.post }} hideImages /> : null}

                      <div className="-mx-4 my-6 border-t" />

                      {isLoading ? (
                        <PostSkeleton bordered={false} />
                      ) : (
                        <div>
                          <Compose reply={{ root: replyRef, parent: replyRef }} />

                          {/* @ts-ignore */}
                          {data?.thread?.replies?.length ? (
                            <div className="-mx-4">
                              {/* @ts-ignore */}
                              {data?.thread.replies.map(reply => (
                                <div key={reply.id} className="border-b px-8 py-6 last:border-none">
                                  <div className="mb-1 flex space-x-4">
                                    <div className="w-14" />

                                    <div className="flex items-center space-x-1 text-xs text-zinc-500">
                                      <ChatBubbleEmpty className="h-3 w-3 stroke-2 text-zinc-500" />
                                      {/* @ts-ignore */}
                                      <div>Replying to @{post?.author?.handle}</div>
                                    </div>
                                  </div>
                                  <Post {...{ post: reply.post }} isReply />
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      )}
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
