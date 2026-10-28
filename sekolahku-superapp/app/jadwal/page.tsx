'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'

type Schedule = { id: string; subject: string; teacher_name: string | null; day_of_week: number; start_time: string; end_time: string; room: string | null; class_id: string | null }
type SchoolClass = { id: string; name: string; grade_level: string | null }
const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
export default function JadwalPage() {
 const [items, setItems] = useState<Schedule[]>([])
 const [classes, setClasses] = useState<SchoolClass[]>([])
 const [loading, setLoading] = useState(true)
 const [message, setMessage] = useState('')
 useEffect(() => { let alive = true; async function load() { try { const supabase = getSupabase(); const { data: { user }, error: authError } = await supabase.auth.getUser(); if (authError || !user) { window.location.href = '/login'; return }; const [s, c] = await Promise.all([supabase.from('schedules').select('id,subject,teacher_name,day_of_week,start_time,end_time,room,class_id').order('day_of_week').order('start_time'), supabase.from('classes').select('id,name,grade_level').order('name')]); if (s.error) throw s.error; if (c.error) throw c.error; if (alive) { setItems((s.data ?? []) as Schedule[]); setClasses((c.data ?? []) as SchoolClass[]) } } catch { if (alive) setMessage('Jadwal belum dapat dimuat. Periksa koneksi lalu muat ulang halaman.') } finally { if (alive) setLoading(false) } }; load(); return () => { alive = false } }, [])
 const className = (id: string | null) => classes.find(c => c.id === id)?.name ?? 'Semua kelas'
 const groups = days.slice(1).map((day, i) => ({ day, entries: items.filter(item => item.day_of_week === i + 1) })).filter(g => g.entries.length)
 return <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial,sans-serif', padding: 24 }}><div style={{ maxWidth: 900, margin: '0 auto' }}><Link href="/" style={{ color: '#4267e8' }}>← Kembali ke Beranda</Link><header style={{ background: '#fff', border: '1px solid #e8edf4', borderRadius: 16, padding: 24, margin: '20px 0' }}><p style={{ color: '#4267e8', fontWeight: 800 }}>AKADEMIK SEKOLAHKU</p><h1>Jadwal Pelajaran</h1><p>Jadwal dan kelas terhubung ke database sekolah.</p></header><section style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 16 }}><h2>Data kelas</h2>{loading ? 'Memuat kelas…' : classes.length ? classes.map(c => <span key={c.id} style={{ display: 'inline-block', padding: 10, margin: 4, background: '#f0f4ff', borderRadius: 8 }}>{c.name}{c.grade_level ? ` · Tingkat ${c.grade_level}` : ''}</span>) : <p>Belum ada kelas di database.</p>}</section>{message && <p role="alert">{message}</p>}{loading ? <p>Memuat jadwal…</p> : groups.length ? groups.map(g => <section key={g.day} style={{ background: '#fff', padding: 20, borderRadius: 14, marginBottom: 14 }}><h2>{g.day}</h2>{g.entries.map(item => <article key={item.id} style={{ padding: 12, borderTop: '1px solid #edf0f5' }}><b style={{ color: '#4267e8' }}>{item.start_time.slice(0,5)}–{item.end_time.slice(0,5)}</b> · <b>{item.subject}</b><p>{className(item.class_id)}{item.teacher_name ? ` · ${item.teacher_name}` : ''}{item.room ? ` · Ruang ${item.room}` : ''}</p></article>)}</section>) : <section style={{ background: '#fff', padding: 24, borderRadius: 14 }}><h2>Belum ada jadwal</h2><p>Tabel jadwal telah disiapkan. Jadwal akan tampil setelah admin atau guru memasukkan data.</p></section>}</div></main>
}
