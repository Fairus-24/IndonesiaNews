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