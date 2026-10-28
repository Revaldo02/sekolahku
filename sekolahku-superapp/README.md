# SekolahKu SuperApp

Fondasi awal portal sekolah terpadu berbasis Next.js, React, TypeScript, dan CSS responsif. Dirancang agar mudah dikembangkan bertahap dan nyaman dibuka melalui HP Android.

## Status saat ini

**Prototype frontend / mode demo.** Tampilan dashboard dan navigasi layanan sudah dibuat. Konten statistik, agenda, dan pengumuman masih contoh; belum ada autentikasi, backend, database, atau data sekolah sungguhan.

## Kebutuhan

- Node.js 20.9 atau lebih baru
- npm
- Git (opsional untuk menjalankan lokal, dibutuhkan untuk version control)

## Menjalankan di komputer atau lingkungan cloud

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Build produksi:

```bash
npm run build
npm run start
```

## Deploy gratis (opsi)

1. Unggah folder proyek ini ke repository GitHub milik Anda.
2. Hubungkan repository ke layanan hosting yang mendukung Next.js, misalnya Vercel.
3. Ikuti proses impor dan deploy bawaan penyedia hosting. Paket gratis memiliki batas penggunaan dan ketentuan yang dapat berubah.
4. Setelah deploy, uji tautan publik dari HP Android.

## Menjadikan aplikasi lebih lengkap

Tahap pengembangan yang disarankan:

1. **Fondasi UI** — dashboard responsif, navigasi, layanan demo (tahap ini).
2. **Database & autentikasi** — pilih penyedia, skema sekolah, siswa, guru, orang tua, kelas, dan tahun ajaran.
3. **Hak akses** — role-based access control, validasi server-side, dan audit log.
4. **Akademik** — jadwal, presensi, tugas, nilai, rapor, kalender, pengumuman.
5. **Administrasi** — data siswa, pembayaran (tanpa menyimpan data kartu), perpustakaan, komunikasi.
6. **PWA** — ikon aplikasi, service worker/offline strategy, instalasi dan pengujian lintas perangkat.
7. **Keamanan & rilis** — pengujian, backup, privasi, pengelolaan rahasia, serta prosedur pemulihan.

## Prinsip keamanan

- Jangan masukkan kata sandi, token, atau kunci privat ke repository.
- Jangan menaruh kunci server di variabel `NEXT_PUBLIC_*`.
- Data anak/siswa adalah data sensitif: batasi akses, kumpulkan seperlunya, dan dapatkan persetujuan serta dasar pemrosesan yang sesuai.
- Jangan gunakan data demo untuk keputusan sekolah nyata.

## Struktur

```text
app/
  globals.css
  layout.tsx
  page.tsx
public/
  manifest.json
.env.example
README.md
package.json
tsconfig.json
next.config.ts
eslint.config.mjs
```

## Catatan

Nama dan informasi pada dashboard hanyalah data contoh. Tombol layanan memberi pemberitahuan demo, bukan melakukan transaksi atau mengakses data siswa.
