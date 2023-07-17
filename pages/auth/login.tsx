import { AtpAgentLoginOpts } from '@atproto/api'
import { Cancel, WarningCircle } from 'iconoir-react'
import { Space_Grotesk } from 'next/font/google'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { FieldValues, useForm } from 'react-hook-form'

import Logo from '@/components/Logo'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import agent from '@/lib/agent'

const font = Space_Grotesk({
  subsets: ['latin'],
  weight: ['600'],
})

export default function Login(): JSX.Element {
  const { push } = useRouter()
  const {
    formState: { errors },
    register,
    handleSubmit,
  } = useForm()
  const [networkError, setNetworkError] = useState(false)
  const [loading, setLoading] = useState(false)

  async function onSubmit(values: FieldValues): Promise<void | boolean> {
    setLoading(true)

    try {
      const { success } = await (await agent()).login(values as AtpAgentLoginOpts)

      if (success) {
        // Redirect to homepage
        return push('/')
      }
    } catch {
      setLoading(false)
      setNetworkError(true)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="grid-cols-2 items-center gap-12 space-y-24 px-12 xl:grid xl:w-3/5 xl:space-y-0 xl:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-8 rounded-lg border p-8 shadow-sm">
          <div className="flex items-center justify-start space-x-4 text-brand-500">
            <Logo className="h-10 w-10" />
            <div className="mt-1 text-2xl tracking-tighter" style={font.style}>
              Sunrise
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1">
              <Label htmlFor="identifier">Handle, Email or DID</Label>
              <Input {...register('identifier', { required: true })} placeholder="Handler" className="w-full" />

              {errors.identifier?.type === 'required' && (
                <div className="flex items-center space-x-1 rounded-md border border-red-500 px-2 py-1 text-xs leading-none text-red-500">
                  <Cancel />
                  <div>Handle, Email or DID is required</div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">App password</Label>
              <Input
                {...register('password', {
                  required: true,
                  pattern: /^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/,
                })}
                type="password"
                placeholder="xxxx-xxxx-xxxx-xxxx"
              />

              {errors.password?.type === 'required' && (
                <div className="flex items-center space-x-1 rounded-md border border-red-500 px-2 py-1 text-xs leading-none text-red-500">
                  <Cancel />
                  <div>Password is required</div>
                </div>
              )}

              {errors.password?.type === 'pattern' && (
                <div className="flex items-center space-x-1 rounded-md border border-red-500 px-2 py-1 text-xs leading-none text-red-500">
                  <Cancel />
                  <div>Password needs to match xxxx-xxxx-xxxx-xxxx</div>
                </div>
              )}
            </div>

            <div className="text-xs text-zinc-400 dark:text-zinc-500">
              You'll need to generate an{' '}
              <a
                href="https://atproto.com/specs/atp#app-passwords"
                target="_blank"
                className="underline"
                rel="noreferrer"
              >
                app password
              </a>{' '}
              in order to login into Sunrise, this is for your own security.
            </div>
          </div>

          {networkError ? (
            <Alert variant="destructive">
              <WarningCircle className="h-4 w-4" />
              <AlertTitle>Uh oh! Something went wrong</AlertTitle>
              <AlertDescription>
                We're having trouble connection with the AT protocol, we'll keep trying, hang tight!
              </AlertDescription>
            </Alert>
          ) : null}

          <Button disabled={loading} className="w-full">
            Login
          </Button>
        </form>

        <div className="flex-1 space-y-10">
          <div className="space-y-1">
            <div className="font-semibold">What is Sunrise?</div>
            <div className="text-sm text-zinc-500">
              Sunrise is a friendly web client for the{' '}
              <a href="https://atproto.com/" className="underline" target="_blank" rel="noreferrer">
                AT Protocol
              </a>
              , a networking technology created by{' '}
              <a href="https://blueskyweb.xyz/" target="_blank" className="underline" rel="noreferrer">
                Bluesky
              </a>{' '}
              to power the next generation of social applications.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold">Is Sunrise safe?</div>
            <div className="text-sm text-zinc-500">
              We don't storage anything in our services, believe it or not, we don't even use a database.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold">How does the login work then?</div>
            <div className="text-sm text-zinc-500">
              We make a request directly to Bsky, the only thing we store it's the session data, and even that, we store
              it on local storage, meaning it's only stored in your browser.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold">What about posts, likes, etc?</div>
            <div className="text-sm text-zinc-500">
              Every single bit of data shown on Sunrise comes from the Bsky services.
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-semibold">I don't have a Bluesky account, what now?</div>
            <div className="text-sm text-zinc-500">
              We advice to create your accounts on{' '}
              <a href="https://staging.bsky.app/" target="_blank" rel="noreferrer" className="underline">
                Bluesky
              </a>{' '}
              and then login on Sunrise.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
