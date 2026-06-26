# 📚 Perpustakaan ITK - PWA Sistem Booking & Peminjaman Buku

Aplikasi Progressive Web App (PWA) untuk sistem booking dan peminjaman buku Perpustakaan Institut Teknologi Kalimantan (ITK).

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| PWA | next-pwa + Service Worker |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | MySQL |
| Auth | JWT (jose) + Cookie |

---

## Fitur Utama

### Mahasiswa
- Login/Register dengan email kampus
- Dashboard dengan statistik peminjaman
- Katalog & pencarian buku dengan filter kategori
- Booking buku (maks. 3 booking aktif)
- Status booking real-time
- Peminjaman aktif dengan countdown batas kembali
- Perpanjangan peminjaman (maks. 2x, 7 hari)
- Riwayat peminjaman lengkap
- Notifikasi in-app
- Profil & ganti password

### Admin
- Dashboard statistik perpustakaan
- Manajemen buku & eksemplar (CRUD)
- Manajemen kategori buku
- Approval/reject booking mahasiswa
- Catat peminjaman dari booking yang disetujui
- Catat pengembalian buku + hitung denda otomatis
- Monitor buku terlambat
- Laporan peminjaman + export CSV
- Data mahasiswa

### PWA
- Dapat diinstall di smartphone
- Mobile-first responsive design
- Offline page
- Cache halaman statis
- Push notification ready
- App manifest + splash screen

---

## Cara Instalasi

### 1. Prasyarat
- Node.js >= 18
- MySQL >= 8.0
- Git

### 2. Clone & Install

```bash
# Install dependencies
npm install
```

### 3. Setup Database

```sql
-- Buat database di MySQL
CREATE DATABASE perpustakaan_itk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Konfigurasi Environment
```bash
# Salin file .env.example menjadi .env
cp .env.example .env
```

Edit file `.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/perpustakaan_itk"
JWT_SECRET="ganti-dengan-string-random-panjang"
```

### 5. Migrasi & Seed Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database (development)
npm run db:push

# Seed data awal (kategori, buku, akun demo)
npm run db:seed
```

### 6. Jalankan Aplikasi

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Buka browser: **http://localhost:3000**

---

## Akun Demo

| Role | Email | Password |
|---|---|---|
| Admin | admin@perpus.itk.ac.id | admin123 |
| Mahasiswa | 04231047@student.itk.ac.id | mahasiswa123 |

---

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/          # Halaman login & register
│   ├── (mahasiswa)/     # Halaman mahasiswa (dashboard, buku, dll)
│   ├── (admin)/         # Halaman admin
│   └── api/             # API Routes (REST)
├── components/
│   ├── ui/              # Komponen dasar (Button, Input, Card, dll)
│   └── shared/          # Komponen bersama (Navbar, BookCard, dll)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities (db, auth, utils)
└── types/               # TypeScript type definitions
prisma/
├── schema.prisma        # Skema database
└── seed.ts              # Data awal
public/
├── manifest.json        # PWA manifest
├── sw-custom.js         # Service Worker kustom
└── icons/               # Icon PWA
```

---

## Alur Sistem

```
Mahasiswa → Cari Buku → Booking (PENDING)
                              ↓
                    Admin → Setuju (APPROVED) / Tolak (REJECTED)
                              ↓
                    Mahasiswa ambil buku di perpus
                              ↓
                    Admin → Catat Peminjaman (ACTIVE)
                              ↓
                    [14 hari] Batas Pengembalian
                              ↓
                    Mahasiswa kembalikan buku
                              ↓
                    Admin → Catat Pengembalian (RETURNED)
                    Jika terlambat → Hitung Denda otomatis
```

## Status Buku & Booking

| Status | Keterangan |
|---|---|
| AVAILABLE | Eksemplar tersedia untuk dipesan |
| BOOKED | Sedang di-booking oleh mahasiswa |
| BORROWED | Sedang dipinjam |
| PENDING | Booking menunggu persetujuan admin |
| APPROVED | Booking disetujui, menunggu pengambilan |
| REJECTED | Booking ditolak admin |
| CANCELLED | Booking dibatalkan mahasiswa |
| COMPLETED | Proses booking selesai (sudah dipinjam) |
| ACTIVE | Peminjaman aktif |
| RETURNED | Buku sudah dikembalikan |
| OVERDUE | Melewati batas waktu pengembalian |

---

## API Endpoints

| Method | URL | Deskripsi |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Register mahasiswa |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Data user login |
| GET | /api/books | Daftar buku (+ filter & search) |
| POST | /api/books | Tambah buku (Admin) |
| GET | /api/books/:id | Detail buku |
| PUT | /api/books/:id | Edit buku (Admin) |
| DELETE | /api/books/:id | Hapus buku (Admin) |
| GET | /api/categories | Daftar kategori |
| POST | /api/categories | Tambah kategori (Admin) |
| GET | /api/bookings | Daftar booking |
| POST | /api/bookings | Buat booking (Mahasiswa) |
| POST | /api/bookings/:id/approve | Setujui booking (Admin) |
| POST | /api/bookings/:id/reject | Tolak booking (Admin) |
| POST | /api/bookings/:id/cancel | Batalkan booking |
| GET | /api/borrowings | Daftar peminjaman |
| POST | /api/borrowings | Catat peminjaman (Admin) |
| POST | /api/borrowings/:id/return | Catat pengembalian (Admin) |
| POST | /api/borrowings/:id/extend | Perpanjang pinjaman (Mahasiswa) |
| GET | /api/notifications | Notifikasi mahasiswa |
| PATCH | /api/notifications/:id | Tandai sudah dibaca |
| GET | /api/dashboard | Data dashboard |
| GET | /api/reports | Laporan (Admin) |

---

## Deployment

### Docker (Opsional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### VPS + Nginx

```nginx
server {
    listen 80;
    server_name perpus.itk.ac.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Pengembangan Lanjutan (Roadmap)

- [ ] Web Push Notification (VAPID)
- [ ] Export laporan ke Excel/PDF
- [ ] Scan barcode ISBN
- [ ] QR Code peminjaman
- [ ] Sistem denda online (payment gateway)
- [ ] Rekomendasi buku
- [ ] Multi-bahasa (id/en)
- [ ] Dark mode

---

Dibuat untuk **Perpustakaan Institut Teknologi Kalimantan** | 2024
