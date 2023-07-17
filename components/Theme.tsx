import { t } from '@lingui/macro'
import { Check } from 'iconoir-react'
import { Paintbrush2 } from 'lucide-react'
import { useState } from 'react'
import colors from 'tailwindcss/colors'

import { ThemeColors } from '@/constants/Themes'

export default function Themes(): JSX.Element {
  const onLoadTheme = typeof localStorage !== 'undefined' && localStorage.getItem('CURRENT_THEME')
  const [selectedTheme] = useState(onLoadTheme || 'rose')

  return (
    <div className="space-y-6 rounded-lg border p-6">
      <div className="flex items-center space-x-2">
        <Paintbrush2 className="h-6 w-6 stroke-[1.5px]" />
        <div className="font-medium">{t`Theme`}</div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {Object.keys(ThemeColors).map(key => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const color = colors[key][500]

          return (
            <button
              onClick={() => {
                localStorage.setItem('CURRENT_THEME', key)
                window.location.reload()
              }}
              key={key}
              className="flex items-center space-x-2 text-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: color }}>
                {selectedTheme === key ? <Check className="h-4 w-4 stroke-2 text-white" /> : null}
              </div>
              <div className="capitalize">{key}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
