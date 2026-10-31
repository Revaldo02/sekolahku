'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Megaphone, Search, CalendarDays, ArrowLeft, RefreshCw } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Announcement = {
  id: string
  title: string
  body: string
  created_at: string
}

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: '12px 14px',
  border: '1px solid #dbe2ee',
  borderRadius: 10,
  fontSize: 16,
  background: '#fff',
  color: '#26334c',
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(date)
}

export default function PengumumanPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState('')
  const [canManage, setCanManage] = useState(false)

  async function loadAnnouncements(isRefresh = false) {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setMessage('')
    try {
      const db = getSupabase()
      const { data: { user }, error: authError } = await db.auth.getUser()
      if (authError || !user) {
        window.location.href = '/login'
        return
      }

      const { data: role } = await db.rpc('current_user_role')
      setCanManage(role === 'admin' || role === 'teacher')

      const { data, error } = await db
        .from('announcements')
        .select('id,title,body,created_at')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setItems((data ?? []) as Announcement[])
    } catch {
      setMessage('Pengumuman belum dapat dimuat. Periksa koneksi atau izin akun, lalu coba lagi.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadAnnouncements()
  }, [])

  const visibleItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID')
    if (!query) return items
    return items.filter(item =>
      `${item.title} ${item.body}`.toLocaleLowerCase('id-ID').includes(query)
    )
  }, [items, search])

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4267e8', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        <header style={{ background: 'linear-gradient(120deg,#fff,#eef3ff)', border: '1px solid #e8edf4', borderRadius: 18, padding: '26px 24px', margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4267e8', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
            <Megaphone size={20} /> INFORMASI RESMI SEKOLAH
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,38px)', margin: '14px 0 8px' }}>Pengumuman</h1>
          <p style={{ color: '#718096', margin: 0, lineHeight: 1.7 }}>Baca informasi terbaru yang diterbitkan oleh sekolah.</p>
        </header>

        <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <div style={{ color: '#718096', fontSize: 13 }}>{items.length} pengumuman tersedia</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {canManage && <Link href="/kelola-pengumuman" style={{ padding: '10px 13px', borderRadius: 9, background: '#4267e8', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Kelola pengumuman</Link>}
          <button type="button" onClick={() => void loadAnnouncements(true)} disabled={loading || refreshing} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 13px', border: '1px solid #dbe2ee', borderRadius: 9, background: '#fff', color: '#26334c', fontWeight: 700 }}>
            <RefreshCw size={16} /> {refreshing ? 'Memuat ulang…' : 'Muat ulang'}
          </button>
          </div>
        </section>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid #e8edf4', borderRadius: 12, padding: '0 14px', marginBottom: 18 }}>
          <Search size={18} color="#718096" />
          <input aria-label="Cari pengumuman" placeholder="Cari judul atau isi pengumuman…" value={search} onChange={event => setSearch(event.target.value)} style={{ ...fieldStyle, border: 0, outline: 0 }} />
        </label>

        {message && <div role="alert" style={{ padding: 14, background: '#fff0ef', color: '#a33b35', borderRadius: 10, marginBottom: 16 }}>{message}</div>}

        {loading ? (
          <section aria-live="polite" style={{ background: '#fff', padding: 24, borderRadius: 14, border: '1px solid #e8edf4' }}>Memuat pengumuman…</section>
        ) : visibleItems.length ? (
          <div style={{ display: 'grid', gap: 14 }}>
            {visibleItems.map(item => (
              <article key={item.id} style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#718096', fontSize: 12, marginBottom: 10 }}>
                  <CalendarDays size={15} /> {formatDate(item.created_at)}
                </div>
                <h2 style={{ fontSize: 19, lineHeight: 1.4, margin: '0 0 10px' }}>{item.title}</h2>
                <p style={{ color: '#5e6b82', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.body}</p>
              </article>
            ))}
          </div>
        ) : (
          <section style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: '32px 24px', textAlign: 'center' }}>
            <span style={{ display: 'inline-grid', placeItems: 'center', width: 52, height: 52, borderRadius: 14, background: '#edf2ff', color: '#4267e8' }}><Megaphone size={24} /></span>
            <h2 style={{ marginBottom: 8 }}>{search ? 'Pengumuman tidak ditemukan' : 'Belum ada pengumuman'}</h2>
            <p style={{ color: '#718096', lineHeight: 1.7, margin: 0 }}>{search ? 'Coba kata kunci lain.' : 'Pengumuman yang telah dipublikasikan sekolah akan muncul di halaman ini.'}</p>
          </section>
        )}

        <footer style={{ padding: '24px 0 8px', color: '#8b97aa', fontSize: 12 }}>SekolahKu · Informasi hanya menampilkan pengumuman yang sudah dipublikasikan.</footer>
      </div>
    </main>
  )
}
