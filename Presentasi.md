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

---

## Struktur & Penjelasan Database

### 1. Tabel User
- **Kolom:**
  - id: Primary key, identitas unik user
  - fullName: Nama lengkap user
  - email: Email user (unik)
  - password: Password terenkripsi
  - role: Peran user (user/admin/developer)
- **Kegunaan:**
  - Menyimpan data akun user
  - Menentukan hak akses (fitur personal/admin)

### 2. Tabel Article
- **Kolom:**
  - id: Primary key, identitas artikel
  - title: Judul artikel
  - content: Isi artikel (HTML)
  - excerpt: Ringkasan artikel
  - coverImage: URL gambar utama
  - categoryId: Relasi ke kategori
  - authorId: Relasi ke user penulis
  - publishedAt: Tanggal publish
  - createdAt, updatedAt: Timestamp
- **Kegunaan:**
  - Menyimpan seluruh artikel berita
  - Relasi ke user (penulis) dan kategori

### 3. Tabel Category
- **Kolom:**
  - id: Primary key
  - name: Nama kategori
  - color: Warna kategori (untuk badge)
  - slug: Slug unik untuk URL
- **Kegunaan:**
  - Menyimpan daftar kategori berita
  - Digunakan untuk filter dan navigasi

### 4. Tabel Comment
- **Kolom:**
  - id: Primary key
  - content: Isi komentar
  - articleId: Relasi ke artikel
  - authorId: Relasi ke user
  - createdAt: Timestamp
  - status: Status moderasi (approved/pending/rejected)
- **Kegunaan:**
  - Menyimpan komentar user pada artikel
  - Mendukung moderasi otomatis/manual

### 5. Tabel Settings
- **Kolom:**
  - key: Nama pengaturan (misal: feature_flags)
  - value: Nilai pengaturan (JSON/string)
- **Kegunaan:**
  - Menyimpan pengaturan global aplikasi (site settings, feature flags)
  - Digunakan untuk mengaktifkan/menonaktifkan fitur dari admin panel

### 6. Tabel Bookmark (opsional, jika tidak di dalam User/Article)
- **Kolom:**
  - id: Primary key
  - userId: Relasi ke user
  - articleId: Relasi ke artikel
- **Kegunaan:**
  - Menyimpan data artikel yang di-bookmark user

---

## Komunikasi Frontend & Backend

- **Frontend (React):**
  - Mengirim request ke backend menggunakan fetch/axios (REST API)
  - Contoh: GET /api/articles, POST /api/articles/:id/comments
  - Mengirim data (JSON) untuk aksi: login, register, komentar, like, bookmark, dsb
  - Menerima response (data, status, pesan error) dari backend
  - Menampilkan data ke user sesuai response

- **Backend (Express.js):**
  - Menerima request dari frontend
  - Melakukan autentikasi (cek JWT), validasi data, dan otorisasi
  - Memproses request: query ke database, simpan data, update, hapus, dsb
  - Mengirim response ke frontend (data, status, pesan)

- **Contoh Alur Komunikasi:**
  1. User klik tombol Like di frontend
  2. Frontend kirim POST /api/articles/:id/like ke backend
  3. Backend cek autentikasi, update data like di database
  4. Backend kirim response (berhasil/gagal) ke frontend
  5. Frontend update tampilan jumlah like

- **Keamanan:**
  - Semua endpoint penting dilindungi autentikasi JWT
  - Validasi data di backend untuk mencegah data tidak valid/berbahaya

---

Makalah ini dapat digunakan sebagai dokumentasi, laporan, atau lampiran presentasi proyek.

---

## Penjelasan Bagian-Bagian Kode & Fungsinya

### 1. Frontend (React)
- **App.tsx**
  - Fungsi: Entry point aplikasi, routing antar halaman (Home, Detail, Login, Register, Admin, dsb).
  - Kegunaan: Mengatur navigasi dan layout utama aplikasi.

- **components/Navbar.tsx & Footer.tsx**
  - Fungsi: Komponen navigasi utama dan footer di setiap halaman.
  - Kegunaan: Memudahkan user berpindah halaman, menampilkan info penting.

- **pages/Home.tsx**
  - Fungsi: Menampilkan slider artikel unggulan, berita populer, kategori, dan daftar artikel.
  - Kegunaan: Halaman utama yang menjadi pusat akses berita dan fitur pencarian/kategori.

- **pages/ArticleDetail.tsx**
  - Fungsi: Menampilkan detail artikel, komentar, tombol like/bookmark, form komentar dengan emoji.
  - Kegunaan: Membaca artikel lengkap, interaksi user (komentar, like, bookmark).

- **pages/admin/**
  - Fungsi: Halaman admin untuk manajemen artikel, moderasi komentar, statistik, pengaturan situs.
  - Kegunaan: Hanya untuk admin/developer, mengelola seluruh konten dan fitur aplikasi.

- **components/ArticleCard.tsx**
  - Fungsi: Komponen kartu artikel untuk list/grid di Home dan kategori.
  - Kegunaan: Menampilkan ringkasan artikel secara konsisten.

- **lib/siteSettings.tsx**
  - Fungsi: Context/provider untuk site settings & feature flags.
  - Kegunaan: Mengatur fitur aktif/tidak dari frontend.

- **hooks/useAuth.tsx**
  - Fungsi: Custom hook untuk autentikasi user (login, logout, cek status).
  - Kegunaan: Mengelola state user di frontend.

- **lib/queryClient.ts**
  - Fungsi: Setup React Query untuk fetch/mutate data ke backend.
  - Kegunaan: Optimasi pengambilan data dan cache.

---

### 2. Backend (Express.js)
- **server/index.ts**
  - Fungsi: Entry point backend, setup server, middleware, routing.
  - Kegunaan: Menjalankan server API dan mengatur request/response.

- **server/routes.ts**
  - Fungsi: Mendefinisikan endpoint API (artikel, kategori, komentar, settings, upload).
  - Kegunaan: Mengatur jalur komunikasi data antara frontend dan database.

- **server/db.ts**
  - Fungsi: Setup koneksi database dengan Drizzle ORM.
  - Kegunaan: Menghubungkan backend ke database (SQLite/PostgreSQL).

- **server/middleware/auth.ts**
  - Fungsi: Middleware autentikasi JWT, cek role user.
  - Kegunaan: Melindungi endpoint penting dari akses tidak sah.

- **server/services/upload.ts**
  - Fungsi: Proses upload file (gambar artikel) ke storage.
  - Kegunaan: Menyimpan file dan mengembalikan URL ke frontend.

---

### 3. Shared & Utilities
- **shared/schema.ts**
  - Fungsi: Mendefinisikan skema data (User, Article, Category, Comment, Settings) untuk validasi dan ORM.
  - Kegunaan: Menjamin konsistensi struktur data di seluruh aplikasi.

- **client/src/types/index.ts**
  - Fungsi: Tipe data TypeScript untuk seluruh entitas aplikasi.
  - Kegunaan: Memastikan type safety dan autocompletion di frontend.

- **client/src/hooks/use-toast.ts**
  - Fungsi: Custom hook untuk notifikasi toast.
  - Kegunaan: Memberi feedback ke user (sukses/gagal aksi).

---

### 4. Maksud, Tujuan, dan Kegunaan Setiap Bagian
- **Frontend:**
  - Menyajikan UI/UX interaktif, responsif, dan mudah digunakan.
  - Mengelola state aplikasi, autentikasi, dan komunikasi ke backend.
- **Backend:**
  - Menyediakan API yang aman, efisien, dan terstruktur.
  - Mengelola data, autentikasi, dan logika bisnis aplikasi.
- **Database:**
  - Menyimpan seluruh data utama aplikasi secara terstruktur dan aman.
- **Storage:**
  - Menyimpan file gambar artikel yang diupload user/admin.
- **Shared/Utils:**
  - Menjamin konsistensi data, validasi, dan kemudahan pengembangan lintas stack.

---

Setiap bagian saling terhubung membentuk sistem portal berita yang modern, aman, dan mudah dikembangkan.

---

## Contoh Potongan Kode Inti & Penjelasannya

### 1. Fetch Artikel & Kategori (Home.tsx)
```tsx
const { data: articlesResponse, isLoading: articlesLoading } = useQuery({
  queryKey: ["/api/articles", { page, category, search }],
  queryFn: async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      published: "true",
      ...(category && { category }),
      ...(search && { search }),
    });
    const response = await fetch(`/api/articles?${params}`);
    if (!response.ok) throw new Error("Failed to fetch articles");
    return response.json();
  },
});
```
**Penjelasan:**
- Mengambil data artikel dari backend dengan filter page, kategori, dan pencarian.
- Menggunakan React Query untuk optimasi fetch dan cache data.

---

### 2. Form Komentar & Emoji Picker (ArticleDetail.tsx)
```tsx
<form onSubmit={commentForm.handleSubmit(onSubmitComment)}>
  <Textarea {...commentForm.register("content")} />
  <button type="button" onClick={() => setShowEmoji((v) => !v)}>😊</button>
  {showEmoji && (
    <Picker onEmojiClick={(emojiData) => {
      // Menyisipkan emoji ke textarea
    }} />
  )}
  <Button type="submit">Kirim Komentar</Button>
</form>
```
**Penjelasan:**
- Form komentar dengan validasi dan emoji picker.
- Emoji dapat disisipkan ke dalam textarea komentar.
- Komentar dikirim ke backend untuk dimoderasi.

---

### 3. API Route Backend: Ambil Artikel (server/routes.ts)
```ts
app.get("/api/articles", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const categorySlug = req.query.category as string;
  const search = req.query.search as string;
  let published: boolean | undefined;
  if (req.query.published === "false") {
    published = undefined;
  } else {
    published = true;
  }
  const result = await storage.getArticles(page, limit, categorySlug, search, published);
  res.json(result);
});
```
**Penjelasan:**
- Endpoint backend untuk mengambil daftar artikel dengan filter page, kategori, search, dan status publish.
- Data diambil dari database melalui storage layer.

---

### 4. Site Settings Provider (client/src/lib/siteSettings.tsx)
```tsx
export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>({});
  useEffect(() => {
    async function fetchSettings() {
      const keys = ["site_name", "site_description", "site_icon", "feature_flags"];
      const results = await Promise.all(
        keys.map(async (key) => {
          const res = await fetch(`/api/settings/${key}`);
          if (!res.ok) return [key, undefined];
          const data = await res.json();
          return [key, data.value];
        })
      );
      const obj: SiteSettings = {};
      for (const [key, value] of results) {
        if (key && value !== undefined) obj[key as keyof SiteSettings] = value;
      }
      setSettings(obj);
    }
    fetchSettings();
  }, []);
  return (
    <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
  );
};
```
**Penjelasan:**
- Provider React untuk mengambil dan menyimpan site settings dari backend.
- Digunakan untuk mengatur fitur aktif/tidak (feature flags) di seluruh aplikasi.

---

### 5. Autentikasi User (client/src/hooks/useAuth.tsx)
```tsx
useEffect(() => {
  const initAuth = async () => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        const data = await response.json();
        setUserState(data.user);
      } catch {
        logout();
      }
    }
    setIsLoading(false);
  };
  initAuth();
}, []);
```
**Penjelasan:**
- Mengecek status login user saat aplikasi dimuat.
- Jika token valid, user dianggap login dan bisa akses fitur personal.

---

### 6. API Route Backend: Komentar (server/routes.ts)
```ts
app.post("/api/articles/:articleId/comments", authenticateToken, async (req, res) => {
  const articleId = parseInt(req.params.articleId);
  const { content } = req.body;
  const comment = await storage.createComment({
    content,
    authorId: req.user!.id,
    articleId,
    isApproved: false, // Komentar perlu moderasi
  });
  res.status(201).json({ message: "Komentar berhasil dikirim dan menunggu moderasi" });
});
```
**Penjelasan:**
- Endpoint backend untuk menerima komentar baru.
- Komentar disimpan dengan status menunggu moderasi (isApproved: false).

---

## Potongan Kode Inti Lanjutan & Penjelasannya

### 7. Routing & Layout Utama (App.tsx)
```tsx
function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/article/:slug" element={<ArticleDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/*" element={<ProtectedRoute roles={["ADMIN", "DEVELOPER"]}><AdminRoutes /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```
**Penjelasan:**
- Mengatur navigasi utama aplikasi menggunakan React Router.
- Melindungi route admin dengan komponen ProtectedRoute.

---

### 8. Protected Route (components/ProtectedRoute.tsx)
```tsx
export default function ProtectedRoute({ children, roles, fallback }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated || (roles && !roles.includes(user?.role))) {
    return fallback || <Navigate to="/login" />;
  }
  return <>{children}</>;
}
```
**Penjelasan:**
- Membatasi akses halaman tertentu hanya untuk user dengan role tertentu (misal: admin).

---

### 9. Komponen Navbar (components/Navbar.tsx)
```tsx
export default function Navbar() {
  const siteSettings = useSiteSettings();
  const { user, logout, isAuthenticated } = useAuth();
  // ...
  return (
    <nav>
      {/* Logo, menu, user info, dsb */}
    </nav>
  );
}
```
**Penjelasan:**
- Menampilkan navigasi utama, logo, dan menu sesuai status login user.

---

### 10. Komponen Footer (components/Footer.tsx)
```tsx
export default function Footer() {
  return (
    <footer className="py-6 text-center text-gray-500">
      &copy; {new Date().getFullYear()} IndonesiaNews. All rights reserved.
    </footer>
  );
}
```
**Penjelasan:**
- Menampilkan informasi copyright di bagian bawah aplikasi.

---

### 11. Komponen ArticleCard (components/ArticleCard.tsx)
```tsx
export default function ArticleCard({ article }) {
  return (
    <Card>
      <img src={article.coverImage} alt={article.title} />
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
    </Card>
  );
}
```
**Penjelasan:**
- Menampilkan ringkasan artikel dalam bentuk kartu.

---

### 12. Custom Hook useIsMobile (hooks/use-mobile.tsx)
```tsx
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return isMobile;
}
```
**Penjelasan:**
- Menentukan apakah tampilan saat ini mobile atau desktop.

---

### 13. Validasi Register (pages/Register.tsx)
```tsx
const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(3),
});
```
**Penjelasan:**
- Validasi data register user menggunakan Zod.

---

### 14. Form Register (pages/Register.tsx)
```tsx
<form onSubmit={form.handleSubmit(onSubmit)}>
  <input {...form.register("username")} />
  <input {...form.register("email")} />
  <input {...form.register("password")} type="password" />
  <input {...form.register("fullName")} />
  <Button type="submit">Daftar</Button>
</form>
```
**Penjelasan:**
- Form register user baru dengan validasi dan submit ke backend.

---

### 15. Fetch Kategori (pages/Home.tsx)
```tsx
const { data: categories } = useQuery({
  queryKey: ["/api/categories"],
  queryFn: async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) throw new Error("Failed to fetch categories");
    return response.json();
  },
});
```
**Penjelasan:**
- Mengambil daftar kategori dari backend untuk navigasi/filter.

---

### 16. Like Artikel (pages/ArticleDetail.tsx)
```tsx
const likeMutation = useMutation({
  mutationFn: () => apiRequest("POST", `/api/articles/${article!.id}/like`),
  onSuccess: async (response) => {
    const data = await response.json();
    setIsLiked(data.isLiked);
    toast({ description: data.message });
    queryClient.invalidateQueries({ queryKey: ["/api/articles", slug] });
  },
});
```
**Penjelasan:**
- Mengirim aksi like artikel ke backend dan update state di frontend.

---

### 17. Bookmark Artikel (pages/ArticleDetail.tsx)
```tsx
const bookmarkMutation = useMutation({
  mutationFn: () => apiRequest("POST", `/api/articles/${article!.id}/bookmark`),
  onSuccess: async (response) => {
    const data = await response.json();
    setIsBookmarked(data.isBookmarked);
    toast({ description: data.message });
    queryClient.invalidateQueries({ queryKey: ["/api/articles", slug] });
  },
});
```
**Penjelasan:**
- Mengirim aksi bookmark artikel ke backend dan update state di frontend.

---

### 18. Format Tanggal (pages/ArticleDetail.tsx)
```tsx
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};
```
**Penjelasan:**
- Mengubah format tanggal menjadi format lokal Indonesia.

---

### 19. Fetch Komentar (pages/ArticleDetail.tsx)
```tsx
const { data: comments = [], isLoading: commentsLoading } = useQuery({
  queryKey: ["/api/articles", article?.id, "comments"],
  queryFn: async () => {
    if (!article?.id || !commentsEnabled) return [];
    const response = await fetch(`/api/articles/${article.id}/comments`);
    if (!response.ok) throw new Error("Gagal memuat komentar");
    return response.json();
  },
  enabled: !!article?.id && commentsEnabled,
});
```
**Penjelasan:**
- Mengambil daftar komentar untuk artikel tertentu dari backend.

---

### 20. Moderasi Komentar Otomatis (server/routes.ts)
```ts
app.post("/api/articles/:articleId/comments", authenticateToken, async (req, res) => {
  const articleId = parseInt(req.params.articleId);
  const { content } = req.body;
  const comment = await storage.createComment({
    content,
    authorId: req.user!.id,
    articleId,
    isApproved: false, // Komentar perlu moderasi
  });
  res.status(201).json({ message: "Komentar berhasil dikirim dan menunggu moderasi" });
});
```
**Penjelasan:**
- Komentar baru disimpan dengan status menunggu moderasi admin/otomatis.

---

(Lanjutkan ke 30 potongan kode berikutnya jika ingin lebih banyak contoh, atau minta bagian spesifik yang ingin didetailkan!)
