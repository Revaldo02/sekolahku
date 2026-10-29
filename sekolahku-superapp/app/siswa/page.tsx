'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

type Student = { id: string; full_name: string; class_id: string | null }
type SchoolClass = { id: string; name: string }
const field = { width: '100%', boxSizing: 'border-box' as const, padding: 12, border: '1px solid #dbe2ee', borderRadius: 8, margin: '5px 0 12px', fontSize: 16 }

export default function SiswaPage() {
 const [students, setStudents] = useState<Student[]>([])
 const [classes, setClasses] = useState<SchoolClass[]>([])
 const [name, setName] = useState('')
 const [classId, setClassId] = useState('')
 const [editing, setEditing] = useState<Student | null>(null)
 const [editName, setEditName] = useState('')
 const [editClass, setEditClass] = useState('')
 const [search, setSearch] = useState('')
 const [canManage, setCanManage] = useState(false)
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [message, setMessage] = useState('')
 async function refresh() {
  const db = getSupabase()
  const [s,c] = await Promise.all([db.from('students').select('id,full_name,class_id').order('full_name'), db.from('classes').select('id,name').order('name')])
  if (s.error) throw s.error
  if (c.error) throw c.error
  setStudents((s.data ?? []) as Student[])
  setClasses((c.data ?? []) as SchoolClass[])
 }
 useEffect(() => { let alive = true; async function load() { try {
  const db = getSupabase()
  const {data:{user},error} = await db.auth.getUser()
  if (error || !user) { window.location.href='/login'; return }
  const [{data:p},{data:r}] = await Promise.all([db.from('profiles').select('role').eq('id',user.id).maybeSingle(),db.rpc('current_user_role')])
  if (alive) setCanManage(['admin','teacher'].includes(typeof r==='string' && r ? r : p?.role ?? ''))
  await refresh()
 } catch(e) { if(alive) setMessage(e && typeof e==='object' && 'message' in e ? String(e.message) : 'Data siswa gagal dimuat.') } finally { if(alive) setLoading(false) } }
 load(); return()=>{alive=false} }, [])
 async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); if (!editing || !editName.trim()) return
  setSaving(true); setMessage('')
  try { const { error } = await getSupabase().from('students').update({full_name:editName.trim(),class_id:editClass||null}).eq('id',editing.id); if(error) throw error; setEditing(null); await refresh(); setMessage('Data siswa berhasil diperbarui.') }
  catch(e) { setMessage(e && typeof e==='object' && 'message' in e ? String(e.message) : 'Data siswa gagal diperbarui.') }
  finally { setSaving(false) }
 }
 async function addStudent(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault(); if(!name.trim()) return
  setSaving(true); setMessage('')
  try {
   const {error} = await getSupabase().from('students').insert({full_name:name.trim(),class_id:classId||null})
   if(error) throw error
   setName(''); setClassId(''); await refresh(); setMessage('Data siswa berhasil ditambahkan.')
  } catch(e) { setMessage(e && typeof e==='object' && 'message' in e ? String(e.message) : 'Data siswa gagal ditambahkan.') } finally { setSaving(false) }
 }
 const visible = students.filter(s => s.full_name.toLowerCase().includes(search.toLowerCase()))
 return <main style={{minHeight:'100vh',background:'#f5f7fb',color:'#26334c',fontFamily:'Arial,sans-serif',padding:20}}><div style={{maxWidth:900,margin:'0 auto'}}>
 <Link href="/" style={{color:'#4267e8'}}>← Kembali ke Beranda</Link><header style={{background:'#fff',border:'1px solid #e8edf4',borderRadius:16,padding:24,margin:'20px 0'}}><p style={{color:'#4267e8',fontWeight:800}}>ADMINISTRASI SEKOLAHKU</p><h1>Data Siswa</h1><p>Daftar siswa dan rombongan belajar.</p></header>
 {message && <p role="status" style={{padding:12,background:'#fff',borderRadius:8,overflowWrap:'anywhere'}}>{message}</p>}
 {canManage && <section style={{background:'#fff',padding:20,borderRadius:14,marginBottom:16}}><h2>Tambah siswa</h2><form onSubmit={addStudent}>
 <label>Nama lengkap<input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nama siswa" style={field}/></label>
  <label>Kelas<select value={classId} onChange={e=>setClassId(e.target.value)} style={field}><option value="">Belum ditentukan</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <button disabled={saving} style={{padding:'12px 16px',background:'#4267e8',color:'#fff',border:0,borderRadius:8,fontWeight:700}}>{saving?'Menyimpan…':'Simpan siswa'}</button></form></section>}
 <section style={{background:'#fff',padding:20,borderRadius:14}}><h2>Daftar siswa ({visible.length})</h2><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama siswa" style={field}/>
 {loading?'Memuat data siswa…':visible.length ? visible.map(s=><article key={s.id} style={{padding:14,borderTop:'1px solid #edf0f5'}}>{editing?.id===s.id ? <form onSubmit={saveEdit}><label>Nama lengkap<input required value={editName} onChange={e=>setEditName(e.target.value)} style={field}/></label><label>Kelas<select value={editClass} onChange={e=>setEditClass(e.target.value)} style={field}><option value="">Belum ditentukan</option>{classes.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button disabled={saving} style={{padding:10,background:'#4267e8',color:'#fff',border:0,borderRadius:8}}>Simpan</button> <button type="button" onClick={()=>setEditing(null)} style={{padding:10,border:0,borderRadius:8}}>Batal</button></form>:<><b>{s.full_name}</b><p style={{color:'#718096',fontSize:13}}>Kelas {classes.find(c=>c.id===s.class_id)?.name ?? 'Belum ditentukan'}</p>{canManage && <button onClick={()=>{setEditing(s);setEditName(s.full_name);setEditClass(s.class_id??'')}} style={{padding:9,background:'#eef2ff',color:'#3657c8',border:0,borderRadius:8}}>Ubah data</button>}</>}</article>):<p>Belum ada siswa atau tidak ada hasil pencarian.</p>}</section>
 <p style={{color:'#718096',fontSize:12,marginTop:16}}>Data dapat diubah oleh admin/guru. Penghapusan belum disediakan agar riwayat presensi tidak terhapus tanpa sengaja.</p></div></main>
}
