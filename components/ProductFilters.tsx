'use client'

import React, { useState, useMemo } from 'react'
import { Product } from '@/lib/types'
import { FALLBACK_PRODUCTS } from '@/lib/initialData'
import ProductCard from './ProductCard'
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'

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
    // Default: featured first
    return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
  }, [products, selectedCategory, search, sortBy])

  return (
    <div>
      {/* Sleek Search & Controls Bar */}
      <div className="sticky top-[69px] z-30 mb-8 rounded-2xl border border-[#2B2B2B] bg-[#111111]/90 backdrop-blur-xl p-3 sm:p-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          {/* Quick Search Input */}
          <div className="relative flex-1">
            <label htmlFor="storefront-search" className="sr-only">
              Search creator equipment
            </label>
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden="true" />
            <input
              id="storefront-search"
              type="text"
              placeholder="Search Sony ZV-E10, Godox lighting, Hollyland mic..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search creator equipment"
              className="w-full rounded-xl bg-[#1A1A1A] border border-[#333] pl-10 pr-10 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#FF6B00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/40 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="appearance-none rounded-xl bg-[#1A1A1A] border border-[#333] px-3.5 py-2.5 pr-8 text-xs font-semibold text-zinc-300 focus:border-[#FF6B00] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Horizontal Category Carousel */}
        <div
          role="group"
          aria-label="Filter equipment by category"
          className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B00] shrink-0 mr-1 hidden sm:block" aria-hidden="true" />
          {categories.map(category => {
            const isSelected = selectedCategory === category
            return (
              <button
                key={category}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#FF6B00] to-[#FF3D00] text-black shadow-md shadow-[#FF6B00]/25'
                    : 'bg-[#1C1C1C] border border-[#2F2F2F] text-zinc-300 hover:text-white hover:border-[#FF6B00]/50'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>
      </div>

      {/* Product Count Display */}
      <div className="mb-6 flex items-center justify-between text-xs font-medium text-zinc-400" aria-live="polite">
        <span>
          Showing <span className="text-white font-bold">{filteredProducts.length}</span> curated studio recommendation{filteredProducts.length === 1 ? '' : 's'}
        </span>
        {(selectedCategory !== 'All' || search) && (
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All')
              setSearch('')
            }}
            className="text-[#FF9A3C] hover:underline font-semibold"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Responsive Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#2B2B2B] bg-[#141414]/70 p-12 text-center backdrop-blur-md">
          <p className="text-lg font-bold text-white">No gear matches your search</p>
          <p className="mt-1.5 text-xs text-zinc-400 max-w-sm mx-auto">
            We couldn't find any equipment matching "{search}". Try searching for cameras, mics, or softbox lights.
          </p>
          <button
            onClick={() => {
              setSearch('')
              setSelectedCategory('All')
            }}
            className="mt-5 rounded-xl bg-[#FF6B00] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
