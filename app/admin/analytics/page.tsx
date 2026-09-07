import React from 'react'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import AnalyticsCharts from './AnalyticsCharts'
import { ArrowLeft, BarChart3, TrendingUp, Globe, Smartphone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  let allClicks: any[] = []

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: clicks } = await supabase
        .from('clicks')
        .select('id, product_id, referrer, utm_source, utm_medium, utm_campaign, device, country, clicked_at, products(title, slug, price, category)')
        .order('clicked_at', { ascending: false })

      if (clicks) allClicks = clicks
    }
  } catch (e) {
    console.error('Error fetching analytics clicks:', e)
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const clicks7d = allClicks.filter(c => new Date(c.clicked_at) >= sevenDaysAgo).length
  const clicks30d = allClicks.filter(c => new Date(c.clicked_at) >= thirtyDaysAgo).length
  const clicksAllTime = allClicks.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between border-b border-[#262626] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-1.5 rounded-lg bg-[#1A1A1A] border border-[#262626] text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Affiliate Clicks Analytics</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 pl-9">
            Server-side aggregated performance data across all FirstSelfie affiliate redirects.
          </p>
        </div>
      </div>

      {/* 1. Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Clicks (Last 7 Days)</span>
            <TrendingUp className="w-4 h-4 text-[#FF9A3C]" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{clicks7d}</div>
        </div>

        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Clicks (Last 30 Days)</span>
            <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{clicks30d}</div>
        </div>

        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Clicks (All-Time)</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white">{clicksAllTime}</div>
        </div>
      </div>

      {/* Client-side Recharts Component */}
      <AnalyticsCharts clicks={allClicks} />
    </div>
  )
}
