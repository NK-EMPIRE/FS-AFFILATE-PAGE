'use client'

import React, { useState, useMemo } from 'react'
import { Product } from '@/lib/types'
import { FALLBACK_PRODUCTS } from '@/lib/initialData'
import ProductCard from './ProductCard'
import { Search, X } from 'lucide-react'

interface ProductFiltersProps {
  initialProducts: Product[]
}

export default function ProductFilters({ initialProducts }: ProductFiltersProps) {
  const [products, setProducts] = useState<Product[]>(
    initialProducts && initialProducts.length > 0 ? initialProducts : FALLBACK_PRODUCTS
  )
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured')

  // Client-side fallback sync
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
    const list = products.filter(product => {
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory
      const matchesSearch =
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase())) ||
        product.category.toLowerCase().includes(search.toLowerCase())

      return matchesCategory && matchesSearch
    })

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price)
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price)
    }
    if (sortBy === 'name') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title))
    }
    return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }, [products, selectedCategory, search, sortBy])

  return (
    <div>
      {/* Floating Minimal Search & Navigation Capsule */}
      <div className="sticky top-[64px] z-30 mb-10 rounded-2xl border border-white/[0.08] bg-[#0E0E10]/80 p-2 sm:p-2.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" aria-hidden="true" />
            <input
              id="storefront-search"
              type="text"
              placeholder="Search cameras, lighting, mics, softboxes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white/[0.03] border border-white/[0.04] pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-white/[0.2] focus:outline-none transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto appearance-none rounded-xl bg-white/[0.03] border border-white/[0.04] px-3.5 py-2 text-xs font-mono text-zinc-400 focus:border-white/[0.2] focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-[#141416]">Sort: Featured</option>
              <option value="price-asc" className="bg-[#141416]">Price: Low → High</option>
              <option value="price-desc" className="bg-[#141416]">Price: High → Low</option>
              <option value="name" className="bg-[#141416]">Name: A → Z</option>
            </select>
          </div>
        </div>

        {/* Minimal Category Strip */}
        <div className="mt-2.5 pt-2 border-t border-white/[0.04] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(category => {
            const isSelected = selectedCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Catalog Counter */}
      <div className="mb-6 flex items-center justify-between text-xs font-mono text-zinc-400">
        <span>
          COUNT: <span className="text-zinc-200">{filteredProducts.length}</span> ITEMS
        </span>
        {(selectedCategory !== 'All' || search) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All')
              setSearch('')
            }}
            className="text-zinc-400 hover:text-[#FF6B00] transition-colors"
          >
            RESET
          </button>
        )}
      </div>

      {/* Responsive Gallery Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredProducts.map(product => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] p-16 text-center">
          <p className="text-sm font-medium text-zinc-300">No equipment found</p>
          <p className="mt-1 text-xs text-zinc-400 font-mono">
            Adjust your search query or filter
          </p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedCategory('All')
            }}
            className="mt-4 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white hover:bg-white hover:text-black transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
