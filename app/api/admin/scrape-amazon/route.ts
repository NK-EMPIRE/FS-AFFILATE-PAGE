import { NextRequest, NextResponse } from 'next/server'
import https from 'https'
import http from 'http'

// Helper to follow HTTP 301/302 redirects up to maxDepth
function followRedirects(url: string, depth = 0): Promise<{ statusCode: number; finalUrl: string; body: string }> {
  return new Promise((resolve, reject) => {
    if (depth > 6) {
      return resolve({ statusCode: 400, finalUrl: url, body: '' })
    }

    try {
      const client = url.startsWith('https') ? https : http
      const req = client.get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept':
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
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

          let body = ''
          res.setEncoding('utf8')
          res.on('data', chunk => {
            body += chunk
          })
          res.on('end', () => {
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
    .replace(/^Buy\s+/i, '')
    .replace(/\s*Online at Low Prices in India\s*-\s*Amazon\.in/i, '')
    .replace(/\s*:\s*Amazon\.in:\s*.+$/i, '')
    .replace(/\s*-\s*Amazon\.in$/i, '')
    .replace(/\s*\|\s*Amazon\.in$/i, '')
    .trim()

  // If title is excessively long, truncate gracefully at a sensible word boundary
  if (title.length > 120) {
    const cut = title.slice(0, 115)
    const lastSpace = cut.lastIndexOf(' ')
    title = (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + '...'
  }
  return title
}

// Recommend standard creator category based on title keywords
function detectCategory(title: string): string {
  const t = title.toLowerCase()
  if (t.includes('camera') || t.includes('camcorder') || t.includes('alpha') || t.includes('zv-e') || t.includes('dslr') || t.includes('lumix') || t.includes('eos')) {
    return 'Camera'
  }
  if (t.includes('mic') || t.includes('microphone') || t.includes('audio') || t.includes('wireless go') || t.includes('rode') || t.includes('hollyland') || t.includes('shure')) {
    return 'Microphone'
  }
  if (t.includes('light') || t.includes('led') || t.includes('softbox') || t.includes('godox') || t.includes('aputure') || t.includes('amaran') || t.includes('ring light')) {
    return 'Lighting'
  }
  if (t.includes('tripod') || t.includes('stand') || t.includes('mount') || t.includes('arm') || t.includes('rig') || t.includes('gimbal')) {
    return 'Accessories'
  }
  if (t.includes('sd card') || t.includes('sandisk') || t.includes('battery') || t.includes('cable') || t.includes('memory card')) {
    return 'Storage & Power'
  }
  return 'Accessories'
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

    // Follow redirects and fetch final product page
    const result = await followRedirects(trimmedUrl)

    if (!result.body) {
      return NextResponse.json(
        { error: 'Failed to retrieve product details from Amazon' },
        { status: 502 }
      )
    }

    const body = result.body

    // 1. Extract Product Title
    let title = ''
    const titleMatch = body.match(/<title>([^<]+)<\/title>/i)
    if (titleMatch && titleMatch[1]) {
      title = sanitizeTitle(titleMatch[1])
    }
    const h1TitleMatch = body.match(/<span\s+id=["']productTitle["'][^>]*>([^<]+)<\/span>/i)
    if (h1TitleMatch && h1TitleMatch[1]) {
      title = sanitizeTitle(h1TitleMatch[1].trim())
    }

    // 2. Extract High-Res Product Image
    let imageUrl = ''
    // Try landingImage tag with high-res or regular src
    const landingHiRes =
      body.match(/id=["']landingImage["'][^>]*data-old-hires=["']([^"']+)["']/i) ||
      body.match(/data-old-hires=["']([^"']+)["'][^>]*id=["']landingImage["']/i)
    if (landingHiRes && landingHiRes[1]) {
      imageUrl = landingHiRes[1]
    } else {
      const landingSrc = body.match(/id=["']landingImage["'][^>]*src=["']([^"']+)["']/i)
      if (landingSrc && landingSrc[1]) {
        imageUrl = landingSrc[1]
      }
    }

    // Fallback to og:image if landingImage not matched
    if (!imageUrl) {
      const ogImg =
        body.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        body.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)
      if (ogImg && ogImg[1]) {
        imageUrl = ogImg[1]
      }
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
      : ''

    const suggestedCategory = detectCategory(title)

    return NextResponse.json({
      success: true,
      data: {
        title,
        price,
        image_url: imageUrl,
        slug: suggestedSlug,
        category: suggestedCategory,
        final_url: result.finalUrl,
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
