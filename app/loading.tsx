import React from 'react'

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Hero Skeleton */}
      <div className="mb-14 flex flex-col items-center text-center">
        <div className="h-6 w-48 rounded-full bg-[#1A1A1A] mb-4" />
        <div className="h-12 w-3/4 max-w-xl rounded-xl bg-[#1A1A1A] mb-3" />
        <div className="h-4 w-1/2 max-w-md rounded bg-[#1A1A1A]" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
        <div className="h-10 w-72 rounded-xl bg-[#1A1A1A]" />
        <div className="h-10 w-96 rounded-xl bg-[#1A1A1A]" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[#262626] bg-[#1A1A1A] p-4">
            <div className="aspect-square w-full rounded-lg bg-[#262626] mb-4" />
            <div className="h-4 w-20 rounded bg-[#262626] mb-2" />
            <div className="h-5 w-full rounded bg-[#262626] mb-2" />
            <div className="h-4 w-3/4 rounded bg-[#262626] mb-4" />
            <div className="h-10 w-full rounded-lg bg-[#262626]" />
          </div>
        ))}
      </div>
    </div>
  )
}
