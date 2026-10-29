# Referensi Pengembangan SekolahKu

Dokumen ini mencatat proyek open-source yang dapat dijadikan referensi desain dan pola implementasi. Referensi **tidak otomatis disalin atau digabungkan** ke aplikasi; fitur dipilih satu per satu agar autentikasi Supabase, aturan akses data (RLS), dan data sekolah yang sudah ada tetap aman.

## Referensi yang dipilih

### 1. Dashboard Next.js + shadcn/ui
- Repository: https://github.com/Kiranism/next-shadcn-dashboard-starter
- Kegunaan untuk SekolahKu: pola dashboard responsif, navigasi, tabel, formulir, dan komponen UI.
- Cara adopsi: ambil pola komponen yang diperlukan secara bertahap; jangan mengganti autentikasi dan konfigurasi Supabase yang sudah berjalan.

### 2. Komponen UI shadcn/ui
- Repository: https://github.com/shadcn-ui/ui
- Kegunaan: komponen dasar yang konsisten dan ramah keyboard, seperti tombol, dialog, input, tabel, dan menu.
- Cara adopsi: pasang hanya jika struktur dependensi proyek sudah diperiksa, lalu migrasikan halaman sedikit demi sedikit.

### 3. Template manajemen sekolah Next.js
- Repository: https://github.com/zxmodren/Nextjs-SchoolManagementSystem-Template
- Kegunaan: referensi alur modul administrasi sekolah.
- Catatan: stack, kualitas kode, lisensi, dan kompatibilitasnya perlu diperiksa sebelum mengambil kode. Bukan dasar untuk mengganti aplikasi yang sedang berjalan.

## Prinsip integrasi

1. Pertahankan Next.js dan Supabase yang sudah digunakan.
2. Semua data siswa, kelas, jadwal, dan absensi harus dilindungi oleh Supabase Row Level Security (RLS).
3. Jangan memasukkan service-role key ke browser atau menyimpannya di Git.
4. Hindari menyalin seluruh template karena dapat menimpa login, kebijakan akses, dan struktur database.
5. Sebelum mengadopsi kode dari repository eksternal, tinjau lisensi, dependensi, keamanan, dan kecocokannya dengan proyek ini.

## Tahap berikutnya

- Selesaikan pengelolaan data siswa (edit data dengan validasi).
- Rancang tabel dan kebijakan RLS untuk absensi sebelum membuat halaman absensi.
- Tambahkan dukungan PWA setelah alur login dan halaman utama stabil.
