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

    const { error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setPesan('Login gagal: ' + error.message)
      return
    }

    // Kembali ke halaman tujuan setelah middleware mengarahkan pengguna ke login.
    // Hanya izinkan path lokal agar parameter next tidak menjadi open redirect.
    const requestedNext = new URLSearchParams(window.location.search).get('next')
    const safeNext = requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : '/'
    window.location.href = safeNext
  }

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 24 }}>
      <h1>SekolahKu</h1>
      <h2>Masuk ke akun</h2>
      <form onSubmit={handleLogin}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0 16px' }} />

        <label htmlFor="password">Kata sandi</label>
        <input id="password" type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', padding: 12, margin: '8px 0 16px' }} />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p>
        <Link href="/lupa-sandi">Lupa kata sandi?</Link>
        </p>
      {pesan && <p role="alert">{pesan}</p>}
      <p>Belum punya akun? <Link href="/daftar">Daftar di sini</Link></p>
    </main>
  )
}
