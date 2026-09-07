import React from 'react'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { Product } from '@/lib/types'
import AdminProductTable from './AdminProductTable'
import { Plus, BarChart3, Package } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = createAdminClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  const { count: totalClicks } = await supabase
    .from('clicks')
    .select('*', { count: 'exact', head: true })

  const productList: Product[] = products || []

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#262626] pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Product Inventory & Admin</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage your FirstSelfie creator affiliate catalog, track links, and toggle status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/analytics"
            className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#1A1A1A] px-4 py-2 text-xs font-semibold text-[#FFE0C2] hover:border-[#FF6B00] hover:text-[#FF6B00] transition"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Catalog Items</span>
            <Package className="w-4 h-4 text-[#FF6B00]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{productList.length}</div>
        </div>

        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Active Items</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {productList.filter(p => p.active).length}
          </div>
        </div>

        <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-5">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total Affiliate Clicks</span>
            <BarChart3 className="w-4 h-4 text-[#FF9A3C]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalClicks || 0}</div>
        </div>
      </div>

      {/* Interactive Table Client Component */}
      <AdminProductTable initialProducts={productList} />
    </div>
  )
}
