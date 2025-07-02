---
marp: true
theme: default
paginate: true
---

# Portal Berita IndonesiaNews
### UAS Pemrograman Web 2025
**Kelompok 4**

**Anggota:**
1. Abed
2. Fairus
3. Nisak
4. Diva
5. Indah
6. Akmal
7. Zulfa

**Dosen:** Muchayan
**Tanggal:** 2 Juli 2025

---

## Latar Belakang & Tujuan
- Informasi digital sangat dibutuhkan masyarakat modern.
- Portal berita harus ramah pengguna, interaktif, dan mudah dikelola.
- **Tujuan:**
  Membangun portal berita modern berbasis web dengan fitur lengkap dan panel developer/admin.

---

## Fitur Utama & Fungsinya
- Home: Slider artikel unggulan & berita populer
- Kategori berita
- Detail artikel
- Komentar (moderasi otomatis/admin, emoji)
- Like & Bookmark
- Register/Login
- Admin panel: manajemen artikel, moderasi, statistik
- Developer panel: database, audit log, user management, info sistem, logs, feature flags
- Site settings & feature flags
- Forgot password, show/hide password, login demo (admin, developer, demo user)

---

## Arsitektur Sistem
- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Express.js, Prisma ORM
- **Database:** MySQL (phpMyAdmin/XAMPP)
- **Lainnya:** JWT Auth, REST API, Emoji Picker, File Upload, Audit Log, Feature Flags, Prisma Client

---

## Migrasi & Integrasi Database
- Migrasi data dari PostgreSQL (Neon) ke MySQL (phpMyAdmin/XAMPP) menggunakan Prisma ORM.
- Script migrasi: `migrate_postgres_to_mysql.js`, konversi CSV ke SQL.
- Penyesuaian schema Prisma, generate Prisma Client, dan update koneksi `.env`.
- Semua query backend kini menggunakan Prisma Client (MySQL).

---

## Developer Panel (Admin/Developer)
- Tab database: view, edit, hapus data (CRUD, tanpa tambah data)
- Tab pengguna: CRUD user, log perubahan role, konfirmasi password
- Tab info sistem: environment variable, info server
- Tab logs: audit log, log server, log perubahan user
- Tab feature flags: aktif/nonaktif fitur
- Forgot password, show/hide password, login demo (admin, developer, demo user)

---

## Flowchart Sistem

![Flowchart 1](https://raw.githubusercontent.com/Fairus-24/IndonesiaNews/refs/heads/main/client/src/assets/flowchart.png)

![Flowchart 2](https://raw.githubusercontent.com/Fairus-24/IndonesiaNews/refs/heads/main/client/src/assets/flowchart2.png)

---

## Home & Navigasi
- Slider 3 artikel unggulan (otomatis)
- 3 berita populer di kanan slider
- Navigasi kategori & pencarian
- Komponen modular: ArticleCard, Badge, dsb.

---

## Detail Artikel & Komentar
- Isi artikel, penulis, tanggal, kategori, gambar
- Komentar: form, emoji, validasi, moderasi otomatis

---

## Alur Sistem (Teks)
1. User membuka aplikasi (Frontend React)
2. User dapat melihat slider berita unggulan, berita populer, memilih kategori, mencari artikel, login/register.
3. Jika user memilih artikel, akan diarahkan ke halaman detail artikel, dapat memberi like, bookmark, dan komentar.
4. Komentar yang dikirim user akan dimoderasi otomatis oleh backend (jika tidak mengandung kata kasar/spam langsung tampil, jika tidak menunggu admin).
5. User yang login dapat mengakses fitur personal (like, bookmark, komentar). Jika role admin/developer, dapat mengakses admin/developer panel.
6. Admin/developer panel menyediakan fitur manajemen artikel, moderasi komentar, statistik, pengaturan site settings/feature flags, database, audit log, user management, info sistem, logs, feature flags.
7. Semua aksi user dikirim ke backend melalui REST API, diproses oleh Express.js, dan data disimpan di database (Prisma ORM/MySQL) atau storage (untuk gambar).

---

## Keamanan & Validasi
- Validasi backend dengan Zod
- Error handling detail
- JWT Auth
- Audit log (perubahan user, role, dsb)
- Konfirmasi password untuk aksi sensitif

---

## Build & Deploy
- Frontend: Vite, React, TailwindCSS
- Backend: Express.js, Prisma, MySQL
- Jalankan: `npm run dev` untuk development
- Migrasi database: `npx prisma migrate dev`
- Konfigurasi environment di `.env`
- Database dapat diatur via phpMyAdmin/XAMPP

---

## Penutup
- IndonesiaNews: Portal berita modern, interaktif, dan mudah dikelola
- Fitur lengkap untuk user, admin, dan developer
- Migrasi ke MySQL & Prisma meningkatkan skalabilitas dan maintainability
- Siap dikembangkan lebih lanjut untuk kebutuhan nyata


