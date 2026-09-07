import React from 'react'
import Image from 'next/image'
import { CheckCircle2, ArrowUpRight } from 'lucide-react'
import { YouTubeIcon, InstagramIcon, WhatsAppIcon } from './SocialIcons'

export default function CreatorBannerHero() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111113] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
      {/* 1. YouTube Channel Header Banner - Natural aspect ratio (1707x282 ~ 6:1 on desktop, 16:6 on mobile) */}
      <div className="relative w-full aspect-[16/6] sm:aspect-[1707/282] overflow-hidden bg-zinc-950">
        <Image
          src="/fs-banner-yt.jpg"
          alt="FirstSelfie Channel Banner"
          fill
          priority
          className="object-contain sm:object-cover object-center"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        {/* Crisp, delicate bottom edge line */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#111113] to-transparent pointer-events-none" />
      </div>

      {/* 2. Creator Identity Stage (Avatar, Name, Verified Blue Tick & Social Links) */}
      <div className="relative px-4 sm:px-8 pb-8 pt-3 sm:pt-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          {/* Avatar and Creator Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
            {/* Profile Avatar with Glowing Border */}
            <div className="relative h-20 w-20 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-2 sm:border-4 border-[#111113] bg-zinc-900 shadow-2xl shrink-0 ring-2 ring-[#FF6B00]/40 -mt-10 sm:-mt-14 z-10">
              <Image
                src="/profile-fs.jpg"
                alt="FirstSelfie Profile"
                fill
                priority
                className="object-cover"
                sizes="112px"
              />
            </div>

            {/* Titles & Verification */}
            <div className="pt-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-hero">
                  FirstSelfie
                </h2>
                {/* Verified Blue Tick Badge */}
                <span title="Verified Creator" className="inline-flex items-center justify-center text-[#3897F0]">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.5-3.5 1.41-1.41 2.09 2.08 5.69-5.69 1.41 1.41-7.1 7.11z" />
                  </svg>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                @firstselfietamil • Creator Studio Equipment & Production Guide
              </p>
            </div>
          </div>

          {/* Social Quick Links */}
          <div className="flex items-center justify-center sm:justify-end gap-2.5 flex-wrap">
            <a
              href="https://www.youtube.com/@firstselfietamil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <YouTubeIcon className="w-4 h-4 fill-current" />
              <span>YouTube</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href="https://www.instagram.com/firstselfie_tamil/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-pink-500/20 bg-pink-500/10 px-3.5 py-2 text-xs font-bold text-pink-400 hover:bg-gradient-to-r hover:from-pink-500 hover:to-orange-500 hover:text-white transition-all shadow-sm active:scale-95"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Instagram</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a
              href="https://whatsapp-community.firstselfie.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-4 py-2 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all shadow-md active:scale-95"
            >
              <WhatsAppIcon className="w-4 h-4 fill-current" />
              <span>Join WhatsApp VIP</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>

        {/* Hero Impact Headline with Bricolage Grotesque */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-white/[0.06] text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1 text-[11px] font-medium text-zinc-400 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B00] animate-pulse" />
            <span className="font-mono text-[10px] tracking-wider uppercase text-zinc-300">
              Verified Creator Production Setup
            </span>
          </div>

          <h1 className="font-hero text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl">
            Your First Frame to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#FF8533] to-[#FF3D00]">
              a Million Faces.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-zinc-400 max-w-2xl leading-relaxed">
            The exact studio equipment stack behind FirstSelfie. Hand-curated 4K cameras, wireless microphones, key lighting, and softboxes with direct verified affiliate links.
          </p>
        </div>
      </div>
    </section>
  )
}
