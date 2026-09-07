import { PostHog } from 'posthog-node'

export function getPostHogClient() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

  if (!apiKey) {
    return null
  }

  return new PostHog(apiKey, {
    host,
    flushAt: 1,
    flushInterval: 0,
  })
}
