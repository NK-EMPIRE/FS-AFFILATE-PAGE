import React from 'react'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'

export default function StorefrontHero() {
  return (
    <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 text-center max-w-4xl mx-auto">
      {/* Category Micro-Label */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] font-medium text-zinc-400 mb-6 backdrop-blur-md">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B00]" />
        <span className="tracking-[0.15em] uppercase font-mono text-[10px] text-zinc-300">
          Studio Curated Catalog
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
        Your First Frame to{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
          a Million Faces.
        </span>
      </h1>

      {/* Editorial Subtitle */}
      <p className="mt-4 sm:mt-5 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
        The exact equipment stack behind high-performing creators. Hand-tested cameras, studio lighting, wireless microphones, and softboxes with direct Amazon affiliate deep-links.
      </p>

      {/* Studio Quality Badges */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-[#FF6B00]">✦</span>
          <span>14 Verified Studio Essentials</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#FF6B00]">✦</span>
          <span>Tested for 4K Video & Live Streaming</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#FF6B00]">✦</span>
          <span>Amazon Verified Direct Pricing</span>
        </div>
      </div>
    </section>
  )
}
