# Aplikasi Pencatatan Tandan Hasil Panen

Dokumen ini berisi rancangan awal (mini-PRD) untuk aplikasi pencatatan
hasil panen berbasis web menggunakan **ReactJS** sebagai frontend dan
**SQLite** sebagai database.

## 1. Gambaran Umum

Aplikasi digunakan untuk mencatat, memantau, dan merekap tandan hasil
panen secara terstruktur. Data dapat dicatat berdasarkan tanggal panen,
lokasi/blok, pemanen, jumlah tandan, berat, serta keterangan tambahan.

**Tujuan utama:** - Menggantikan pencatatan manual di buku atau
spreadsheet. - Mengurangi kesalahan pencatatan dan duplikasi data. -
Memudahkan pencarian riwayat panen. - Menyediakan rekap hasil panen
berdasarkan tanggal, lokasi, dan pemanen. - Menyediakan data yang dapat
diekspor untuk pelaporan.

## 2. Teknologi yang Digunakan

  Bagian       Teknologi                    Keterangan
  ------------ ---------------------------- -------------------------------------------------
  Frontend     ReactJS                      Antarmuka pengguna dan pengelolaan form
  Bahasa       JavaScript atau TypeScript   Logika aplikasi
  Backend      Node.js + Express            API untuk membaca dan mengubah data
  Database     SQLite                       Penyimpanan data lokal dalam satu file database
  Komunikasi   REST API                     Penghubung ReactJS dengan backend
  Styling      CSS / Tailwind CSS           Tampilan responsif
  Export       CSV / Excel (opsional)       Ekspor laporan

> **Catatan arsitektur:** ReactJS di browser tidak sebaiknya mengakses
> file SQLite secara langsung. Gunakan backend Node.js/Express sebagai
> perantara. React mengirim permintaan HTTP ke API, lalu backend
> menjalankan query ke SQLite.

## 3. Pengguna dan Hak Akses

Untuk versi awal, aplikasi dapat menggunakan dua peran:

  -----------------------------------------------------------------------
  Peran                               Hak akses
  ----------------------------------- -----------------------------------
  Admin                               Mengelola pengguna, data master,
                                      seluruh catatan panen, dan laporan

  Petugas                             Menambahkan catatan panen dan
                                      melihat catatan yang diizinkan
  -----------------------------------------------------------------------

Jika aplikasi hanya digunakan satu orang pada satu perangkat, fitur
login dan pembagian peran dapat ditunda ke versi berikutnya.

## 4. Fitur Utama

### 4.1 Dashboard

Menampilkan ringkasan: - Total tandan pada hari ini. - Total berat panen
hari ini (jika berat dicatat). - Total hasil panen pada periode
berjalan. - Jumlah transaksi pencatatan. - Ringkasan hasil panen per
lokasi atau blok.

### 4.2 Pencatatan Panen

Petugas dapat menambahkan catatan dengan data: - Tanggal panen. - Lokasi
atau blok kebun. - Nama pemanen. - Jumlah tandan. - Berat total dalam
kilogram (opsional). - Keterangan (opsional).

Validasi dasar: - Tanggal wajib diisi. - Lokasi/blok wajib dipilih atau
diisi. - Jumlah tandan harus berupa bilangan bulat lebih dari nol. -
Berat tidak boleh bernilai negatif. - Nama pemanen wajib diisi jika
pencatatan menggunakan data pemanen.

### 4.3 Data Master

Data master yang dapat dikelola admin: - Lokasi atau blok kebun. -
Daftar pemanen. - Pengguna aplikasi (jika fitur login diaktifkan).

### 4.4 Riwayat Panen

Menampilkan daftar catatan panen dengan kemampuan: - Melihat detail
catatan. - Mencari berdasarkan nama pemanen atau lokasi. - Memfilter
berdasarkan rentang tanggal. - Mengurutkan data terbaru atau terlama. -
Mengubah dan menghapus catatan sesuai hak akses.

### 4.5 Laporan

Laporan dapat dirangkum berdasarkan: - Harian. - Mingguan. - Bulanan. -
Rentang tanggal tertentu. - Lokasi/blok. - Pemanen.

Informasi laporan: - Jumlah transaksi. - Total tandan. - Total berat
(jika dicatat). - Rata-rata berat per tandan (jika jumlah dan berat
tersedia).

### 4.6 Ekspor Data

Fitur ekspor CSV dapat disediakan pada versi awal. Ekspor Excel atau PDF
dapat ditambahkan kemudian.

## 5. Alur Penggunaan

1.  Pengguna membuka aplikasi.
2.  Pengguna masuk ke dashboard.
3.  Petugas membuka menu **Pencatatan Panen**.
4.  Petugas mengisi tanggal, lokasi/blok, pemanen, jumlah tandan, dan
    data opsional.
5.  Sistem memvalidasi isian.
6.  Backend menyimpan data ke SQLite.
7.  Aplikasi menampilkan notifikasi bahwa data berhasil disimpan.
8.  Data muncul pada menu **Riwayat Panen** dan ikut dihitung dalam
    laporan.

## 6. Rancangan Database

Nama database: `panen.db`

### 6.1 Tabel `users`

Digunakan jika fitur autentikasi diaktifkan.

  Kolom           Tipe                   Keterangan
  --------------- ---------------------- -----------------------------
  id              INTEGER PRIMARY KEY    ID pengguna
  name            TEXT NOT NULL          Nama pengguna
  username        TEXT UNIQUE NOT NULL   Username
  password_hash   TEXT NOT NULL          Password yang sudah di-hash
  role            TEXT NOT NULL          `admin` atau `petugas`
  created_at      DATETIME               Waktu dibuat

### 6.2 Tabel `locations`

  Kolom         Tipe                  Keterangan
  ------------- --------------------- ---------------------
  id            INTEGER PRIMARY KEY   ID lokasi
  name          TEXT NOT NULL         Nama atau kode blok
  description   TEXT                  Keterangan lokasi
  created_at    DATETIME              Waktu dibuat

### 6.3 Tabel `harvesters`

  Kolom           Tipe                  Keterangan
  --------------- --------------------- --------------------------
  id              INTEGER PRIMARY KEY   ID pemanen
  name            TEXT NOT NULL         Nama pemanen
  employee_code   TEXT UNIQUE           Nomor pekerja (opsional)
  is_active       INTEGER DEFAULT 1     Status aktif
  created_at      DATETIME              Waktu dibuat

### 6.4 Tabel `harvest_records`

  Kolom             Tipe                  Keterangan
  ----------------- --------------------- ----------------------------------------
  id                INTEGER PRIMARY KEY   ID catatan
  harvest_date      DATE NOT NULL         Tanggal panen
  location_id       INTEGER NOT NULL      Relasi ke `locations.id`
  harvester_id      INTEGER               Relasi ke `harvesters.id`
  bunch_count       INTEGER NOT NULL      Jumlah tandan
  total_weight_kg   REAL                  Berat total dalam kilogram
  notes             TEXT                  Catatan tambahan
  created_by        INTEGER               Relasi ke `users.id`, jika login aktif
  created_at        DATETIME              Waktu pencatatan
  updated_at        DATETIME              Waktu perubahan

### 6.5 Relasi Antar Tabel

-   Satu lokasi dapat memiliki banyak catatan panen.
-   Satu pemanen dapat memiliki banyak catatan panen.
-   Satu pengguna dapat membuat banyak catatan panen.
-   Setiap catatan panen mengacu pada satu lokasi dan, jika tersedia,
    satu pemanen.

``` text
locations  1 ─────── * harvest_records
harvesters 1 ─────── * harvest_records
users      1 ─────── * harvest_records
```

### 6.6 Contoh SQL

``` sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    employee_code TEXT UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvest_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    harvest_date TEXT NOT NULL,
    location_id INTEGER NOT NULL,
    harvester_id INTEGER,
    bunch_count INTEGER NOT NULL CHECK (bunch_count > 0),
    total_weight_kg REAL CHECK (
        total_weight_kg IS NULL OR total_weight_kg >= 0
    ),
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (harvester_id) REFERENCES harvesters(id)
);

CREATE INDEX IF NOT EXISTS idx_harvest_date
ON harvest_records(harvest_date);

CREATE INDEX IF NOT EXISTS idx_harvest_location
ON harvest_records(location_id);

CREATE INDEX IF NOT EXISTS idx_harvest_harvester
ON harvest_records(harvester_id);
```

Jika tabel `users` dan autentikasi digunakan, tambahkan tabel tersebut
dan kolom `created_by` dengan foreign key ke `users.id`.

## 7. Rancangan Struktur Folder

Contoh struktur proyek dengan frontend dan backend terpisah:

``` text
panen-app/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       │   ├── Dashboard.jsx
│       │   ├── HarvestForm.jsx
│       │   ├── HarvestHistory.jsx
│       │   ├── Locations.jsx
│       │   ├── Harvesters.jsx
│       │   └── Reports.jsx
│       ├── services/
│       │   └── api.js
│       ├── hooks/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── app.js
│   ├── database/
│   │   └── panen.db
│   └── package.json
│
└── README.md
```

## 8. Rancangan REST API

Prefix API: `/api`

  Method   Endpoint                 Fungsi
  -------- ------------------------ --------------------------------
  GET      `/harvest-records`       Mengambil daftar catatan panen
  GET      `/harvest-records/:id`   Mengambil detail catatan
  POST     `/harvest-records`       Menambahkan catatan
  PUT      `/harvest-records/:id`   Mengubah catatan
  DELETE   `/harvest-records/:id`   Menghapus catatan
  GET      `/locations`             Mengambil daftar lokasi
  POST     `/locations`             Menambahkan lokasi
  PUT      `/locations/:id`         Mengubah lokasi
  DELETE   `/locations/:id`         Menghapus lokasi
  GET      `/harvesters`            Mengambil daftar pemanen
  POST     `/harvesters`            Menambahkan pemanen
  PUT      `/harvesters/:id`        Mengubah pemanen
  DELETE   `/harvesters/:id`        Menghapus pemanen
  GET      `/reports/summary`       Mengambil ringkasan laporan

Contoh request untuk menambahkan catatan:

``` json
{
  "harvest_date": "2026-11-14",
  "location_id": 1,
  "harvester_id": 2,
  "bunch_count": 85,
  "total_weight_kg": 1275.5,
  "notes": "Panen pagi"
}
```

Contoh filter daftar catatan:

``` text
GET /api/harvest-records?startDate=2026-11-01&endDate=2026-11-14&locationId=1
```

## 9. Rancangan Halaman

1.  **Dashboard** --- kartu ringkasan, grafik hasil panen, dan catatan
    terbaru.
2.  **Input Panen** --- form untuk memasukkan catatan baru.
3.  **Riwayat Panen** --- tabel catatan, pencarian, filter, edit, dan
    hapus.
4.  **Data Lokasi** --- pengelolaan blok atau lokasi kebun.
5.  **Data Pemanen** --- pengelolaan daftar pemanen.
6.  **Laporan** --- rekap berdasarkan periode, lokasi, dan pemanen.
7.  **Pengaturan/Pengguna** --- opsional, untuk admin dan autentikasi.

## 10. Ketentuan Teknis dan Keamanan

-   Gunakan query parameter (`?`) atau prepared statements untuk
    mencegah SQL injection.
-   Validasi data di frontend dan backend.
-   Simpan password sebagai hash yang kuat, bukan teks biasa.
-   Aktifkan foreign key SQLite pada setiap koneksi database.
-   Batasi akses endpoint berdasarkan peran jika autentikasi digunakan.
-   Lakukan backup file `panen.db` secara berkala.
-   Gunakan transaksi database untuk operasi yang melibatkan beberapa
    perubahan.
-   Simpan tanggal dalam format konsisten `YYYY-MM-DD`.
-   Jika aplikasi diakses beberapa perangkat, jalankan backend pada satu
    server yang dapat dijangkau perangkat lain. Jangan menyalin file
    SQLite yang sama ke banyak perangkat untuk dipakai bersamaan.

## 11. Tahapan Pengerjaan

### Tahap 1 --- Fondasi

-   Membuat proyek ReactJS.
-   Membuat backend Node.js dan Express.
-   Menghubungkan backend dengan SQLite.
-   Membuat tabel dan relasi database.
-   Menyiapkan konfigurasi environment.

### Tahap 2 --- CRUD Data Master

-   CRUD lokasi/blok.
-   CRUD pemanen.
-   Validasi input.

### Tahap 3 --- Pencatatan Panen

-   Form input panen.
-   Simpan data melalui REST API.
-   Tampilkan riwayat panen.
-   Edit dan hapus catatan.

### Tahap 4 --- Dashboard dan Laporan

-   Ringkasan total tandan.
-   Filter periode, lokasi, dan pemanen.
-   Rekap jumlah tandan dan berat.
-   Ekspor CSV.

### Tahap 5 --- Pengujian dan Rilis

-   Uji validasi form dan API.
-   Uji relasi dan konsistensi data.
-   Uji backup dan pemulihan database.
-   Build frontend dan jalankan backend pada perangkat/server tujuan.

## 12. Kriteria Selesai Versi MVP

Versi pertama dianggap siap digunakan jika: - Pengguna dapat menambah,
melihat, mengubah, dan menghapus catatan panen. - Setiap catatan
tersimpan di SQLite. - Data dapat difilter berdasarkan tanggal dan
lokasi. - Total tandan dapat dihitung dengan benar. - Data master lokasi
dan pemanen dapat dikelola. - Laporan periode dapat ditampilkan dan
diekspor ke CSV. - Aplikasi tetap dapat dijalankan setelah server
dimulai ulang dan data tidak hilang.

## 13. Pengembangan Berikutnya

Fitur berikut dapat dipertimbangkan setelah MVP: - Login dan hak akses
lebih lengkap. - Pencatatan per afdeling, blok, mandor, atau kelompok
panen. - Target panen dan perbandingan realisasi. - Pencatatan kualitas
atau kategori tandan. - Cetak laporan PDF. - Sinkronisasi data jika
pencatatan dilakukan secara offline. - Audit log untuk mengetahui siapa
yang mengubah data.

## 14. Hal yang Perlu Dipastikan Sebelum Implementasi

Rancangan ini menggunakan asumsi bahwa satu catatan mewakili hasil panen
seorang pemanen pada satu lokasi dan satu tanggal. Sebelum pengembangan,
pastikan: - Apakah komoditasnya kelapa sawit/TBS atau jenis panen
lain? - Apakah pencatatan hanya jumlah tandan, atau jumlah tandan
sekaligus berat? - Apakah data dicatat per pemanen, per kendaraan, per
blok, atau per kelompok? - Apakah aplikasi digunakan satu perangkat atau
beberapa perangkat melalui jaringan? - Apakah aplikasi perlu login dan
membedakan admin dengan petugas?

Jawaban atas pertanyaan tersebut dapat mengubah detail form, relasi
database, dan kebutuhan sinkronisasi.
