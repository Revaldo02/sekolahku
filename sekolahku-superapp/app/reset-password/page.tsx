'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pesan, setPesan] = useState('')
  const [berhasil, setBerhasil] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPesan('')
    setBerhasil(false)

    if (password.length < 8) {
      setPesan('Kata sandi minimal 8 karakter.')
      return
    }

    if (password !== confirmPassword) {
      setPesan('Kedua kata sandi belum sama.')
      return
    }

    setLoading(true)
    try {
      const { error } = await getSupabase().auth.updateUser({ password })
      if (error) {
        setPesan('Gagal mengubah sandi. Tautan mungkin kedaluwarsa. Minta tautan reset yang baru.')
        return
      }

      setBerhasil(true)
      setPesan('Kata sandi berhasil diperbarui. Silakan masuk kembali.')
    } catch {
      setPesan('Layanan autentikasi belum siap. Periksa konfigurasi Supabase lalu coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ maxWidth: 420, margin: '60px auto', padding: 24 }}>
      <h1>SekolahKu</h1>
      <h2>Buat kata sandi baru</h2>
      <p>Gunakan kata sandi minimal 8 karakter.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="password">Kata sandi baru</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            display: 'block',
            boxSizing: 'border-box',
            width: '100%',
            padding: 12,
            margin: '8px 0 16px',
          }}
        />

        <label htmlFor="confirmPassword">Ulangi kata sandi baru</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={{
            display: 'block',
            boxSizing: 'border-box',
            width: '100%',
            padding: 12,
            margin: '8px 0 16px',
          }}
        />

        <button
          type="submit"
          disabled={loading || berhasil}
          style={{ width: '100%', padding: 12 }}
        >
          {loading ? 'Menyimpan...' : 'Simpan kata sandi baru'}
        </button>
      </form>

      {pesan && <p role="status" aria-live="polite">{pesan}</p>}
      {berhasil && <p><Link href="/login">Kembali ke halaman masuk</Link></p>}
    </main>
  )
}
