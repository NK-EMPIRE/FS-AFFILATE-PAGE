import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gadgets.firstselfie.in'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/go/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
