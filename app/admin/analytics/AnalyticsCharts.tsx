'use client'

import React, { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  BarChart3,
  TrendingUp,
  Clock,
  ShieldCheck,
  Bot,
  ExternalLink,
  Users,
} from 'lucide-react'

interface ClickRecord {
  id: string
  product_id: string
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  device: string | null
  country: string | null
  clicked_at: string
  is_bot?: boolean
  products: {
    title: string
    slug: string
    price: number
    category: string
  } | null
}

interface Props {
  clicks: ClickRecord[]
}

export default function AnalyticsCharts({ clicks }: Props) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [botFilter, setBotFilter] = useState<'all' | 'human-only' | 'bots-only'>('human-only')

  // Total raw clicks
  const totalRawClicks = clicks.length

  // Filter clicks based on bot selection
  const botFilteredClicks = useMemo(() => {
    if (botFilter === 'human-only') {
      return clicks.filter(c => !c.is_bot)
    }
    if (botFilter === 'bots-only') {
      return clicks.filter(c => !!c.is_bot)
    }
    return clicks
  }, [clicks, botFilter])

  // Filter clicks based on time range
  const filteredClicks = useMemo(() => {
    if (timeRange === 'all') return botFilteredClicks
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return botFilteredClicks.filter(c => new Date(c.clicked_at) >= cutoff)
  }, [botFilteredClicks, timeRange])

  // Clicks per day for Line Chart
  const lineChartData = useMemo(() => {
    const countsByDay: Record<string, number> = {}

    const daysCount = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 14
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      countsByDay[key] = 0
    }

    filteredClicks.forEach(c => {
      const key = c.clicked_at.split('T')[0]
      if (countsByDay[key] !== undefined) {
        countsByDay[key] += 1
      }
    })

    return Object.entries(countsByDay).map(([date, count]) => ({
      date: date.substring(5), // MM-DD
      clicks: count,
    }))
  }, [filteredClicks, timeRange])

  // Hourly Distribution (00 to 23 hours in UTC/Local)
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      clicks: 0,
    }))

    filteredClicks.forEach(c => {
      const h = new Date(c.clicked_at).getHours()
      if (hours[h]) {
        hours[h].clicks += 1
      }
    })

    return hours
  }, [filteredClicks])

  // Top 10 products by click count
  const topProductsData = useMemo(() => {
    const map: Record<string, number> = {}
    filteredClicks.forEach(c => {
      const title = c.products?.title || 'Unknown Equipment'
      map[title] = (map[title] || 0) + 1
    })

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [filteredClicks])

  // Referrer & UTM Source Breakdown
  const referrerData = useMemo(() => {
    const map: Record<string, number> = {}
    const total = filteredClicks.length || 1

    filteredClicks.forEach(c => {
      let source = 'Direct / App Bio'
      if (c.utm_source) {
        source = c.utm_source
      } else if (c.referrer) {
        try {
          const host = new URL(c.referrer).hostname
          source = host.replace(/^www\./, '')
        } catch {
          source = c.referrer.slice(0, 30)
        }
      }
      map[source] = (map[source] || 0) + 1
    })

    return Object.entries(map)
      .map(([source, count]) => ({
        source,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
  }, [filteredClicks])

  // Device breakdown
  const { deviceStats, topCountries } = useMemo(() => {
    const devMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
    const countryMap: Record<string, number> = {}
    const total = filteredClicks.length || 1

    filteredClicks.forEach(c => {
      const dev = (c.device || 'desktop').toLowerCase()
      if (dev in devMap) devMap[dev] += 1
      else devMap.desktop += 1

      const ctry = c.country || 'India'
      countryMap[ctry] = (countryMap[ctry] || 0) + 1
    })

    const countries = Object.entries(countryMap)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      deviceStats: {
        mobile: ((devMap.mobile / total) * 100).toFixed(1),
        desktop: ((devMap.desktop / total) * 100).toFixed(1),
        tablet: ((devMap.tablet / total) * 100).toFixed(1),
      },
      topCountries: countries,
    }
  }, [filteredClicks])

  if (totalRawClicks === 0) {
    return (
      <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-12 text-center shadow-lg">
        <BarChart3 className="w-10 h-10 text-[#FF6B00] mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-base font-bold text-white">No Affiliate Redirect Events Recorded Yet</h2>
        <p className="mt-1.5 text-xs text-zinc-400 max-w-md mx-auto">
          Analytics will update automatically in real-time as users click "View Deal on Amazon" across your gear recommendations.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Controls Bar: Time Range & Bot Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#2B2B2B] bg-[#141414] p-3.5 shadow-md">
        {/* Bot & Audience Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-400">Audience:</span>
          <div className="flex items-center gap-1 rounded-lg bg-[#1F1F1F] p-1 border border-[#2B2B2B]">
            <button
              type="button"
              onClick={() => setBotFilter('human-only')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition ${
                botFilter === 'human-only'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Real Humans</span>
            </button>
            <button
              type="button"
              onClick={() => setBotFilter('all')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition ${
                botFilter === 'all'
                  ? 'bg-[#FF6B00]/20 text-[#FF9A3C] border border-[#FF6B00]/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>All Traffic</span>
            </button>
            <button
              type="button"
              onClick={() => setBotFilter('bots-only')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-semibold transition ${
                botFilter === 'bots-only'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Bots & Crawlers</span>
            </button>
          </div>
        </div>

        {/* Time Window Tabs */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-semibold text-zinc-400">Window:</span>
          <div className="flex items-center gap-1 rounded-lg bg-[#1F1F1F] p-1 border border-[#2B2B2B]">
            {(['7d', '30d', '90d', 'all'] as const).map(range => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`rounded px-3 py-1 text-xs font-bold uppercase transition ${
                  timeRange === range
                    ? 'bg-[#FF6B00] text-black shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume Line Chart */}
        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#FF6B00]" />
              <span>Daily Click Volume ({timeRange.toUpperCase()})</span>
            </h3>
            <span className="text-xs text-[#FF9A3C] font-semibold font-mono">
              {filteredClicks.length} Clicks
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '10px' }}
                />
                <Line
                  type="monotone"
                  dataKey="clicks"
                  stroke="#FF6B00"
                  strokeWidth={2.5}
                  dot={{ fill: '#FF6B00', r: 3 }}
                  activeDot={{ r: 6, fill: '#FF3D00' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours Histogram */}
        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF9A3C]" />
              <span>Hourly Traffic Distribution (24-Hour Peak)</span>
            </h3>
            <span className="text-xs text-zinc-400">Audience Peak Times</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" />
                <XAxis dataKey="hour" stroke="#71717a" fontSize={10} interval={3} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#333', borderRadius: '10px' }}
                />
                <Bar dataKey="clicks" fill="#FF8533" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Leaderboard & Traffic Source */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Equipment Leaderboard */}
        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#FF6B00]" />
                <span>Top Gear Recommendations by Clicks</span>
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">Ranked by Volume</span>
            </div>

            {topProductsData.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500">
                No clicks recorded for this filter window.
              </div>
            ) : (
              <div className="space-y-3">
                {topProductsData.slice(0, 6).map((item, idx) => {
                  const maxClicks = topProductsData[0]?.count || 1
                  const pct = Math.round((item.count / maxClicks) * 100)
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-zinc-200 truncate max-w-[260px]">
                          <span className="text-zinc-500 font-mono mr-1.5">#{idx + 1}</span>
                          {item.name}
                        </span>
                        <span className="font-mono font-bold text-[#FF9A3C] shrink-0">
                          {item.count} {item.count === 1 ? 'click' : 'clicks'}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF9A3C] transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Traffic Source & Referrers */}
        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Audience Origin & Channels</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-zinc-500 border-b border-[#242424]">
                  <tr>
                    <th className="pb-2">Channel / Referrer</th>
                    <th className="pb-2">Clicks</th>
                    <th className="pb-2 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242424]">
                  {referrerData.slice(0, 7).map((row, i) => (
                    <tr key={i} className="text-zinc-300">
                      <td className="py-2.5 font-mono text-[#FFE0C2] truncate max-w-[180px]">{row.source}</td>
                      <td className="py-2.5 font-semibold">{row.count}</td>
                      <td className="py-2.5 text-right font-bold text-white">{row.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device Breakdown Stats */}
          <div className="pt-4 border-t border-[#242424] mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] p-3 text-center">
                <Smartphone className="w-4 h-4 mx-auto text-[#FF6B00] mb-1" />
                <div className="text-[11px] text-zinc-400">Mobile</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{deviceStats.mobile}%</div>
              </div>
              <div className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] p-3 text-center">
                <Monitor className="w-4 h-4 mx-auto text-[#FF9A3C] mb-1" />
                <div className="text-[11px] text-zinc-400">Desktop</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{deviceStats.desktop}%</div>
              </div>
              <div className="rounded-xl bg-[#1A1A1A] border border-[#2E2E2E] p-3 text-center">
                <Tablet className="w-4 h-4 mx-auto text-zinc-400 mb-1" />
                <div className="text-[11px] text-zinc-400">Tablet</div>
                <div className="text-sm font-extrabold text-white mt-0.5">{deviceStats.tablet}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Granular Events & Conversion Log Table */}
      <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414] p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#242424]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Granular Event Log & Traffic Attribution</span>
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              Complete chronological stream of incoming user clicks, UTM campaigns, and outbound Amazon conversions.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-400 self-start sm:self-auto">
            Showing latest {Math.min(filteredClicks.length, 25)} events
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-zinc-400 bg-white/[0.02] border-b border-[#242424]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Time</th>
                <th className="py-2.5 px-3 font-semibold">Product Clicked</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Source / Referrer</th>
                <th className="py-2.5 px-3 font-semibold">Device</th>
                <th className="py-2.5 px-3 font-semibold">Location</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#242424]">
              {filteredClicks.slice(0, 25).map((c, idx) => {
                const timeStr = new Date(c.clicked_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                const dateStr = new Date(c.clicked_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
                return (
                  <tr key={c.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-mono text-zinc-400 whitespace-nowrap">
                      {dateStr} {timeStr}
                    </td>
                    <td className="py-3 px-3 font-medium text-white max-w-[220px] truncate">
                      {c.products?.title || 'Creator Equipment Item'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="rounded-md bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
                        {c.products?.category || 'Gear'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#FF9A3C] max-w-[160px] truncate">
                      {c.utm_source || c.referrer || 'Direct / Bio Link'}
                    </td>
                    <td className="py-3 px-3 uppercase text-zinc-400 font-mono text-[11px]">
                      {c.device || 'Mobile'}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {c.country || 'India'}
                    </td>
                    <td className="py-3 px-3">
                      {c.is_bot ? (
                        <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-bold text-red-400">
                          Bot Filtered
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          Outbound 302
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
