'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase'
import { Activity, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronRight, ClipboardCheck, FileText, GraduationCap, Grid2X2, Home, LogOut, Menu, Megaphone, MessageCircle, Search, Settings, ShieldCheck, UserRound, Wallet, X } from 'lucide-react'

type Profile = { full_name: string | null; role: string | null }
type Announcement = { id: string; title: string; body: string; created_at: string }

const roleLabels: Record<string, string> = { admin: 'Administrator', teacher: 'Guru', student: 'Siswa', parent: 'Orang Tua' }
const services = [
  { title: 'Jadwal Pelajaran', desc: 'Jadwal kelas dan mata pelajaran', icon: CalendarDays },
  { title: 'Kehadiran', desc: 'Catatan presensi', icon: ClipboardCheck },
  { title: 'Nilai & Rapor', desc: 'Hasil belajar siswa', icon: GraduationCap },
  { title: 'Tugas Sekolah', desc: 'Tugas dan tenggat', icon: FileText },
  { title: 'Pengumuman', desc: 'Informasi resmi sekolah', icon: Megaphone },
  { title: 'Pembayaran', desc: 'Informasi tagihan sekolah', icon: Wallet },
  { title: 'Komunikasi', desc: 'Hubungi pihak sekolah', icon: MessageCircle },
  { title: 'Data Siswa', desc: 'Informasi siswa', icon: UserRound },
]

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let alive = true
    async function loadDashboard() {
      try {
        const supabase = getSupabase()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
          router.replace('/login')
          return
        }
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles').select('full_name, role').eq('id', user.id).maybeSingle()
        if (profileError) throw profileError
        if (!userProfile) {
          setError('Profil akun belum tersedia. Hubungi administrator sekolah untuk memeriksa profil akun.')
        } else if (alive) {
          setProfile(userProfile as Profile)
        }
        const { data: notices, error: noticesError } = await supabase
          .from('announcements').select('id, title, body, created_at')
          .eq('published', true).order('created_at', { ascending: false }).limit(5)
        if (!noticesError && alive) setAnnouncements((notices ?? []) as Announcement[])
      } catch {
        if (alive) setError('Data belum dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.')
      } finally {
        if (alive) setLoading(false)
      }
    }
    loadDashboard()
    return () => { alive = false }
  }, [router])

  async function logout() {
    setSigningOut(true)
    const { error: logoutError } = await getSupabase().auth.signOut()
    if (logoutError) {
      setNotice('Belum berhasil keluar. Coba lagi.')
      setSigningOut(false)
      return
    }
    router.replace('/login')
    router.refresh()
  }

  const displayName = profile?.full_name?.trim() || 'Pengguna SekolahKu'
  const role = roleLabels[profile?.role ?? ''] || 'Pengguna'
  const initials = displayName.split(/\\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase()
  const visibleServices = services.filter(item => `${item.title} ${item.desc}`.toLowerCase().includes(search.toLowerCase()))

  return (
    <main style={{ minHeight: '100vh', display: 'flex', background: '#f5f7fb', color: '#26334c', fontFamily: 'Arial, sans-serif' }}>
      {menuOpen && <button aria-label="Tutup menu" onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: '#14234466', border: 0, zIndex: 9 }} />}
      <aside style={{ width: 245, flexShrink: 0, background: '#fff', borderRight: '1px solid #e8edf4', padding: 22, display: 'flex', flexDirection: 'column', gap: 20, zIndex: 10 }} className={menuOpen ? 'sk-sidebar sk-sidebar-open' : 'sk-sidebar'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 23, fontWeight: 800, color: '#4267e8' }}><GraduationCap size={28}/> SekolahKu <button className="sk-close" onClick={() => setMenuOpen(false)} aria-label="Tutup menu"><X size={20}/></button></div>
        <div style={{ background: '#f4f7ff', borderRadius: 12, padding: 14, fontSize: 12 }}><b>{loading ? 'Memuat akun...' : displayName}</b><p style={{ margin: '5px 0 0', color: '#7e8ba2' }}>{role}</p></div>
        <nav style={{ display: 'grid', gap: 8 }}>
          <button className="sk-nav sk-selected"><Home size={18}/> Beranda</button>
          <button className="sk-nav" onClick={() => setNotice('Modul akademik akan diaktifkan setelah data dan alur sekolah dikonfigurasi.')}><BookOpen size={18}/> Akademik</button>
          <button className="sk-nav" onClick={() => setNotice('Modul layanan sedang disiapkan dan belum menerima transaksi nyata.')}><Grid2X2 size={18}/> Layanan</button>
          <button className="sk-nav" onClick={() => setNotice('Fitur komunikasi belum terhubung.')}><MessageCircle size={18}/> Komunikasi</button>
          <button className="sk-nav" onClick={() => setNotice('Pengaturan akun akan ditambahkan pada tahap berikutnya.')}><Settings size={18}/> Pengaturan</button>
        </nav>
        <div style={{ marginTop: 'auto', borderTop: '1px solid #e8edf4', paddingTop: 16, fontSize: 12, color: '#7e8ba2' }}><ShieldCheck size={20}/><p>Akses akun mengikuti peran yang terdaftar di SekolahKu.</p><button className="sk-nav" disabled={signingOut} onClick={logout}><LogOut size={18}/>{signingOut ? 'Keluar...' : 'Keluar akun'}</button></div>
      </aside>
      <section style={{ flex: 1, minWidth: 0 }}>
        <header style={{ minHeight: 70, background: '#fff', borderBottom: '1px solid #e8edf4', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><button className="sk-menu" onClick={() => setMenuOpen(true)} aria-label="Buka menu"><Menu/></button><span style={{ color: '#7e8ba2', fontSize: 13 }}>Portal / <b style={{ color: '#26334c' }}>Beranda</b></span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><label style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#f5f7fb', padding: 10, borderRadius: 9 }}><Search size={16}/><input aria-label="Cari layanan" placeholder="Cari layanan..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 140, maxWidth: '28vw', border: 0, outline: 0, background: 'transparent' }}/></label><button className="sk-avatar" aria-label="Profil pengguna">{initials || 'SK'}</button></div>
        </header>
        <div style={{ maxWidth: 1300, margin: '0 auto', padding: 24 }}>
          <section style={{ background: 'linear-gradient(110deg,#fff,#eef3ff)', border: '1px solid #e8edf4', borderRadius: 16, padding: '26px 28px', marginBottom: 20 }}>
            <div style={{ color: '#4267e8', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>PORTAL SEKOLAH TERPADU</div>
            <h1 style={{ fontSize: 'clamp(25px,4vw,36px)', margin: '12px 0 8px' }}>Halo, {loading ? '...' : displayName}!</h1>
            <p style={{ color: '#7e8ba2', margin: 0 }}>Selamat datang kembali di SekolahKu. Berikut ringkasan layanan sekolah.</p>
          </section>
          {error && <div role="alert" style={{ padding: 14, borderRadius: 10, background: '#fff0ef', color: '#a33b35', marginBottom: 18 }}>{error}</div>}
          <div className="sk-stats">
            {[{ label: 'Status akun', value: loading ? 'Memuat...' : profile ? 'Aktif' : 'Perlu diperiksa', icon: CheckCircle2 }, { label: 'Peran pengguna', value: role, icon: UserRound }, { label: 'Pengumuman terbaru', value: String(announcements.length), icon: Bell }, { label: 'Modul tersedia', value: String(services.length), icon: Activity }].map(stat => { const Icon = stat.icon; return <div key={stat.label} className="sk-stat"><Icon size={22} color="#4267e8"/><div><small>{stat.label}</small><b>{stat.value}</b></div></div> })}
          </div>
          <section style={{ marginTop: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 13 }}><div><h2 style={{ fontSize: 20, margin: 0 }}>Layanan Sekolah</h2><p style={{ color: '#7e8ba2', fontSize: 13 }}>Modul yang direncanakan untuk SekolahKu.</p></div></div>
            <div className="sk-services">{visibleServices.map(item => { const Icon = item.icon; return <button key={item.title} className="sk-service" onClick={() => setNotice(`${item.title}: modul ini belum terhubung ke data operasional. Tidak ada transaksi yang dilakukan.`)}><span className="sk-service-icon"><Icon size={21}/></span><span><b>{item.title}</b><small>{item.desc}</small></span><ChevronRight size={17}/></button> })}</div>
            {!visibleServices.length && <p>Tidak ada layanan yang cocok dengan pencarian.</p>}
          </section>
          <section style={{ marginTop: 28, background: '#fff', border: '1px solid #e8edf4', borderRadius: 14, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Megaphone size={21} color="#4267e8"/><h2 style={{ fontSize: 19, margin: 0 }}>Pengumuman terbaru</h2></div>
            {loading ? <p style={{ color: '#7e8ba2' }}>Memuat pengumuman...</p> : announcements.length ? announcements.map(item => <article key={item.id} style={{ borderTop: '1px solid #edf0f5', padding: '14px 0 4px', marginTop: 10 }}><b>{item.title}</b><p style={{ whiteSpace: 'pre-wrap', color: '#64728a', fontSize: 13, lineHeight: 1.6 }}>{item.body}</p><small style={{ color: '#8b97aa' }}>{new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</small></article>) : <p style={{ color: '#7e8ba2', fontSize: 13 }}>Belum ada pengumuman terpublikasi atau data belum tersedia.</p>}
          </section>
          <footer style={{ padding: '22px 0', color: '#8b97aa', fontSize: 11 }}>© 2026 SekolahKu · Tampilan akun nyata, modul operasional dikembangkan bertahap.</footer>
        </div>
      </section>
      {notice && <div role="status" style={{ position: 'fixed', right: 16, bottom: 16, maxWidth: 380, background: '#26334c', color: '#fff', borderRadius: 12, padding: 16, zIndex: 20, boxShadow: '0 8px 30px #14234433' }}>{notice}<button onClick={() => setNotice('')} aria-label="Tutup pesan" style={{ marginLeft: 12, background: 'transparent', color: '#fff', border: 0 }}><X size={16}/></button></div>}
      <style jsx>{`
        .sk-nav{display:flex;align-items:center;gap:10px;padding:12px;border:0;border-radius:9px;background:transparent;color:#64728a;text-align:left;font-size:13px}
        .sk-selected{background:#edf2ff;color:#4267e8;font-weight:700}
        .sk-avatar{width:38px;height:38px;border-radius:50%;border:0;background:#eaf0ff;color:#4267e8;font-weight:800}
        .sk-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
        .sk-stat{background:#fff;border:1px solid #e8edf4;border-radius:12px;padding:16px;display:flex;align-items:center;gap:12px;min-width:0}
        .sk-stat small,.sk-stat b{display:block}.sk-stat small{font-size:11px;color:#7e8ba2;margin-bottom:6px}.sk-stat b{font-size:15px}
        .sk-services{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .sk-service{display:flex;align-items:center;gap:12px;text-align:left;padding:15px;background:#fff;border:1px solid #e8edf4;border-radius:12px;color:#26334c;min-width:0}
        .sk-service-icon{display:grid;place-items:center;width:40px;height:40px;flex-shrink:0;border-radius:10px;background:#edf2ff;color:#4267e8}
        .sk-service span:nth-child(2){flex:1;min-width:0}.sk-service b,.sk-service small{display:block}.sk-service b{font-size:13px}.sk-service small{font-size:11px;color:#7e8ba2;margin-top:5px}
        .sk-menu,.sk-close{display:none;border:0;background:transparent;color:#26334c}
        @media(max-width:760px){.sk-sidebar{position:fixed;inset:0 auto 0 0;min-height:100dvh;transform:translateX(-110%);transition:transform .2s;width:270px!important;box-shadow:none}.sk-sidebar-open{transform:translateX(0);box-shadow:10px 0 30px #14234422}.sk-close{display:block;margin-left:auto}.sk-menu{display:block}.sk-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sk-services{grid-template-columns:1fr}}
        @media(max-width:380px){.sk-stats{grid-template-columns:1fr} }
      `}</style>
    </main>
  )
}
