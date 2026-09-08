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
                    type="button"
                    onClick={() => product.id && toggleStatus(product.id, 'featured', !!product.featured)}
                    aria-label={`Toggle featured status for ${product.title}. Currently ${product.featured ? 'featured' : 'not featured'}`}
                    className={`p-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
                      product.featured
                        ? 'bg-[#FF6B00]/20 text-[#FF6B00]'
                        : 'bg-[#262626] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {product.featured ? <Check className="w-4 h-4" aria-hidden="true" /> : <X className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() => product.id && toggleStatus(product.id, 'active', !!product.active)}
                    aria-label={`Toggle active status for ${product.title}. Currently ${product.active ? 'active' : 'inactive'}`}
                    className={`p-1.5 rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                      product.active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-[#262626] text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {product.active ? <Check className="w-4 h-4" aria-hidden="true" /> : <X className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </td>

                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <a
                      href={`/go/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Test affiliate redirect link for ${product.title}`}
                      className="p-1.5 rounded bg-[#262626] text-zinc-400 hover:text-white hover:bg-zinc-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                      title="Test Affiliate Link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                    </a>
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      aria-label={`Edit ${product.title}`}
                      className="p-1.5 rounded bg-[#262626] text-zinc-400 hover:text-[#FF6B00] hover:bg-zinc-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(product)}
                      aria-label={`Delete ${product.title}`}
                      className="p-1.5 rounded bg-[#262626] text-zinc-400 hover:text-red-400 hover:bg-zinc-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 px-4 text-center">
                  <p className="text-sm font-semibold text-zinc-300">No equipment found in inventory</p>
                  <p className="mt-1 text-xs text-zinc-500 mb-4">Add your first creator gear item to start generating affiliate redirects.</p>
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition"
                  >
                    Add Equipment
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Accessible Delete Confirmation Modal */}
      {deleteTarget && (
        <div 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="delete-dialog-title"
          onKeyDown={e => e.key === 'Escape' && setDeleteTarget(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-xl border border-[#262626] bg-[#1A1A1A] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <AlertTriangle className="w-5 h-5 shrink-0" aria-hidden="true" />
              <h3 id="delete-dialog-title" className="font-bold text-white text-base">Confirm Delete</h3>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">{deleteTarget.title}</strong>? This action will remove the product and invalidate cached links.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={actionLoading}
                className="rounded-lg border border-[#262626] px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-[#262626] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
