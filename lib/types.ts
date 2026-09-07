import { z } from 'zod'

export const ProductSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(2, 'Title is required'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens'),
  image_url: z.string().url().optional().or(z.literal('')),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  amazon_url: z.string().regex(/^https:\/\/(www\.)?amazon\.[a-z.]+\/|^https:\/\/link\.amazon\//, 'Must be a valid Amazon or link.amazon URL'),
  description: z.string().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  created_at: z.string().optional(),
})

export type Product = z.infer<typeof ProductSchema>

export const SlugSchema = z.string().regex(/^[a-z0-9-]+$/)
