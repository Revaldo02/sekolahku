'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, UserRound } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

type LinkRow = {
  is_verified: boolean
  relationship: string | null
  students: { id: string; full_name: string; class_id: string | null; classes: { name: string } | null } | null
}
type Attendance = { student_id: string; attendance_date: string; status: string; note: string | null }
type ScheduleRow = { class_id: string | null; subject: string; teacher_name: string | null; day_of_week: number; start_time: string; end_time: string; room: string | null }

const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
const statusLabels: Record<string, string> = { present: 'Hadir', late: 'Terlambat', absent: 'Tidak hadir', excused: 'Izin' }
const cardStyle = { background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20, marginBottom: 16 }

export default function OrangTuaPage() {
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [parentName, setParentName] = useState<string | null>(null)
  const [links, setLinks] = useState<LinkRow[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [schedules, setSchedules] = useState<ScheduleRow[]>([])

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const db = getSupabase()
        const { data: { user }, error: authError } = await db.auth.getUser()
        if (authError || !user) { window.location.href = '/login'; return }

        const { data: parent, error: parentError } = await db
          .from('parents').select('id,full_name').eq('user_id', user.id).maybeSingle()
        if (parentError) throw parentError
        if (!parent) {
          if (alive) setMessage('Akun ini belum terhubung dengan data orang tua. Hubungi administrator sekolah.')
          return
        }
        if (alive) setParentName(parent.full_name)

        const { data: linkData, error: linkError } = await db
          .from('student_parents')
          .select('is_verified,relationship,students(id,full_name,class_id,classes(name))')
          .eq('parent_id', parent.id)
        if (linkError) throw linkError
        const rows = (linkData ?? []) as unknown as LinkRow[]
        if (alive) setLinks(rows)

        const verified = rows.filter(r => r.is_verified && r.students).map(r => r.students!)
        const studentIds = verified.map(s => s.id)
        const classIds = Array.from(new Set(verified.map(s => s.class_id).filter(Boolean))) as string[]

        if (studentIds.length) {
          const { data: att, error: attError } = await db
            .from('attendance_records')
            .select('student_id,attendance_date,status,note')
            .in('student_id', studentIds)
            .order('attendance_date', { ascending: false })
            .limit(60)
          if (attError) throw attError
          if (alive) setAttendance((att ?? []) as Attendance[])
        }
        if (classIds.length) {
          const { data: sch, error: schError } = await db
            .from('schedules')
            .select('class_id,subject,teacher_name,day_of_week,start_time,end_time,room')
            .in('class_id', classIds)
            .order('day_of_week')
            .order('start_time')
          if (schError) throw schError
          if (alive) setSchedules((sch ?? []) as ScheduleRow[])
        }
      } catch (err) {
        if (alive) setMessage(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Data belum dapat dimuat. Muat ulang halaman.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    void load()
    return () => { alive = false }
  }, [])

  const verifiedStudents = links.filter(l => l.is_verified && l.students).map(l => l.students!)
  const pendingCount = links.filter(l => !l.is_verified).length

  return (
    <main style={{ minHeight: '100vh', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#4267e8', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={18} /> Kembali ke Beranda
        </Link>

        <header style={{ ...cardStyle, margin: '20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#4267e8', fontWeight: 800, fontSize: 12, letterSpacing: 1 }}>
            <UserRound size={20} /> ANAK SAYA
          </div>
          <h1 style={{ margin: '12px 0 6px' }}>{parentName ? `Halo, ${parentName}` : 'Anak Saya'}</h1>
          <p style={{ color: '#718096', margin: 0, lineHeight: 1.7 }}>Pantau kehadiran dan jadwal anak yang sudah terverifikasi oleh sekolah.</p>
        </header>

        {message && <div role="status" style={{ ...cardStyle, padding: 14 }}>{message}</div>}
        {loading && <p>Memuat data…</p>}

        {!loading && !message && (
          <>
            {pendingCount > 0 && (
              <div style={{ ...cardStyle, background: '#fff8e6', borderColor: '#f6e0a6', padding: 14 }}>
                {pendingCount} hubungan anak menunggu verifikasi sekolah. Data anak belum tampil sampai diverifikasi.
              </div>
            )}

            {verifiedStudents.length === 0 ? (
              <section style={{ ...cardStyle, textAlign: 'center' }}>
                <h2 style={{ marginTop: 0 }}>Belum ada anak yang terverifikasi</h2>
                <p style={{ color: '#718096' }}>Setelah sekolah memverifikasi hubungan Anda, data anak akan muncul di sini.</p>
              </section>
            ) : (
              verifiedStudents.map(student => {
                const records = attendance.filter(a => a.student_id === student.id)
                const classSchedule = schedules.filter(s => s.class_id === student.class_id)
                return (
                  <section key={student.id} style={cardStyle}>
                    <h2 style={{ margin: '0 0 4px', fontSize: 20 }}>{student.full_name}</h2>
                    <p style={{ color: '#718096', margin: '0 0 14px', fontSize: 13 }}>
                      {student.classes?.name ? `Kelas ${student.classes.name}` : 'Belum masuk kelas'}
                    </p>

                    <h3 style={{ fontSize: 15 }}>Kehadiran terbaru</h3>
                    {records.length === 0 ? <p style={{ color: '#718096', fontSize: 13 }}>Belum ada catatan kehadiran.</p> : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {records.slice(0, 10).map((r, i) => (
                          <div key={`${r.attendance_date}-${i}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14, borderBottom: '1px solid #edf0f5', paddingBottom: 8 }}>
                            <span>{new Date(r.attendance_date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>
                            <span style={{ fontWeight: 700 }}>{statusLabels[r.status] ?? r.status}{r.note ? ` · ${r.note}` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <h3 style={{ fontSize: 15, marginTop: 18 }}>Jadwal pelajaran</h3>
                    {!student.class_id ? <p style={{ color: '#718096', fontSize: 13 }}>Jadwal akan tampil setelah anak masuk kelas.</p>
                      : classSchedule.length === 0 ? <p style={{ color: '#718096', fontSize: 13 }}>Belum ada jadwal untuk kelas ini.</p> : (
                      <div style={{ display: 'grid', gap: 8 }}>
                        {classSchedule.map((s, i) => (
                          <div key={`${s.day_of_week}-${s.start_time}-${i}`} style={{ border: '1px solid #e8edf4', borderRadius: 10, padding: 12, fontSize: 14 }}>
                            <b>{s.subject}</b>
                            <div style={{ color: '#718096', fontSize: 13 }}>
                              {dayNames[s.day_of_week] ?? ''} · {s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)}
                              {s.teacher_name ? ` · ${s.teacher_name}` : ''}{s.room ? ` · ${s.room}` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
              })
            )}
          </>
        )}
      </div>
    </main>
  )
}
