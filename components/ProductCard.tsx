import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { ArrowUpRight } from 'lucide-react'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price)

  return (
    <article
      aria-label={product.title}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#111113] p-4 sm:p-5 transition-all duration-300 hover:border-white/[0.2] hover:bg-[#151518] hover:shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)]"
    >
      {/* Top Header: Category Tag & Essential Badge */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          {product.category}
        </span>
        {product.featured && (
          <span className="flex items-center gap-1 rounded-full border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-2 py-0.5 text-[9px] font-semibold font-mono tracking-wider text-[#FF9A3C] uppercase">
            Essential
          </span>
        )}
      </div>

      {/* Product Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#0B0B0C] border border-white/[0.03] p-4 flex items-center justify-center mb-4">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600 font-mono">
            No image
          </div>
        )}
      </div>

      {/* Product Metadata */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-white group-hover:text-zinc-100 transition-colors leading-snug">
            {product.title}
          </h3>

          {product.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-zinc-400 font-normal leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Pricing & Deep-Link Trigger */}
        <div className="mt-5 pt-3.5 border-t border-white/[0.05] flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              Price
            </span>
            <span className="text-base font-bold text-white tracking-tight font-mono">
              {formattedPrice}
            </span>
          </div>

          <a
            href={`/go/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Buy ${product.title} on Amazon`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#FF6B00] hover:text-black hover:border-[#FF6B00] active:scale-95"
          >
            <span>View Deal</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </a>
        </div>
      </div>
    </article>
  )
}
