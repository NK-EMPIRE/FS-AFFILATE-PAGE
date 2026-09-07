'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Product } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Edit2, Trash2, ExternalLink, Check, X, AlertTriangle } from 'lucide-react'

interface Props {
  initialProducts: Product[]
}

export default function AdminProductTable({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const toggleStatus = async (id: string, field: 'active' | 'featured', currentVal: boolean) => {
    const supabase = createClient()
    const newVal = !currentVal

    // Optimistic update
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: newVal } : p))
    )

    const { error } = await supabase
      .from('products')
      .update({ [field]: newVal })
      .eq('id', id)

    if (error) {
      alert('Failed to update: ' + error.message)
      // Revert on error
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, [field]: currentVal } : p))
      )
    } else {
      const prod = products.find(p => p.id === id)
      if (prod) {
        fetch('/api/products/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: prod.slug }),
        }).catch(console.error)
      }
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !deleteTarget.id) return
    setActionLoading(true)

    const targetSlug = deleteTarget.slug
    const supabase = createClient()
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id)

    if (error) {
      alert('Delete failed: ' + error.message)
    } else {
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)

      if (targetSlug) {
        fetch('/api/products/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: targetSlug }),
        }).catch(console.error)
      }
    }
    setActionLoading(false)
  }

  return (
    <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-[#141414] text-zinc-400 uppercase tracking-wider border-b border-[#262626]">
            <tr>
              <th className="py-3.5 px-4">Item</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4 text-center">Featured</th>
              <th className="py-3.5 px-4 text-center">Active</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-[#212121]/50 transition">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-black">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-600">
                          N/A
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white max-w-xs truncate">
                        {product.title}
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">
                        /go/{product.slug}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="rounded bg-[#262626] px-2 py-0.5 text-zinc-300">
                    {product.category}
                  </span>
                </td>

                <td className="py-3 px-4 font-mono font-medium text-white whitespace-nowrap">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => product.id && toggleStatus(product.id, 'featured', !!product.featured)}
                    className={`p-1 rounded-md transition ${
                      product.featured
                        ? 'bg-[#FF6B00]/20 text-[#FF6B00]'
                        : 'bg-[#262626] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {product.featured ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => product.id && toggleStatus(product.id, 'active', !!product.active)}
                    className={`p-1 rounded-md transition ${
                      product.active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-[#262626] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {product.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/go/${product.slug}`}
                      target="_blank"
                      className="p-1.5 rounded bg-[#262626] text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                      title="Test Affiliate Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="p-1.5 rounded bg-[#262626] text-zinc-400 hover:text-[#FF6B00] hover:bg-zinc-700 transition"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      className="p-1.5 rounded bg-[#262626] text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#262626] bg-[#1A1A1A] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-white text-base">Confirm Delete</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">{deleteTarget.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="rounded-lg border border-[#262626] px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-[#262626]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                {actionLoading ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
