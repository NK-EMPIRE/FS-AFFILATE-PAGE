import { NextResponse } from 'next/server'
import { flushClickBatch } from '@/lib/clickQueue'

export async function GET() {
  const flushed = await flushClickBatch()
  return NextResponse.json({ success: true, flushedCount: flushed })
}

export async function POST() {
  const flushed = await flushClickBatch()
  return NextResponse.json({ success: true, flushedCount: flushed })
}
