import React from 'react'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import ProductForm from '@/components/ProductForm'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Edit Equipment</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Update product specifications, affiliate links, and visibility.
        </p>
      </div>

      <ProductForm initialData={product} isEdit={true} />
    </div>
  )
}
