'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

type Schedule = { id: string; subject: string; teacher_name: string | null; day_of_week: number; start_time: string; end_time: string; room: string | null; class_id: string | null }
type SchoolClass = { id: string; name: string; grade_level: string | null }
const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const inputStyle = { width: '100%', boxSizing: 'border-box' as const, padding: 12, border: '1px solid #dbe2ee', borderRadius: 8, margin: '5px 0 12px', fontSize: 16 }
const buttonStyle = { padding: '12px 16px', background: '#4267e8', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }
export default function JadwalPage() {
 const [items, setItems] = useState<Schedule[]>([])
 const [classes, setClasses] = useState<SchoolClass[]>([])
 const [loading, setLoading] = useState(true)
 const [message, setMessage] = useState('')
 const [canManage, setCanManage] = useState(false)
 const [saving, setSaving] = useState(false)
 const [subject, setSubject] = useState('')
 const [teacher, setTeacher] = useState('')
 const [day, setDay] = useState('1')
 const [start, setStart] = useState('07:00')
 const [end, setEnd] = useState('08:00')
 const [room, setRoom] = useState('')
 const [classId, setClassId] = useState('')
 const [filterDay, setFilterDay] = useState('0')
 const [filterClass, setFilterClass] = useState('all')
 const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>({})
 async function refresh() {
  const supabase = getSupabase()
  const [s, c] = await Promise.all([supabase.from('schedules').select('id,subject,teacher_name,day_of_week,start_time,end_time,room,class_id').order('day_of_week').order('start_time'), supabase.from('classes').select('id,name,grade_level').order('name')])
  if (s.error) throw s.error
  if (c.error) throw c.error
  setItems((s.data ?? []) as Schedule[])
  setClasses((c.data ?? []) as SchoolClass[])
 }
 useEffect(() => { let alive = true; async function load() { try { const supabase = getSupabase(); const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) { window.location.href = '/login'; return }; const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(); const { data: roleData } = await supabase.rpc('current_user_role'); const role = typeof roleData === 'string' && roleData ? roleData : (profile?.role ?? ''); if (alive) setCanManage(['admin','teacher'].includes(role)); await refresh() } catch { if (alive) setMessage('Data belum dapat dimuat. Periksa koneksi lalu muat ulang halaman.') } finally { if (alive) setLoading(false) } }; load(); return () => { alive = false } }, [])
 const classLabel = (id: string | null) => classes.find(c => c.id === id)?.name ?? 'Semua kelas'
 async function addSchedule(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if (!subject.trim() || end <= start) { setMessage('Isi mata pelajaran dan pastikan waktu selesai setelah waktu mulai.'); return }
  setSaving(true); setMessage('')
  try { const { error } = await getSupabase().from('schedules').insert({ subject: subject.trim(), teacher_name: teacher.trim() || null, day_of_week: Number(day), start_time: start, end_time: end, room: room.trim() || null, class_id: classId || null }); if (error) throw error; setSubject(''); setTeacher(''); setRoom(''); await refresh(); setMessage('Jadwal berhasil ditambahkan.') } catch (err) { setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Jadwal gagal ditambahkan. Coba lagi.') } finally { setSaving(false) }
 }
 async function assignScheduleClass(item: Schedule) {
  const selectedClass = assignmentDrafts[item.id] ?? item.class_id ?? ''
  setSaving(true); setMessage('')
  try {
   const { error } = await getSupabase().from('schedules').update({ class_id: selectedClass || null }).eq('id', item.id)
   if (error) throw error
   await refresh()
   setAssignmentDrafts(current => { const next = { ...current }; delete next[item.id]; return next })
   setMessage(selectedClass ? 'Jadwal berhasil dikaitkan ke kelas.' : 'Jadwal disimpan tanpa kelas tertentu.')
  } catch (err) {
   setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Kelas jadwal gagal diperbarui.')
  } finally { setSaving(false) }
 }
 async function deleteSchedule(item: Schedule) {
  if (!window.confirm(`Hapus jadwal ${item.subject}?`)) return
  setSaving(true); setMessage('')
  try {
   const { error } = await getSupabase().from('schedules').delete().eq('id', item.id)
   if (error) throw error
   await refresh(); setMessage('Jadwal berhasil dihapus.')
  } catch (err) {
   setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Jadwal gagal dihapus.')
  } finally { setSaving(false) }
 }
 const filteredItems = items.filter(item => (filterDay === '0' || item.day_of_week === Number(filterDay)) && (filterClass === 'all' || item.class_id === filterClass))
 const groups = days.slice(1).map((dayName, i) => ({ day: dayName, entries: filteredItems.filter(item => item.day_of_week === i + 1) })).filter(g => g.entries.length)
 return <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial,sans-serif', padding: 20 }}><div style={{ maxWidth: 900, margin: '0 auto' }}><Link href="/" style={{ color: '#4267e8' }}>← Kembali ke Beranda</Link><header style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 16, padding: 24, margin: '20px 0' }}><p style={{ color: '#4267e8', fontWeight: 800 }}>AKADEMIK SEKOLAHKU</p><h1>Jadwal Pelajaran</h1><p>Jadwal dan kelas terhubung ke database sekolah.</p></header>
 {message && <p role="status" style={{ padding: 12, background: '#fff', borderRadius: 8, overflowWrap: 'anywhere' }}>{message}</p>}
 {canManage && <section style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 16 }}><h2>Kelola jadwal pelajaran</h2><p>Tambahkan jadwal di sini. Untuk membuat atau melihat rombongan belajar dan tingkat kelas, buka menu <Link href="/kelas" style={{ color: '#4267e8' }}>Kelas</Link>. Database tetap memeriksa izin akun.</p><form onSubmit={addSchedule}><h3>Tambah jadwal pelajaran</h3><label>Mata pelajaran<input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Contoh: Matematika" style={inputStyle} /></label><label>Kelas<select value={classId} onChange={e => setClassId(e.target.value)} style={inputStyle}><option value="">Semua kelas / belum ditentukan</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Nama guru (opsional)<input value={teacher} onChange={e => setTeacher(e.target.value)} placeholder="Nama guru" style={inputStyle} /></label><label>Hari<select value={day} onChange={e => setDay(e.target.value)} style={inputStyle}>{days.slice(1).map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></label><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}><label>Mulai<input required type="time" value={start} onChange={e => setStart(e.target.value)} style={inputStyle} /></label><label>Selesai<input required type="time" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle} /></label></div><label>Ruang belajar (opsional)<input value={room} onChange={e => setRoom(e.target.value)} placeholder="Contoh: R-01 atau Lab Komputer" style={inputStyle} /></label><p style={{ color: "#718096", fontSize: 13, marginTop: -6 }}>Ruang adalah lokasi pelajaran berlangsung, bukan tingkat atau nama kelas.</p><button disabled={saving} style={buttonStyle}>Simpan jadwal</button></form></section>}
 <section style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 16 }}><h2>Data kelas</h2>{loading ? 'Memuat kelas…' : classes.length ? classes.map(c => <span key={c.id} style={{ display: 'inline-block', padding: 10, margin: 4, background: '#f0f4ff', borderRadius: 8 }}>{c.name}{c.grade_level ? ` · Tingkat ${c.grade_level}` : ''}</span>) : <p>Belum ada kelas di database.</p>}</section>
 <section style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 16 }}><h2>Filter jadwal</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}><label>Hari<select value={filterDay} onChange={e => setFilterDay(e.target.value)} style={inputStyle}><option value="0">Semua hari</option>{days.slice(1).map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></label><label>Kelas<select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={inputStyle}><option value="all">Semua kelas</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div></section>
 {loading ? <p>Memuat jadwal…</p> : groups.length ? groups.map(g => <section key={g.day} style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 14 }}><h2>{g.day}</h2>{g.entries.map(item => <article key={item.id} style={{ padding: 12, borderTop: '1px solid #edf0f5' }}><b style={{ color: '#4267e8' }}>{item.start_time.slice(0,5)}–{item.end_time.slice(0,5)}</b> · <b>{item.subject}</b><p>{classLabel(item.class_id)}{item.teacher_name ? ` · ${item.teacher_name}` : ''}{item.room ? ` · Ruang ${item.room}` : ''}</p>{canManage && <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 8, alignItems: 'end', marginTop: 10 }}><label style={{ fontSize: 13 }}>Atur kelas untuk jadwal ini<select aria-label={`Kelas untuk ${item.subject}`} value={assignmentDrafts[item.id] ?? item.class_id ?? ''} onChange={e => setAssignmentDrafts(current => ({ ...current, [item.id]: e.target.value }))} style={{ ...inputStyle, marginBottom: 0 }}><option value="">Semua kelas / belum ditentukan</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><button type="button" disabled={saving || (assignmentDrafts[item.id] ?? item.class_id ?? '') === (item.class_id ?? '')} onClick={() => assignScheduleClass(item)} style={{ ...buttonStyle, padding: '12px' }}>Simpan kelas</button></div>} {canManage && <button type="button" disabled={saving} onClick={() => deleteSchedule(item)} style={{ ...buttonStyle, background: '#b42318', padding: '8px 12px', marginTop: 10 }}>Hapus jadwal</button>}</article>)}</section>) : <section style={{ background: '#fff', padding: 24, borderRadius: 14 }}><h2>Belum ada jadwal</h2><p>{items.length ? 'Tidak ada jadwal yang cocok dengan filter ini.' : 'Admin atau guru dapat menambahkan jadwal melalui formulir di atas.'}</p></section>}
 </div></main>
}
