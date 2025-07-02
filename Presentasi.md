# Diagram Alur Sistem IndonesiaNews

```mermaid
flowchart TD
    A[User membuka aplikasi]
    B{Frontend (React)}
    C1[Home: Slider & Berita Populer]
    C2[Login/Register]
    C3[Halaman Kategori]
    C4[Detail Artikel]
    C5[Bookmarks]
    C6[Settings]
    C7[Admin Panel]
    D1[Manajemen Artikel]
    D2[Moderasi Komentar]
    D3[Statistik Dashboard]
    E[API Request ke Backend]
    F{Backend (Express.js)}
    G1[Autentikasi & Middleware]
    G2[Route Artikel]
    G3[Route Kategori]
    G4[Route Komentar]
    G5[Route Settings]
    G6[Route Upload]
    H1[Database (Drizzle ORM)]
    H2[Storage/Uploads]

    A --> B
    B --> C1
    B --> C2
    B --> C3
    B --> C4
    B --> C5
    B --> C6
    B --> C7
    C7 --> D1
    C7 --> D2
    C7 --> D3
    B -- "Aksi user" --> E
    E --> F
    F --> G1
    F --> G2
    F --> G3
    F --> G4
    F --> G5
    F --> G6
    G2 --> H1
    G3 --> H1
    G4 --> H1
    G5 --> H1
    G6 --> H2
    H1 -- "Data" --> B
    H2 -- "File URL" --> B
```

> Diagram ini menggambarkan alur kerja aplikasi IndonesiaNews secara menyeluruh, mulai dari interaksi user di frontend, request ke backend, proses autentikasi, routing API, hingga penyimpanan data di database dan file upload.
