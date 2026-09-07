'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Product, ProductSchema } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import imageCompression from 'browser-image-compression'
import { ArrowLeft, Save, Upload, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react'
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
  const [fetchingAmazon, setFetchingAmazon] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [autoFetchSuccess, setAutoFetchSuccess] = useState(false)

  // 1-Click Amazon Scraping Automation
  const handleAutoFetchAmazon = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || amazonUrl
    if (!urlToFetch) return

    setFetchingAmazon(true)
    setAutoFetchSuccess(false)
    try {
      const res = await fetch('/api/admin/scrape-amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      })

      const data = await res.json()
      if (res.ok && data.success && data.data) {
        const item = data.data
        if (item.title && (!title || title.length < 5)) {
          setTitle(item.title)
        }
        if (item.slug && !slug) {
          setSlug(item.slug)
        }
        if (item.price && !price) {
          setPrice(item.price.toString())
        }
        if (item.image_url) {
          setImageUrl(item.image_url)
        }
        if (item.category && category === 'Camera') {
          setCategory(item.category)
        }
        setAutoFetchSuccess(true)
        setTimeout(() => setAutoFetchSuccess(false), 4000)
      } else {
        alert(data.error || 'Could not auto-fetch Amazon details. You can enter them manually.')
      }
    } catch (err: any) {
      console.error('Auto-fetch error:', err)
      alert('Failed to connect to Amazon auto-fetch service: ' + err.message)
    } finally {
      setFetchingAmazon(false)
    }
  }

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
          <label htmlFor="product-title" className="block text-xs font-semibold text-zinc-300 mb-1">
            Product Title <span className="text-[#FF6B00]" aria-hidden="true">*</span>
          </label>
          <input
            id="product-title"
            type="text"
            required
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="e.g. Godox 60W Studio Video Key/Fill Light"
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/40 focus:outline-none transition"
          />
          {errors.title && <p id="title-error" className="mt-1 text-xs text-red-400" role="alert">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="product-slug" className="block text-xs font-semibold text-zinc-300 mb-1">
            Slug <span className="text-[#FF6B00]" aria-hidden="true">*</span> <span className="text-zinc-500 font-normal">(/go/[slug])</span>
          </label>
          <input
            id="product-slug"
            type="text"
            required
            aria-required="true"
            aria-invalid={!!errors.slug}
            aria-describedby={errors.slug ? 'slug-error' : undefined}
            value={slug}
            onChange={e => setSlug(e.target.value.toLowerCase())}
            placeholder="godox-60w-studio-light"
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white font-mono focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/40 focus:outline-none transition"
          />
          {errors.slug && <p id="slug-error" className="mt-1 text-xs text-red-400" role="alert">{errors.slug}</p>}
        </div>

        {/* Price & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="product-price" className="block text-xs font-semibold text-zinc-300 mb-1">
              Price (INR) <span className="text-[#FF6B00]" aria-hidden="true">*</span>
            </label>
            <input
              id="product-price"
              type="number"
              step="any"
              required
              aria-required="true"
              aria-invalid={!!errors.price}
              aria-describedby={errors.price ? 'price-error' : undefined}
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="9990"
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white font-mono focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/40 focus:outline-none transition"
            />
            {errors.price && <p id="price-error" className="mt-1 text-xs text-red-400" role="alert">{errors.price}</p>}
          </div>

          <div>
            <label htmlFor="product-category" className="block text-xs font-semibold text-zinc-300 mb-1">
              Category <span className="text-[#FF6B00]" aria-hidden="true">*</span>
            </label>
            <select
              id="product-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/40 focus:outline-none transition"
            >
              <option value="Camera">Camera</option>
              <option value="Camera Tripod">Camera Tripod</option>
              <option value="Microphone">Microphone</option>
              <option value="Lighting">Lighting</option>
              <option value="Storage">Storage</option>
              <option value="Accessories">Accessories</option>
            </select>
            {errors.category && <p id="category-error" className="mt-1 text-xs text-red-400" role="alert">{errors.category}</p>}
          </div>
        </div>

        {/* Amazon Affiliate URL with 1-Click Auto-Fetch */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="product-amazon-url" className="block text-xs font-semibold text-zinc-300">
              Amazon Destination URL <span className="text-[#FF6B00]" aria-hidden="true">*</span>
            </label>
            <button
              type="button"
              onClick={() => handleAutoFetchAmazon(amazonUrl)}
              disabled={fetchingAmazon || !amazonUrl}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#FF6B00]/40 bg-[#FF6B00]/10 px-2.5 py-1 text-[11px] font-bold text-[#FF9A3C] hover:bg-[#FF6B00] hover:text-black transition disabled:opacity-40 disabled:pointer-events-none"
            >
              {fetchingAmazon ? (
                <>
                  <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Fetching Details...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Auto-Fetch Title, Image & Price</span>
                </>
              )}
            </button>
          </div>
          <input
            id="product-amazon-url"
            type="url"
            required
            aria-required="true"
            aria-invalid={!!errors.amazon_url}
            aria-describedby={errors.amazon_url ? 'amazon-url-error' : undefined}
            value={amazonUrl}
            onChange={e => setAmazonUrl(e.target.value)}
            onPaste={e => {
              const pastedText = e.clipboardData.getData('text')
              if (pastedText && (pastedText.includes('amazon') || pastedText.includes('amzlinks') || pastedText.includes('amzn.to'))) {
                setTimeout(() => handleAutoFetchAmazon(pastedText), 100)
              }
            }}
            placeholder="https://link.amazon/B0hxg02gv or https://www.amazon.in/dp/..."
            className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] px-3.5 py-2 text-sm text-white focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/40 focus:outline-none transition"
          />
          {errors.amazon_url && <p id="amazon-url-error" className="mt-1 text-xs text-red-400" role="alert">{errors.amazon_url}</p>}
          <p className="mt-1 text-[11px] text-zinc-500">
            Paste any Amazon or link.amazon URL and click Auto-Fetch to automatically extract the high-res image, price, title, and slug.
          </p>
        </div>

        {/* Image Upload / URL */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">
            Product Image (Auto-populated or upload/paste)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://m.media-amazon.com/images/..."
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
