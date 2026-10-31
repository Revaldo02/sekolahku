'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Megaphone, Plus, RefreshCw, Save, Send, EyeOff } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Announcement = {
  id: string
  title: string
  body: string
  published: boolean
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

const buttonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '11px 14px',
  border: 0,
  borderRadius: 9,
  background: '#4267e8',
  color: '#fff',
  fontWeight: 700,
  cursor: 'pointer',
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Tanggal tidak tersedia'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(date)
}

export default function KelolaPengumumanPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function refresh() {
    const db = getSupabase()
    const { data, error: queryError } = await db
      .from('announcements')
      .select('id,title,body,published,created_at')
      .order('created_at', { ascending: false })
      .limit(100)
    if (queryError) throw queryError
    setItems((data ?? []) as Announcement[])
  }

  useEffect(() => {
    let active = true
    async function initialize() {
      try {
        const db = getSupabase()
        const { data: { user }, error: authError } = await db.auth.getUser()
        if (authError || !user) {
          window.location.href = '/login'
          return
        }
        const { data: role, error: roleError } = await db.rpc('current_user_role')
        if (roleError) throw roleError
        const allowed = role === 'admin' || role === 'teacher'
        if (active) setCanManage(allowed)
        if (!allowed) return
        await refresh()
      } catch {
        if (active) setError('Data pengumuman gagal dimuat. Periksa koneksi dan izin akun.')
      } finally {
        if (active) setLoading(false)
      }
    }
    void initialize()
    return () => { active = false }
  }, [])

  function startEdit(item: Announcement) {
    setEditingId(item.id)
    setTitle(item.title)
    setBody(item.body)
    setMessage('')
    setError('')
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setBody('')
  }

  async function saveAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage || !title.trim() || !body.trim()) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const db = getSupabase()
      const payload = { title: title.trim(), body: body.trim() }
      const result = editingId
        ? await db.from('announcements').update(payload).eq('id', editingId)
        : await db.from('announcements').insert({ ...payload, published: false })
      if (result.error) throw result.error
      resetForm()
      await refresh()
      setMessage(editingId ? 'Perubahan pengumuman berhasil disimpan.' : 'Pengumuman berhasil disimpan sebagai draf.')
    } catch {
      setError('Pengumuman gagal disimpan. Periksa izin akun dan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(item: Announcement) {
    if (!canManage || saving) return
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const { error: updateError } = await getSupabase()
        .from('announcements')
        .update({ published: !item.published })
        .eq('id', item.id)
      if (updateError) throw updateError
      await refresh()
      setMessage(item.published ? 'Pengumuman ditarik dan menjadi draf.' : 'Pengumuman berhasil dipublikasikan.')
    } catch {
      setError('Status publikasi gagal diubah. Periksa izin akun dan coba lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial,sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/pengumuman" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4267e8', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={18} /> Kembali ke pengumuman
        </Link>
        <header style={{ background: 'linear-gradient(120deg,#fff,#eef3ff)', border: '1px solid #e8edf4', borderRadius: 18, padding: 24, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4267e8', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
            <Megaphone size={20} /> ADMINISTRASI SEKOLAHKU
          </div>
          <h1 style={{ fontSize: 'clamp(27px,5vw,36px)', margin: '14px 0 8px' }}>Kelola Pengumuman</h1>
          <p style={{ color: '#718096', margin: 0, lineHeight: 1.7 }}>Buat draf, perbarui isi, dan atur publikasi informasi sekolah.</p>
        </header>

        {message && <p role="status" style={{ padding: 13, background: '#edf8f1', color: '#21633a', borderRadius: 10 }}>{message}</p>}
        {error && <p role="alert" style={{ padding: 13, background: '#fff0ef', color: '#a33b35', borderRadius: 10 }}>{error}</p>}

        {loading ? (
          <section style={{ background: '#fff', borderRadius: 14, padding: 22 }}>Memeriksa akses dan memuat pengumuman…</section>
        ) : !canManage ? (
          <section style={{ background: '#fff', borderRadius: 14, padding: 22 }}>
            <h2>Akses tidak tersedia</h2>
            <p>Halaman pengelolaan pengumuman hanya dapat digunakan oleh admin dan guru.</p>
          </section>
        ) : (
          <>
            <section style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <h2 style={{ marginTop: 0 }}>{editingId ? 'Ubah pengumuman' : 'Buat pengumuman'}</h2>
              <form onSubmit={saveAnnouncement} style={{ display: 'grid', gap: 12 }}>
                <label>Judul
                  <input required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} placeholder="Contoh: Jadwal kegiatan sekolah" style={{ ...fieldStyle, marginTop: 6 }} />
                </label>
                <label>Isi pengumuman
                  <textarea required maxLength={10000} rows={6} value={body} onChange={event => setBody(event.target.value)} placeholder="Tuliskan informasi yang perlu diketahui warga sekolah…" style={{ ...fieldStyle, marginTop: 6, resize: 'vertical' }} />
                </label>
                <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
                  <button type="submit" disabled={saving || !title.trim() || !body.trim()} style={{ ...buttonStyle, opacity: saving ? 0.7 : 1 }}>
                    {editingId ? <Save size={17} /> : <Plus size={17} />}
                    {saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Simpan sebagai draf'}
                  </button>
                  {editingId && <button type="button" disabled={saving} onClick={resetForm} style={{ ...buttonStyle, background: '#64748b' }}>Batal</button>}
                </div>
                <p style={{ margin: 0, color: '#718096', fontSize: 12 }}>Pengumuman baru disimpan sebagai draf dan tidak terlihat oleh siswa/orang tua sampai dipublikasikan.</p>
              </form>
            </section>

            <section style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0 }}>Daftar pengumuman ({items.length})</h2>
                <button type="button" disabled={saving} onClick={() => void refresh().catch(() => setError('Gagal memuat ulang daftar pengumuman.'))} style={{ ...buttonStyle, background: '#eef2ff', color: '#3657c8' }}>
                  <RefreshCw size={16} /> Muat ulang
                </button>
              </div>
              {items.length ? (
                <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                  {items.map(item => (
                    <article key={item.id} style={{ border: '1px solid #e8edf4', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
                          <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 20, background: item.published ? '#eaf7ef' : '#f1f3f7', color: item.published ? '#21633a' : '#596579', fontSize: 12, fontWeight: 700 }}>
                            {item.published ? 'Dipublikasikan' : 'Draf'}
                          </span>
                          <h3 style={{ margin: '10px 0 6px', overflowWrap: 'anywhere' }}>{item.title}</h3>
                          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', color: '#64728a', lineHeight: 1.7, margin: '0 0 8px' }}>{item.body}</p>
                          <small style={{ color: '#8b97aa' }}>{formatDate(item.created_at)}</small>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" disabled={saving} onClick={() => startEdit(item)} style={{ ...buttonStyle, background: '#eef2ff', color: '#3657c8' }}>Ubah</button>
                          <button type="button" disabled={saving} onClick={() => void togglePublished(item)} style={{ ...buttonStyle, background: item.published ? '#64748b' : '#16834a' }}>
                            {item.published ? <EyeOff size={16} /> : <Send size={16} />}
                            {item.published ? 'Tarik publikasi' : 'Publikasikan'}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : <p style={{ color: '#718096', marginTop: 18 }}>Belum ada pengumuman. Buat pengumuman pertama melalui formulir di atas.</p>}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
