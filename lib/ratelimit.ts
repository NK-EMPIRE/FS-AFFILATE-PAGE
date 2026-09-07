import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const hasUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

export const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// High-capacity sliding window limiter: Supports massive creator viral spikes (up to 5,000 requests/minute per IP)
const ipLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5000, '60 s'),
      prefix: 'rl:ip',
      analytics: true,
    })
  : null

// In-memory sliding window fallback with high capacity (10,000 requests/minute)
const inMemoryStore = new Map<string, number[]>()

function checkInMemory(identifier: string, limit = 5000, windowMs = 60000): boolean {
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

/**
 * High-Scale Rate Limiter:
 * - Allows viral surges (10,000+ simultaneous viewers)
 * - Protects against extreme DDoS abuse without blocking legitimate shoppers
 * - Always fails OPEN in production if Redis is temporarily unreachable so real customer traffic is NEVER blocked
 */
export async function checkRateLimit(
  ip: string,
  slug: string
): Promise<{ success: boolean; reason?: string }> {
  const identifier = `visitor:${ip}`

  if (redis && ipLimiter) {
    try {
      const result = await ipLimiter.limit(identifier)
      if (!result.success) {
        return { success: false, reason: 'ip_rate_limit_exceeded' }
      }
      return { success: true }
    } catch (err) {
      console.warn('Rate limiter warning (failing open for high concurrency):', err)
      // Fail open: Never block buying customers during traffic surges if Redis has latency
      return { success: true }
    }
  }

  // Fast in-memory check with generous limit
  const isAllowed = checkInMemory(identifier, 5000, 60000)
  return {
    success: isAllowed,
    reason: isAllowed ? undefined : 'ip_rate_limit_exceeded',
  }
}
