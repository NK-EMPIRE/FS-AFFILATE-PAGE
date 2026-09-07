'use client'

import React, { useState } from 'react'
import { Check, Sparkles, CheckCircle2 } from 'lucide-react'

const INITIAL_ESSENTIALS = [
  { id: 1, label: '4K Creator Camera / Phone', count: '1', note: 'Sony ZV-E10 / iPhone 15 Pro', checked: true },
  { id: 2, label: 'Heavy-Duty Fluid Head Tripod', count: '1', note: 'Stable eye-level angle', checked: true },
  { id: 3, label: 'Wireless Lavalier Microphone', count: '1', note: 'Noise cancelling & clean 48kHz audio', checked: true },
  { id: 4, label: 'Key & Fill Softbox Lighting', count: '2', note: 'Godox SL60W / Amaran 100D soft diffused light', checked: true },
  { id: 5, label: '9ft Air Cushioned Light Stands', count: '2', note: 'Prevents gear falling on set', checked: true },
  { id: 6, label: 'High-Speed V30 U3 SD Card', count: '1', note: '170MB/s 4K recording buffer', checked: true },
]

export default function CreatorChecklist() {
  const [items, setItems] = useState(INITIAL_ESSENTIALS)

  const toggleItem = (id: number) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  const completedCount = items.filter(i => i.checked).length

  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-white/[0.08] bg-gradient-to-b from-[#141416] via-[#101012] to-[#0A0A0B] p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-[#FF6B00]" />
            <span className="text-xs tracking-wide text-[#FF8533] font-semibold">
              Studio Setup Blueprint
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Essential Creator Studio Checklist
          </h3>
          <p className="mt-1 text-xs text-zinc-400">
            Click any item to verify your production gear before recording.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-right">
            <div className="text-[11px] font-medium text-zinc-400">Readiness Score</div>
            <div className="text-sm font-bold text-[#FF9A3C]">
              {completedCount} of {items.length} Ready ({Math.round((completedCount / items.length) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleItem(item.id)}
            className={`group flex items-start justify-between gap-3 text-left rounded-2xl border p-4 transition-all duration-200 ${
              item.checked
                ? 'border-[#FF6B00]/30 bg-[#FF6B00]/[0.05] hover:border-[#FF6B00]/60 shadow-sm'
                : 'border-white/[0.06] bg-white/[0.01] opacity-60 hover:opacity-100 hover:border-white/[0.15]'
            }`}
          >
            <div className="flex items-start gap-3 overflow-hidden">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg transition-all ${
                  item.checked
                    ? 'bg-[#FF6B00] text-black shadow-md'
                    : 'border border-white/[0.2] bg-white/[0.02] text-transparent'
                }`}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white group-hover:text-[#FF8533] transition-colors">
                  {item.label}
                </div>
                <div className="mt-0.5 text-xs text-zinc-400 truncate font-normal">
                  {item.note}
                </div>
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-zinc-400 rounded-md bg-white/[0.04] px-2 py-0.5">
              ×{item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
