import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const publicPaths = new Set(['/login', '/daftar', '/lupa-sandi', '/reset-password'])

function isPublicPath(path: string) {
  return publicPaths.has(path) || path.startsWith('/auth/')
}

function loginRedirect(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  const nextPath = request.nextUrl.pathname + request.nextUrl.search
  // Keep only a same-site relative path; never accept an absolute redirect target.
  if (nextPath.startsWith('/') && !nextPath.startsWith('//')) {
    loginUrl.searchParams.set('next', nextPath)
  }
  return NextResponse.redirect(loginUrl)
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const response = NextResponse.next({ request })

  // Missing environment variables must not crash every route with a 500.
  // Public auth screens remain accessible so local setup can be completed.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return isPublicPath(path) ? response : loginRedirect(request)
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    })

    // Verify the session with Supabase instead of trusting cookie contents.
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return isPublicPath(path) ? response : loginRedirect(request)
    }

    if (path === '/login' || path === '/daftar') {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const roleRules: Record<string, string[]> = {
      '/admin': ['admin', 'administrator'],
      '/guru': ['admin', 'administrator', 'teacher', 'guru'],
      '/siswa': ['admin', 'administrator', 'teacher', 'guru', 'student', 'siswa'],
      '/orang-tua': ['admin', 'administrator', 'parent', 'orang_tua', 'orangtua'],
    }

    const restrictedArea = Object.keys(roleRules).find(
      (area) => path === area || path.startsWith(`${area}/`)
    )

    if (!restrictedArea) return response

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return new NextResponse('Profil pengguna tidak ditemukan atau belum dapat diakses.', {
        status: 403,
      })
    }

    const normalizedRole = (profile.role ?? '').trim().toLowerCase()
    if (!roleRules[restrictedArea].includes(normalizedRole)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    return response
  } catch {
    // A temporary Supabase/network/configuration failure should not crash the
    // middleware runtime. Let public pages render; protect private pages.
    return isPublicPath(path)
      ? response
      : new NextResponse('Layanan autentikasi sedang tidak tersedia. Periksa konfigurasi Supabase dan coba lagi.', {
          status: 503,
          headers: { 'content-type': 'text/plain; charset=utf-8' },
        })
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
