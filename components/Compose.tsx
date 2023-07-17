/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AppBskyFeedPost, PostRecord, RichText } from '@atproto/api'
import { ProfileView } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/feed/getTimeline'
import { ReplyRef } from '@atproto/api/dist/client/types/app/bsky/feed/post'
import { Dialog, Transition } from '@headlessui/react'
import { t } from '@lingui/macro'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Extension } from '@tiptap/core'
import CharacterCount from '@tiptap/extension-character-count'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { DotPulse } from '@uiball/loaders'
import clsx from 'clsx'
import { AddMediaImage, Bold, Italic, MediaImage, Sparks } from 'iconoir-react'
import { XIcon } from 'lucide-react'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { Fragment, useEffect, useState } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import { useDropzone } from 'react-dropzone'
import { FieldValues, useForm } from 'react-hook-form'
import TurndownService from 'turndown'
import { v4 } from 'uuid'

import { getProfile } from '@/api'
import suggestion from '@/helpers/suggestion'
import useSession from '@/hooks/useSession'
import agent from '@/lib/agent'
import { uploadAndEmbedImages } from '@/utils/uploadAndEmbedImages'

import OpenAI from './OpenAI'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from './ui/use-toast'

type Props = {
  reply?: ReplyRef
  embedRecord?: PostView
  onDone?: () => void
  autoFocus?: boolean
}

const turndownService = new TurndownService()

export default function Compose({ reply, embedRecord, onDone, autoFocus }: Props): JSX.Element {
  const { register, handleSubmit, getValues, reset, setValue, trigger } = useForm()
  const [previews, setPreviews] = useState<{ url: string; path?: string; alt?: string }[]>()
  const [fileModal, setFileModal] = useState<{ url: string; path?: string; alt?: string }>()
  const [altValue, setAltValue] = useState<string | undefined>()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 4,
    onDrop: files => {
      setPreviews([
        ...(previews ?? []),
        ...files.map(file =>
          Object.assign(file, {
            url: URL.createObjectURL(file),
          }),
        ),
      ])

      setValue('images', [...(getValues('images') ?? []), ...files])
      trigger('images')
    },
  })

  const { data: session } = useSession()
  const { data: profile } = useQuery(['profile'], () => getProfile(session?.handle as string), {
    enabled: !!session?.handle,
  })
  const { pathname, asPath } = useRouter()
  const [showUpload, setShowUpload] = useState(false)
  const [posting, setPosting] = useState(false)
  const [showOpenAi, setShowOpenAi] = useState(false)
  const queryClient = useQueryClient()
  const { resolvedTheme } = useTheme()

  const { mutate, isLoading } = useMutation({
    mutationFn: async function (data: Partial<PostRecord>) {
      const response = await (await agent()).post(data)

      return response
    },
    onMutate: async function (record) {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [asPath] })

      // Snapshot the previous value
      const previous = queryClient.getQueryData([asPath])

      // Optimistically update to the new value
      queryClient.setQueryData([asPath], data => {
        if (profile && !pathname.includes('/u/[handle]')) {
          return optimisticHomeFeed(data, record, profile)
        }
      })

      // Return a context object with the snapshotted value
      return { previous }
    },
    onSuccess: async function () {
      setValue('images', null)
      trigger('images')
      setValue('text', null)
      trigger('text')
      setShowUpload(false)
      setPosting(false)
      setPreviews(undefined)

      await queryClient.refetchQueries([asPath])
      onDone?.()
      reset()

      toast({
        title: t`Posted!`,
        description: reply ? t`Your reply has been posted!` : t`Your post has been posted!`,
      })
    },
    onError: function () {
      setPosting(false)
    },
    onSettled: function () {
      queryClient.invalidateQueries({ queryKey: [asPath] })
    },
  })

  async function onSubmit(values: FieldValues): Promise<void | boolean> {
    setPosting(true)
    const rt = new RichText({ text: values.text })
    await rt.detectFacets(await agent())

    const embed = values.images ? await uploadAndEmbedImages(values.images) : null

    // @ts-ignore
    const record: AppBskyFeedPost.Record = {
      $type: 'app.bsky.feed.post',
      text: rt.text ?? '',
      facets: rt.facets,
      createdAt: new Date().toISOString(),
      reply,
      ...(embed || embedRecord
        ? {
            embed: {
              ...(embed
                ? {
                    ...embed,
                    images: embed.images.map((e, index) => ({
                      ...e,
                      alt: previews?.[index]?.alt ?? '',
                    })),
                  }
                : null),
              ...(embedRecord
                ? {
                    $type: 'app.bsky.embed.record',
                    record: embedRecord,
                  }
                : null),
            },
          }
        : null),
    }

    try {
      mutate(record as Partial<PostRecord>)
    } catch (error) {
      // something is wrong
      toast({
        variant: 'destructive',
        title: t`Error`,
        description: `${error}`,
      })
      setPosting(false)
    }
  }

  // Rules to autofocus input
  function autofocus(): boolean | undefined {
    if ((!!reply && (pathname === '/hot' || pathname === '/')) || autoFocus) {
      return editor?.commands.focus()
    }
  }

  const editor = useEditor({
    enableInputRules: ['Bold', 'Italic'],
    // editable: !isLoading,
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: 300,
      }),
      Extension.create({
        addKeyboardShortcuts() {
          return {
            'Cmd-Enter'({ editor }) {
              handleSubmit(onSubmit)()
              editor.commands.clearContent()
              return true
            },
            'Ctrl-Enter'({ editor }) {
              handleSubmit(onSubmit)()
              editor.commands.clearContent()
              return true
            },
          }
        },
      }),
      Placeholder.configure({
        placeholder: reply ? t`Type your reply` : t`What's going on?`,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        // @ts-ignore
        suggestion,
      }),
    ],
    editorProps: {
      attributes: {
        class: `outline-none p-3 ${reply ? 'text-sm' : ''}`,
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getHTML()

      setValue('text', turndownService.turndown(text))
      trigger('text')
    },
  })

  useEffect(() => {
    addEventListener('paste', async event => {
      const transfer = event.clipboardData

      if (!transfer) return

      const hasImages = Object.values(transfer.items).filter(item => item.type.includes('image'))?.length

      if (hasImages === 0) return

      setShowUpload(true)

      const files: { url: string }[] = []

      Object.values(transfer.items).map(item => {
        const file = item.getAsFile()

        if (!file) return

        const o = Object.assign(file, {
          url: URL.createObjectURL(file),
        })

        // @ts-ignore
        files.push(o)
      })

      // @ts-ignore
      setPreviews([...(previews ?? []), ...files])
      setValue('images', files)
      trigger('images')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!editor) return

    autofocus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor])

  if (!editor) return <></>

  return (
    <div className="relative rounded-lg border p-1 focus-within:border-brand-500 focus-within:ring-brand-50 dark:focus-within:ring-brand-50 dark:focus-within:ring-opacity-10">
      <form onSubmit={handleSubmit(onSubmit)}>
        <EditorContent
          // @ts-ignore
          editor={editor}
          {...register('text')}
        />

        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={clsx('flex h-7 w-7 items-center justify-center rounded-md', {
                'bg-brand-500 text-white': editor?.isActive('bold'),
                'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800': !editor?.isActive('bold'),
              })}
            >
              <Bold className="h-4 w-4 stroke-2" />
            </button>

            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={clsx('flex h-7 w-7 items-center justify-center rounded-md', {
                'bg-brand-500 text-white': editor?.isActive('italic'),
                'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800': !editor?.isActive('italic'),
              })}
            >
              <Italic className="h-4 w-4 stroke-2" />
            </button>

            <button
              className={clsx('flex h-7 w-7 items-center justify-center rounded-md', {
                'bg-brand-500 text-white': showUpload,
                'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800': !showUpload,
              })}
              type="button"
              onClick={() => setShowUpload(!showUpload)}
            >
              <MediaImage className="h-4 w-4 stroke-2" />
            </button>

            <button
              className={clsx('flex h-7 w-7 items-center justify-center rounded-md', {
                'bg-brand-500 text-white': showOpenAi,
                'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800': !showOpenAi,
              })}
              type="button"
              onClick={() => setShowOpenAi(!showOpenAi)}
            >
              <Sparks className="h-4 w-4 stroke-2" />
            </button>
          </div>

          <div className="flex h-9">
            <div>
              {isLoading || posting ? (
                <div className="flex items-center space-x-2 pt-2">
                  <DotPulse size={16} speed={1.3} color={resolvedTheme === 'dark' ? '#fff' : '#000'} />
                  <div className="text-sm font-medium">{t`Posting, please wait...`}</div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div
                    className={clsx('relative h-5 w-5', {
                      hidden: editor?.storage.characterCount.characters() === 0,
                    })}
                  >
                    <CircularProgressbar
                      strokeWidth={14}
                      value={(100 * editor?.storage.characterCount.characters()) / 300}
                      styles={{
                        path: {
                          stroke: 'var(--brand-500)',
                        },
                        trail: {
                          stroke: resolvedTheme === 'dark' ? '#444' : '#ddd',
                        },
                      }}
                      className="stroke-brand-500"
                    />
                  </div>

                  <Button
                    onClick={() => {
                      editor?.commands.clearContent()
                    }}
                    size="sm"
                  >
                    {reply ? t`Reply` : t`Skeet`}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {showUpload ? (
          <>
            <div
              {...getRootProps()}
              className={clsx(
                'm-2 cursor-pointer rounded-lg border p-8 text-center hover:border-zinc-300 dark:hover:border-zinc-600',
                {
                  'border-slate-500 ring-4 ring-slate-100 ring-opacity-80 dark:border-white dark:ring-white dark:ring-opacity-20':
                    isDragActive,
                },
              )}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center space-y-4 text-sm font-medium">
                <AddMediaImage className="h-6 w-6" />

                <div>
                  {isDragActive ? (
                    <>{t`Drop the files here ...`}</>
                  ) : (
                    <>{t`Drag 'n' drop some files here, or click to select files`}</>
                  )}
                </div>
              </div>
            </div>

            {previews?.length ? (
              <div className="m-2 grid grid-cols-2 gap-4">
                {previews.map((file, index) => {
                  return (
                    <div
                      key={index}
                      className="relative max-h-48 basis-1/2 overflow-hidden rounded-lg border hover:border-zinc-500"
                    >
                      <button
                        onClick={e => {
                          // Remove image from previews and from form state
                          setPreviews(previews.filter(a => a.url !== file.url))
                          setValue(
                            'images',
                            // @ts-ignore
                            getValues('images')?.filter(a => a.url !== file.url),
                          )
                          trigger('images')

                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700 text-white"
                      >
                        <XIcon className="h-4 w-4 stroke-2" />
                      </button>

                      <div className="h-full object-cover">
                        {/*eslint-disable-next-line @next/next/no-img-element*/}
                        <img className="w-full object-cover" src={file.url} alt={file.path} />
                      </div>

                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()

                          setFileModal(file)
                        }}
                        className="absolute bottom-1 right-1 z-10 flex rounded-full bg-zinc-700 px-3 py-1.5 text-sm font-medium leading-none text-white"
                      >
                        {t`Edit`}
                      </button>

                      {file.alt ? (
                        <div
                          title={file.alt}
                          className="absolute bottom-1 left-1 z-10 flex rounded-full bg-zinc-700 px-3 py-1.5 text-xs font-medium leading-none text-white"
                        >
                          ALT
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}
          </>
        ) : null}
      </form>

      {showOpenAi ? (
        <div className="absolute left-0 top-0 z-10 w-full">
          <OpenAI
            onDone={data => {
              setShowOpenAi(false)
              editor?.commands.setContent(data?.choices?.[0]?.text)
            }}
          />
        </div>
      ) : null}

      <Transition appear show={!!fileModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setFileModal(undefined)}>
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

          <div className="fixed inset-0 z-50 overflow-y-auto">
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
                  <div className="text-lg font-semibold">{t`Edit image`}</div>

                  {/*eslint-disable-next-line @next/next/no-img-element*/}
                  <img className="rounded-lg" src={fileModal?.url} alt={fileModal?.path} />

                  <Input
                    defaultValue={fileModal?.alt}
                    onChange={e => setAltValue(e.target.value)}
                    placeholder={t`Image alt / description`}
                  />

                  <Button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()

                      setPreviews(
                        previews?.map(a => {
                          if (a.path === fileModal?.path) {
                            return {
                              alt: altValue,
                              ...a,
                            }
                          }

                          return a
                        }),
                      )

                      trigger('images')
                      setAltValue(undefined)
                      setFileModal(undefined)
                    }}
                    className="w-full text-center"
                  >
                    {t`Save`}
                  </Button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function optimisticHomeFeed(data: any, record: any, profile: ProfileView): OutputSchema {
  return {
    ...data,
    pages: [
      {
        feed: [
          {
            post: {
              cid: v4(),
              author: profile,
              record,
              likeCount: 0,
              replyCount: 0,
              repostCount: 0,
              indexedAt: new Date(),
            },
          },
          // eslint-disable-next-line no-unsafe-optional-chaining
          ...data?.pages?.[0]?.feed,
        ],
        ...data?.pages,
      },
    ],
  }
}
