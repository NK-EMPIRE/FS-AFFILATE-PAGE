'use client'

import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react'
import FirstSelfieLogo from '@/components/Logo'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const notAuthorized = searchParams.get('error') === 'not_authorized'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      // 1. Authenticate with server to verify rate limits and admin table authorization
      let serverAuthOk = false
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        })

        const text = await res.text()
        let data: any = {}
        try {
          data = text ? JSON.parse(text) : {}
        } catch {
          data = { error: text || 'Server returned unexpected response' }
        }

        if (!res.ok) {
          setErrorMsg(data.error || `Authentication failed (${res.status}).`)
          setLoading(false)
          return
        }
        serverAuthOk = true
      } catch (fetchErr: any) {
        console.warn('Server auth endpoint warning, trying direct client authentication:', fetchErr)
      }

      // 2. Also authenticate browser Supabase client to sync local cookies/tokens for middleware
      const supabase = createClient()
      const { data: authData, error: clientAuthErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (clientAuthErr) {
        setErrorMsg(clientAuthErr.message)
        setLoading(false)
        return
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#262626] bg-[#1A1A1A] p-8 shadow-2xl">
        <div className="text-center mb-8">
          <FirstSelfieLogo size="md" className="justify-center" />
          <h2 className="mt-4 text-xl font-bold text-white">Admin Authentication</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Internal management for FirstSelfie affiliate inventory
          </p>
        </div>

        {notAuthorized && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Unauthorized: Your user account is not an approved admin.</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@firstselfie.com"
                className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg bg-[#0A0A0A] border border-[#262626] pl-10 pr-4 py-2.5 text-sm text-white focus:border-[#FF6B00] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] py-2.5 px-4 text-sm font-bold text-black hover:bg-[#FF3D00] hover:text-white transition disabled:opacity-50"
          >
            {loading ? (
              <span>Verifying...</span>
            ) : (
              <>
                <span>Sign In to Admin</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 border-t border-[#262626] pt-4 text-center text-xs text-zinc-500">
          Supabase Auth Protected • Service Role RLS Enforced
        </div>
      </div>
    </div>
  )
}
