import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // Never redirect if already on /admin/login
  if (pathname === '/admin/login') {
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key missing in middleware')
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({
              request,
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const pathname = request.nextUrl.pathname

    // Protect /admin routes except /admin/login
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }

      // Verify user ID exists in 'admins' table
      const { data: adminRecord, error: adminErr } = await supabase
        .from('admins')
        .select('id')
        .eq('id', user.id)
        .single()

      if (adminErr || !adminRecord) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        url.searchParams.set('error', 'not_authorized')
        return NextResponse.redirect(url)
      }
    }
  } catch (err) {
    console.error('Middleware execution error caught:', err)
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
