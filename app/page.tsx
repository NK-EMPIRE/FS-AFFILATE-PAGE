import React from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import ProductFilters from '@/components/ProductFilters'
import { Product } from '@/lib/types'
import { Video, Award, Zap, ShieldCheck } from 'lucide-react'

// Incremental Static Regeneration (ISR) with 5-minute cache window
export const revalidate = 300

export default async function HomePage() {
  let products: Product[] = []

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })

      if (!error && data) {
        products = data
      } else if (error) {
        console.error('Error fetching products:', error)
      }
    }
  } catch (e) {
    console.warn('HomePage build-time / runtime warning (createAdminClient):', e)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Brand Hero Section */}
      <section className="relative mb-14 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-3.5 py-1 text-xs font-semibold text-[#FF9A3C] mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Curated Creator Production Gear</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
          Your First Selfie to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF3D00]">Your First Crore.</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
          Your first frame to a million faces. The exact studio setup—cameras, lighting, microphones, and softboxes—built for creators ready to turn content into an empire.
        </p>

        {/* Feature Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
            <span>Verified Creator Recommended</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#FF6B00]" />
            <span>Tested Studio Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#FF6B00]" />
            <span>4K Live & Cinema Ready</span>
          </div>
        </div>
      </section>

      {/* Main Filterable Product Showcase */}
      <ProductFilters initialProducts={products} />
    </div>
  )
}
