import React from 'react'
import Link from 'next/link'
import { ArrowLeft, HelpCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-[#FF6B00]/10 p-4 text-[#FF6B00] mb-4">
        <HelpCircle className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-extrabold text-white">Gear Not Found</h1>
      <p className="mt-2 text-sm text-zinc-400 max-w-sm">
        The equipment link or page you are looking for has been moved or retired.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Creator Store</span>
      </Link>
    </div>
  )
}
