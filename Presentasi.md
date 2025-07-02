---
marp: true
theme: default
paginate: true
---

# Portal Berita IndonesiaNews
### UAS Pemrograman Web  
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
  Membangun portal berita modern berbasis web dengan fitur lengkap.

---

## Fitur Utama & Fungsinya

- Home: Slider artikel unggulan & berita populer
- Kategori berita
- Detail artikel
- Komentar (moderasi otomatis/admin, emoji)
- Like & Bookmark
- Register/Login
- Admin panel: manajemen artikel, moderasi, statistik
- Site settings & feature flags

---

## Arsitektur Sistem

- **Frontend:** React, Vite, TailwindCSS
- **Backend:** Express.js, Drizzle ORM
- **Database:** SQLite/PostgreSQL
- **Lainnya:** JWT Auth, REST API, Emoji Picker, File Upload

---

## Flowchart Sistem

![Flowchart](flowchart.png)
<!-- Gambar flowchart, bisa digambar di draw.io lalu di-insert di sini -->

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
- Cuplikan kode:
```tsx
<Picker onEmojiClick={...} ... />
---

##Berikut adalah deskripsi alur sistem dalam bentuk teks yang saling berkaitan dan mudah diubah menjadi diagram alur (flowchart). Setiap bagian sudah dihubungkan secara logis dari awal hingga akhir proses aplikasi:


**1. User membuka aplikasi**  
→ Frontend React menampilkan halaman Home  
→ User dapat memilih:  
 • Melihat slider berita unggulan  
 • Melihat berita populer  
 • Memilih kategori berita  
 • Melakukan pencarian artikel  
 • Login/Register

**2. Jika user memilih artikel**  
→ Frontend menampilkan detail artikel  
→ User dapat:  
 • Membaca isi artikel  
 • Memberi like  
 • Bookmark artikel  
 • Melihat dan menulis komentar (jika fitur aktif)

**3. Jika user menulis komentar**  
→ Frontend mengirim data komentar ke backend  
→ Backend melakukan validasi & moderasi otomatis  
 • Jika lolos moderasi → komentar langsung tampil  
 • Jika terdeteksi spam/kata kasar → menunggu moderasi admin

**4. Jika user login/register**  
→ Frontend mengirim data ke backend  
→ Backend melakukan autentikasi (JWT)  
→ Jika sukses, user bisa akses fitur personal (like, bookmark, komentar, admin jika role sesuai)

**5. Jika user/admin mengakses Admin Panel**  
→ Frontend menampilkan menu admin  
→ Admin dapat:  
 • Manajemen artikel (tambah, edit, hapus, publish)  
 • Moderasi komentar  
 • Melihat statistik dashboard  
 • Mengatur site settings & feature flags

**6. Semua aksi user (baca, like, bookmark, komentar, admin)**  
→ Frontend mengirim request ke backend (API)  
→ Backend memproses request melalui middleware (autentikasi, validasi)  
→ Backend melakukan query ke database (Drizzle ORM)  
→ Jika ada upload gambar, backend simpan ke storage/uploads  
→ Backend mengirim response ke frontend  
→ Frontend update tampilan sesuai response


**Catatan:**
- Setiap proses saling terhubung, misal:  
  - Komentar hanya bisa jika user login  
  - Fitur admin hanya muncul jika role user = admin/developer  
  - Site settings/feature flags mempengaruhi fitur di frontend (misal: komentar aktif/tidak)
- Semua data utama (user, artikel, kategori, komentar, settings) tersimpan di database.


# Makalah Proyek Portal Berita IndonesiaNews

## 1. Pendahuluan

Portal Berita IndonesiaNews adalah aplikasi web yang dikembangkan sebagai tugas akhir mata kuliah Pemrograman Web. Aplikasi ini bertujuan menyediakan platform berita digital yang modern, interaktif, dan mudah dikelola, baik untuk pengguna umum maupun admin.

## 2. Latar Belakang

Di era digital, kebutuhan akan informasi yang cepat dan akurat sangat tinggi. Banyak portal berita yang tersedia, namun belum semuanya menawarkan pengalaman pengguna yang baik, fitur interaktif, serta kemudahan pengelolaan konten. Oleh karena itu, kami mengembangkan IndonesiaNews dengan fitur-fitur modern dan sistem manajemen yang efisien.

## 3. Tujuan

- Membuat portal berita berbasis web yang responsif dan mudah digunakan.
- Menyediakan fitur lengkap: publikasi artikel, kategori, komentar, bookmark, admin panel, dan pengaturan situs.
- Menerapkan konsep fullstack development (frontend, backend, database, storage).

## 4. Alur Sistem

1. User membuka aplikasi melalui browser (Frontend React).
2. User dapat melihat slider berita unggulan, berita populer, memilih kategori, mencari artikel, login/register.
3. Jika user memilih artikel, akan diarahkan ke halaman detail artikel, dapat memberi like, bookmark, dan komentar.
4. Komentar yang dikirim user akan dimoderasi otomatis oleh backend (jika tidak mengandung kata kasar/spam langsung tampil, jika tidak menunggu admin).
5. User yang login dapat mengakses fitur personal (like, bookmark, komentar). Jika role admin/developer, dapat mengakses admin panel.
6. Admin panel menyediakan fitur manajemen artikel, moderasi komentar, statistik, dan pengaturan site settings/feature flags.
7. Semua aksi user dikirim ke backend melalui REST API, diproses oleh Express.js, dan data disimpan di database (Drizzle ORM) atau storage (untuk gambar).

## 5. Fitur dan Fungsionalitas

### a. Home & Navigasi
- Menampilkan slider 3 artikel unggulan (otomatis berganti).
- Menampilkan 3 berita populer di kanan slider.
- Navigasi kategori dan pencarian artikel.

### b. Detail Artikel & Komentar
- Menampilkan isi artikel, penulis, tanggal, kategori, gambar.
- Komentar: user bisa menulis komentar, memilih emoji, validasi panjang komentar.
- Komentar dimoderasi otomatis oleh backend.

### c. Like, Bookmark, Register/Login
- User bisa like & bookmark artikel (harus login).
- Register/login untuk akses fitur personal.

### d. Admin Panel
- Hanya untuk user role admin/developer.
- Manajemen artikel: tambah, edit, hapus, publish/unpublish.
- Moderasi komentar: approve/reject otomatis/manual.
- Statistik dashboard: jumlah artikel, user, komentar.
- Pengaturan site settings & feature flags.

### e. Site Settings & Feature Flags
- Admin dapat mengaktifkan/menonaktifkan fitur (misal: komentar).
- Pengaturan disimpan di database dan diakses frontend melalui context/provider.

## 6. Arsitektur & Teknologi

- **Frontend:** React, Vite, TailwindCSS, React Query, React Hook Form, Zod, Emoji Picker
- **Backend:** Express.js, Drizzle ORM, JWT Auth, REST API, Middleware (autentikasi, validasi, rate limiter)
- **Database:** SQLite/PostgreSQL (tabel: User, Article, Category, Comment, Settings)
- **Storage:** Upload gambar artikel

## 7. Diagram Alur Sistem

```
User → Frontend (React) → API Request → Backend (Express.js) → Middleware → Routing → Database/Storage → Response → Frontend
```

## 8. Hasil & Tampilan

- Aplikasi berjalan responsif di desktop & mobile.
- Fitur utama berjalan sesuai kebutuhan: publikasi artikel, komentar, bookmark, admin panel, dsb.
- Tampilan modern dan mudah digunakan.
- Sistem moderasi komentar berjalan otomatis dan manual.
- Admin dapat mengatur fitur melalui site settings.

## 9. Kesimpulan

Portal Berita IndonesiaNews berhasil dibangun dengan fitur lengkap, arsitektur modern, dan sistem manajemen yang efisien. Aplikasi ini dapat dikembangkan lebih lanjut untuk kebutuhan nyata, baik sebagai portal berita kampus, komunitas, maupun publik.

## 10. Saran Pengembangan

- Integrasi notifikasi real-time (misal: komentar baru, artikel baru).
- Fitur upload video atau galeri foto.
- Integrasi analitik pengunjung.
- Peningkatan keamanan (captcha, audit log admin, dsb).


Makalah ini dapat digunakan sebagai dokumentasi, laporan, atau lampiran presentasi proyek.
