import React from 'react'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { YouTubeIcon, InstagramIcon, WhatsAppIcon } from './SocialIcons'

export default function CommunitySection() {
  return (
    <section className="mt-16 sm:mt-20 pt-10 border-t border-white/[0.08]">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] font-medium text-zinc-400 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B00]" />
          <span className="font-mono text-[10px] tracking-wider uppercase text-zinc-300">
            Connect & Grow With Us
          </span>
        </div>
        <h2 className="font-hero text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Join the FirstSelfie Creator Community
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400">
          Get direct studio production tips, new video alerts, and live gear recommendations across our official channels.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {/* YouTube Card */}
        <a
          href="https://www.youtube.com/@firstselfietamil"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141416] to-[#0E0E10] p-6 transition-all duration-300 hover:border-red-500/50 hover:shadow-[0_10px_30px_-10px_rgba(239,68,68,0.3)] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
              <YouTubeIcon className="w-6 h-6 fill-current" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="font-hero text-lg font-bold text-white mb-1">YouTube Channel</h3>
          <p className="text-xs text-zinc-400 mb-3">
            Subscribe for in-depth camera tests, lighting tutorials, and creator breakdowns in Tamil.
          </p>
          <span className="font-mono text-[11px] text-red-400 font-semibold group-hover:underline">
            @firstselfietamil ↗
          </span>
        </a>

        {/* Instagram Card */}
        <a
          href="https://www.instagram.com/firstselfie_tamil/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141416] to-[#0E0E10] p-6 transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_10px_30px_-10px_rgba(236,72,153,0.3)] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 group-hover:bg-gradient-to-tr group-hover:from-pink-500 group-hover:to-orange-500 group-hover:text-white transition-all">
              <InstagramIcon className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="font-hero text-lg font-bold text-white mb-1">Instagram</h3>
          <p className="text-xs text-zinc-400 mb-3">
            Behind the scenes, quick camera setup tips, and daily creator inspiration reels.
          </p>
          <span className="font-mono text-[11px] text-pink-400 font-semibold group-hover:underline">
            @firstselfie_tamil ↗
          </span>
        </a>

        {/* WhatsApp VIP Community Card */}
        <a
          href="https://whatsapp-community.firstselfie.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#141416] to-[#0E0E10] p-6 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_10px_30px_-10px_rgba(16,185,129,0.3)] hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <WhatsAppIcon className="w-6 h-6 fill-current" />
            </div>
            <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
          <h3 className="font-hero text-lg font-bold text-white mb-1">WhatsApp VIP Group</h3>
          <p className="text-xs text-zinc-400 mb-3">
            Direct access to our creator community with live Q&A, discount drops, and course updates.
          </p>
          <span className="font-mono text-[11px] text-emerald-400 font-semibold group-hover:underline">
            whatsapp-community.firstselfie.in ↗
          </span>
        </a>
      </div>
    </section>
  )
}
