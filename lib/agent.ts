import { AtpSessionData, AtpSessionEvent, BskyAgent } from '@atproto/api'

const at = new BskyAgent({
  service: 'https://bsky.social',
  persistSession: (evt: AtpSessionEvent, sess?: AtpSessionData) => {
    if (!sess) return

    // Get existing logged in accounts
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const loggedInAccounts = JSON.parse(localStorage.getItem('loggedInAccounts')) ?? []

    localStorage.setItem('sessionData', JSON.stringify(sess))

    if (!loggedInAccounts?.map((s: { did: string }) => s.did).includes(sess.did)) {
      localStorage.setItem('loggedInAccounts', JSON.stringify([...loggedInAccounts, sess]))
    }
  },
})

async function agent(): Promise<BskyAgent> {
  const sessionData = localStorage.getItem('sessionData')

  if (!sessionData || sessionData === 'undefined') {
    if (window.location.pathname !== '/auth/login') {
      window.location.assign('/auth/login')
    }

    return at
  }

  try {
    await at.resumeSession(JSON.parse(sessionData))
    localStorage.removeItem('NETWORK_ISSUES')
  } catch {
    // empty
  }

  return at
}

export default agent
