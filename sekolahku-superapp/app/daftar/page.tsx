'use client'

import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import Link from 'next/link'

export default function DaftarPage() {
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pesan, setPesan] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleDaftar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setPesan('')

    try {
      const { data, error } = await getSupabase().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: nama.trim() } },
      })

      if (error) {
        setPesan('Pendaftaran gagal. Periksa data yang dimasukkan lalu coba lagi.')
        return
      }

      if (data.session) {
        window.location.href = '/'
        return
      }

      setPesan('Pendaftaran diterima. Jika konfirmasi email aktif, buka email untuk menyelesaikan pendaftaran.')
    } catch {
      setPesan('Layanan pendaftaran belum siap. Periksa konfigurasi Supabase lalu coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 24 }}>
      <h1>SekolahKu</h1>
      <h2>Buat akun</h2>
      <p>Peran dan hak akses akun mengikuti konfigurasi sekolah.</p>
      <form onSubmit={handleDaftar}>
        <label htmlFor="nama">Nama lengkap</label>
        <input
          id="nama"
          autoComplete="name"
          required
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          style={{ display: 'block', boxSizing: 'border-box', width: '100%', padding: 12, margin: '8px 0 16px' }}
        />

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

        <label htmlFor="password">Kata sandi (minimal 8 karakter)</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', boxSizing: 'border-box', width: '100%', padding: 12, margin: '8px 0 16px' }}
        />

        <button type="submit" disabled={loading} style={{ width: '100%', padding: 12 }}>
          {loading ? 'Memproses...' : 'Daftar'}
        </button>
      </form>
      {pesan && <p role="status" aria-live="polite">{pesan}</p>}
      <p>Sudah punya akun? <Link href="/login">Masuk</Link></p>
    </main>
  )
}
