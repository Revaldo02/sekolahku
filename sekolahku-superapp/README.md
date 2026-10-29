# SekolahKu SuperApp

Portal sekolah responsif berbasis Next.js App Router, TypeScript, React, dan Supabase. Proyek ini dikembangkan bertahap dengan prioritas penggunaan nyaman di HP Android, fondasi akses berbasis peran, dan biaya serendah mungkin.

## Status pengembangan

Website dan halaman inti sudah tersedia di repository. Integrasi autentikasi serta beberapa modul menggunakan Supabase. **Belum dinyatakan siap untuk operasional sekolah nyata** sebelum konfigurasi database, kebijakan Row Level Security (RLS), data awal, dan seluruh alur diuji pada proyek Supabase milik sekolah.

Data demo atau modul yang menampilkan pemberitahuan bukan transaksi nyata. Jangan gunakan data siswa sungguhan sampai akses, privasi, dan kebijakan penyimpanan diverifikasi.

## Kebutuhan lokal

- Node.js 20.9 atau lebih baru
- npm
- Akun/proyek Supabase hanya jika ingin menguji autentikasi dan database nyata

## Menyiapkan website lokal

1. Masuk ke folder `sekolahku-superapp`.
2. Pasang dependensi:

   ```bash
   npm ci
   ```

3. Salin `.env.example` menjadi `.env.local`.
4. Untuk menguji autentikasi/database, isi URL proyek Supabase dan publishable key dari pengaturan proyek Supabase. Jangan pernah menaruh service-role key di frontend atau variabel `NEXT_PUBLIC_*`.
5. Jalankan server pengembangan:

   ```bash
   npm run dev
   ```

6. Buka `http://localhost:3000` di browser. Untuk HP, perangkat dan komputer harus berada di jaringan yang memungkinkan akses ke alamat lokal komputer; atau gunakan lingkungan pengembangan lokal yang menyediakan preview.

Tanpa konfigurasi Supabase, halaman autentikasi akan tetap bisa dibuka untuk membantu setup, tetapi login dan akses data tidak dapat berfungsi. Halaman yang memerlukan akun akan mengarahkan pengguna ke halaman login.

## Pemeriksaan kualitas

Jalankan perintah berikut sebelum menyatakan perubahan siap:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Tes yang membutuhkan Supabase perlu dijalankan lagi setelah kredensial dan skema database disiapkan. Jangan menyebut pengujian berhasil jika perintahnya belum benar-benar dijalankan.

## Modul utama yang tersedia

- Dashboard / beranda
- Login, pendaftaran, pemulihan kata sandi, dan callback autentikasi
- Data siswa
- Kelas
- Jadwal pelajaran
- Kehadiran
- Manifest dan service worker dasar untuk pengembangan PWA

Sebagian layanan lain masih berupa tampilan atau pemberitahuan demo dan harus dihubungkan ke database serta diuji sebelum dipakai.

## Keamanan dan privasi

- Gunakan kebijakan RLS pada setiap tabel yang menyimpan data siswa, guru, orang tua, kelas, jadwal, presensi, nilai, atau pengumuman.
- Validasi hak akses di server/database, bukan hanya dengan menyembunyikan menu.
- Jangan commit `.env.local`, kata sandi, token, atau kunci privat.
- Terapkan pengumpulan data minimum dan kebijakan retensi yang sesuai untuk data anak/siswa.
- Gunakan akun uji dan data dummy selama pengembangan.

## Tahap berikutnya

1. Menuntaskan perbaikan dan pengujian lokal.
2. Memvalidasi skema Supabase, RLS, serta alur setiap peran.
3. Menguji responsif dan aksesibilitas di perangkat nyata.
4. Baru setelah semua pemeriksaan disetujui, merencanakan deployment dan publikasi. Deployment tidak termasuk tahap saat ini.
