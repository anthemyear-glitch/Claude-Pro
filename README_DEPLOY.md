# Panduan Deploy Kloning 1:1 Website Dinas Sosial Kota Surakarta

Paket aplikasi ini merupakan hasil **Deep Research & Kloning 1:1 (FrontEnd hingga BackEnd)** dari `https://dinsos.surakarta.go.id/` dalam format **HTML Siap Deploy + Full-Stack Node.js & SQL Database**.

## Struktur Direktori Utama
- `index.html` — **Layer 1: Portal Layanan (`/`)** (*"SUGENG RAWUH WONTEN — 15 Layanan Terintegrasi"*)
- `home.html` — **Layer 2: Website Utama (`/home`)** (Template Bkro Bootstrap 5.3.3 lengkap dengan seluruh route Profil, Bidang Layanan, Standar Pelayanan, Berita, Pengumuman, Artikel, Agenda, Bank Data, Galeri Foto/Video, PPID, Aduan Masyarakat, Unduhan, & FAQ)
- `login.html` — **Layer 3a: Autentikasi BackEnd (`/login`)** (*Web Dinas Sosial* dengan RBAC 3 Role)
- `admin.html` — **Layer 3b: Dashboard BackEnd CMS (`/dashboard`)** (PIXINVENT Frest Admin dengan CRUD 20+ Tabel, Tindak Lanjut Aduan, Analitik Chart.js, & Ekspor SQL/JSON)
- `pmks.html` — **Layer 4: Sub-Aplikasi SIM PMKS & PSKS (`/pmks`)** (Analitik Kesejahteraan Sosial 5 Kecamatan Kota Surakarta)
- `research.html` & `DEEP_RESEARCH_DINSOS_SURAKARTA.md` — **Dokumentasi Forensik & Blueprint Arsitektur Lengkap**
- `server.js` — **Full-Stack BackEnd Server** tanpa dependensi eksternal (REST API + Server-Side DataTables + Clean URL Rewriter)
- `database/dinsos_surakarta.sql` & `database/dinsos_db.json` — **Database Relasional 22 Tabel**
- `.htaccess`, `_redirects`, `vercel.json` — Konfigurasi Clean URL siap pakai untuk Apache/cPanel, Netlify/Cloudflare Pages, dan Vercel.

## Cara Menjalankan / Deploy

### 1. Deploy Full-Stack (Node.js / VPS / Render / Railway)
```bash
node server.js
```
Buka `http://localhost:3000`. Seluruh perubahan CRUD di BackEnd CMS (`admin.html`) tersimpan permanen ke `database/dinsos_db.json` dan `database/dinsos_surakarta.sql`.

### 2. Deploy Static HTML Murni (cPanel `public_html` / Netlify / Vercel / GitHub Pages)
Cukup unggah seluruh folder ini ke hosting statis. Mesin `assets/js/db-engine.js` secara otomatis mendeteksi ketiadaan endpoint Node.js dan beralih mulus ke **Reactive LocalStorage Engine** tanpa kehilangan satu pun fitur CRUD, autentikasi, pencarian, maupun DataTables.

## Akun Demo BackEnd (`/login` atau `login.html`)
- **Super Administrator:** `admin` / `dinsos2026`
- **Admin PPID Pelaksana:** `ppid_dinsos` / `ppid2026`
- **Operator Bidang Linjamsos:** `admin_linjamsos` / `linjamsos2026`
