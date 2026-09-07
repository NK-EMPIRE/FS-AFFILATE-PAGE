import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/go/'],
    },
    sitemap: 'https://firstselfie.com/sitemap.xml',
  }
}
