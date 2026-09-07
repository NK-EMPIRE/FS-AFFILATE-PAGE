import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/ratelimit'
import { createServerClientWithAuth, createAdminClient } from '@/lib/supabase/server'

// In-memory lockout fallback for local development when Redis is absent
const inMemoryLoginAttempts = new Map<string, { count: number; lockedUntil: number }>()

function getLockoutDurationSeconds(failedAttempts: number): number {
  // Lockout formula:
  // attempt 5: 5 minutes (300s)
  // attempt 6: 10 minutes (600s)
  // attempt 7: 20 minutes (1200s)
  // attempt 8+: 40 minutes (2400s max)
  const exponent = Math.min(failedAttempts - 5, 3)
  return 300 * Math.pow(2, exponent)
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
  const redisKey = `login_fails:${ip}`
  const now = Date.now()

  let failedAttempts = 0
  let isLocked = false
  let lockoutRemainingSeconds = 0

  if (redis) {
    try {
      const stored = await redis.get<{ count: number; lockedUntil: number }>(redisKey)
      if (stored) {
        failedAttempts = stored.count || 0
        if (stored.lockedUntil && stored.lockedUntil > now) {
          isLocked = true
          lockoutRemainingSeconds = Math.ceil((stored.lockedUntil - now) / 1000)
        }
      }
    } catch (e) {
      console.warn('Redis read error for login backoff:', e)
    }
  } else {
    const mem = inMemoryLoginAttempts.get(ip)
    if (mem) {
      failedAttempts = mem.count
      if (mem.lockedUntil > now) {
        isLocked = true
        lockoutRemainingSeconds = Math.ceil((mem.lockedUntil - now) / 1000)
      }
    }
  }

  // Enforce lockout if locked
  if (isLocked) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Account locked. Try again in ${Math.ceil(lockoutRemainingSeconds / 60)} minutes.`,
        retryAfter: lockoutRemainingSeconds,
      },
      {
        status: 429,
        headers: {
          'Retry-After': lockoutRemainingSeconds.toString(),
        },
      }
    )
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  // Authenticate user via Supabase
  const supabase = await createServerClientWithAuth()
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    failedAttempts += 1
    let lockedUntil = 0
    let durationSeconds = 0

    if (failedAttempts >= 5) {
      durationSeconds = getLockoutDurationSeconds(failedAttempts)
      lockedUntil = now + durationSeconds * 1000
    }

    const failurePayload = { count: failedAttempts, lockedUntil }

    if (redis) {
      try {
        const ttl = durationSeconds > 0 ? durationSeconds : 3600
        await redis.set(redisKey, failurePayload, { ex: ttl })
      } catch (e) {
        console.warn('Redis write error for login failure:', e)
      }
    } else {
      inMemoryLoginAttempts.set(ip, failurePayload)
    }

    if (failedAttempts >= 5) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. IP locked for ${Math.ceil(durationSeconds / 60)} minutes.`,
          retryAfter: durationSeconds,
        },
        {
          status: 429,
          headers: { 'Retry-After': durationSeconds.toString() },
        }
      )
    }

    const attemptsRemaining = 5 - failedAttempts
    return NextResponse.json(
      {
        error: `${authError?.message || 'Invalid credentials'}. ${attemptsRemaining} attempt${attemptsRemaining === 1 ? '' : 's'} remaining before lockout.`,
      },
      { status: 401 }
    )
  }

  // Verify membership in admins table
  const adminClient = createAdminClient()
  const { data: adminRecord } = await adminClient
    .from('admins')
    .select('id')
    .eq('id', authData.user.id)
    .single()

  if (!adminRecord) {
    // Log out unapproved user
    await supabase.auth.signOut()
    return NextResponse.json(
      { error: 'User is authenticated but not authorized in the admins table.' },
      { status: 403 }
    )
  }

  // Successful login — reset failure counter
  if (redis) {
    try {
      await redis.del(redisKey)
    } catch (e) {
      console.warn('Redis delete error:', e)
    }
  } else {
    inMemoryLoginAttempts.delete(ip)
  }

  return NextResponse.json({ success: true, user: authData.user })
}
