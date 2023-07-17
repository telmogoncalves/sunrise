import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/actor/getPreferences'
import { t } from '@lingui/macro'
import { useQuery } from '@tanstack/react-query'
import { EyeAlt } from 'iconoir-react'

import Page from '@/components/Page'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.app.bsky.actor.getPreferences()

  return data
}

export default function Filtering(): JSX.Element {
  const { data, refetch, isLoading } = useQuery(['content-filtering'], getData)

  const preferences = [
    {
      label: 'nsfw',
      title: t`Explicit Sexual Images`,
      description: t`i.e. Pornography`,
      value: 'hide',
    },
    {
      label: 'nudity',
      title: t`Other Nudity`,
      description: t`Including non-sexual and artistic`,
      value: 'warn',
    },
    {
      label: 'suggestive',
      title: t`Sexually Suggestive`,
      description: t`Does not include nudity`,
      value: 'warn',
    },
    {
      label: 'gore',
      title: t`Violent / Bloody`,
      description: t`Gore, self-harm, torture`,
      value: 'warn',
    },
    {
      label: 'hate',
      title: t`Political Hate-Groups`,
      value: 'hide',
    },
    {
      label: 'spam',
      title: t`Spam`,
      description: t`Excessive unwanted interactions`,
      value: 'hide',
    },
    {
      label: 'impersonation',
      title: t`Impersonation`,
      description: t`Accounts falsely claiming to be people or orgs`,
      value: 'warn',
    },
  ]

  if (isLoading)
    return (
      <div className="px-12">
        <Page icon={EyeAlt} title={t`Content filtering`}>
          <div className="rounded-lg border">
            <PreferenceSkeleton />
            <PreferenceSkeleton />
            <PreferenceSkeleton />
            <PreferenceSkeleton />
            <PreferenceSkeleton />
          </div>
        </Page>
      </div>
    )

  return (
    <div className="px-12">
      <Page icon={EyeAlt} title={t`Content filtering`}>
        <div className="rounded-lg border">
          {preferences.map(pref => {
            const defaultValue = data?.preferences?.find(p => p.label === pref.label)?.visibility ?? pref.value

            return (
              <div key={pref.label} className="flex items-center border-b p-5 last:border-none">
                <div className="grow">
                  <div className="text-sm font-medium">{pref.title}</div>
                  <div className="text-sm text-zinc-500">{pref.description}</div>
                </div>

                <div>
                  <RadioGroup
                    onValueChange={async val => {
                      const [, value] = val.split('--')
                      const prefExists = data?.preferences?.find(p => p.label === pref.label)

                      await (
                        await agent()
                      ).api.app.bsky.actor.putPreferences({
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        preferences: prefExists
                          ? data?.preferences?.map(p => {
                              if (p.label === pref.label) {
                                return { ...p, visibility: value }
                              }

                              return p
                            })
                          : [
                              ...(data?.preferences ?? []),
                              {
                                $type: 'app.bsky.actor.defs#contentLabelPref',
                                label: pref.label,
                                visibility: value,
                              },
                            ],
                      })

                      toast({
                        title: t`Preferences`,
                        description: t`Changed "${pref.label}" to "${value}"`,
                      })

                      refetch?.()
                    }}
                    defaultValue={`${pref.label}--${defaultValue}`}
                    className="flex space-x-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={`${pref.label}--hide`} id={`${pref.label}--hide`} />
                      <Label htmlFor={`${pref.label}--hide`}>Hide</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={`${pref.label}--warn`} id={`${pref.label}--warn`} />
                      <Label htmlFor={`${pref.label}--warn`}>Warn</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={`${pref.label}--show`} id={`${pref.label}--show`} />
                      <Label htmlFor={`${pref.label}--show`}>Show</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )
          })}
        </div>
      </Page>
    </div>
  )
}

function PreferenceSkeleton(): JSX.Element {
  return (
    <div className="flex items-center justify-between border-b p-5 last:border-none">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-3 w-56 rounded-md" />
      </div>

      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-2 w-8 rounded-md" />
        </div>

        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-2 w-8 rounded-md" />
        </div>

        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-2 w-8 rounded-md" />
        </div>
      </div>
    </div>
  )
}
