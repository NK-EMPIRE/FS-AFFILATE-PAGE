import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// If Upstash credentials exist, use distributed Redis ratelimit.
// Otherwise, fallback to in-memory sliding window rate limiter for development reliability.

const inMemoryStore = new Map<string, number[]>()

function checkInMemoryRateLimit(identifier: string, limit = 20, windowMs = 60000): { success: boolean; reset: number } {
  const now = Date.now()
  const timestamps = inMemoryStore.get(identifier) || []
  const validTimestamps = timestamps.filter(t => now - t < windowMs)

  if (validTimestamps.length >= limit) {
    const oldest = validTimestamps[0]
    return { success: false, reset: oldest + windowMs }
  }

  validTimestamps.push(now)
  inMemoryStore.set(identifier, validTimestamps)
  return { success: true, reset: now + windowMs }
}

export async function checkRateLimit(ip: string, slug: string) {
  const identifier = `${ip}:${slug}`

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '60 s'),
        analytics: true,
      })
      const result = await ratelimit.limit(identifier)
      return { success: result.success }
    } catch (e) {
      console.warn('Upstash rate limiting failed, fallback to memory', e)
    }
  }

  return checkInMemoryRateLimit(identifier, 20, 60000)
}
