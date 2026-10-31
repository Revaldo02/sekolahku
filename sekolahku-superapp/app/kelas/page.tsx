'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

type SchoolClass = { id: string; name: string; created_at: string }
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: 12, border: '1px solid #dbe2ee', borderRadius: 8, margin: '5px 0 12px', fontSize: 16 }
const buttonStyle = { padding: '12px 16px', background: '#4267e8', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }

export default function KelasPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([])
  const [className, setClassName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canManage, setCanManage] = useState(false)
  const [message, setMessage] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  async function refresh() {
    const { data, error } = await getSupabase().from('classes').select('id,name,created_at').order('name')
    if (error) throw error
    setClasses((data ?? []) as SchoolClass[])
  }

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const supabase = getSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) { window.location.href = '/login'; return }
        const [{ data: profile }, { data: roleData }] = await Promise.all([
          supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
          supabase.rpc('current_user_role')
        ])
        const role = typeof roleData === 'string' && roleData ? roleData : (profile?.role ?? '')
        if (alive) setCanManage(['admin', 'guru'].includes(role))
        await refresh()
      } catch (err) {
        if (alive) setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Data kelas gagal dimuat.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  async function addClass(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!className.trim()) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await getSupabase().from('classes').insert({ name: className.trim() })
      if (error) throw error
      setClassName('')
      await refresh()
      setMessage('Kelas berhasil ditambahkan.')
    } catch (err) {
      setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Kelas gagal ditambahkan. Coba lagi.')
    } finally { setSaving(false) }
  }

  function beginEdit(c: SchoolClass) {
    setEditingId(c.id)
    setEditName(c.name)
    setMessage('')
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editingId || !editName.trim()) return
    setSaving(true)
    setMessage('')
    try {
      const { error } = await getSupabase().from('classes').update({ name: editName.trim() }).eq('id', editingId)
      if (error) throw error
      setEditingId(null)
      await refresh()
      setMessage('Perubahan kelas berhasil disimpan. Jadwal yang terkait tetap menggunakan kelas ini.')
    } catch (err) {
      setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Perubahan kelas gagal disimpan.')
    } finally { setSaving(false) }
  }

  return <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial,sans-serif', padding: 20 }}>
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Link href="/" style={{ color: '#4267e8' }}>← Kembali ke Beranda</Link>
      <header style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 16, padding: 24, margin: '20px 0' }}>
        <p style={{ color: '#4267e8', fontWeight: 800 }}>ADMINISTRASI SEKOLAHKU</p>
        <h1>Kelola Kelas</h1>
        <p>Daftarkan rombongan belajar menggunakan nama kelas saja.</p>
      </header>
      {message && <p role="status" style={{ padding: 12, background: '#fff', borderRadius: 8, overflowWrap: 'anywhere' }}>{message}</p>}
      {canManage && <section style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 16 }}>
        <h2>Tambah kelas</h2>
        <form onSubmit={addClass}>
          <label>Nama kelas<input required value={className} onChange={e => setClassName(e.target.value)} placeholder="Contoh: 11.9" style={inputStyle} /></label>
          <button disabled={saving} style={buttonStyle}>{saving ? 'Menyimpan…' : 'Simpan kelas'}</button>
        </form>
      </section>}
      <section style={{ background: '#fff', padding: 20, borderRadius: 14 }}>
        <h2>Daftar kelas ({classes.length})</h2>
        {loading ? <p>Memuat kelas…</p> : classes.length ? <div style={{ display: 'grid', gap: 10 }}>{classes.map(c => <article key={c.id} style={{ padding: 14, border: '1px solid #e8edf4', borderRadius: 10 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{editingId === c.id ? <form onSubmit={saveEdit} style={{ flex: '1 1 240px' }}><label>Nama kelas<input required value={editName} onChange={e => setEditName(e.target.value)} style={inputStyle} /></label><div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><button disabled={saving} style={buttonStyle}>{saving ? 'Menyimpan…' : 'Simpan perubahan'}</button><button type="button" disabled={saving} onClick={() => setEditingId(null)} style={{ ...buttonStyle, background: '#64748b' }}>Batal</button></div></form> : <><div><b>{c.name}</b></div>{canManage && <button type="button" onClick={() => beginEdit(c)} style={{ ...buttonStyle, padding: '8px 12px' }}>Ubah kelas</button>}<Link href="/jadwal" style={{ color: '#4267e8' }}>Lihat jadwal →</Link></>}</div></article>)}</div> : <p>Belum ada kelas. Tambahkan kelas melalui formulir di atas jika akun Anda memiliki izin.</p>}
      </section>
      <p style={{ color: '#718096', fontSize: 12, marginTop: 16 }}>Anda dapat menambah, melihat, dan mengubah nama kelas. Penghapusan kelas sengaja belum disediakan agar jadwal terkait tidak terhapus atau kehilangan hubungan.</p>
    </div>
  </main>
}
