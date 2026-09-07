import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

export default function DisclosurePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Storefront</span>
      </Link>

      <div className="rounded-2xl border border-[#262626] bg-[#1A1A1A] p-8 sm:p-12 shadow-xl">
        <div className="flex items-center gap-3 text-[#FF6B00] mb-4">
          <ShieldCheck className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">FTC Affiliate Disclosure</h1>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
          <p className="font-semibold text-white">
            FirstSelfie believes in 100% transparency with our creator community.
          </p>

          <p>
            In compliance with FTC guidelines, please assume that any and all links leading to Amazon or third-party merchant sites on this platform are affiliate links. If you click on these links and visit the resulting site, a cookie may be set in your web browser that causes us to receive a compensation if you purchase a product.
          </p>

          <div className="rounded-xl border border-[#FF6B00]/30 bg-[#FF6B00]/10 p-4 text-xs font-semibold text-[#FFE0C2]">
            "As an Amazon Associate I earn from qualifying purchases."
          </div>

          <h2 className="text-base font-bold text-white pt-4">Our Integrity & Curation Standards</h2>
          <p>
            We do not accept paid compensation for positive reviews or placements. The gear showcased on FirstSelfie—from camera bodies and wireless button mics to parabolic softboxes and high-speed V30 SD cards—is handpicked strictly based on real creator performance, reliability, and value.
          </p>

          <p>
            Prices and availability for Amazon products are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply.
          </p>
        </div>
      </div>
    </div>
  )
}
