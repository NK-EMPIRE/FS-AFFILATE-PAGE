import React from 'react'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import AnalyticsCharts from './AnalyticsCharts'
import { ArrowLeft, BarChart3, TrendingUp, Globe, Smartphone, ShieldCheck, Users, Bot } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  let allClicks: any[] = []

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: clicks } = await supabase
        .from('clicks')
        .select('id, product_id, referrer, utm_source, utm_medium, utm_campaign, device, country, is_bot, visitor_id, clicked_at, products(title, slug, price, category)')
        .order('clicked_at', { ascending: false })

      if (clicks) allClicks = clicks
    }
  } catch (e) {
    console.error('Error fetching analytics clicks:', e)
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const humanClicks = allClicks.filter(c => !c.is_bot)
  const botClicks = allClicks.filter(c => !!c.is_bot)

  const clicks7d = humanClicks.filter(c => new Date(c.clicked_at) >= sevenDaysAgo).length
  const clicks30d = humanClicks.filter(c => new Date(c.clicked_at) >= thirtyDaysAgo).length
  const clicksAllTime = humanClicks.length

  // Calculate unique human visitors using the fs_vid cookie identifier
  const uniqueVisitors = new Set(humanClicks.map(c => c.visitor_id || c.id)).size

  const mobileCount = humanClicks.filter(c => (c.device || '').toLowerCase() === 'mobile').length
  const mobilePct = humanClicks.length > 0 ? Math.round((mobileCount / humanClicks.length) * 100) : 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#2B2B2B] pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2B2B2B] text-zinc-400 hover:text-white transition"
              aria-label="Back to admin dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-2xl font-black text-white">Affiliate Performance & Real-Time Tracking</h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400 pl-11">
            Server-side real-time analytics with bot protection, conversion estimation, and audience source attribution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Tracking Live</span>
          </div>
        </div>
      </div>

      {/* 4 Stat KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Unique Visitors</span>
            <Users className="w-4 h-4 text-[#FF9A3C]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{uniqueVisitors}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Tracked via cookie ID</div>
        </div>

        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Human Link Taps</span>
            <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{clicksAllTime}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Real outbound 302 clicks</div>
        </div>

        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Mobile Audience</span>
            <Smartphone className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{mobilePct}%</div>
          <div className="mt-1 text-[11px] text-zinc-500">{mobileCount} mobile clicks</div>
        </div>

        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Bot Filtered</span>
            <Bot className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{botClicks.length}</div>
          <div className="mt-1 text-[11px] text-zinc-500">Scrapers & crawlers blocked</div>
        </div>
      </div>

      {/* Advanced Recharts Interactive Component */}
      <AnalyticsCharts clicks={allClicks} />
    </div>
  )
}
