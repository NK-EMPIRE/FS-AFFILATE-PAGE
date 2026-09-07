import React from 'react'
import { Check } from 'lucide-react'

const ESSENTIALS = [
  { label: 'Camera / Phone', count: '1' },
  { label: 'Camera Stand', count: '1' },
  { label: 'Microphone', count: '1' },
  { label: 'Key + Fill Lights', count: '2' },
  { label: 'Light Stands', count: '2' },
  { label: 'V30 SD Card', count: '1' },
]

export default function CreatorChecklist() {
  return (
    <div className="mx-auto max-w-4xl mb-12 rounded-2xl border border-white/[0.07] bg-white/[0.015] p-4 sm:p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF6B00] font-semibold">
            Mandatory Setup
          </span>
          <span className="text-zinc-600">/</span>
          <span className="text-xs text-zinc-300 font-medium">
            Core Creator Studio Stack
          </span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400 self-start sm:self-auto">
          6 Core Checklist Items
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {ESSENTIALS.map((item, idx) => (
          <div
            key={idx}
            className="group flex items-center justify-between gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2 transition-colors hover:border-[#FF6B00]/40"
          >
            <div className="flex items-center gap-1.5 overflow-hidden">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#FF6B00]/20 text-[#FF6B00]">
                <Check className="h-2.5 w-2.5 stroke-[2.5]" />
              </span>
              <span className="truncate text-[11px] font-medium text-zinc-300">
                {item.label}
              </span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">×{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
