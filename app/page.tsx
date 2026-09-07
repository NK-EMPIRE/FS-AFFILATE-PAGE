import React from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import CreatorBannerHero from '@/components/CreatorBannerHero'
import CreatorChecklist from '@/components/CreatorChecklist'
import ProductFilters from '@/components/ProductFilters'
import CommunitySection from '@/components/CommunitySection'
import { Product } from '@/lib/types'
import { FALLBACK_PRODUCTS } from '@/lib/initialData'

// Incremental Static Regeneration (ISR) with 5-minute cache window
export const revalidate = 300

export default async function HomePage() {
  let products: Product[] = FALLBACK_PRODUCTS

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        products = data
      }
    }
  } catch (e) {
    console.warn('HomePage build-time / runtime warning (createAdminClient):', e)
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FirstSelfie Creator Studio Storefront',
    url: 'https://firstselfie.com',
    description: 'Creator equipment, 4K camera gear, lighting and studio production stack.',
    publisher: {
      '@type': 'Organization',
      name: 'FirstSelfie',
      logo: {
        '@type': 'ImageObject',
        url: 'https://firstselfie.com/logo-primary.png',
      },
      sameAs: [
        'https://www.youtube.com/@firstselfietamil',
        'https://www.instagram.com/firstselfie_tamil/',
        'https://whatsapp-community.firstselfie.in/',
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.slice(0, 15).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: p.title,
          image: p.image_url,
          description: p.description || p.title,
          offers: {
            '@type': 'Offer',
            price: p.price,
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
          },
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* 1. YouTube Header Banner, Profile Avatar & Bricolage Grotesque Hero */}
        <CreatorBannerHero />

        {/* 2. Boutique Product Showcase with Verified Amazon Media & Custom Filter Bar */}
        <ProductFilters initialProducts={products} />

        {/* 3. Creative Studio Equipment Checklist (Relocated seamlessly before community) */}
        <div id="checklist-section" className="pt-10 scroll-mt-24">
          <CreatorChecklist />
        </div>

        {/* 4. Creator Channels & Community Embeds (YouTube, Instagram, WhatsApp) */}
        <CommunitySection />
      </div>
    </>
  )
}
