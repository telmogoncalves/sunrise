import { Preferences } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { OutputSchema } from '@atproto/api/dist/client/types/app/bsky/actor/getPreferences'
import { useQuery } from '@tanstack/react-query'

import agent from '@/lib/agent'

async function getData(): Promise<OutputSchema> {
  const { data } = await (await agent()).api.app.bsky.actor.getPreferences()

  return data
}

type ReturnType = {
  hideNsfw: boolean
  warnNsfw: boolean
}

export default function usePreferences(): ReturnType {
  const { data } = useQuery(['user-preferences'], getData)

  function getPreference(label: string): Preferences[number] | undefined {
    return data?.preferences?.find(p => p.label === label)
  }

  return {
    hideNsfw: getPreference('nsfw')?.visibility === 'hide',
    warnNsfw: getPreference('nsfw')?.visibility === 'warn',
  }
}
