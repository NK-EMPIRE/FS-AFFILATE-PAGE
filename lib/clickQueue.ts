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
}

const CLICK_QUEUE_KEY = 'queue:clicks'
const BATCH_SIZE = 20

// In-memory click queue fallback for development
const inMemoryClickQueue: ClickEvent[] = []

/**
 * Push click to high-speed Redis queue buffer
 */
export async function queueClick(click: ClickEvent) {
  click.clicked_at = click.clicked_at || new Date().toISOString()

  if (redis) {
    try {
      const queueLen = await redis.rpush(CLICK_QUEUE_KEY, JSON.stringify(click))
      // If queue hits batch threshold (20 records), flush immediately in background
      if (queueLen >= BATCH_SIZE) {
        flushClickBatch().catch(err => console.error('Auto flush error:', err))
      }
      return
    } catch (e) {
      console.warn('Redis click queue error, fallback to in-memory:', e)
    }
  }

  inMemoryClickQueue.push(click)
  if (inMemoryClickQueue.length >= BATCH_SIZE) {
    flushClickBatch().catch(err => console.error('In-memory flush error:', err))
  }
}

/**
 * Flush batched clicks from queue into Supabase table in a single bulk INSERT
 */
export async function flushClickBatch(): Promise<number> {
  const supabase = createAdminClient()
  if (!supabase) return 0

  let itemsToInsert: ClickEvent[] = []

  if (redis) {
    try {
      const rawItems = await redis.lrange(CLICK_QUEUE_KEY, 0, BATCH_SIZE * 2 - 1)
      if (rawItems && rawItems.length > 0) {
        await redis.ltrim(CLICK_QUEUE_KEY, rawItems.length, -1)
        itemsToInsert = rawItems
          .map(item => {
            try {
              return typeof item === 'string' ? JSON.parse(item) : item
            } catch {
              return null
            }
          })
          .filter(Boolean)
      }
    } catch (e) {
      console.error('Error popping click batch from Redis:', e)
    }
  } else {
    itemsToInsert = inMemoryClickQueue.splice(0, inMemoryClickQueue.length)
  }

  if (itemsToInsert.length === 0) return 0

  try {
    const { error } = await supabase.from('clicks').insert(itemsToInsert)
    if (error) {
      console.error('Supabase batch insert error:', error)
      return 0
    }
    return itemsToInsert.length
  } catch (err) {
    console.error('Failed to flush click batch to Supabase:', err)
    return 0
  }
}
