import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({ request })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verifikasi sesi ke Supabase, bukan sekadar membaca cookie.
  const { data: { user }, error } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname
  const halamanPublik =
  path === '/login' ||
  path === '/daftar' ||
  path === '/lupa-sandi' ||
  path === '/reset-password' ||
  path.startsWith('/auth/')
  if (error || !user) {
    if (halamanPublik) return response

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', path)
    return NextResponse.redirect(loginUrl)
  }

  if (path === '/login' || path === '/daftar') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const aturanPeran: Record<string, string[]> = {
    '/admin': ['admin'],
    '/guru': ['admin', 'teacher'],
    '/siswa': ['admin', 'administrator', 'teacher', 'guru', 'student', 'siswa'],
    '/orang-tua': ['admin', 'parent'],
  }

  const areaTerbatas = Object.keys(aturanPeran).find(
    (area) => path === area || path.startsWith(`${area}/`)
  )

  // Halaman utama dan halaman umum tidak perlu profil untuk dirender.
  // Pemeriksaan profil hanya dilakukan saat pengguna membuka area berbasis peran.
  if (!areaTerbatas) {
    return response
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profile) {
    return new NextResponse('Profil pengguna tidak ditemukan.', {
      status: 403,
    })
  }

  const normalizedRole = (profile.role ?? '').trim().toLowerCase()\n  if (!aturanPeran[areaTerbatas].includes(normalizedRole)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
