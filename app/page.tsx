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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* 1. YouTube Header Banner, Profile Avatar & Bricolage Grotesque Hero */}
      <CreatorBannerHero />

      {/* 2. Structured Studio Equipment Checklist */}
      <CreatorChecklist />

      {/* 3. Boutique Product Showcase with Verified Amazon Media */}
      <ProductFilters initialProducts={products} />

      {/* 4. Creator Channels & Community Embeds (YouTube, Instagram, WhatsApp) */}
      <CommunitySection />
    </div>
  )
}
