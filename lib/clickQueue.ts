import { redis } from '@/lib/ratelimit'
import { createAdminClient } from '@/lib/supabase/server'

export interface ClickEvent {
  product_id: string
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  device: string
  country: string | null
  is_bot: boolean
  clicked_at?: string
  visitor_id?: string | null
}

const CLICK_QUEUE_KEY = 'queue:clicks'
const BATCH_SIZE = 10

/**
 * Record click event in real-time.
 * If Redis is configured, pushes to queue; also writes directly to Supabase
 * so analytics update instantly in real-time.
 */
export async function queueClick(click: ClickEvent) {
  click.clicked_at = click.clicked_at || new Date().toISOString()

  try {
    const supabase = createAdminClient()
    if (supabase) {
      // Direct real-time write
      await supabase.from('clicks').insert({
        product_id: click.product_id,
        referrer: click.referrer,
        utm_source: click.utm_source,
        utm_medium: click.utm_medium,
        utm_campaign: click.utm_campaign,
        device: click.device,
        country: click.country,
        is_bot: click.is_bot,
        clicked_at: click.clicked_at,
      })
      return
    }
  } catch (err) {
    console.error('Direct click record error:', err)
  }

  // Redis fallback buffer if direct insert encountered issue
  if (redis) {
    try {
      await redis.rpush(CLICK_QUEUE_KEY, JSON.stringify(click))
    } catch (e) {
      console.warn('Redis click queue error:', e)
    }
  }
}

/**
 * Flush batched clicks from queue into Supabase table
 */
export async function flushClickBatch(): Promise<number> {
  const supabase = createAdminClient()
  if (!supabase || !redis) return 0

  try {
    const rawItems = await redis.lrange(CLICK_QUEUE_KEY, 0, BATCH_SIZE * 2 - 1)
    if (rawItems && rawItems.length > 0) {
      await redis.ltrim(CLICK_QUEUE_KEY, rawItems.length, -1)
      const itemsToInsert = rawItems
        .map(item => {
          try {
            return typeof item === 'string' ? JSON.parse(item) : item
          } catch {
            return null
          }
        })
        .filter(Boolean)

      if (itemsToInsert.length > 0) {
        const { error } = await supabase.from('clicks').insert(itemsToInsert)
        if (error) {
          console.error('Supabase batch insert error:', error)
          return 0
        }
        return itemsToInsert.length
      }
    }
  } catch (e) {
    console.error('Error popping click batch from Redis:', e)
  }

  return 0
}
