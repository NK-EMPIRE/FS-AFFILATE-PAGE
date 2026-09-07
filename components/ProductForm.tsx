'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductSchema } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { ArrowLeft, Save, Upload, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProductFormProps {
  initialData?: Product
  isEdit?: boolean
}

export default function ProductForm({ initialData, isEdit = false }: ProductFormProps) {
  const router = useRouter()

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [price, setPrice] = useState(initialData?.price?.toString() || '')
  const [category, setCategory] = useState(initialData?.category || 'Camera')
  const [amazonUrl, setAmazonUrl] = useState(initialData?.amazon_url || '')
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [featured, setFeatured] = useState(initialData?.featured || false)
  const [active, setActive] = useState(initialData?.active ?? true)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-slugify from title on blur if slug is empty
  const handleTitleBlur = () => {
    if (!slug && title) {
      const generated = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setSlug(generated)
    }
  }

  // Handle client-side image compression & upload to Supabase Storage
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      // Compress to max 800px webp
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        fileType: 'image/webp',
      }
      const compressedFile = await imageCompression(file, options)

      const supabase = createClient()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, compressedFile)

      if (error) {
        // If storage bucket isn't configured, notify user gracefully
        alert('Supabase Storage Note: Make sure "product-images" bucket exists in Supabase. You can also paste an image URL directly.')
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        setImageUrl(publicUrlData.publicUrl)
      }
    } catch (err: any) {
      console.error('Compression/Upload error:', err)
      alert('Upload error: ' + err.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    const payload = {
      title,
      slug,
      price: Number(price),
      category,
      amazon_url: amazonUrl,
      image_url: imageUrl || '',
      description: description || '',
      featured,
      active,
    }

    // Validate with Zod
    const validation = ProductSchema.safeParse(payload)
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {}
      validation.error.issues.forEach(issue => {
        const path = issue.path[0] as string
        formattedErrors[path] = issue.message
      })
      setErrors(formattedErrors)
      setSubmitting(false)
      return
    }

    const supabase = createClient()

    if (isEdit && initialData?.id) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', initialData.id)

      if (error) {
        alert('Update error: ' + error.message)
        setSubmitting(false)
        return
      }
    } else {
      const { error } = await supabase.from('products').insert([payload])

      if (error) {
        alert('Insert error: ' + error.message)
        setSubmitting(false)
        return
      }
    }

    // Invalidate Redis product cache and Next.js ISR cache
    try {
      await fetch('/api/products/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: payload.slug }),
      })
    } catch (revalErr) {
      console.error('Revalidation error:', revalErr)
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-lg bg-[#FF6B00] px-5 py-2 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{submitting ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}</span>
        </button>
      </div>

      <div className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Product Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="e.g. Godox 60W Studio Video Key/Fill Light"
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Slug * (/go/[slug])
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase())}
            placeholder="godox-60w-studio-light"
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white font-mono focus:border-[#FF6B00] focus:outline-none"
          />
          {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Price (INR) *
            </label>
            <input
              type="number"
              step="any"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="9990"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white font-mono focus:border-[#FF6B00] focus:outline-none"
            />
            {errors.price && <p className="mt-1 text-xs text-red-400">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
            >
              <option value="Camera">Camera</option>
              <option value="Camera Tripod">Camera Tripod</option>
              <option value="Microphone">Microphone</option>
              <option value="Lighting">Lighting</option>
              <option value="Storage">Storage</option>
              <option value="Accessories">Accessories</option>
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
          </div>
        </div>

        {/* Amazon Affiliate URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Amazon Destination URL *
          </label>
          <input
            type="url"
            required
            value={amazonUrl}
            onChange={e => setAmazonUrl(e.target.value)}
            placeholder="https://link.amazon/B0cgLebXO or https://www.amazon.in/dp/..."
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
          />
          {errors.amazon_url && <p className="mt-1 text-xs text-red-400">{errors.amazon_url}</p>}
        </div>

        {/* Image Upload / URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Product Image (Upload or direct URL)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
            />
            <label className="flex items-center justify-center gap-2 cursor-pointer rounded-lg border border-[#262626] bg-[#262626] px-4 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:border-[#FF6B00] transition">
              <Upload className="w-4 h-4" />
              <span>{uploadingImage ? 'Compressing...' : 'Upload Image'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </label>
          </div>
          {imageUrl && (
            <div className="mt-3 flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-black border border-[#262626]">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" />
              </div>
              <span className="text-[11px] text-zinc-500 truncate max-w-md">{imageUrl}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Key features, priority rating, and studio setup recommendations."
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
          />
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded accent-[#FF6B00]"
            />
            <span className="text-xs font-semibold text-zinc-200">Featured / Essential Gear</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={e => setActive(e.target.checked)}
              className="h-4 w-4 rounded accent-emerald-500"
            />
            <span className="text-xs font-semibold text-zinc-200">Active (Visible on Storefront)</span>
          </label>
        </div>
      </div>
    </form>
  )
}
