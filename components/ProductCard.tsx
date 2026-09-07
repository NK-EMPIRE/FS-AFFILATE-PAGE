import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/lib/types'
import { ExternalLink, Sparkles } from 'lucide-react'

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
    <div className="group relative flex flex-col justify-between rounded-xl bg-[#1A1A1A] border border-[#262626] p-4 transition-all duration-300 hover:border-[#FF6B00] hover:shadow-[0_0_25px_-5px_rgba(255,107,0,0.3)]">
      {product.featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-[#FF6B00] px-2.5 py-0.5 text-xs font-semibold text-black uppercase tracking-wider shadow-md">
          <Sparkles className="w-3 h-3" />
          Essential
        </div>
      )}

      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#0A0A0A] mb-4">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              No Image
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-block rounded-md bg-[#262626] px-2.5 py-1 text-xs font-medium text-[#FFE0C2]">
            {product.category}
          </span>
          <span className="text-lg font-bold text-white tracking-tight">
            {formattedPrice}
          </span>
        </div>

        <h3 className="line-clamp-2 text-base font-semibold text-white group-hover:text-[#FF9A3C] transition-colors">
          {product.title}
        </h3>

        {product.description && (
          <p className="mt-2 line-clamp-2 text-xs text-zinc-400">
            {product.description}
          </p>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-[#262626]">
        <Link
          href={`/go/${product.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] py-2.5 px-4 text-sm font-semibold text-black transition-all duration-200 hover:bg-[#FF3D00] hover:text-white shadow-lg active:scale-95"
        >
          <span>View Deal</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
