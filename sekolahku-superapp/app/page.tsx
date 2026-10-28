"use client";

import { useMemo, useState } from "react";
import {
  Activity, Bell, BookOpen, CalendarDays, CheckCircle2, ChevronDown, ChevronRight,
  ClipboardCheck, Clock3, GraduationCap, Grid2X2, HelpCircle, Home, Menu,
  MessageCircle, Search, Settings, ShieldCheck, Sparkles, Users, Wallet, X,
  FileText, LibraryBig, Bus, Utensils, CalendarCheck, UserRound, Megaphone
} from "lucide-react";

type Service = { title: string; desc: string; icon: typeof BookOpen; color: string; group: string };

const services: Service[] = [
  { title: "Jadwal Pelajaran", desc: "Lihat jadwal kelas hari ini", icon: CalendarDays, color: "blue", group: "Akademik" },
  { title: "Kehadiran", desc: "Pantau presensi harian", icon: ClipboardCheck, color: "green", group: "Akademik" },
  { title: "Nilai & Rapor", desc: "Ringkasan hasil belajar", icon: GraduationCap, color: "purple", group: "Akademik" },
  { title: "Tugas Sekolah", desc: "Tugas dan tenggat terdekat", icon: FileText, color: "orange", group: "Akademik" },
  { title: "Kalender Sekolah", desc: "Agenda dan kegiatan sekolah", icon: CalendarCheck, color: "pink", group: "Informasi" },
  { title: "Pengumuman", desc: "Informasi resmi sekolah", icon: Megaphone, color: "yellow", group: "Informasi" },
  { title: "Perpustakaan", desc: "Jelajahi koleksi buku", icon: LibraryBig, color: "teal", group: "Layanan" },
  { title: "Pembayaran", desc: "Informasi tagihan sekolah", icon: Wallet, color: "green", group: "Layanan" },
  { title: "Komunikasi", desc: "Hubungi wali kelas", icon: MessageCircle, color: "blue", group: "Layanan" },
  { title: "Data Siswa", desc: "Profil dan informasi siswa", icon: UserRound, color: "purple", group: "Administrasi" },
  { title: "Antar-Jemput", desc: "Informasi transportasi", icon: Bus, color: "orange", group: "Layanan" },
  { title: "Kantin Sehat", desc: "Menu dan informasi kantin", icon: Utensils, color: "pink", group: "Layanan" }
];

const announcements = [
  { tag: "Akademik", title: "Pengumpulan tugas proyek kelas", detail: "Pastikan tugas dikumpulkan sesuai jadwal yang ditentukan guru.", date: "Hari ini" },
  { tag: "Kegiatan", title: "Persiapan kegiatan Jumat Bersih", detail: "Seluruh siswa diharapkan membawa perlengkapan kebersihan.", date: "Besok" },
  { tag: "Informasi", title: "Pembaruan informasi orang tua", detail: "Periksa kembali nomor kontak wali murid melalui wali kelas.", date: "24 Okt" }
];

export default function HomePage() {
  const [activeNav, setActiveNav] = useState("Beranda");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const filteredServices = useMemo(() => services.filter(s => `${s.title} ${s.desc} ${s.group}`.toLowerCase().includes(search.toLowerCase())), [search]);
  const navItems = [
    { label: "Beranda", icon: Home }, { label: "Akademik", icon: BookOpen },
    { label: "Layanan", icon: Grid2X2 }, { label: "Komunikasi", icon: MessageCircle }
  ];
  const handleService = (title: string) => setNotice(`${title}: fitur ini sudah disiapkan pada tampilan awal. Integrasi data dan akun akan ditambahkan pada tahap berikutnya.`);
  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><GraduationCap size={25}/></div><div><strong>Sekolah<span>Ku</span></strong><small>PORTAL SEKOLAH TERPADU</small></div><button className="close-menu" onClick={() => setMenuOpen(false)} aria-label="Tutup menu"><X size={20}/></button></div>
        <div className="school-switch"><div className="school-avatar">SK</div><div className="school-copy"><b>SekolahKu Demo</b><small>Portal sekolah</small></div><ChevronDown size={16}/></div>
        <p className="nav-caption">MENU UTAMA</p>
        <nav className="main-nav">{navItems.map(item => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${activeNav === item.label ? "active" : ""}`} onClick={() => {setActiveNav(item.label); setMenuOpen(false); if(item.label !== "Beranda") setNotice(`Bagian ${item.label} akan dikembangkan pada tahap berikutnya.`);}}><Icon size={19}/><span>{item.label}</span>{item.label === "Komunikasi" && <i className="nav-dot"/>}</button>})}</nav>
        <p className="nav-caption tools-caption">PREFERENSI</p>
        <button className="nav-item" onClick={() => setNotice("Pengaturan akun akan tersedia setelah sistem login dibuat.")}><Settings size={19}/><span>Pengaturan</span></button>
        <button className="nav-item" onClick={() => setNotice("Pusat bantuan akan ditambahkan pada tahap pengembangan berikutnya.")}><HelpCircle size={19}/><span>Pusat Bantuan</span></button>
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><ShieldCheck size={20}/></div><b>Ruang belajar lebih baik</b><p>Satu tempat untuk terhubung dan berkembang bersama.</p><button onClick={() => setNotice("Terima kasih! Pusat bantuan akan segera tersedia.")}>Pelajari lebih lanjut <ChevronRight size={14}/></button></div><div className="user-profile"><div className="profile-avatar">AD</div><div className="profile-info"><b>Admin Demo</b><small>Administrator</small></div><button aria-label="Pengaturan profil" onClick={() => setNotice("Profil demo — login sungguhan belum diaktifkan.")}><Settings size={17}/></button></div></div>
      </aside>
      {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Tutup menu"/>}
      <section className="main-area">
        <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Buka menu"><Menu size={22}/></button><div className="breadcrumb">Portal <ChevronRight size={15}/> <b>{activeNav}</b></div><div className="top-actions"><label className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari layanan..." aria-label="Cari layanan"/><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label="Notifikasi" onClick={() => setNotice("Belum ada notifikasi baru pada akun demo.")}><Bell size={19}/><i/></button><div className="top-divider"/><div className="top-user"><div className="profile-avatar">AD</div><div><b>Admin Demo</b><small>Administrator</small></div><ChevronDown size={15}/></div></div></header>
        <div className="content">
          <div className="welcome-row"><div><div className="eyebrow"><Sparkles size={15}/> SELAMAT DATANG DI SEKOLAHKU</div><h1>Semua urusan sekolah,<br/><span>lebih mudah.</span></h1><p>Selamat datang! Temukan layanan sekolah dan informasi terbaru dalam satu tempat.</p></div><div className="welcome-art"><div className="art-sun"/><div className="art-cloud cloud-one"/><div className="art-cloud cloud-two"/><div className="art-book"><BookOpen size={54}/></div><div className="art-spark spark-one">✦</div><div className="art-spark spark-two">✦</div></div></div>
          <div className="stats-grid"><div className="stat-card"><div className="stat-icon blue"><CalendarDays size={20}/></div><div><span>Agenda Hari Ini</span><strong>3 <small>kegiatan</small></strong><p><span className="status-dot blue-dot"/>Jadwal sekolah</p></div></div><div className="stat-card"><div className="stat-icon green"><CheckCircle2 size={20}/></div><div><span>Status Kehadiran</span><strong>Aktif</strong><p><span className="status-dot green-dot"/>Pantau presensi</p></div></div><div className="stat-card"><div className="stat-icon purple"><BookOpen size={20}/></div><div><span>Layanan Tersedia</span><strong>12 <small>layanan</small></strong><p><span className="status-dot purple-dot"/>Jelajahi fitur</p></div></div><div className="stat-card"><div className="stat-icon orange"><Activity size={20}/></div><div><span>Info Terbaru</span><strong>3 <small>pengumuman</small></strong><p><span className="status-dot orange-dot"/>Tetap terhubung</p></div></div></div>
          <div className="section-heading"><div><h2>Layanan Sekolah</h2><p>Akses cepat ke layanan yang kamu butuhkan.</p></div><button className="text-button" onClick={() => setShowAll(v => !v)}>{showAll ? "Tampilkan ringkas" : "Lihat semua"} <ChevronRight size={16}/></button></div>
          {search && <p className="search-result">Hasil pencarian untuk <b>“{search}”</b>: {filteredServices.length} layanan</p>}
          <div className="services-grid">{filteredServices.slice(0, showAll || search ? 12 : 8).map((service) => {const Icon = service.icon; return <button className="service-card" key={service.title} onClick={() => handleService(service.title)}><div className={`service-icon ${service.color}`}><Icon size={21}/></div><div className="service-copy"><b>{service.title}</b><span>{service.desc}</span></div><ChevronRight className="service-arrow" size={17}/></button>})}{filteredServices.length === 0 && <div className="empty-search">Tidak ada layanan yang cocok. Coba kata kunci lain.</div>}</div>
          <div className="bottom-grid"><section className="panel announcements"><div className="panel-heading"><div><h2>Pengumuman Terbaru</h2><p>Informasi penting dari sekolah.</p></div><button className="icon-button subtle" aria-label="Lihat semua pengumuman" onClick={() => setNotice("Daftar pengumuman lengkap akan tersedia saat backend dibuat.")}><ChevronRight size={19}/></button></div><div className="announcement-list">{announcements.map((item, i) => <button className="announcement-item" key={item.title} onClick={() => setNotice(`${item.title}. ${item.detail}`)}><div className={`announcement-symbol symbol-${i}`}><Megaphone size={18}/></div><div className="announcement-copy"><div><b>{item.title}</b><span className={`tag tag-${i}`}>{item.tag}</span></div><p>{item.detail}</p><small><Clock3 size={13}/>{item.date}</small></div><ChevronRight size={16} className="announcement-arrow"/></button>)}</div></section>
          <section className="panel agenda"><div className="panel-heading"><div><h2>Agenda Sekolah</h2><p>Rencana kegiatan terdekat.</p></div><CalendarDays className="panel-title-icon" size={20}/></div><div className="agenda-date"><div className="date-tile"><span>OKT</span><b>28</b></div><div className="agenda-copy"><b>Belajar & kegiatan kelas</b><span><Clock3 size={14}/> 07.00 – 12.00 WIB</span><small>Agenda contoh untuk tampilan awal</small></div></div><div className="agenda-date"><div className="date-tile date-tile-green"><span>OKT</span><b>29</b></div><div className="agenda-copy"><b>Persiapan kegiatan sekolah</b><span><Clock3 size={14}/> 08.00 – 10.00 WIB</span><small>Agenda contoh untuk tampilan awal</small></div></div><button className="agenda-link" onClick={() => setNotice("Kalender lengkap akan tersedia pada pengembangan berikutnya.")}>Buka kalender sekolah <ChevronRight size={15}/></button></section></div>
          <footer><span>© 2026 SekolahKu. Dibangun untuk pendidikan yang lebih terhubung.</span><span><i className="footer-dot"/> Mode demo · Data contoh</span></footer>
        </div>
      </section>
      {notice && <div className="toast" role="status"><div className="toast-icon"><CheckCircle2 size={19}/></div><p>{notice}</p><button onClick={() => setNotice("")} aria-label="Tutup pesan"><X size={17}/></button></div>}
    </main>
  );
}
