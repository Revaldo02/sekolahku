'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, GraduationCap } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Teacher = { id: string; user_id: string | null; full_name: string; status: 'aktif' | 'nonaktif' }
type Subject = { id: string; name: string }
type Profile = { id: string; full_name: string; role: string }

const fieldStyle = { width: '100%', boxSizing: 'border-box' as const, padding: 12, border: '1px solid #dbe2ee', borderRadius: 8, fontSize: 15, marginTop: 5, background: '#fff', color: '#26334c' }
const buttonStyle = { padding: '10px 14px', background: '#4267e8', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }
const cardStyle = { background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20, marginBottom: 16 }

function errorText(err: unknown, fallback: string) {
  return err && typeof err === 'object' && 'message' in err ? String(err.message) : fallback
}

export default function KelolaGuruPage() {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [teacherName, setTeacherName] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [accountFor, setAccountFor] = useState<Record<string, string>>({})

  async function loadAll() {
    const db = getSupabase()
    const [t, s, p] = await Promise.all([
      db.from('teachers').select('id,user_id,full_name,status').order('full_name'),
      db.from('subjects').select('id,name').order('name'),
      db.from('profiles').select('id,full_name,role').order('full_name'),
    ])
    if (t.error) throw t.error
    if (s.error) throw s.error
    if (p.error) throw p.error
    setTeachers((t.data ?? []) as Teacher[])
    setSubjects((s.data ?? []) as Subject[])
    setProfiles((p.data ?? []) as Profile[])
  }

  useEffect(() => {
    let alive = true
    async function init() {
      try {
        const db = getSupabase()
        const { data: { user }, error: authError } = await db.auth.getUser()
        if (authError || !user) { window.location.href = '/login'; return }
        await loadAll()
      } catch (err) {
        if (alive) setMessage(errorText(err, 'Data belum dapat dimuat. Muat ulang halaman.'))
      } finally {
        if (alive) setLoading(false)
      }
    }
    void init()
    return () => { alive = false }
  }, [])

  async function run(action: () => Promise<void>, success: string, fallback: string) {
    setBusy(true)
    setMessage('')
    try {
      await action()
      await loadAll()
      setMessage(success)
    } catch (err) {
      setMessage(errorText(err, fallback))
    } finally {
      setBusy(false)
    }
  }

  const linkedUserIds = new Set(teachers.map(t => t.user_id).filter(Boolean))

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4267e8', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        <header style={{ ...cardStyle, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4267e8', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
            <GraduationCap size={20} /> ADMINISTRASI SEKOLAHKU
          </div>
          <h1 style={{ margin: '12px 0 6px' }}>Kelola Guru dan Mata Pelajaran</h1>
          <p style={{ color: '#718096', margin: 0, lineHeight: 1.7 }}>Daftarkan guru dan mata pelajaran. Hubungkan guru dengan akun yang sudah terdaftar.</p>
        </header>

        {message && <div role="status" style={{ ...cardStyle, padding: 14, overflowWrap: 'anywhere' }}>{message}</div>}
        {loading && <p>Memuat data…</p>}

        {!loading && (
          <>
            <section style={cardStyle}>
              <h2 style={{ fontSize: 18, marginTop: 0 }}>Daftar guru</h2>
              {teachers.length === 0 && <p style={{ color: '#718096' }}>Belum ada data guru.</p>}
              <div style={{ display: 'grid', gap: 10 }}>
                {teachers.map(t => (
                  <article key={t.id} style={{ border: '1px solid #e8edf4', borderRadius: 10, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div>
                        <b>{t.full_name}</b>
                        <div style={{ fontSize: 13, color: t.status === 'aktif' ? '#2f855a' : '#718096' }}>{t.status === 'aktif' ? 'Aktif' : 'Nonaktif'}</div>
                        <div style={{ fontSize: 13, color: t.user_id ? '#2f855a' : '#b7791f' }}>
                          {t.user_id ? `Akun: ${profiles.find(p => p.id === t.user_id)?.full_name ?? 'terhubung'}` : 'Belum terhubung ke akun'}
                        </div>
                      </div>
                      <button type="button" disabled={busy} style={{ ...buttonStyle, background: t.status === 'aktif' ? '#64748b' : '#2f855a' }}
                        onClick={() => run(async () => {
                          const { error } = await getSupabase().from('teachers').update({ status: t.status === 'aktif' ? 'nonaktif' : 'aktif' }).eq('id', t.id)
                          if (error) throw error
                        }, 'Status guru diperbarui.', 'Status guru gagal diubah.')}>
                        {t.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                    {!t.user_id && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        <select value={accountFor[t.id] ?? ''} onChange={e => setAccountFor(prev => ({ ...prev, [t.id]: e.target.value }))} style={{ ...fieldStyle, marginTop: 0, width: 'auto', flex: '1 1 220px' }}>
                          <option value="">Pilih akun guru</option>
                          {profiles.filter(p => !linkedUserIds.has(p.id)).map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>)}
                        </select>
                        <button type="button" disabled={busy || !accountFor[t.id]} style={buttonStyle}
                          onClick={() => run(async () => {
                            const { error } = await getSupabase().from('teachers').update({ user_id: accountFor[t.id] }).eq('id', t.id)
                            if (error) throw error
                          }, 'Akun guru berhasil dihubungkan.', 'Akun guru gagal dihubungkan. Pastikan akun belum terhubung ke guru lain.')}>
                          Hubungkan
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
              <form style={{ marginTop: 16, display: 'grid', gap: 10 }} onSubmit={e => {
                e.preventDefault()
                if (!teacherName.trim()) return
                void run(async () => {
                  const { error } = await getSupabase().from('teachers').insert({ full_name: teacherName.trim() })
                  if (error) throw error
                  setTeacherName('')
                }, 'Guru ditambahkan.', 'Guru gagal ditambahkan.')
              }}>
                <h3 style={{ margin: 0 }}>Tambah guru</h3>
                <label>Nama lengkap
                  <input required value={teacherName} onChange={e => setTeacherName(e.target.value)} style={fieldStyle} />
                </label>
                <div><button disabled={busy} style={buttonStyle}>Simpan guru</button></div>
              </form>
            </section>

            <section style={cardStyle}>
              <h2 style={{ fontSize: 18, marginTop: 0 }}>Mata pelajaran</h2>
              {subjects.length === 0 && <p style={{ color: '#718096' }}>Belum ada mata pelajaran.</p>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {subjects.map(s => (
                  <span key={s.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #e8edf4', borderRadius: 999, padding: '6px 12px', fontSize: 14 }}>
                    {s.name}
                    <button type="button" aria-label={`Hapus ${s.name}`} disabled={busy} style={{ border: 0, background: 'transparent', color: '#c53030', fontWeight: 700, cursor: 'pointer' }}
                      onClick={() => {
                        if (!window.confirm(`Hapus mata pelajaran ${s.name}?`)) return
                        void run(async () => {
                          const { error } = await getSupabase().from('subjects').delete().eq('id', s.id)
                          if (error) throw error
                        }, 'Mata pelajaran dihapus.', 'Mata pelajaran gagal dihapus.')
                      }}>×</button>
                  </span>
                ))}
              </div>
              <form style={{ marginTop: 16, display: 'grid', gap: 10 }} onSubmit={e => {
                e.preventDefault()
                if (!subjectName.trim()) return
                void run(async () => {
                  const { error } = await getSupabase().from('subjects').insert({ name: subjectName.trim() })
                  if (error) throw error
                  setSubjectName('')
                }, 'Mata pelajaran ditambahkan.', 'Mata pelajaran gagal ditambahkan. Mungkin sudah ada.')
              }}>
                <h3 style={{ margin: 0 }}>Tambah mata pelajaran</h3>
                <label>Nama mata pelajaran
                  <input required value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="Contoh: Matematika" style={fieldStyle} />
                </label>
                <div><button disabled={busy} style={buttonStyle}>Simpan mata pelajaran</button></div>
              </form>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
