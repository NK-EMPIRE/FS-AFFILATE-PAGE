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
import { Smartphone, Monitor, Tablet, Globe } from 'lucide-react'

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
  products: {
    title: string
    slug: string
    price: number
    category: string
  } | null
}

interface Props {
  clicks: any[]
}

export default function AnalyticsCharts({ clicks }: Props) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Filter clicks based on time range
  const filteredClicks = useMemo(() => {
    if (timeRange === 'all') return clicks
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return clicks.filter(c => new Date(c.clicked_at) >= cutoff)
  }, [clicks, timeRange])

  // Clicks per day for Line Chart
  const lineChartData = useMemo(() => {
    const countsByDay: Record<string, number> = {}

    // Initialize days
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

  // Top 10 products by click count
  const topProductsData = useMemo(() => {
    const map: Record<string, number> = {}
    clicks.forEach(c => {
      const title = c.products?.title || 'Unknown Product'
      map[title] = (map[title] || 0) + 1
    })

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }, [clicks])

  // UTM Source Breakdown
  const utmSourceData = useMemo(() => {
    const map: Record<string, number> = {}
    const total = filteredClicks.length || 1

    filteredClicks.forEach(c => {
      const src = c.utm_source || 'direct / none'
      map[src] = (map[src] || 0) + 1
    })

    return Object.entries(map)
      .map(([source, count]) => ({
        source,
        count,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.count - a.count)
  }, [filteredClicks])

  // Device & Country breakdown
  const { deviceStats, topCountries } = useMemo(() => {
    const devMap: Record<string, number> = { mobile: 0, desktop: 0, tablet: 0 }
    const countryMap: Record<string, number> = {}
    const total = filteredClicks.length || 1

    filteredClicks.forEach(c => {
      const dev = (c.device || 'desktop').toLowerCase()
      if (dev in devMap) devMap[dev] += 1
      else devMap.desktop += 1

      const ctry = c.country || 'Unknown'
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

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Traffic Trends</h2>
        <div className="flex items-center gap-1.5 rounded-lg border border-[#262626] bg-[#1A1A1A] p-1">
          {(['7d', '30d', '90d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded px-3 py-1 text-xs font-semibold uppercase transition ${
                timeRange === range
                  ? 'bg-[#FF6B00] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">
            Daily Click Volume ({timeRange.toUpperCase()})
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '8px' }}
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

        {/* Bar Chart */}
        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">
            Top 10 Products by Clicks (All-Time)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" stroke="#71717a" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={110} stroke="#71717a" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#262626', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#FF9A3C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Breakdowns: UTM Source & Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UTM Source Table */}
        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">
            Traffic by UTM Source
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-500 border-b border-[#262626]">
                <tr>
                  <th className="pb-2">Source</th>
                  <th className="pb-2">Clicks</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {utmSourceData.map((row, i) => (
                  <tr key={i} className="text-zinc-300">
                    <td className="py-2 font-mono text-[#FFE0C2]">{row.source}</td>
                    <td className="py-2">{row.count}</td>
                    <td className="py-2 text-right font-medium text-white">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device & Country Breakdown */}
        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Device Breakdown</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-[#0A0A0A] border border-[#262626] p-3 text-center">
                <Smartphone className="w-4 h-4 mx-auto text-[#FF6B00] mb-1" />
                <div className="text-xs text-zinc-400">Mobile</div>
                <div className="text-sm font-bold text-white mt-0.5">{deviceStats.mobile}%</div>
              </div>
              <div className="rounded-lg bg-[#0A0A0A] border border-[#262626] p-3 text-center">
                <Monitor className="w-4 h-4 mx-auto text-[#FF9A3C] mb-1" />
                <div className="text-xs text-zinc-400">Desktop</div>
                <div className="text-sm font-bold text-white mt-0.5">{deviceStats.desktop}%</div>
              </div>
              <div className="rounded-lg bg-[#0A0A0A] border border-[#262626] p-3 text-center">
                <Tablet className="w-4 h-4 mx-auto text-zinc-400 mb-1" />
                <div className="text-xs text-zinc-400">Tablet</div>
                <div className="text-sm font-bold text-white mt-0.5">{deviceStats.tablet}%</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-2">Top Countries</h3>
            {topCountries.length > 0 ? (
              <div className="space-y-1.5">
                {topCountries.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#0A0A0A]">
                    <span className="text-zinc-300">{c.country}</span>
                    <span className="font-semibold text-[#FF9A3C]">{c.count} clicks</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No geo data recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
