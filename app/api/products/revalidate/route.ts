import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { invalidateProductCache } from '@/lib/productCache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug } = body

    if (slug) {
      await invalidateProductCache(slug)
    }

    // Revalidate public storefront ISR cache
    revalidatePath('/')
    revalidatePath('/sitemap.xml')

    return NextResponse.json({ revalidated: true, slug: slug || null })
  } catch (e: any) {
    return NextResponse.json({ revalidated: false, error: e?.message }, { status: 500 })
  }
}
