---
marp: true
theme: default
paginate: true
---

# Portal Berita IndonesiaNews
### UAS Pemrograman Web  
Kelompok 7  
Dosen: [Nama Dosen]  
Tanggal: [Tanggal Presentasi]

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


##Berikut adalah deskripsi alur sistem dalam bentuk teks yang saling berkaitan dan mudah diubah menjadi diagram alur (flowchart). Setiap bagian sudah dihubungkan secara logis dari awal hingga akhir proses aplikasi:

---

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

---

**Catatan:**
- Setiap proses saling terhubung, misal:  
  - Komentar hanya bisa jika user login  
  - Fitur admin hanya muncul jika role user = admin/developer  
  - Site settings/feature flags mempengaruhi fitur di frontend (misal: komentar aktif/tidak)
- Semua data utama (user, artikel, kategori, komentar, settings) tersimpan di database.

---
