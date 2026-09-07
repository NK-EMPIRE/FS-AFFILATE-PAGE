import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ratelimit'
import { getPostHogClient } from '@/lib/posthog'
import { SlugSchema } from '@/lib/types'

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

  // 2. Rate-limits by IP: max 20 requests/minute per IP+slug combo
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
  const rateLimitResult = await checkRateLimit(ip, slug)

  if (!rateLimitResult.success) {
    return new NextResponse('Too many requests', { status: 429, headers: { 'Content-Type': 'text/plain' } })
  }

  // 3. Look up product by slug using SERVER Supabase client
  const supabase = createAdminClient()
  if (!supabase) {
    return NextResponse.redirect(new URL('/?error=db_unavailable', request.url))
  }

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !product || !product.active) {
    return NextResponse.redirect(new URL('/?not_found=1', request.url))
  }

  // 4. Background non-blocking tracking writes:
  // a) Insert into "clicks" table
  const searchParams = request.nextUrl.searchParams
  const userAgent = request.headers.get('user-agent') || ''
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
  };

  // Fire-and-forget DB write
  (async () => {
    try {
      const { error: insertErr } = await supabase.from('clicks').insert(clickData)
      if (insertErr) console.error('Error logging click:', insertErr)
    } catch (err) {
      console.error('Click tracking error:', err)
    }
  })()

  // b) PostHog server capture
  const posthog = getPostHogClient()
  if (posthog) {
    try {
      posthog.capture({
        distinctId: ip,
        event: 'affiliate_click',
        properties: {
          product_id: product.id,
          slug: product.slug,
          price: product.price,
          category: product.category,
          device: clickData.device,
          country: clickData.country,
        },
      })
    } catch (e) {
      console.error('PostHog capture error:', e)
    }
  }

  // 5. Returns a 302 redirect to product.amazon_url immediately
  return NextResponse.redirect(product.amazon_url, { status: 302 })
}
