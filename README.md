# Panen TBS — Aplikasi Pencatatan Tandan Hasil Panen

Aplikasi web untuk mencatat, memantau, dan merekap tandan hasil panen kelapa sawit.

Stack: **ReactJS (Vite) + Node.js/Express + SQLite**

---

## Struktur Folder

```text
tandan/
├── app_palm.md          # Dokumen rancangan (mini-PRD)
├── client/              # Frontend ReactJS
│   └── src/
│       ├── components/  # Layout, Modal, Toast
│       ├── pages/       # Dashboard, HarvestForm, HarvestHistory, Locations, Harvesters, Reports
│       ├── services/    # api.js
│       ├── hooks/       # useData.js
│       └── utils/       # format.js
└── server/              # Backend Express + SQLite
    ├── database/        # panen.db (dibuat otomatis)
    └── src/
        ├── config/      # database.js
        ├── middleware/  # error.js
        ├── routes/      # locations, harvesters, harvestRecords, reports
        ├── scripts/     # seed.js
        └── app.js
```

---

## Menjalankan

### 1. Backend

```bash
cd server
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run seed              # opsional: isi data contoh
npm run dev               # http://localhost:3001
```

### 2. Frontend

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Vite sudah dikonfigurasi proxy `/api` ke `http://localhost:3001`, jadi frontend tidak perlu setting URL backend.

---

## Endpoint API

Prefix: `/api`

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET | `/health` | Cek status server |
| GET | `/locations` | Daftar lokasi |
| POST | `/locations` | Tambah lokasi |
| PUT | `/locations/:id` | Ubah lokasi |
| DELETE | `/locations/:id` | Hapus lokasi |
| GET | `/harvesters` | Daftar pemanen (`?active=1` filter aktif) |
| POST | `/harvesters` | Tambah pemanen |
| PUT | `/harvesters/:id` | Ubah pemanen |
| DELETE | `/harvesters/:id` | Hapus pemanen |
| GET | `/harvest-records` | Daftar catatan panen (filter + paginasi) |
| GET | `/harvest-records/:id` | Detail catatan |
| POST | `/harvest-records` | Tambah catatan |
| PUT | `/harvest-records/:id` | Ubah catatan |
| DELETE | `/harvest-records/:id` | Hapus catatan |
| GET | `/reports/summary` | Ringkasan laporan |
| GET | `/reports/export` | Unduh CSV |

### Filter catatan panen

```text
GET /api/harvest-records?startDate=2026-11-01&endDate=2026-11-14&locationId=1&harvesterId=2&page=1&limit=25&sort=desc
```

### Filter laporan

```text
GET /api/reports/summary?startDate=2026-11-01&endDate=2026-11-14&period=daily|weekly|monthly
```

Response: `summary`, `byPeriod`, `byLocation`, `byHarvester`.

### Contoh POST catatan panen

```json
{
  "harvest_date": "2026-11-14",
  "location_id": 1,
  "harvester_id": 2,
  "bunch_count": 85,
  "total_weight_kg": 1275.5,
  "notes": "Panen pagi"
}
```

---

## Skema Database

File: `server/database/panen.db`

- **locations** — `id`, `name` (unik), `description`, `created_at`
- **harvesters** — `id`, `name`, `employee_code` (unik), `is_active`, `created_at`
- **harvest_records** — `id`, `harvest_date`, `location_id` FK, `harvester_id` FK, `bunch_count` (>0), `total_weight_kg` (>=0 atau null), `notes`, `created_at`, `updated_at`

Foreign key SQLite diaktifkan pada setiap koneksi (`PRAGMA foreign_keys = ON`).

---

## Keamanan & Ketentuan Teknis

- Semua query pakai **prepared statements** (better-sqlite3) — aman dari SQL injection.
- Validasi dilakukan di backend (format tanggal, bilangan bulat positif, berat tidak negatif).
- Hapus lokasi/pemanen ditolak (409) jika masih dipakai catatan panen — jaga integritas data.
- Tanggal disimpan konsisten `YYYY-MM-DD`.
- WAL mode aktif untuk keandalan penulisan.

## Backup

```bash
# saat server berhenti
copy server\database\panen.db backup\panen-2026-11-14.db
```

Cadangkan berkala file `panen.db`.

---

## Menambah Fitur Login (versi berikutnya)

Belum diimplementasi. Untuk menambah:

1. Buat tabel `users` (`id`, `name`, `username` unik, `password_hash`, `role`, `created_at`).
2. Tambah kolom `created_by` di `harvest_records` dengan FK ke `users.id`.
3. Tambah middleware autentikasi (JWT atau session) + bcrypt untuk hash password.
4. Batasi endpoint berdasarkan `role` (`admin` / `petugas`).

