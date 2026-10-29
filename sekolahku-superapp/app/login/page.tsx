'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setPesan('')

    try {
      const { error } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setPesan('Login gagal. Periksa email dan kata sandi, lalu coba lagi.')
        return
      }

      // Hanya izinkan tujuan lokal agar parameter next tidak menjadi open redirect.
      const requestedNext = new URLSearchParams(window.location.search).get('next')
      const safeNext = requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
        ? requestedNext
        : '/'
      window.location.href = safeNext
    } catch {
      setPesan('Layanan login belum siap. Periksa konfigurasi Supabase lalu coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 24 }}>
      <h1>SekolahKu</h1>
      <h2>Masuk ke akun</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', boxSizing: 'border-box', width: '100%', padding: 12, margin: '8px 0 16px' }}
        />

        <label htmlFor="password">Kata sandi</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', boxSizing: 'border-box', width: '100%', padding: 12, margin: '8px 0 16px' }}
        />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p><Link href="/lupa-sandi">Lupa kata sandi?</Link></p>
      {pesan && <p role="alert" aria-live="polite">{pesan}</p>}
      <p>Belum punya akun? <Link href="/daftar">Daftar di sini</Link></p>
    </main>
  )
}
