import { redis } from '@/lib/ratelimit'
import { createAdminClient } from '@/lib/supabase/server'
import { FALLBACK_PRODUCTS } from '@/lib/initialData'

export interface CachedProduct {
  id: string
  amazon_url: string
  active: boolean
  slug: string
}

const CACHE_TTL_SECONDS = 3600 // 1-hour cache TTL

// Fast in-memory lookup table seeded with verified catalog
const inMemoryProductCache = new Map<string, { product: CachedProduct | null; expiresAt: number }>()

// Pre-populate memory cache from FALLBACK_PRODUCTS for instantaneous 0ms response
for (const p of FALLBACK_PRODUCTS) {
  inMemoryProductCache.set(p.slug, {
    product: {
      id: p.id || p.slug,
      amazon_url: p.amazon_url,
      active: p.active,
      slug: p.slug,
    },
    expiresAt: Date.now() + 24 * 3600 * 1000,
  })
}

/**
 * High-Scale Product Lookup:
 * 1. Checks fast in-memory map (0.01ms)
 * 2. Checks Upstash Redis if configured (10ms)
 * 3. Falls back to static catalog before hitting Supabase
 */
export async function getCachedProduct(slug: string): Promise<CachedProduct | null> {
  // 1. Instant in-memory check (handles 50,000+ req/sec)
  const mem = inMemoryProductCache.get(slug)
  if (mem && mem.expiresAt > Date.now() && mem.product) {
    return mem.product
  }

  // 2. Redis check
  const cacheKey = `product:slug:${slug}`
  if (redis) {
    try {
      const cached = await redis.get<CachedProduct>(cacheKey)
      if (cached) {
        // Refresh local memory cache
        inMemoryProductCache.set(slug, {
          product: cached,
          expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
        })
        return cached
      }
    } catch (e) {
      console.warn('Redis getCachedProduct error:', e)
    }
  }

  // 3. Fallback catalog check (prevents Supabase DB connection exhaustion during viral spikes)
  const fallback = FALLBACK_PRODUCTS.find(p => p.slug === slug)
  if (fallback) {
    const item: CachedProduct = {
      id: fallback.id || fallback.slug,
      amazon_url: fallback.amazon_url,
      active: fallback.active,
      slug: fallback.slug,
    }
    inMemoryProductCache.set(slug, {
      product: item,
      expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
    })
    return item
  }

  // 4. Live DB fetch as final fallback
  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: product } = await supabase
        .from('products')
        .select('id, amazon_url, active, slug')
        .eq('slug', slug)
        .single()

      if (product) {
        const cachedProduct: CachedProduct = {
          id: product.id,
          amazon_url: product.amazon_url,
          active: Boolean(product.active),
          slug: product.slug,
        }

        inMemoryProductCache.set(slug, {
          product: cachedProduct,
          expiresAt: Date.now() + CACHE_TTL_SECONDS * 1000,
        })
        return cachedProduct
      }
    }
  } catch (dbErr) {
    console.warn('Supabase getCachedProduct error:', dbErr)
  }

  return null
}

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
