import React from 'react'
import ProductForm from '@/components/ProductForm'

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add New Equipment</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Add an Amazon affiliate product to your FirstSelfie creator store.
        </p>
      </div>

      <ProductForm />
    </div>
  )
}
