import { redis } from '@/lib/ratelimit'
import { createAdminClient } from '@/lib/supabase/server'

export interface CachedProduct {
  id: string
  amazon_url: string
  active: boolean
  slug: string
}

const CACHE_TTL_SECONDS = 300 // 5-minute TTL

// In-memory product cache fallback for local development
const inMemoryProductCache = new Map<string, { product: CachedProduct | null; expiresAt: number }>()

/**
 * Get product from Redis cache or fetch from Supabase and cache it
 */
export async function getCachedProduct(slug: string): Promise<CachedProduct | null> {
  const cacheKey = `product:slug:${slug}`

  if (redis) {
    try {
      const cached = await redis.get<CachedProduct>(cacheKey)
      if (cached) {
        return cached
      }
    } catch (e) {
      console.warn('Redis getCachedProduct error, falling back to DB:', e)
    }
  } else {
    const mem = inMemoryProductCache.get(slug)
    if (mem && mem.expiresAt > Date.now()) {
      return mem.product
    }
  }

  // Cache miss: fetch from Supabase
  const supabase = createAdminClient()
  if (!supabase) return null

  const { data: product, error } = await supabase
    .from('products')
    .select('id, amazon_url, active, slug')
    .eq('slug', slug)
    .single()

  if (error || !product) {
    return null
  }

  const cachedProduct: CachedProduct = {
    id: product.id,
    amazon_url: product.amazon_url,
    active: Boolean(product.active),
    slug: product.slug,
  }

  // Write to cache
  if (redis) {
    try {
      await redis.set(cacheKey, cachedProduct, { ex: CACHE_TTL_SECONDS })
    } catch (e) {
      console.warn('Redis set error for product cache:', e)
    }
  } else {
    inMemoryProductCache.set(slug, {
      product: cachedProduct,
      expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    })
  }

  return cachedProduct
}

/**
 * Invalidate cached product slug across Redis and in-memory cache
 */
export async function invalidateProductCache(slug?: string) {
  if (slug) {
    const cacheKey = `product:slug:${slug}`
    if (redis) {
      try {
        await redis.del(cacheKey)
      } catch (e) {
        console.warn('Redis cache invalidation error:', e)
      }
    }
    inMemoryProductCache.delete(slug)
  }
}
