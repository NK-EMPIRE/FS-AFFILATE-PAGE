import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import http from 'http'
import zlib from 'zlib'

// Rotating realistic User-Agents to prevent bot profiling
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
]

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

// Helper to follow HTTP 301/302 redirects up to maxDepth with decompression support
function followRedirects(url: string, depth = 0): Promise<{ statusCode: number; finalUrl: string; body: string }> {
  return new Promise((resolve, reject) => {
    if (depth > 6) {
      return resolve({ statusCode: 400, finalUrl: url, body: '' })
    }

    try {
      const client = url.startsWith('https') ? https : http
      const ua = getRandomUserAgent()
      const req = client.get(
        url,
        {
          headers: {
            'User-Agent': ua,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'Referer': 'https://www.google.com/',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Upgrade-Insecure-Requests': '1',
          },
        },
        res => {
          if (
            [301, 302, 303, 307, 308].includes(res.statusCode || 0) &&
            res.headers.location
          ) {
            const nextUrl = res.headers.location.startsWith('http')
              ? res.headers.location
              : new URL(res.headers.location, url).toString()
            return resolve(followRedirects(nextUrl, depth + 1))
          }

          const encoding = res.headers['content-encoding']
          let stream: NodeJS.ReadableStream = res

          if (encoding === 'gzip') {
            stream = res.pipe(zlib.createGunzip())
          } else if (encoding === 'deflate') {
            stream = res.pipe(zlib.createInflate())
          } else if (encoding === 'br') {
            stream = res.pipe(zlib.createBrotliDecompress())
          }

          let body = ''
          stream.setEncoding('utf8')
          stream.on('data', chunk => {
            body += chunk
          })
          stream.on('end', () => {
            resolve({
              statusCode: res.statusCode || 200,
              finalUrl: url,
              body,
            })
          })
          stream.on('error', () => {
            resolve({
              statusCode: res.statusCode || 200,
              finalUrl: url,
              body,
            })
          })
        }
      )

      req.on('error', err => {
        reject(err)
      })
      req.setTimeout(12000, () => {
        req.destroy(new Error('Request timed out'))
      })
    } catch (err) {
      reject(err)
    }
  })
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

  // If title is excessively long, truncate gracefully at a sensible word boundary
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
    // Matches /Amkette-Flow-Plus-Programmable-Web-Software/dp/B0GPCMS314
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
    t.includes('camera') ||
    t.includes('camcorder') ||
    t.includes('alpha') ||
    t.includes('zv-e') ||
    t.includes('dslr') ||
    t.includes('lumix') ||
    t.includes('eos')
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
    t.includes('shure')
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
    t.includes('ring light')
  ) {
    return 'Lighting'
  }
  if (
    t.includes('tripod') ||
    t.includes('stand') ||
    t.includes('mount') ||
    t.includes('arm') ||
    t.includes('rig') ||
    t.includes('gimbal')
  ) {
    return 'Accessories'
  }
  if (
    t.includes('sd card') ||
    t.includes('sandisk') ||
    t.includes('battery') ||
    t.includes('cable') ||
    t.includes('memory card')
  ) {
    return 'Storage & Power'
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

    // Follow redirects and fetch product page
    let finalUrl = trimmedUrl
    let body = ''
    try {
      const result = await followRedirects(trimmedUrl)
      finalUrl = result.finalUrl || trimmedUrl
      body = result.body || ''
    } catch (e: any) {
      console.warn('Redirect/Fetch warning, attempting fallback:', e.message)
    }

    const asin = extractAsin(finalUrl) || extractAsin(trimmedUrl)
    const fallbackTitleFromSlug = extractTitleFromUrlSlug(finalUrl) || extractTitleFromUrlSlug(trimmedUrl)

    // 1. Extract Product Title
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

    // Fallback: If Amazon gave a 503/anti-bot page or couldn't parse title, use the clean URL slug
    if (!title && fallbackTitleFromSlug) {
      title = fallbackTitleFromSlug
    }

    // 2. Extract High-Res Product Image
    let imageUrl = ''
    
    // Check landingImage high-res
    const landingHiRes =
      body.match(/id=["']landingImage["'][^>]*data-old-hires=["']([^"']+)["']/i) ||
      body.match(/data-old-hires=["']([^"']+)["'][^>]*id=["']landingImage["']/i)
    if (landingHiRes && landingHiRes[1] && !landingHiRes[1].includes('grey-pixel')) {
      imageUrl = landingHiRes[1]
    } else {
      const landingSrc = body.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/i)
      if (landingSrc && landingSrc[1] && !landingSrc[1].includes('grey-pixel')) {
        imageUrl = landingSrc[1]
      }
    }

    // Fallback 1: Dynamic colorImages JSON in script
    if (!imageUrl) {
      const colorImages = body.match(/'colorImages':\s*\{\s*'initial':\s*(\[[\s\S]+?\])\}/)
      if (colorImages && colorImages[1]) {
        try {
          const parsed = JSON.parse(colorImages[1])
          if (parsed[0] && (parsed[0].hiRes || parsed[0].large)) {
            imageUrl = parsed[0].hiRes || parsed[0].large
          }
        } catch {}
      }
    }

    // Fallback 2: OpenGraph Image
    if (!imageUrl) {
      const ogImg =
        body.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        body.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)
      if (ogImg && ogImg[1] && !ogImg[1].includes('amazon_logo')) {
        imageUrl = ogImg[1]
      }
    }

    // Fallback 3: Amazon Media CDN by ASIN if blocked or missing
    if (!imageUrl && asin) {
      imageUrl = `https://ws-eu.amazon-adsystem.com/widgets/q?_encoding=UTF8&ASIN=${asin}&Format=_SL500_&ID=AsinImage`
    }

    // 3. Extract Price
    let price: number | null = null
    const priceWholeMatch = body.match(/class=["']a-price-whole["']>([0-9,]+)(?:<span|\.)/i)
    if (priceWholeMatch && priceWholeMatch[1]) {
      const cleanPrice = priceWholeMatch[1].replace(/,/g, '').trim()
      price = parseInt(cleanPrice, 10)
    } else {
      const offscreenMatch = body.match(/class=["']a-offscreen["']>₹?([0-9,]+(?:\.[0-9]{2})?)/i)
      if (offscreenMatch && offscreenMatch[1]) {
        const cleanPrice = offscreenMatch[1].replace(/,/g, '').split('.')[0].trim()
        price = parseInt(cleanPrice, 10)
      }
    }

    // Auto-generate suggested slug
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
        final_url: finalUrl,
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
