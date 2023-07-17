import '@/styles/globals.css'
import 'filepond/dist/filepond.min.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import 'react-circular-progressbar/dist/styles.css'

import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import { I18nProvider } from '@lingui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'

import { Toaster } from '@/components/ui/toaster'
import { toast } from '@/components/ui/use-toast'
import { ThemeColors } from '@/constants/Themes'
import Layout from '@/containers/Layout'
import { initLocale } from '@/utils/i18n'

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  const onLoadTheme = typeof localStorage !== 'undefined' && localStorage.getItem('CURRENT_THEME')
  const [cssVars, setCssVars] = useState()
  const [networkError, setNetworkError] = useState(false)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        onError: function () {
          if (networkError) return

          toast({
            title: t`Uh oh! Something went wrong`,
            description: t`We're having some trouble connection with the AT API, we'll keep trying, hang tight!`,
            variant: 'destructive',
            duration: 60000,
          })

          setNetworkError(true)
        },
        onSuccess: function () {
          setNetworkError(false)
        },
      },
    },
  })

  useEffect(() => {
    initLocale()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    setCssVars(ThemeColors[onLoadTheme ?? 'rose'])

    // Check content languages
    if (typeof localStorage !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const hasContentLanguages = JSON.parse(localStorage.getItem('CONTENT_LANGUAGES'))

      if (hasContentLanguages && hasContentLanguages.length) return

      localStorage.setItem('CONTENT_LANGUAGES', JSON.stringify([]))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Head>
        <title>Sunrise</title>

        <meta name="description" content="Your friendly Bluesky web client" />
        <meta property="og:url" content="https://sunrise.li" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Sunrise ∙ Your friendly Bluesky web client" />
        <meta property="og:description" content="Your friendly Bluesky web client" />
        <meta property="og:image" content="https://sunrise.li/api/og" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="sunrise.li" />
        <meta property="twitter:url" content="https://sunrise.li" />
        <meta name="twitter:title" content="Sunrise ∙ Your friendly Bluesky web client" />
        <meta name="twitter:description" content="Your friendly Bluesky web client" />
        <meta name="twitter:image" content="https://sunrise.li/api/og" />

        <link rel="icon" type="image/x-icon" href="/favicon.svg" />

        <style>{`
          :root {
            ${cssVars}
          }
        `}</style>
      </Head>

      <I18nProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider enableSystem attribute="class">
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>

          <Toaster />
          <ReactQueryDevtools position="top-right" />
        </QueryClientProvider>
      </I18nProvider>

      <Analytics />
    </>
  )
}
