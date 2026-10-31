'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type Profile = { id: string; full_name: string; role: string }
type Parent = { id: string; user_id: string | null; full_name: string; phone: string | null }
type Student = { id: string; full_name: string }
type Link = {
  student_id: string
  parent_id: string
  relationship: string | null
  is_verified: boolean
  students: { full_name: string } | null
  parents: { full_name: string } | null
}

const roleOptions = [
  { value: 'siswa', label: 'Siswa' },
  { value: 'orang_tua', label: 'Orang tua' },
  { value: 'guru', label: 'Guru' },
  { value: 'admin', label: 'Admin' },
]

const fieldStyle = { width: '100%', boxSizing: 'border-box' as const, padding: 12, border: '1px solid #dbe2ee', borderRadius: 8, fontSize: 15, marginTop: 5, background: '#fff', color: '#26334c' }
const buttonStyle = { padding: '10px 14px', background: '#4267e8', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }
const cardStyle = { background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20, marginBottom: 16 }

function errorText(err: unknown, fallback: string) {
  return err && typeof err === 'object' && 'message' in err ? String(err.message) : fallback
}

export default function VerifikasiOrangTuaPage() {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [message, setMessage] = useState('')
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [links, setLinks] = useState<Link[]>([])

  const [parentName, setParentName] = useState('')
  const [parentPhone, setParentPhone] = useState('')
  const [linkStudent, setLinkStudent] = useState('')
  const [linkParent, setLinkParent] = useState('')
  const [linkRelation, setLinkRelation] = useState('')
  const [accountParent, setAccountParent] = useState<Record<string, string>>({})

  async function loadAll() {
    const db = getSupabase()
    const [p, pa, s, l] = await Promise.all([
      db.from('profiles').select('id,full_name,role').order('full_name'),
      db.from('parents').select('id,user_id,full_name,phone').order('full_name'),
      db.from('students').select('id,full_name').order('full_name'),
      db.from('student_parents').select('student_id,parent_id,relationship,is_verified,students(full_name),parents(full_name)'),
    ])
    if (p.error) throw p.error
    if (pa.error) throw pa.error
    if (s.error) throw s.error
    if (l.error) throw l.error
    setProfiles((p.data ?? []) as Profile[])
    setParents((pa.data ?? []) as Parent[])
    setStudents((s.data ?? []) as Student[])
    setLinks((l.data ?? []) as unknown as Link[])
  }

  useEffect(() => {
    let alive = true
    async function init() {
      try {
        const db = getSupabase()
        const { data: { user }, error: authError } = await db.auth.getUser()
        if (authError || !user) { window.location.href = '/login'; return }
        const { data: roleData } = await db.rpc('current_user_role')
        if (alive) setIsAdmin(roleData === 'admin')
        await loadAll()
      } catch (err) {
        if (alive) setMessage(errorText(err, 'Data belum dapat dimuat. Periksa koneksi lalu muat ulang halaman.'))
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

  const parentById = new Map(parents.map(p => [p.id, p]))
  const linkedProfileIds = new Set(parents.map(p => p.user_id).filter(Boolean))

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4267e8', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        <header style={{ ...cardStyle, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4267e8', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
            <ShieldCheck size={20} /> ADMINISTRASI SEKOLAHKU
          </div>
          <h1 style={{ margin: '12px 0 6px' }}>Verifikasi Orang Tua</h1>
          <p style={{ color: '#718096', margin: 0, lineHeight: 1.7 }}>
            Hubungkan orang tua dengan anak, lalu verifikasi hubungan tersebut. Orang tua hanya bisa melihat anak yang sudah terverifikasi.
          </p>
        </header>

        {message && <div role="status" style={{ ...cardStyle, padding: 14, overflowWrap: 'anywhere' }}>{message}</div>}
        {loading && <p>Memuat data…</p>}

        {!loading && (
          <>
            <section style={cardStyle}>
              <h2 style={{ fontSize: 18, marginTop: 0 }}>Hubungan anak dan orang tua</h2>
              {links.length === 0 && <p style={{ color: '#718096' }}>Belum ada hubungan. Tambahkan melalui formulir di bawah.</p>}
              <div style={{ display: 'grid', gap: 10 }}>
                {links.map(link => (
                  <article key={`${link.student_id}-${link.parent_id}`} style={{ border: '1px solid #e8edf4', borderRadius: 10, padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <b>{link.students?.full_name ?? 'Siswa'}</b>
                      <div style={{ color: '#718096', fontSize: 13 }}>
                        Orang tua: {link.parents?.full_name ?? '-'}{link.relationship ? ` · ${link.relationship}` : ''}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: link.is_verified ? '#2f855a' : '#b7791f' }}>
                        {link.is_verified ? 'Terverifikasi' : 'Belum diverifikasi'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button type="button" disabled={busy} style={{ ...buttonStyle, background: link.is_verified ? '#64748b' : '#2f855a' }}
                        onClick={() => run(async () => {
                          const { error } = await getSupabase().from('student_parents').update({ is_verified: !link.is_verified }).eq('student_id', link.student_id).eq('parent_id', link.parent_id)
                          if (error) throw error
                        }, link.is_verified ? 'Verifikasi dicabut.' : 'Hubungan berhasil diverifikasi.', 'Status verifikasi gagal diubah.')}>
                        {link.is_verified ? 'Cabut verifikasi' : 'Verifikasi'}
                      </button>
                      <button type="button" disabled={busy} style={{ ...buttonStyle, background: '#c53030' }}
                        onClick={() => {
                          if (!window.confirm('Hapus hubungan anak dan orang tua ini?')) return
                          void run(async () => {
                            const { error } = await getSupabase().from('student_parents').delete().eq('student_id', link.student_id).eq('parent_id', link.parent_id)
                            if (error) throw error
                          }, 'Hubungan dihapus.', 'Hubungan gagal dihapus.')
                        }}>
                        Hapus
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <form style={{ marginTop: 18, display: 'grid', gap: 12 }} onSubmit={e => {
                e.preventDefault()
                if (!linkStudent || !linkParent) { setMessage('Pilih siswa dan orang tua terlebih dahulu.'); return }
                void run(async () => {
                  const { error } = await getSupabase().from('student_parents').insert({ student_id: linkStudent, parent_id: linkParent, relationship: linkRelation.trim() || null, is_verified: false })
                  if (error) throw error
                  setLinkStudent(''); setLinkParent(''); setLinkRelation('')
                }, 'Hubungan ditambahkan. Verifikasi setelah data sudah benar.', 'Hubungan gagal ditambahkan. Mungkin sudah ada.')
              }}>
                <h3 style={{ margin: 0 }}>Tambah hubungan</h3>
                <label>Siswa
                  <select required value={linkStudent} onChange={e => setLinkStudent(e.target.value)} style={fieldStyle}>
                    <option value="">Pilih siswa</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                  </select>
                </label>
                <label>Orang tua
                  <select required value={linkParent} onChange={e => setLinkParent(e.target.value)} style={fieldStyle}>
                    <option value="">Pilih orang tua</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </label>
                <label>Hubungan (opsional)
                  <input value={linkRelation} onChange={e => setLinkRelation(e.target.value)} placeholder="Contoh: Ayah, Ibu, Wali" style={fieldStyle} />
                </label>
                <div><button disabled={busy} style={buttonStyle}>Simpan hubungan</button></div>
              </form>
            </section>

            <section style={cardStyle}>
              <h2 style={{ fontSize: 18, marginTop: 0 }}>Data orang tua</h2>
              {parents.length === 0 && <p style={{ color: '#718096' }}>Belum ada data orang tua.</p>}
              <div style={{ display: 'grid', gap: 10 }}>
                {parents.map(p => {
                  const account = profiles.find(pr => pr.id === p.user_id)
                  return (
                    <article key={p.id} style={{ border: '1px solid #e8edf4', borderRadius: 10, padding: 14 }}>
                      <b>{p.full_name}</b>
                      <div style={{ color: '#718096', fontSize: 13 }}>{p.phone ? `Telepon: ${p.phone}` : 'Telepon belum diisi'}</div>
                      <div style={{ color: account ? '#2f855a' : '#b7791f', fontSize: 13, marginTop: 4 }}>
                        {account ? `Akun terhubung: ${account.full_name}` : 'Belum terhubung ke akun'}
                      </div>
                      {!p.user_id && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                          <select value={accountParent[p.id] ?? ''} onChange={e => setAccountParent(prev => ({ ...prev, [p.id]: e.target.value }))} style={{ ...fieldStyle, marginTop: 0, width: 'auto', flex: '1 1 220px' }}>
                            <option value="">Pilih akun orang tua</option>
                            {profiles.filter(pr => !linkedProfileIds.has(pr.id)).map(pr => <option key={pr.id} value={pr.id}>{pr.full_name} ({pr.role})</option>)}
                          </select>
                          <button type="button" disabled={busy || !accountParent[p.id]} style={buttonStyle}
                            onClick={() => run(async () => {
                              const { error } = await getSupabase().from('parents').update({ user_id: accountParent[p.id] }).eq('id', p.id)
                              if (error) throw error
                            }, 'Akun berhasil dihubungkan.', 'Akun gagal dihubungkan.')}>
                            Hubungkan akun
                          </button>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>

              <form style={{ marginTop: 18, display: 'grid', gap: 12 }} onSubmit={e => {
                e.preventDefault()
                if (!parentName.trim()) return
                void run(async () => {
                  const { error } = await getSupabase().from('parents').insert({ full_name: parentName.trim(), phone: parentPhone.trim() || null })
                  if (error) throw error
                  setParentName(''); setParentPhone('')
                }, 'Data orang tua ditambahkan.', 'Data orang tua gagal ditambahkan.')
              }}>
                <h3 style={{ margin: 0 }}>Tambah data orang tua</h3>
                <label>Nama lengkap
                  <input required value={parentName} onChange={e => setParentName(e.target.value)} style={fieldStyle} />
                </label>
                <label>Nomor telepon (opsional)
                  <input value={parentPhone} onChange={e => setParentPhone(e.target.value)} style={fieldStyle} />
                </label>
                <div><button disabled={busy} style={buttonStyle}>Simpan data orang tua</button></div>
              </form>
            </section>

            {isAdmin && (
              <section style={cardStyle}>
                <h2 style={{ fontSize: 18, marginTop: 0 }}>Peran akun</h2>
                <p style={{ color: '#718096', fontSize: 13, marginTop: 0 }}>Hanya admin yang dapat mengubah peran akun. Pastikan peran sesuai data sekolah.</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {profiles.map(pr => (
                    <div key={pr.id} style={{ border: '1px solid #e8edf4', borderRadius: 10, padding: 12, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      <div style={{ minWidth: 0 }}>
                        <b>{pr.full_name || 'Tanpa nama'}</b>
                        <div style={{ color: '#718096', fontSize: 12 }}>{parentById.get(pr.id) ? 'Terhubung ke data orang tua' : ''}</div>
                      </div>
                      <select value={pr.role} disabled={busy} onChange={e => {
                        const next = e.target.value
                        if (next === pr.role) return
                        if (!window.confirm(`Ubah peran ${pr.full_name} menjadi ${next}?`)) return
                        void run(async () => {
                          const { error } = await getSupabase().from('profiles').update({ role: next }).eq('id', pr.id)
                          if (error) throw error
                        }, 'Peran akun diperbarui.', 'Peran akun gagal diubah.')
                      }} style={{ ...fieldStyle, marginTop: 0, width: 'auto' }}>
                        {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
