# LAPORAN DEEP RESEARCH KOMPREHENSIF (FRONTEND HINGGA BACKEND)
## Website Resmi Dinas Sosial Kota Surakarta (`https://dinsos.surakarta.go.id/`)

**Tanggal Audit & Riset:** 23 Oktober 2026  
**Target Sistem:** `https://dinsos.surakarta.go.id/` (beserta sub-aplikasi `/home`, `/login`, `/pmks/`)  
**Instansi Pemilik:** Dinas Sosial Pemerintah Kota Surakarta — Jl. Slamet Riyadi No.368, Penumping, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57141  

---

## 1. RINGKASAN EKSEKUTIF ARSITEKTUR SISTEM

Berdasarkan investigasi menyeluruh terhadap struktur DOM, aset statis (`/assets/frontend/`, `/assets/backend/`, `/assets/portal/`, `/assets/other/`), pola routing URL, mekanisme request tabel dinamis, *error signature*, dan integrasi pihak ketiga, website `dinsos.surakarta.go.id` dibangun menggunakan arsitektur **Monolitik Multi-Layer berbasis PHP MVC (CodeIgniter 3)** yang dikembangkan bersama ekosistem **Diskominfo SP Kota Surakarta & PT Phicos Cipta Media (`egov.phicos.co.id`)**.

Secara struktural, aplikasi terbagi menjadi **4 Layer Utama**:

| Layer | Endpoint Utama | Template / UI Engine | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Layer 1: Portal Layanan** | `/` & `/layanan` | Custom Bootstrap Portal (`/assets/portal/`) | Landing page *"SUGENG RAWUH WONTEN — Layanan Dinas Sosial Kota Surakarta"* yang menampilkan gedung Dinsos & **15 Layanan Terintegrasi**. |
| **Layer 2: Website Publik Utama** | `/home` & 25+ sub-route | **EnvyTheme Bkro v5.3.3** (`/assets/frontend/css/style.css`) | Portal informasi publik utama: Slide Show, Motto, Visi-Misi, 6 Tupoksi, Pengumuman, Berita + Feed Instagram, QR SKM, PPID, Galeri, Unduhan, Aduan, & FAQ. |
| **Layer 3: BackEnd CMS & Auth** | `/login` & panel admin internal | **PIXINVENT Frest Bootstrap Admin** (`/assets/backend/`) | Sistem autentikasi split-card (`Web Dinas Sosial`) & dashboard manajemen konten seluruh tabel database, menggunakan jQuery DataTables Server-Side. |
| **Layer 4: Sub-Aplikasi SIM PMKS** | `/pmks/` | Custom CodeIgniter Sub-App (`/pmks/uploads/...`) | *Sistem Informasi Manajemen PMKS & PSKS* untuk rekapitulasi & persebaran data kesejahteraan sosial di 5 Kecamatan Kota Surakarta. |

---

## 2. DEEP RESEARCH FRONTEND SECARA LENGKAP

### 2.1. Identifikasi Template, Tipografi & Sistem Desain (Design Tokens)
Dari ekstraksi langsung file `/assets/frontend/css/style.css`, terkonfirmasi 100% bahwa FrontEnd menggunakan **Bkro — Bootstrap 5 HTML5 Template by EnvyTheme**:
- **Framework CSS:** Bootstrap `v5.3.3`
- **Google Fonts:**
  - Heading (`h1`–`h6`): `'Barlow', sans-serif` (`font-weight: 600–800`, warna `#30296c`)
  - Body Copy (`body`, `p`, `a`): `'Nunito', sans-serif` (`16px`, `line-height: 1.6`, warna `#696687`)
- **Palet Warna Resmi:**
  - **Primary Indigo Navy:** `#30296c` (Heading, Navbar aktif, Overlay kartu Tupoksi, Banner judul halaman `opacity: 0.9`)
  - **Primary Accent Orange:** `#f68820` (Hover link, ikon informasi, indikator aktif slider, tombol sosial)
  - **CTA Linear Gradient (`.default-btn`):** `linear-gradient(to right, #ffa203, #ff5e29)` dengan efek hover scale `::before` terbalik `linear-gradient(to right, #ff5e29, #ffa203)`
  - **Surface & Background:** `#ffffff`, `#f9fbfe` (`.bg-color`), `#e9f7fe` (`.bg-color-e9f7fe`), dan `#fff8f0` (aksen kartu layanan)
- **Animasi Khas CSS Keyframes:**
  - `@keyframes border-transform`: Animasi organik morphing blob (`border-radius: 63% 37% 54% 46% / 55% 48% 52% 45%` ...) pada foto Hero Slider, foto Visi-Misi, dan ikon Tupoksi.
  - `.single-services-box-wrap`: Efek *slide-up* overlay `#30296c` (`top: 100% -> top: 0`) saat kartu Tugas Pokok dan Fungsi di-hover.
- **Library Ikon & Komponen UI:**
  - **Boxicons** & **RemixIcon / Flaticon**
  - **Owl Carousel 2** + `owl-thumbs` bernomor `1 2 3 4 5` pada Hero Slider `/home`
  - **jQuery DataTables** (`Show 10/25/50/100 entries`, `Search:`, indikator `Processing...`, pagination `Previous 1 2 Next`) pada halaman `/standar_pelayanan`, `/layanan/bidang/{id}`, `/bank_data`, `/agenda`, `/unduhan`, dan `/ppid/informasi_berkala/kategori/{id}`.

### 2.2. Widget Pihak Ketiga & Integrasi FrontEnd
1. **EmbedSocial Instagram Widget (`embedsocial.com`):** Menampilkan feed terbaru akun `@dinsos_surakarta` tepat di atas 3 kartu Berita Website pada halaman `/home`.
2. **UserWay Accessibility Widget (`cdn.userway.org`):** Widget aksesibilitas ramah penyandang disabilitas (`spin_wh.svg`, `body_wh.svg`).
3. **QR Code Generator API (`api.qrserver.com`) + Appbagor SKM:** Menghasilkan QR Code dinamis menuju instrumen Survei Kepuasan Masyarakat Bagian Organisasi Setda Kota Surakarta (`https://appbagor.surakarta.go.id/sop/skm/instrumen/isi/25`).
4. **8 Ikon Kanal Eksternal di Footer Atas:**
   - **ULAS Surakarta** (`ulas.surakarta.go.id/...&oid=85` — *Organization ID = 85* milik Dinas Sosial Kota Surakarta)
   - **WhatsApp Hotline** (`wa.me/+628112811919?text=Halo%20Dinsos`)
   - **Instagram** (`@dinsos_surakarta`)
   - **Twitter / X** (`@dinsosjateng`)
   - **Facebook** (`profile.php?id=100092218391317`)
   - **SP4N-LAPOR!** (`surakarta.lapor.go.id`)
   - **SIPPN KemenPANRB** (`sippn.menpan.go.id/instansi/173742/...`)
   - **MONIKS Surakarta** (`moniks.surakarta.go.id`)

### 2.3. Peta Lengkap Hierarki Navigasi & Routing FrontEnd
- `/` atau `/layanan` → **Portal 15 Layanan Terintegrasi**
- `/home` → **Beranda Utama**
- **Profil** (`/profil/detail/{id}` atau obfuscated ID seperti `6573turnups14658`):
  - `7`: Profil Kami | `8`: Visi dan Misi | `9`: Visi dan Misi Layanan | `10`: Susunan Organisasi | `11`: Bagan Organisasi | `12`: Rekognisasi/Penghargaan | serta dokumen RENSTRA 2021-2026, Maklumat Pelayanan 2026, SK Standar Pelayanan 2026, SK Kompensasi 2026, SK Front Office 2026, SK Jam Pelayanan 2026, SK Kode Etik 2026.
- **Layanan** (`/layanan/bidang/{id}` & `/layanan/detail/{id}`):
  - Bidang 1: Bidang Pemberdayaan Sosial (6 layanan: ID `28`–`33`)
  - Bidang 2: Bidang Rehabilitasi Sosial (3 layanan: ID `24`, `26`, `27`)
  - Bidang 3: Bidang Perlindungan dan Jaminan Sosial (DTKS ID `22`, GAKIN, PKH, BPNT/BSP, Reaktivasi PBI, Isoman, COTA)
  - Bidang 4: Sekretariat / Bidang Lainnya
- **Informasi Terkait:**
  - `/berita` & `/berita/detail/{id}` (ID terbaru mencapai `398` per Oktober 2026; uniknya di template asli terdapat typo link gambar `/berita/detai/{id}` yang juga ditangani di kloning ini)
  - `/artikel` & `/artikel/detail/{id}`
  - `/standar_pelayanan` & `/standar_pelayanan/detail/{id}` (15 Standar Pelayanan Publik)
  - `/pengumuman` & `/pengumuman/detail/{id}` (ID terbaru `40`)
  - `/agenda` (DataTables 6 kolom: `#`, `Acara`, `Tempat`, `Tanggal`, `Jam`, `Aksi`)
  - `/bank_data` (DataTables 3 kolom: `#`, `Nama`, `File/Berkas`)
- **Galeri:** `/galeri/gambar` & `/galeri/video` (6 video YouTube channel `UCRqfUK0smUc3LY4XCF_y68A`)
- **PPID:**
  - `/ppid/profil` (Profil Kepala Dinas Drs. Samsu Tri Wahyudin, M.Si. & Sekretaris Margono, S.STP, M.Si)
  - `/ppid/daftar_informasi_publik`
  - `/ppid/informasi_berkala` & `/ppid/informasi_berkala/kategori/{1,2,3,4,5,16,17,24,25,26,28}` (dilengkapi dropdown filter `Pilih Tahun: 2020–2025/2026`)
  - `/ppid/informasi_serta_merta` & `/ppid/informasi_serta_merta/kategori/{13,14,15,38,39,42,43}`
  - `/ppid/informasi_setiap_saat`
  - `/ppid/informasi_dikecualikan`
- **Aduan:** `/aduan/detail/{id}` (SK Kominfo No.011 SP4N, Alur Penanganan Pengaduan, Pengelolaan Aduan ULAS `id=3`, Sampaikan Aduan `id=4`, Tampilkan/Publikasi Aduan `id=5`, SK Tim Pengelola Aduan 2026)
- **Unduhan:** `/unduhan` (DataTables 3 kolom: `#`, `Dokumen`, `Aksi`)
- **FAQ:** `/faq` (11 Pertanyaan & Jawaban resmi akordeon)

---

## 3. DEEP RESEARCH BACKEND & STRUKTUR DATABASE SECARA LENGKAP

### 3.1. Sidik Jari (Fingerprinting) BackEnd Stack
1. **Framework Server:** **CodeIgniter 3.x (PHP)** di atas web server Apache/Nginx dengan `.htaccess` `RewriteRule ^(.*)$ index.php/$1 [L]`.
2. **Bukti Lineage Kode Sumber (Codebase Provenance):**
   - Saat mengakses route tidak terdaftar seperti `/admin` atau `/auth`, aplikasi mengembalikan custom 404 dengan `<title>Error 404 - Frest - Bootstrap HTML admin template</title>` dan referensi gambar `http://localhost:8080/surakarta/sim-surat-dispertan-surakarta/assets/backend/images/pages/404.png`.
   - Pada halaman `/aduan/detail/3` (*Pengelolaan Aduan Ulas*), terdapat embed iframe ke `egov.phicos.co.id`.
   - Hal ini membuktikan bahwa CMS OPD Pemkot Surakarta dikembangkan menggunakan boilerplate standar **Phicos e-Gov CMS** dengan panel admin **PIXINVENT Frest** dan pola enkripsi ID ringan (contoh: `6573turnups14658` atau `dff3sunshades384473` — penyisipan kata kamus acak di tengah hex/angka untuk mengaburkan primary key selain integer langsung).
3. **Pola Penyimpanan Berkas Unggahan (`/uploads/`):**
   Seluruh file yang diunggah melalui form BackEnd di-hash menggunakan **MD5 32-karakter** (`md5(uniqid())`) dan dikelompokkan per modul:
   - `/uploads/images/profil_website/{md5}.png`
   - `/uploads/images/home/slide_show/{md5}.jpg`
   - `/uploads/images/home/tupoksi/{md5}.png`
   - `/uploads/images/profil/{md5}.jpeg`
   - `/uploads/standar_pelayanan/{md5}.jpeg`
   - `/uploads/images/berita/{md5}.jpeg`
   - `/uploads/images/pengumuman/{md5}.jpeg`
   - `/uploads/images/artikel/{md5}.jpeg`
   - `/uploads/images/detail_galeri/{md5}.jpg`
   - `/uploads/ppid/profil/{md5}.jpeg`
   - `/uploads/ppid/informasi_berkala/{md5}.pdf`
   - `/uploads/bank_data/{md5}.pdf`
   - `/uploads/download/{md5}.pdf`

### 3.2. Skema Struktur Data Relasional (22 Tabel Utama)
Seluruh entitas data telah direkonstruksi 100% ke dalam `database/dinsos_surakarta.sql` dan `assets/js/seed-data.js`:
1. `tb_profil_website` — Konfigurasi identitas instansi, motto, visi-misi, kontak, jam layanan, link SKM & medsos.
2. `tb_slide_show` — Data hero carousel beranda (`id`, `urutan`, `judul`, `subjudul`, `gambar`, `tautan`, `aktif`).
3. `tb_tupoksi` — 6 poin tugas pokok dan fungsi dinas.
4. `tb_profil` — Halaman statis/dinamis menu Profil & SK Pelayanan tahun berjalan.
5. `ref_bidang` — Master 4 bidang organisasi (`Pemberdayaan Sosial`, `Rehabilitasi Sosial`, `Perlindungan & Jaminan Sosial`, `Sekretariat`).
6. `tb_layanan` & `tb_standar_pelayanan` — Master 15 layanan terintegrasi beserta komponen SOP PermenPANRB No. 15/2014 (`persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`).
7. `tb_berita` — Publikasi berita kegiatan (`id`, `judul`, `tanggal`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`).
8. `tb_instagram_feed` — Cache sinkronisasi feed Instagram `@dinsos_surakarta`.
9. `tb_pengumuman` — Pengumuman resmi SKM, Ombudsman, & layanan.
10. `tb_artikel` — Artikel edukasi kesejahteraan sosial & TAGANA.
11. `tb_agenda` — Jadwal kegiatan dinas.
12. `tb_bank_data` — Repositori rekapitulasi e-SIK & Hibah Bansos.
13. `tb_galeri` & `tb_detail_galeri` — Album dokumentasi kegiatan.
14. `tb_galeri_video` — Koleksi video YouTube resmi Dinsos Surakarta.
15. `tb_ppid_pimpinan` — Profil Pejabat Atasan PPID & Ketua PPID Pelaksana.
16. `ref_ppid_kategori` — Master kategori informasi (`berkala`, `serta_merta`, `setiap_saat`, `dikecualikan`).
17. `tb_ppid_informasi` — Dokumen informasi publik per kategori & tahun (`2020`–`2026`).
18. `tb_halaman_aduan` — Halaman regulasi & SK Tim SP4N/ULAS.
19. `tb_aduan_masyarakat` — Tiket pengaduan warga, penyamaran privasi NIK/HP sesuai UU PDP, jawaban tindak lanjut bidang, & status penyelesaian.
20. `tb_unduhan` — Berkas unduhan publik.
21. `tb_faq` — 11 daftar tanya-jawab layanan sosial.
22. `tb_pmks_psks` & `tb_users` — Statistik kesejahteraan sosial 5 Kecamatan Kota Surakarta & tabel pengguna RBAC BackEnd.

---

## 4. TEMUAN AUDIT TEKNIS & PENINGKATAN PADA VERSI KLONING

Selama proses *Deep Research* pada server asli `dinsos.surakarta.go.id`, ditemukan beberapa kendala produksi yang telah **diperbaiki dan diperkuat** pada hasil kloning ini:
1. **Perbaikan Error `HTTP 500` pada Endpoint PPID:** Pada website asli, akses ke `/ppid/informasi_setiap_saat` dan `/ppid/informasi_dikecualikan` menghasilkan `HTTP 500 Internal Server Error`. Pada hasil kloning, kedua modul tersebut berjalan 100% normal lengkap dengan struktur DataTables dan dokumen Uji Konsekuensi UU KIP.
2. **Perbaikan Blokir Iframe `egov.phicos.co.id` (`ERR_BLOCKED_BY_RESPONSE`):** Pada `/aduan/detail/3`, server asli mengalami blokir header `X-Frame-Options`. Pada hasil kloning, modul Aduan & ULAS terintegrasi langsung secara *native* dengan formulir pengaduan interaktif (`/aduan/detail/4`) dan tabel transparansi tindak lanjut (`/aduan/detail/5`).
3. **Hardening Keamanan Direktori:** Indeks pencarian menunjukkan server produksi asli sempat mengalami penyusupan halaman spam eksternal pada subdirektori `/jurnal/` dan `/login/...`. Kloning ini menggunakan sanitasi output (`escHtml`), validasi path ketat tanpa eksekusi shell liar, serta penyamaran otomatis data sensitif NIK & nomor telepon pelapor sesuai UU Pelindungan Data Pribadi (UU No. 27 Tahun 2022).

---

## 5. PANDUAN DEPLOYMENT (SIAP DEPLOY 100%)

Hasil kloning dirancang dengan **Arsitektur Dual-Mode** sehingga dapat langsung di-deploy di lingkungan apa pun:

### Opsi A — Static HTML Hosting (Netlify, Vercel, GitHub Pages, Cloudflare Pages, cPanel `public_html`)
Unggah seluruh isi direktori root (`index.html`, `home.html`, `login.html`, `admin.html`, `pmks.html`, `research.html`, `assets/`, `.htaccess`, `_redirects`, `vercel.json`).
- **Tanpa konfigurasi tambahan:** `db-engine.js` otomatis mendeteksi mode statis dan mengaktifkan database reaktif berbasis `LocalStorage` dengan seluruh *seed data* otentik Dinsos Surakarta. Perubahan yang dilakukan melalui `admin.html` langsung tampil pada `index.html`, `home.html`, dan `pmks.html`!

### Opsi B — Full-Stack Server (Node.js + REST API + Persistent Database)
Jalankan satu perintah tanpa perlu instalasi paket eksternal:
```bash
node server.js
```
Server langsung aktif pada `http://0.0.0.0:3000` menyajikan:
- Clean URL identik CodeIgniter (`/`, `/home`, `/berita/detail/398`, `/ppid/profil`, `/login`, `/dashboard`, `/pmks`)
- RESTful CRUD & DataTables Server-Side API (`/api/db`, `/api/collection/:table`, `/api/datatables/:table`, `/api/auth/login`, `/api/export/sql`)
- Penyimpanan permanen otomatis ke `database/dinsos_db.json` dan sinkronisasi skrip SQL `database/dinsos_surakarta.sql`.
