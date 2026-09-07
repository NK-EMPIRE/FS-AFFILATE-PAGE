import { createBrowserClient } from '@supabase/ssr'

const DEFAULT_SUPABASE_URL = 'https://bgweakdzfnfedmcbrkuo.supabase.co'
const DEFAULT_SUPABASE_ANON = 'sb_publishable_qC_4e4xNAsY-lGM4uUbjxw_SkWnomSr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON

  return createBrowserClient(url, key)
}
