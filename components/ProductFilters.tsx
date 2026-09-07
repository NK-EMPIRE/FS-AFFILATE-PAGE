'use client'

import React, { useState, useMemo } from 'react'
import { Product } from '@/lib/types'
import { FALLBACK_PRODUCTS } from '@/lib/initialData'
import ProductCard from './ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'

interface ProductFiltersProps {
  initialProducts: Product[]
}

export default function ProductFilters({ initialProducts }: ProductFiltersProps) {
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : FALLBACK_PRODUCTS
  )
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

  // Client-side fallback: If Vercel prerendered the static page with empty products due to missing build-time env vars,
  // fetch active products client-side immediately.
  React.useEffect(() => {
    if (products.length === 0) {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient()
        supabase
          .from('products')
          .select('*')
          .eq('active', true)
          .order('featured', { ascending: false })
          .order('created_at', { ascending: false })
          .then(({ data, error }) => {
            if (!error && data && data.length > 0) {
              setProducts(data)
            }
          })
      })
    }
  }, [products.length])

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch =
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase())) ||
        product.category.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, search])

  return (
    <div>
      {/* Search and Category Filter Bar */}
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar with Accessible Label */}
        <div className="relative flex-1 max-w-md">
          <label htmlFor="storefront-search" className="sr-only">
            Search creator equipment
          </label>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden="true" />
          <input
            id="storefront-search"
            type="search"
            placeholder="Search cameras, lighting, mics, softboxes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search creator equipment by name, category, or description"
            className="w-full rounded-xl bg-[#1A1A1A] border border-[#262626] pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/40 transition"
          />
        </div>

        {/* Category Pills with ARIA Tab/Button Semantics */}
        <div 
          role="group" 
          aria-label="Filter equipment by category"
          className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none"
        >
          <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0 mr-1" aria-hidden="true" />
          {categories.map(category => {
            const isSelected = selectedCategory === category
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                  isSelected
                    ? 'bg-[#FF6B00] text-black shadow-md shadow-[#FF6B00]/20'
                    : 'bg-[#1A1A1A] border border-[#262626] text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Product Count Display */}
      <div className="mb-6 flex items-center justify-between text-xs text-zinc-400" aria-live="polite">
        <span>Showing {filteredProducts.length} creator gear recommendation{filteredProducts.length === 1 ? '' : 's'}</span>
        {selectedCategory !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedCategory('All')}
            className="text-[#FF9A3C] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF9A3C] rounded px-1"
          >
            Reset filter
          </button>
        )}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#262626] bg-[#1A1A1A]/40 p-12 text-center">
          <p className="text-lg font-semibold text-zinc-300">No equipment found</p>
          <p className="mt-1 text-sm text-zinc-500">
            Try adjusting your search keywords or select a different category filter.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedCategory('All')
            }}
            className="mt-4 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
