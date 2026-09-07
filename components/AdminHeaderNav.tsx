'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, BarChart3, Plus, ShieldCheck } from 'lucide-react'

interface AdminHeaderNavProps {
  currentPath?: string
}

export default function AdminHeaderNav({ currentPath }: AdminHeaderNavProps) {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Clear any cookies and reload to login
      window.location.href = '/admin/login'
    } catch (err) {
      console.error('Logout error:', err)
      window.location.href = '/admin/login'
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        href="/admin/analytics"
        className="flex items-center gap-2 rounded-lg border border-[#262626] bg-[#1A1A1A] px-3.5 py-2 text-xs font-semibold text-[#FFE0C2] hover:border-[#FF6B00] hover:text-[#FF6B00] transition shadow-sm"
      >
        <BarChart3 className="w-4 h-4 text-[#FF9A3C]" />
        <span>Analytics</span>
      </Link>

      <Link
        href="/admin/products/new"
        className="flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition shadow-sm"
      >
        <Plus className="w-4 h-4" />
        <span>Add Product</span>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        title="Sign Out of Admin Session"
        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>
    </div>
  )
}
