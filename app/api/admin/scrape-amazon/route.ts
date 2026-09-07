import { NextRequest, NextResponse } from 'next/server'

// Rotating realistic browser User-Agents
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
]

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// Clean and standardize the title fetched from Amazon
function sanitizeTitle(rawTitle: string): string {
  let title = rawTitle
    .replace(/^Amazon\.in\s*:\s*Buy\s+/i, '')
    .replace(/^Buy\s+/i, '')
    .replace(/\s*Online at Low Prices in India\s*-\s*Amazon\.in/i, '')
    .replace(/\s*Online at Low Prices in India\s*\|\s*Amazon\.in.*$/i, '')
    .replace(/\s*\|\s*Amkette.*$/i, '')
    .replace(/\s*:\s*Amazon\.in:\s*.+$/i, '')
    .replace(/\s*-\s*Amazon\.in$/i, '')
    .replace(/\s*\|\s*Amazon\.in$/i, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

  // Truncate gracefully if excessively long
  if (title.length > 120) {
    const cut = title.slice(0, 115)
    const lastSpace = cut.lastIndexOf(' ')
    title = (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + '...'
  }
  return title
}

// Helper to extract clean human-readable title from URL path slug
function extractTitleFromUrlSlug(url: string): string {
  try {
    const parsed = new URL(url)
    const slugMatch = parsed.pathname.match(/\/([^/]+)\/(?:dp|gp\/product)\//i)
    if (slugMatch && slugMatch[1]) {
      const decoded = decodeURIComponent(slugMatch[1])
        .replace(/[-_+]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (decoded.length > 3 && !/^(dp|gp|product)$/i.test(decoded)) {
        return sanitizeTitle(decoded)
      }
    }
  } catch {}
  return ''
}

// Helper to extract Amazon ASIN
function extractAsin(url: string): string | null {
  const match = url.match(/(?:dp|gp\/product|\/d\/)\/([A-Z0-9]{10})/i)
  return match ? match[1].toUpperCase() : null
}

// Recommend standard creator category based on title keywords
function detectCategory(title: string): string {
  const t = title.toLowerCase()
  if (
    t.includes('tripod') ||
    t.includes('monopod') ||
    t.includes('fluid head') ||
    t.includes('gorillapod') ||
    t.includes('ball head')
  ) {
    return 'Camera Tripod'
  }
  if (
    t.includes('camera') ||
    t.includes('camcorder') ||
    t.includes('alpha') ||
    t.includes('zv-e') ||
    t.includes('dslr') ||
    t.includes('mirrorless') ||
    t.includes('lumix') ||
    t.includes('eos') ||
    t.includes('gopro') ||
    t.includes('insta360')
  ) {
    return 'Camera'
  }
  if (
    t.includes('mic') ||
    t.includes('microphone') ||
    t.includes('audio') ||
    t.includes('wireless go') ||
    t.includes('rode') ||
    t.includes('hollyland') ||
    t.includes('shure') ||
    t.includes('boya') ||
    t.includes('synco')
  ) {
    return 'Microphone'
  }
  if (
    t.includes('light') ||
    t.includes('led') ||
    t.includes('softbox') ||
    t.includes('godox') ||
    t.includes('aputure') ||
    t.includes('amaran') ||
    t.includes('ring light') ||
    t.includes('diffuser')
  ) {
    return 'Lighting'
  }
  if (
    t.includes('sd card') ||
    t.includes('sandisk') ||
    t.includes('hard drive') ||
    t.includes('ssd') ||
    t.includes('storage') ||
    t.includes('memory card') ||
    t.includes('pendrive')
  ) {
    return 'Storage'
  }
  return 'Accessories'
}

function isBotBlockTitle(titleText: string): boolean {
  const lower = titleText.toLowerCase()
  return (
    lower.includes('503') ||
    lower.includes('service unavailable') ||
    lower.includes('robot check') ||
    lower.includes('amazon captcha') ||
    lower.includes('blocked')
  )
}

// Recursively unwrap short redirect links (link.amazon, amzlinks.in, amzn.to)
async function resolveFinalAmazonUrl(url: string, depth = 0): Promise<string> {
  if (depth > 5) return url
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
      redirect: 'manual',
    })

    const loc = res.headers.get('location')
    if (loc && [301, 302, 303, 307, 308].includes(res.status)) {
      const nextUrl = loc.startsWith('http') ? loc : new URL(loc, url).toString()
      return resolveFinalAmazonUrl(nextUrl, depth + 1)
    }
    return url
  } catch {
    return url
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid Amazon URL is required' }, { status: 400 })
    }

    const trimmedUrl = url.trim()
    const isAmazon =
      trimmedUrl.includes('amazon.in') ||
      trimmedUrl.includes('amazon.com') ||
      trimmedUrl.includes('link.amazon') ||
      trimmedUrl.includes('amzn.to') ||
      trimmedUrl.includes('amzlinks.in')

    if (!isAmazon) {
      return NextResponse.json(
        { error: 'URL must be a valid Amazon or link.amazon address' },
        { status: 400 }
      )
    }

    // 1. Resolve shortened links (e.g. link.amazon -> amzlinks.in -> full amazon product url)
    const resolvedUrl = await resolveFinalAmazonUrl(trimmedUrl)
    let asin = extractAsin(resolvedUrl) || extractAsin(trimmedUrl)
    const fallbackTitleFromSlug = extractTitleFromUrlSlug(resolvedUrl) || extractTitleFromUrlSlug(trimmedUrl)

    // 2. Build target URL: Always prioritize clean /dp/{ASIN} to avoid tracking token CAPTCHA triggers
    const targetFetchUrl = asin ? `https://www.amazon.in/dp/${asin}` : resolvedUrl

    let body = ''
    try {
      const response = await fetch(targetFetchUrl, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-IN,en;q=0.9',
          'Referer': 'https://www.google.com/',
          'Cache-Control': 'no-cache',
        },
        redirect: 'follow',
      })
      body = await response.text()
    } catch (err: any) {
      console.warn('Scraper fetch error:', err.message)
    }

    // 3. Extract Product Title
    let title = ''
    const h1TitleMatch = body.match(/<span\s+id=["']productTitle["'][^>]*>([^<]+)<\/span>/i)
    if (h1TitleMatch && h1TitleMatch[1]) {
      const candidate = sanitizeTitle(h1TitleMatch[1].trim())
      if (!isBotBlockTitle(candidate)) {
        title = candidate
      }
    }

    if (!title) {
      const titleMatch = body.match(/<title>([^<]+)<\/title>/i)
      if (titleMatch && titleMatch[1]) {
        const candidate = sanitizeTitle(titleMatch[1])
        if (!isBotBlockTitle(candidate)) {
          title = candidate
        }
      }
    }

    if (!title && fallbackTitleFromSlug) {
      title = fallbackTitleFromSlug
    }

    // 4. Extract High-Res Product Image
    let imageUrl = ''

    // Pattern A: "hiRes":"https://m.media-amazon.com/images/I/..."
    const hiResMatch = body.match(/"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i)
    if (hiResMatch && hiResMatch[1]) {
      imageUrl = hiResMatch[1]
    }

    // Pattern B: landingImage with data-old-hires
    if (!imageUrl) {
      const landingHiRes =
        body.match(/id=["']landingImage["'][^>]*data-old-hires=["']([^"']+)["']/i) ||
        body.match(/data-old-hires=["']([^"']+)["'][^>]*id=["']landingImage["']/i)
      if (landingHiRes && landingHiRes[1] && !landingHiRes[1].includes('grey-pixel')) {
        imageUrl = landingHiRes[1]
      }
    }

    // Pattern C: landingImage regular src
    if (!imageUrl) {
      const landingSrc = body.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/i)
      if (landingSrc && landingSrc[1] && !landingSrc[1].includes('grey-pixel')) {
        imageUrl = landingSrc[1]
      }
    }

    // Pattern D: "large":"https://m.media-amazon.com/images/I/..."
    if (!imageUrl) {
      const largeMatch = body.match(/"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i)
      if (largeMatch && largeMatch[1]) {
        imageUrl = largeMatch[1]
      }
    }

    // Pattern E: Dynamic data-a-dynamic-image JSON
    if (!imageUrl) {
      const dynImg = body.match(/data-a-dynamic-image=["'](\{.+?\})["']/)
      if (dynImg && dynImg[1]) {
        try {
          const unescaped = dynImg[1].replace(/&quot;/g, '"')
          const parsed = JSON.parse(unescaped)
          const keys = Object.keys(parsed)
          if (keys.length > 0) {
            imageUrl = keys[0]
          }
        } catch {}
      }
    }

    // Pattern F: OpenGraph image
    if (!imageUrl) {
      const ogImg =
        body.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        body.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)
      if (ogImg && ogImg[1] && !ogImg[1].includes('amazon_logo')) {
        imageUrl = ogImg[1]
      }
    }

    // Pattern G: Any high-res media-amazon product image in the HTML
    if (!imageUrl) {
      const allMedia = body.match(/https:\/\/m\.media-amazon\.com\/images\/I\/[A-Za-z0-9+_%-]+\.(?:jpg|png)/gi)
      if (allMedia && allMedia.length > 0) {
        const valid = allMedia.filter(u => !u.includes('icon') && !u.includes('badge') && !u.includes('logo'))
        if (valid.length > 0) {
          imageUrl = valid[0]
        }
      }
    }

    // 5. Extract Price
    let price: number | null = null

    // Match A: corePriceDisplay or a-price-whole
    const priceWholeMatch =
      body.match(/id=["']corePriceDisplay_desktop_feature_div["'][\s\S]+?class=["']a-price-whole["']>([0-9,]+)/i) ||
      body.match(/id=["']corePrice_feature_div["'][\s\S]+?class=["']a-price-whole["']>([0-9,]+)/i) ||
      body.match(/class=["']a-price-whole["']>([0-9,]+)(?:<span|\.)/i)

    if (priceWholeMatch && priceWholeMatch[1]) {
      const cleanPrice = priceWholeMatch[1].replace(/,/g, '').trim()
      const parsed = parseInt(cleanPrice, 10)
      if (!isNaN(parsed) && parsed > 0) {
        price = parsed
      }
    }

    // Match B: offscreen price
    if (!price) {
      const offscreenMatches = body.match(/class=["']a-offscreen["']>₹?([0-9,]+(?:\.[0-9]{2})?)/gi)
      if (offscreenMatches && offscreenMatches.length > 0) {
        for (const m of offscreenMatches) {
          const numMatch = m.match(/₹?([0-9,]+)/)
          if (numMatch && numMatch[1]) {
            const p = parseInt(numMatch[1].replace(/,/g, ''), 10)
            if (p > 0) {
              price = p
              break
            }
          }
        }
      }
    }

    // Suggested Slug
    const suggestedSlug = title
      ? title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 45)
      : asin
      ? `product-${asin.toLowerCase()}`
      : ''

    const suggestedCategory = detectCategory(title || fallbackTitleFromSlug || '')

    return NextResponse.json({
      success: true,
      data: {
        title,
        price,
        image_url: imageUrl,
        slug: suggestedSlug,
        category: suggestedCategory,
        asin,
        final_url: resolvedUrl,
      },
    })
  } catch (error: any) {
    console.error('Amazon auto-fetch route error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal error while fetching Amazon data' },
      { status: 500 }
    )
  }
}
