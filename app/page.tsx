import React from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import ProductFilters from '@/components/ProductFilters'
import { Product } from '@/lib/types'
import { FALLBACK_PRODUCTS } from '@/lib/initialData'
import { Video, Award, Zap, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react'

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Brand Hero Section */}
      <section className="relative mb-12 sm:mb-16 text-center">
        {/* Glowing Status Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-4 py-1.5 text-xs font-bold text-[#FF9A3C] mb-5 shadow-[0_0_20px_rgba(255,107,0,0.15)]">
          <Zap className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span>Curated Creator Production Gear — Direct Deep-Links</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Your First Selfie to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#FF3D00]">
            Your First Crore.
          </span>
        </h1>

        <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Your first frame to a million faces. The exact battle-tested studio setup—cameras, studio lighting, microphones, and softboxes—built for creators scaling from zero to an empire.
        </p>

        {/* Feature Trust Badges */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-semibold text-zinc-300">
          <div className="flex items-center gap-2 rounded-full bg-[#181818] border border-[#2B2B2B] px-3.5 py-1.5">
            <ShieldCheck className="w-4 h-4 text-[#FF6B00]" />
            <span>Verified Affiliate Deep-Links</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#181818] border border-[#2B2B2B] px-3.5 py-1.5">
            <Award className="w-4 h-4 text-[#FF6B00]" />
            <span>Studio-Tested Production Quality</span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#181818] border border-[#2B2B2B] px-3.5 py-1.5">
            <Video className="w-4 h-4 text-[#FF6B00]" />
            <span>4K Cinema & Live-Stream Ready</span>
          </div>
        </div>

        {/* Mandatory Setup Checklist for Creators */}
        <div className="mt-8 sm:mt-10 mx-auto max-w-4xl rounded-2xl border border-[#2B2B2B] bg-gradient-to-b from-[#181818] to-[#121212] p-4 sm:p-6 text-left shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span className="text-white font-bold text-xs sm:text-sm tracking-wide">
                MANDATORY CREATOR STUDIO CHECKLIST
              </span>
            </div>
            <span className="text-[11px] font-semibold text-[#FF9A3C] bg-[#FF6B00]/10 border border-[#FF6B00]/30 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
              6 Core Essentials
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
            <div className="rounded-xl bg-[#1D1D1D] p-2.5 text-zinc-200 border border-[#2E2E2E] flex items-center gap-2 transition hover:border-[#FF6B00]/50">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-semibold text-[11px]">Camera / Phone</span>
            </div>
            <div className="rounded-xl bg-[#1D1D1D] p-2.5 text-zinc-200 border border-[#2E2E2E] flex items-center gap-2 transition hover:border-[#FF6B00]/50">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-semibold text-[11px]">Camera Stand</span>
            </div>
            <div className="rounded-xl bg-[#1D1D1D] p-2.5 text-zinc-200 border border-[#2E2E2E] flex items-center gap-2 transition hover:border-[#FF6B00]/50">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-semibold text-[11px]">Microphone</span>
            </div>
            <div className="rounded-xl bg-[#1D1D1D] p-2.5 text-zinc-200 border border-[#2E2E2E] flex items-center gap-2 transition hover:border-[#FF6B00]/50">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-semibold text-[11px]">Lights Key+Fill</span>
            </div>
            <div className="rounded-xl bg-[#1D1D1D] p-2.5 text-zinc-200 border border-[#2E2E2E] flex items-center gap-2 transition hover:border-[#FF6B00]/50">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-semibold text-[11px]">Light Stands</span>
            </div>
            <div className="rounded-xl bg-[#1D1D1D] p-2.5 text-zinc-200 border border-[#2E2E2E] flex items-center gap-2 transition hover:border-[#FF6B00]/50">
              <CheckCircle2 className="w-4 h-4 text-[#FF6B00] shrink-0" />
              <span className="font-semibold text-[11px]">V30 SD Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Filterable Product Showcase */}
      <ProductFilters initialProducts={products} />
    </div>
  )
}
