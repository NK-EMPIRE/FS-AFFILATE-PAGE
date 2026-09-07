import React from 'react'
import Image from 'next/image'
import { CheckCircle2, ArrowUpRight } from 'lucide-react'
import { YouTubeIcon, InstagramIcon, WhatsAppIcon } from './SocialIcons'

export default function CreatorBannerHero() {
  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111113] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
      {/* 1. Full-Width YouTube Channel Header Banner */}
      <div className="relative h-44 sm:h-64 md:h-80 w-full overflow-hidden bg-zinc-950">
        <Image
          src="/fs-banner-yt.jpg"
          alt="FirstSelfie Channel Banner"
          fill
          priority
          className="object-cover object-center"
          sizes="(max-width: 1280px) 100vw, 1280px"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111113]/60 via-transparent to-[#111113]/60" />
      </div>

      {/* 2. Creator Identity Stage (Avatar, Name, Badges & Social Links) */}
      <div className="relative px-5 sm:px-8 pb-8 pt-0 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
          {/* Avatar and Creator Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
            {/* Profile Avatar with Glowing Border */}
            <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border-4 border-[#111113] bg-zinc-900 shadow-2xl shrink-0 ring-2 ring-[#FF6B00]/40">
              <Image
                src="/profile-fs.jpg"
                alt="FirstSelfie Profile"
                fill
                priority
                className="object-cover"
                sizes="144px"
              />
            </div>

            {/* Titles & Verification */}
            <div className="pt-2">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-hero">
                  FirstSelfie
                </h2>
                <CheckCircle2 className="w-5 h-5 text-[#FF6B00] fill-[#FF6B00]/20" />
                <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-300 uppercase tracking-wider">
                  Official Studio
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
