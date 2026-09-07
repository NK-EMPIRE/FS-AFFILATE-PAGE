import React from 'react'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { Product } from '@/lib/types'
import AdminProductTable from './AdminProductTable'
import AdminHeaderNav from '@/components/AdminHeaderNav'
import { Package, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  let productList: Product[] = []
  let totalClicks = 0

  try {
    const supabase = createAdminClient()
    if (supabase) {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (products) productList = products

      const { count } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })

      if (count) totalClicks = count
    }
  } catch (e) {
    console.error('Admin page query error:', e)
  }

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

        <AdminHeaderNav />
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
