import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { ExternalLink, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

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
      className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-[#1E1E1E] to-[#121212] border border-[#2B2B2B] p-4 sm:p-5 transition-all duration-300 hover:border-[#FF6B00]/80 hover:shadow-[0_8px_30px_rgba(255,107,0,0.22)] hover:-translate-y-1 focus-within:ring-2 focus-within:ring-[#FF6B00]"
    >
      {/* Essential / Featured Badge */}
      {product.featured ? (
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF3D00] px-3 py-1 text-[11px] font-bold text-black uppercase tracking-wider shadow-lg">
          <Sparkles className="w-3 h-3" aria-hidden="true" />
          <span>Creator Essential</span>
        </div>
      ) : (
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1 rounded-full bg-[#1F1F1F]/90 backdrop-blur-md border border-[#333] px-2.5 py-0.5 text-[10px] font-medium text-zinc-300">
          <ShieldCheck className="w-3 h-3 text-[#FF9A3C]" />
          <span>Verified Gear</span>
        </div>
      )}

      {/* Top Product Media & Information */}
      <div>
        {/* High-res Image with Glass Frame */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-tr from-[#161616] to-[#242424] border border-[#262626] mb-4.5 p-3 flex items-center justify-center">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={`${product.title} product photo`}
              fill
              className="object-contain p-2 transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-500">
              No Image Available
            </div>
          )}
        </div>

        {/* Category Pill & Live Price */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-block rounded-md bg-[#242424] border border-[#333] px-2.5 py-1 text-[11px] font-semibold text-[#FF9A3C] tracking-wide">
            {product.category}
          </span>
          <div className="text-right">
            <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-white group-hover:text-[#FF9A3C] transition-colors leading-snug">
          {product.title}
        </h3>

        {/* Product Description */}
        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs text-zinc-400 leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Action Footer & Direct Amazon Deep Link Button */}
      <div className="mt-5 pt-3.5 border-t border-[#262626]/80">
        <Link
          href={`/go/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Buy ${product.title} on Amazon`}
          className="group/btn relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6B00] via-[#FF5500] to-[#FF3D00] py-3 px-4 text-sm font-bold text-black transition-all duration-200 hover:shadow-[0_4px_20px_rgba(255,107,0,0.4)] hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF9A3C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121212]"
        >
          <span>View Deal on Amazon</span>
          <ExternalLink className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}
