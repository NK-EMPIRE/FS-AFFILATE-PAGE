'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-red-950/40 p-4 text-red-500 mb-4">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
      <p className="mt-2 text-xs text-zinc-400 max-w-md">
        An unexpected error occurred while loading this view.
      </p>

      {error?.message && (
        <div className="mt-4 max-w-lg rounded-lg border border-red-800/60 bg-red-950/40 p-3 text-left font-mono text-xs text-red-300">
          <p className="font-semibold text-red-200">Error Details:</p>
          <p className="break-all mt-1">{error.message}</p>
          {error.digest && (
            <p className="text-[10px] text-zinc-400 mt-1">Digest: {error.digest}</p>
          )}
        </div>
      )}

      <button
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 text-xs font-bold text-black hover:bg-[#FF3D00] hover:text-white transition"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  )
}
