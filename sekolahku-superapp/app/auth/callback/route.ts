
import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/reset-password'

        if (code) {
            const supabase = await createSupabaseServerClient()
                const { error } = await supabase.auth.exchangeCodeForSession(code)

                    if (!error) {
                          const safeNext =
                                  next.startsWith('/') && !next.startsWith('//')
                                            ? next
                                                      : '/reset-password'

                                                            return NextResponse.redirect(new URL(safeNext, origin))
                                                                }
                                                                  }

                                                                    return NextResponse.redirect(
                                                                        new URL('/lupa-sandi?error=tautan-tidak-valid', origin)
                                                                          )
                                                                          }
                                                                          