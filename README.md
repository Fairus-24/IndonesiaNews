<!-- Banner / Logo / Cover -->
<p align="center">
  <img src="https://st5.depositphotos.com/2885805/65185/v/450/depositphotos_651857994-stock-illustration-indonesia-flat-banner-cultural-landmarks.jpg" alt="IndonesiaNews" width="400"/>
</p>

<h1 align="center">🇮🇩 IndonesiaNews</h1>
<p align="center">
  <b>Portal Berita Indonesia Modern - Fullstack React, Express, Drizzle ORM</b>
</p>
<p align="center">
  <a href="#instalasi">Instalasi</a> • <a href="#flowchart-aplikasi">Flowchart</a> • <a href="#alur-kerja-program-detail">Alur Kerja</a>
</p>

---

## 🚀 Instalasi

1. <b>Clone repository:</b>
   ```bash
   git clone https://github.com/Fairus-24/IndonesiaNews.git
   cd IndonesiaNews
   ```
2. <b>Install dependencies:</b>
   ```bash
   npm install
   ```
3. <b>Jalankan aplikasi (dev mode):</b>
   ```bash
   npm run dev
   ```

---

# IndonesiaNews

## Flowchart Aplikasi

```mermaid
flowchart TD
    A[User membuka aplikasi] --> B{Frontend (React)}
    B --> C1[Home: Featured Slider & Berita Populer]
    B --> C2[Login/Register]
    B --> C3[Halaman Kategori]
    B --> C4[Detail Artikel]
    B --> C5[Bookmarks]
    B --> C6[Settings]
    B --> C7[Admin Panel]
    C7 --> D1[Manajemen Artikel]
    C7 --> D2[Moderasi Komentar]
    C7 --> D3[Statistik Dashboard]
    B -->|Aksi user| E[API Request ke Backend]
    E --> F{Backend (Express.js)}
    F --> G1[Autentikasi & Middleware]
    F --> G2[Route Artikel]
    F --> G3[Route Kategori]
    F --> G4[Route Komentar]
    F --> G5[Route Settings]
    F --> G6[Route Upload]
    G2 --> H1[Database (Drizzle ORM)]
    G3 --> H1
    G4 --> H1
    G5 --> H1
    G6 --> H2[Storage/Uploads]
    H1 -->|Data| B
    H2 -->|File URL| B
```

## Alur Kerja Program (Detail)

### 1. Frontend (React)
- User membuka aplikasi melalui browser.
- Halaman utama (Home) menampilkan slider featured articles dan berita populer.
- User dapat:
  - Melihat detail artikel.
  - Memilih kategori berita.
  - Melakukan pencarian artikel.
  - Login/Register untuk akses fitur personal.
  - Bookmark artikel favorit.
  - Mengakses halaman Settings untuk mengubah preferensi.
  - Jika admin/developer, mengakses Admin Panel (manajemen artikel, moderasi komentar, statistik).
- Setiap aksi (baca, bookmark, moderasi, dsb) mengirim request ke backend melalui REST API.

### 2. Backend (Express.js)
- Menerima request dari frontend.
- Melalui middleware autentikasi (cek token JWT, role user, dsb).
- Routing utama:
  - **/api/articles**: CRUD artikel, filter, pagination, featured, popular.
  - **/api/categories**: List, tambah, edit, hapus kategori.
  - **/api/comments**: Post, moderasi, approve/reject komentar.
  - **/api/settings**: Site settings, feature flags.
  - **/api/upload**: Upload gambar artikel.
- Setiap endpoint memvalidasi data, cek hak akses, dan meneruskan ke database/storage.

### 3. Database (Drizzle ORM)
- Menyimpan data utama:
  - User (akun, role, dsb)
  - Artikel (judul, isi, gambar, kategori, dsb)
  - Kategori
  - Komentar (status moderasi, dsb)
  - Site settings
- Query dilakukan oleh backend sesuai permintaan frontend.

### 4. Storage/Uploads
- Menyimpan file gambar artikel yang diupload user/admin.
- Backend mengembalikan URL file ke frontend untuk ditampilkan.

### 5. Admin Panel
- Hanya bisa diakses user dengan role admin/developer.
- Fitur:
  - Manajemen artikel (tambah, edit, hapus, publish/unpublish)
  - Moderasi komentar (approve/reject otomatis/manual)
  - Statistik dashboard (jumlah artikel, user, komentar, dsb)
  - Pengaturan site settings & feature flags

### 6. Alur User Biasa
1. User membuka Home, melihat slider & berita populer.
2. User klik artikel → Detail Artikel.
3. User bisa login/register untuk bookmark.
4. User bookmark artikel → data tersimpan di backend.
5. User bisa filter berdasarkan kategori atau search.

### 7. Alur Admin
1. Login sebagai admin/developer.
2. Akses Admin Panel.
3. Kelola artikel, moderasi komentar, cek statistik, ubah settings.

---

<p align="center">
  <img src="https://user-images.githubusercontent.com/placeholder/indonesianews-preview.png" alt="Preview" width="700"/>
</p>

<details>
<summary><b>✨ Tips & Catatan</b></summary>

- Gunakan Node.js versi terbaru untuk hasil optimal.
- Pastikan environment variable sudah di-setup (lihat .env.example jika ada).
- Untuk pengembangan, gunakan browser modern (Chrome, Edge, Firefox).
- Fitur admin hanya bisa diakses user dengan role admin/developer.

</details>
