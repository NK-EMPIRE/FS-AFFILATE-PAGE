import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'

export default function PrivacyPage() {
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
          <Lock className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Privacy Policy</h1>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-zinc-300">
          <p>
            Your privacy is paramount to us at FirstSelfie. This policy outlines how information is collected, used, and protected across our affiliate storefront.
          </p>

          <h2 className="text-base font-bold text-white pt-2">1. Analytics & Tracking</h2>
          <p>
            When you interact with a product deal link (/go/[slug]), anonymous technical metadata (such as device classification, referrer, UTM source, and general country of origin) is logged to evaluate traffic sources and campaign effectiveness. We do not sell or store personal identity data.
          </p>

          <h2 className="text-base font-bold text-white pt-2">2. External Links</h2>
          <p>
            Our website contains links to Amazon. When you click these links, you will be redirected to Amazon’s website, which operates under its own Privacy Notice and Conditions of Use.
          </p>

          <h2 className="text-base font-bold text-white pt-2">3. Cookies</h2>
          <p>
            Standard session cookies are used solely for administrator authentication and security. Third-party merchants like Amazon may utilize cookies to attribute affiliate purchases.
          </p>
        </div>
      </div>
    </div>
  )
}
