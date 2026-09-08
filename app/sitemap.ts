import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gadgets.firstselfie.in'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/disclosure`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ]

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: products } = await supabase
        .from('products')
        .select('slug, created_at')
        .eq('active', true)

      if (products && products.length > 0) {
        const productRoutes: MetadataRoute.Sitemap = (products as Array<{ slug: string; created_at?: string }>).map(p => ({
          url: `${baseUrl}/go/${p.slug}`,
          lastModified: p.created_at ? new Date(p.created_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))
        return [...staticRoutes, ...productRoutes]
      }
    }
  } catch (e) {
    console.warn('Error generating dynamic sitemap:', e)
  }

  return staticRoutes
}
