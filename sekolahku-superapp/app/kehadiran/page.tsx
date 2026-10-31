'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

type Student = { id: string; full_name: string; class_id: string | null }
type SchoolClass = { id: string; name: string }
type Status = 'present' | 'late' | 'absent' | 'excused'
type RecordRow = { student_id: string; status: Status; note: string | null }
const field = { width: '100%', boxSizing: 'border-box' as const, padding: 11, border: '1px solid #dbe2ee', borderRadius: 8, margin: '5px 0 12px', fontSize: 16 }
const button = { padding: '11px 14px', background: '#4267e8', color: '#fff', border: 0, borderRadius: 8, fontWeight: 700, cursor: 'pointer' }
const statusLabels: Record<Status, string> = { present: 'Hadir', late: 'Terlambat', absent: 'Tidak hadir', excused: 'Izin / sakit' }
function localDate() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10) }

export default function KehadiranPage() {
 const [students, setStudents] = useState<Student[]>([])
 const [classes, setClasses] = useState<SchoolClass[]>([])
 const [selectedDate, setSelectedDate] = useState(localDate())
 const [filterClass, setFilterClass] = useState('all')
 const [statuses, setStatuses] = useState<Record<string, Status>>({})
 const [notes, setNotes] = useState<Record<string, string>>({})
 const [canManage, setCanManage] = useState(false)
 const [loading, setLoading] = useState(true)
 const [saving, setSaving] = useState(false)
 const [message, setMessage] = useState('')

 async function loadRecords(date: string) {
  const { data, error } = await getSupabase().from('attendance_records').select('student_id,status,note').eq('attendance_date', date)
  if (error) throw error
  const nextStatuses: Record<string, Status> = {}
  const nextNotes: Record<string, string> = {}
  ;((data ?? []) as RecordRow[]).forEach(row => { nextStatuses[row.student_id] = row.status; nextNotes[row.student_id] = row.note ?? '' })
  setStatuses(nextStatuses); setNotes(nextNotes)
 }
 async function refresh() {
  const db = getSupabase()
  const [s, c] = await Promise.all([db.from('students').select('id,full_name,class_id').order('full_name'), db.from('classes').select('id,name').order('name')])
  if (s.error) throw s.error
  if (c.error) throw c.error
  setStudents((s.data ?? []) as Student[]); setClasses((c.data ?? []) as SchoolClass[])
  await loadRecords(selectedDate)
 }
 useEffect(() => {
  let alive = true
  async function init() {
   try {
    const db = getSupabase()
    const { data: { user }, error } = await db.auth.getUser()
    if (error || !user) { window.location.href = '/login'; return }
    const [{ data: profile }, { data: role }] = await Promise.all([db.from('profiles').select('role').eq('id', user.id).maybeSingle(), db.rpc('current_user_role')])
    const resolvedRole = typeof role === 'string' && role ? role : profile?.role ?? ''
    if (alive) setCanManage(['admin','guru'].includes(resolvedRole))
    await refresh()
   } catch (e) { if (alive) setMessage(e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Data kehadiran gagal dimuat.') }
   finally { if (alive) setLoading(false) }
  }
  init()
  return () => { alive = false }
 }, [])
 async function changeDate(date: string) {
  setSelectedDate(date); setMessage('')
  try { await loadRecords(date) } catch { setMessage('Data tanggal ini gagal dimuat. Coba muat ulang halaman.') }
 }
 const visibleStudents = useMemo(() => students.filter(s => filterClass === 'all' || s.class_id === filterClass), [students, filterClass])
 const counts = useMemo(() => {
  const result = { present: 0, late: 0, absent: 0, excused: 0 }
  visibleStudents.forEach(s => { const status = statuses[s.id]; if (status) result[status] += 1 })
  return result
 }, [visibleStudents, statuses])
 async function saveAttendance(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  if (!canManage) { setMessage('Hanya admin dan guru yang dapat mencatat kehadiran.'); return }
  const rows = visibleStudents.filter(s => statuses[s.id]).map(s => ({ student_id: s.id, attendance_date: selectedDate, status: statuses[s.id], note: notes[s.id]?.trim() || null }))
  if (!rows.length) { setMessage('Pilih status kehadiran minimal untuk satu siswa.'); return }
  setSaving(true); setMessage('')
  try {
   const { error } = await getSupabase().from('attendance_records').upsert(rows, { onConflict: 'student_id,attendance_date' })
   if (error) throw error
   await loadRecords(selectedDate)
   setMessage(`Kehadiran ${rows.length} siswa berhasil disimpan untuk ${selectedDate}.`)
  } catch (e) { setMessage(e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Kehadiran gagal disimpan. Periksa koneksi dan izin akun.') }
  finally { setSaving(false) }
 }

 return <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial,sans-serif', padding: 20 }}><div style={{ maxWidth: 950, margin: '0 auto' }}>
  <Link href="/" style={{ color: '#4267e8' }}>← Kembali ke Beranda</Link>
  <header style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 16, padding: 24, margin: '20px 0' }}><p style={{ color: '#4267e8', fontWeight: 800 }}>ADMINISTRASI SEKOLAHKU</p><h1>Presensi / Kehadiran</h1><p>Catat kehadiran siswa per tanggal. Data tersimpan di database sekolah.</p></header>
  {message && <p role="status" style={{ padding: 12, background: '#fff', borderRadius: 8, overflowWrap: 'anywhere' }}>{message}</p>}
  <section style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 16 }}>
   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
    <label>Tanggal presensi<input type="date" value={selectedDate} onChange={e => changeDate(e.target.value)} style={field}/></label>
    <label>Filter kelas<select value={filterClass} onChange={e => setFilterClass(e.target.value)} style={field}><option value="all">Semua kelas</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
   </div>
   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
    {(['present','late','absent','excused'] as Status[]).map(status => <div key={status} style={{ background: '#f4f7ff', borderRadius: 9, padding: 10 }}><small>{statusLabels[status]}</small><h2 style={{ margin: '5px 0' }}>{counts[status]}</h2></div>)}
   </div>
  </section>
  {loading ? <p>Memuat data siswa…</p> : !students.length ? <section style={{ background: '#fff', padding: 20, borderRadius: 14 }}><h2>Belum ada data siswa</h2><p>Tambahkan siswa terlebih dahulu sebelum mencatat kehadiran.</p><Link href="/siswa" style={{ color: '#4267e8' }}>Buka Data Siswa</Link></section> : <form onSubmit={saveAttendance} style={{ background: '#fff', padding: 20, borderRadius: 14 }}>
   <h2>Daftar siswa ({visibleStudents.length})</h2>
   {!canManage && <p>Mode baca saja. Hanya admin dan guru yang dapat mengubah presensi.</p>}
   {visibleStudents.map(student => <article key={student.id} style={{ padding: '14px 0', borderTop: '1px solid #edf0f5' }}>
    <b>{student.full_name}</b><p style={{ margin: '5px 0 10px', color: '#718096', fontSize: 13 }}>Kelas {classes.find(c => c.id === student.class_id)?.name ?? 'Belum ditentukan'}</p>
    <label>Status kehadiran<select disabled={!canManage} value={statuses[student.id] ?? ''} onChange={e => setStatuses(prev => ({ ...prev, [student.id]: e.target.value as Status }))} style={field}><option value="">Belum diisi</option>{Object.entries(statusLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {canManage && <label>Catatan (opsional)<input value={notes[student.id] ?? ''} onChange={e => setNotes(prev => ({ ...prev, [student.id]: e.target.value }))} placeholder="Contoh: izin keluarga" style={field}/></label>}
   </article>)}
   {canManage && <button disabled={saving || !visibleStudents.length} style={button}>{saving ? 'Menyimpan…' : 'Simpan presensi'}</button>}
  </form>}
  <p style={{ color: '#718096', fontSize: 12, marginTop: 16 }}>Catatan: presensi yang disimpan ulang untuk siswa dan tanggal yang sama akan memperbarui data sebelumnya, bukan membuat duplikat.</p>
 </div></main>
}
