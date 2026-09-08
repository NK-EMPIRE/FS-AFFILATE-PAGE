import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/ratelimit'
import { getPostHogClient } from '@/lib/posthog'
import { SlugSchema } from '@/lib/types'
import { getCachedProduct } from '@/lib/productCache'
import { queueClick } from '@/lib/clickQueue'
import crypto from 'crypto'

// Known bot user-agent patterns for detection
const BOT_UA_REGEX = /(bot|spider|crawl|slurp|facebookexternalhit|whatsapp|telegrambot|twitterbot|slackbot|discordbot|bingbot|googlebot|yandex|duckduckbot|baiduspider|curl|wget|python-requests|postmanruntime|httpclient)/i

function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

function hashIp(ip: string): string {
  const salt = process.env.IP_SALT || 'firstselfie_analytics_salt'
  return crypto.createHash('sha256').update(`${ip}:${salt}`).digest('hex')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // 1. Zod validation: reject if slug doesn't match /^[a-z0-9-]+$/
  const slugValidation = SlugSchema.safeParse(slug)
  if (!slugValidation.success) {
    return NextResponse.redirect(new URL('/?not_found=invalid_slug', request.url))
  }

  // 2. Rate-limits: max 20 requests/minute per IP+slug, secondary global slug limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
  const rateLimitResult = await checkRateLimit(ip, slug)

  if (!rateLimitResult.success) {
    return new NextResponse('Too many requests', { status: 429, headers: { 'Content-Type': 'text/plain' } })
  }

  // 3. Lightweight Bot Detection:
  // - Honeypot param check: bots scraping links often submit dummy hidden query parameters like ?hp=1 or ?bot_trap=...
  // - User-Agent heuristic analysis
  const searchParams = request.nextUrl.searchParams
  const userAgent = request.headers.get('user-agent') || ''
  const hasHoneypotParam = Boolean(
    searchParams.get('hp') || searchParams.get('bot') || searchParams.get('utm_term') === 'trap'
  )
  const isBotUserAgent = !userAgent || BOT_UA_REGEX.test(userAgent)
  const isBot = hasHoneypotParam || isBotUserAgent

  // 4. Look up product using Upstash Redis Cache Layer (5-min TTL)
  const product = await getCachedProduct(slug)

  if (!product || !product.active) {
    return NextResponse.redirect(new URL('/?not_found=1', request.url))
  }

  // Defense in depth: validate amazon_url against expected pattern before redirecting
  const amazonUrlPattern = /^https:\/\/(www\.)?amazon\.[a-z.]+\/|^https:\/\/link\.amazon\//
  if (!amazonUrlPattern.test(product.amazon_url)) {
    console.error(`Security alert: invalid or manipulated destination URL for slug ${slug}:`, product.amazon_url)
    return NextResponse.redirect(new URL('/?error=invalid_destination', request.url))
  }

  // 5. Visitor Identification Cookie:
  // Detect returning users vs unique visitors using persistent 1-year cookie
  let visitorId = request.cookies.get('fs_vid')?.value
  const isNewVisitor = !visitorId
  if (!visitorId) {
    visitorId = crypto.randomUUID()
  }

  const referrer = request.headers.get('referer') || request.headers.get('referrer') || null
  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || null

  const clickData = {
    product_id: product.id,
    referrer,
    utm_source: searchParams.get('utm_source') || null,
    utm_medium: searchParams.get('utm_medium') || null,
    utm_campaign: searchParams.get('utm_campaign') || null,
    device: getDeviceType(userAgent),
    country,
    is_bot: isBot,
    visitor_id: visitorId,
  }

  // Real-time write to Supabase
  await queueClick(clickData)

  // 6. PostHog server capture with hashed IP
  if (!isBot) {
    const posthog = getPostHogClient()
    if (posthog) {
      try {
        const hashedDistinctId = visitorId || hashIp(ip)
        posthog.capture({
          distinctId: hashedDistinctId,
          event: 'affiliate_click',
          properties: {
            product_id: product.id,
            slug,
            device: clickData.device,
            country: clickData.country,
            is_new_visitor: isNewVisitor,
          },
        })
      } catch (e) {
        console.error('PostHog capture error:', e)
      }
    }
  }

  // 7. Returns 302 redirect with persistent visitor cookie
  const response = NextResponse.redirect(product.amazon_url, { status: 302 })
  response.cookies.set('fs_vid', visitorId, {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  return response
}


