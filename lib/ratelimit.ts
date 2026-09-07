import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const isProd = process.env.NODE_ENV === 'production'
const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

export const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// 1. Per-IP + Slug Rate Limiter: max 20 requests per minute
const ipSlugLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      prefix: 'rl:ip_slug',
      analytics: true,
    })
  : null

// 2. Global Per-Slug Rate Limiter: max 120 requests per minute across all IPs
const globalSlugLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(120, '60 s'),
      prefix: 'rl:global_slug',
      analytics: true,
    })
  : null

// In-memory store used only during local development / testing when Redis credentials are not provided
const inMemoryStore = new Map<string, number[]>()

function checkInMemory(identifier: string, limit: number, windowMs = 60000): boolean {
  const now = Date.now()
  const timestamps = inMemoryStore.get(identifier) || []
  const valid = timestamps.filter(t => now - t < windowMs)

  if (valid.length >= limit) {
    return false
  }

  valid.push(now)
  inMemoryStore.set(identifier, valid)
  return true
}

export async function checkRateLimit(
  ip: string,
  slug: string
): Promise<{ success: boolean; reason?: string }> {
  const identifier = `${ip}:${slug}`

  // In production, require Upstash Redis and fail closed
  if (isProd || redis) {
    if (!redis || !ipSlugLimiter || !globalSlugLimiter) {
      console.error('Production Rate Limiting Error: Upstash Redis is missing or unconfigured. Failing closed.')
      return { success: false, reason: 'rate_limiter_unavailable' }
    }

    try {
      // 1. Check IP + slug limit
      const ipResult = await ipSlugLimiter.limit(identifier)
      if (!ipResult.success) {
        return { success: false, reason: 'ip_rate_limit_exceeded' }
      }

      // 2. Check secondary global slug limit to catch distributed scraping
      const globalResult = await globalSlugLimiter.limit(`slug:${slug}`)
      if (!globalResult.success) {
        return { success: false, reason: 'global_rate_limit_exceeded' }
      }

      return { success: true }
    } catch (err) {
      console.error('Upstash Redis error during rate limiting:', err)
      // Production must fail closed on Redis connection failure
      if (isProd) {
        return { success: false, reason: 'redis_unreachable' }
      }
    }
  }

  // Development / test fallback
  const ipAllowed = checkInMemory(identifier, 20, 60000)
  const globalAllowed = checkInMemory(`global:${slug}`, 120, 60000)

  return {
    success: ipAllowed && globalAllowed,
    reason: !ipAllowed ? 'ip_rate_limit_exceeded' : !globalAllowed ? 'global_rate_limit_exceeded' : undefined,
  }
}

