
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

export default function LupaSandiPage() {
  const [email, setEmail] = useState('')
    const [pesan, setPesan] = useState('')
      const [loading, setLoading] = useState(false)

        async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
            e.preventDefault()
                setLoading(true)
                    setPesan('')

                        const { error } = await getSupabase().auth.resetPasswordForEmail(email, {
                              redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
                                  })

                                      setLoading(false)

                                          if (error) {
                                                setPesan(`Gagal mengirim permintaan: ${error.message}`)
                                                      return
                                                          }

                                                              setPesan(
                                                                    'Jika email terdaftar, tautan reset sandi akan dikirim. Periksa kotak masuk dan folder spam.'
                                                                        )
                                                                          }

                                                                            return (
                                                                                <main style={{ maxWidth: 420, margin: '60px auto', padding: 24 }}>
                                                                                      <h1>SekolahKu</h1>
                                                                                            <h2>Lupa kata sandi?</h2>
                                                                                                  <p>Masukkan email akunmu untuk menerima tautan reset sandi.</p>

                                                                                                        <form onSubmit={handleSubmit}>
                                                                                                                <label htmlFor="email">Email terdaftar</label>
                                                                                                                        <input
                                                                                                                                  id="email"
                                                                                                                                            type="email"
                                                                                                                                                      required
                                                                                                                                                                value={email}
                                                                                                                                                                          onChange={(e) => setEmail(e.target.value)}
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
                                                                                                                                                                                                                                                                                              disabled={loading}
                                                                                                                                                                                                                                                                                                        style={{ width: '100%', padding: 12 }}
                                                                                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                                                                                          {loading ? 'Mengirim...' : 'Kirim tautan reset sandi'}
                                                                                                                                                                                                                                                                                                                                  </button>
                                                                                                                                                                                                                                                                                                                                        </form>

                                                                                                                                                                                                                                                                                                                                              {pesan && <p role="status">{pesan}</p>}
                                                                                                                                                                                                                                                                                                                                                    <p><Link href="/login">Kembali ke halaman masuk</Link></p>
                                                                                                                                                                                                                                                                                                                                                        </main>
                                                                                                                                                                                                                                                                                                                                                          )
                                                                                                                                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                                                                                                                                          
