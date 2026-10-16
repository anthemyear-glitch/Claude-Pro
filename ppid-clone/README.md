# Portal PPID — Klon Cadangan `CloneForBackup`

Klon **fungsional** (FrontEnd + BackEnd penuh) dari portal layanan keterbukaan informasi publik
PPID Pemerintah Kota Surakarta (`surakarta.go.id/menu/ppid_2746` → `ppid.surakarta.go.id`).

Struktur, alur layanan, dan fitur dibuat mengikuti portal aslinya. **Isi konten tidak disalin**:
seluruh teks ditulis ulang sebagai konten contoh, gambar/logo dibuat sebagai SVG generatif oleh
`src/buat-aset.js`, dan berkas unduhan digantikan berkas yang dihasilkan sistem. Dengan begitu
klon ini aman dipakai sebagai cadangan tampilan/fungsi tanpa mendistribusikan ulang materi
milik badan publik pemiliknya.

Ciri khas klon sesuai permintaan:

| Permintaan | Implementasi |
|---|---|
| Tema warna **Negative** | Palet gelap hasil inversi skema terang asli (`public/css/tema.css`, `data-tema="negative"`). Tersedia pembanding *Positive* lewat tombol di topbar. |
| Watermark diagonal besar **CloneForBackup** | Lapisan watermark berulang (SVG) + satu watermark raksasa miring −28° di tengah layar, `pointer-events:none` sehingga tidak mengganggu klik. Aktif di situs publik **dan** panel admin. |
| Tulisan **CloneForBackup** di akhir alamat | Bilah alamat di puncak setiap halaman menampilkan `https://ppid.surakarta.go.id/CloneForBackup` + jalur aktif, badge merek, dan alamat klon di kaki situs. Rute `/CloneForBackup/*` juga diterima server (dialihkan ke rute sebenarnya). |

---

## Menjalankan

```bash
cd ppid-clone
npm install        # express, ejs, multer
npm start          # http://0.0.0.0:3000
```

Data awal otomatis dibuat saat pertama kali dijalankan. Untuk mengisi ulang data contoh:

```bash
npm run seed       # node src/seed.js --force
```

Prasyarat: **Node.js ≥ 22.5** (memakai `node:sqlite` bawaan — tidak ada dependensi native).

### Akun panel pengelola

| Peran | Pengguna | Kata sandi |
|---|---|---|
| Administrator | `admin` | `admin123` |
| Petugas layanan | `petugas` | `petugas123` |

Panel: `http://localhost:3000/admin`

---

## Fitur

### Situs publik (FrontEnd)

- **Beranda** — slider otomatis, pencarian besar, kartu 4 kategori informasi publik + Daftar
  Informasi Publik, kartu layanan, ringkasan "Mengenai PPID", statistik mini, tabel DIP terbaru,
  galeri video, infografis, berita terkini, dan ajakan layanan.
- **Daftar Informasi Publik** — tabel dengan penyaringan kata kunci, kategori, perangkat daerah,
  tahun, jumlah baris per halaman, paginasi, modal detail (metadata lengkap), dan unduh berkas.
- **4 kategori DIP** — Informasi Berkala, Setiap Saat, Serta Merta, dan Dikecualikan
  (kategori dikecualikan tidak dapat diunduh, sesuai uji konsekuensi).
- **Halaman detail informasi** — metadata, penyedia informasi, kontak perangkat daerah, entri terkait.
- **Layanan permohonan informasi publik** — formulir lengkap (identitas, kategori pemohon,
  rincian informasi, tujuan, cara perolehan, unggah identitas), validasi sisi klien & server,
  penerbitan **nomor tiket** (`PPID-2026-00001`).
- **Lacak permohonan** — status, catatan petugas, jawaban, tautan unduh berkas jawaban
  (terkunci dengan surel pemohon), dan *timeline* riwayat proses.
- **Pengajuan keberatan** — merujuk nomor permohonan, 6 pilihan alasan, nomor tiket `KBR-…`.
- **Mekanisme pelayanan**, **prosedur keberatan**, **upaya bila keberatan tidak ditanggapi**,
  **tentang PPID**, **maklumat pelayanan**, **struktur organisasi**, **dasar hukum**.
- **PPID Pelaksana** — daftar perangkat daerah/kecamatan + pencarian + jumlah entri DIP.
- **Publikasi** — berita & pengumuman (kategori, pencarian, paginasi, detail), regulasi (unduh),
  galeri video, galeri infografis + halaman detail, FAQ dengan penyaringan langsung.
- **Statistik layanan** — grafik kanvas tanpa pustaka eksternal: permohonan per bulan, distribusi
  status, kategori informasi, jenis pemohon, DIP per kategori, perangkat daerah teraktif,
  kunjungan 30 hari, indeks kepuasan.
- **Survei kepuasan** — penilaian bintang 1–5 (mutu, kecepatan, kemudahan) + ringkasan.
- **Kontak** — formulir pesan/pengaduan + kanal resmi.
- **Pencarian global** (`/cari`) — menelusuri DIP, berita, halaman layanan, regulasi, perangkat
  daerah, video, infografis, dan FAQ sekaligus; plus **autocomplete** di bilah navigasi.
- Jam & tanggal WIB langsung, responsif (desktop/tablet/mobile), siap cetak, dan navigasi papan ketik.

### Panel pengelola (BackEnd)

- Autentikasi sesi (cookie HttpOnly), kata sandi di-*hash* dengan `scrypt`, token CSRF di semua
  aksi tulis, pembagian peran **admin / petugas** (halaman sensitif khusus admin → 403).
- **Dasbor** — kartu ringkasan, grafik permohonan bulanan, distribusi status, kunjungan, permohonan
  terbaru, log aktivitas.
- **Permohonan informasi** — penyaringan, pencarian, detail lengkap, ubah status (6 status),
  catatan petugas, jawaban tertulis, unggah berkas jawaban, tautkan ke entri DIP, tetapkan petugas,
  pengingat batas waktu 10 hari kerja, riwayat otomatis, **ekspor CSV**.
- **Keberatan** — telaah dan tanggapan tertulis, 5 status, rujukan ke permohonan.
- **Konten** — CRUD untuk DIP (+unggah berkas), kategori DIP, perangkat daerah, berita (+sampul,
  sanitasi HTML), regulasi, video, infografis, slider, halaman statis, FAQ, survei, pesan kontak.
- **Sistem** — pengelolaan pengguna, pengaturan situs (identitas, kanal kontak, teks watermark,
  tema bawaan, alamat klon), log aktivitas, pencatatan jumlah unduhan/dilihat, statistik kunjungan.

### API JSON (`/api`)

`GET /api/status` · `GET /api/statistik` · `GET /api/dip` · `GET /api/dip/:id` ·
`GET /api/cari-cepat` · `GET /api/berita` · `POST /api/permohonan` (multipart) ·
`GET /api/permohonan/:tiket` · `POST /api/keberatan` · `GET /api/keberatan/:tiket` ·
`POST /api/survei` · `GET /api/survei/ringkasan` · `POST /api/kontak` ·
`GET /api/unduh/{dip|regulasi|infografis|jawaban}/…` · `POST /api/tema`

---

## Struktur

```
ppid-clone/
├── server.js               # bootstrap Express, basis path /CloneForBackup, penanganan galat
├── src/
│   ├── db.js               # skema + pembantu query (node:sqlite)
│   ├── seed.js             # data contoh (ditulis ulang, bukan salinan situs asli)
│   ├── auth.js             # hash kata sandi, sesi, CSRF, peran, log audit
│   ├── util.js             # tanggal Indonesia, slug, paginasi, CSV, nomor tiket
│   ├── buat-aset.js        # pembuat SVG generatif (favicon, sampul, infografis, ikon)
│   └── routes/{public,api,admin}.js
├── views/
│   ├── partials/           # head, topbar (bilah alamat), header, footer, ikon, paginasi, admin-*
│   ├── pages/              # 20 halaman publik
│   └── admin/              # 15 halaman panel pengelola
├── public/
│   ├── css/{tema,gaya,admin}.css
│   ├── js/{app,grafik}.js
│   └── img/                # aset SVG generatif
├── data/                   # basis data SQLite (diabaikan git)
└── uploads/                # berkas unggahan (diabaikan git)
```

## Konfigurasi

| Variabel | Bawaan | Keterangan |
|---|---|---|
| `PORT` | `3000` | Port server |
| `HOST` | `0.0.0.0` | Alamat bind (wajib `0.0.0.0` untuk pratinjau) |
| `PPID_DB` | `data/ppid-clone.db` | Lokasi berkas basis data |

Sebagian besar tampilan (nama situs, telepon, surel, jam layanan, tautan media sosial,
**teks watermark**, **alamat klon berakhiran CloneForBackup**, tema bawaan) dapat diubah dari
**Panel → Pengaturan Situs**.
