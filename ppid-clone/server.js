'use strict';

/**
 * Server utama — portal PPID (klon fungsional).
 * Node 22 + Express + EJS + node:sqlite. Tidak ada dependensi native.
 */

const path = require('path');
const express = require('express');
const multer = require('multer');
const fs = require('fs');

const { q, getSetting, bumpVisit } = require('./src/db');
const { seed } = require('./src/seed');
const auth = require('./src/auth');
const util = require('./src/util');

// Pastikan data awal tersedia
if (!q.get('SELECT COUNT(*) AS n FROM users').n) seed();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.disable('x-powered-by');

/* ---------- penyimpanan unggahan ---------- */
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).slice(0, 8) || '.bin';
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    },
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|webp|csv|txt|zip)$/i.test(file.originalname);
    cb(ok ? null : new Error('Jenis berkas tidak diizinkan'), ok);
  },
});

/* ---------- middleware global ---------- */
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(express.json({ limit: '2mb' }));

app.use(auth.muatSesi);

// Alias basis path: semua rute juga dapat diakses dengan akhiran /CloneForBackup
const SUFFIX = '/CloneForBackup';
app.use((req, res, next) => {
  if (req.path.startsWith(SUFFIX)) {
    const sisa = req.path.slice(SUFFIX.length) || '/';
    const url = sisa + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
    return res.redirect(302, url);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// Data bersama untuk seluruh view
app.use((req, res, next) => {
  const s = (k, d = '') => getSetting(k, d);
  res.locals.util = util;
  res.locals.auth = auth;
  res.locals.q = q;
  res.locals.cfg = {
    siteName: s('site_name', 'PPID Kota Surakarta'),
    subtitle: s('site_subtitle', 'Pejabat Pengelola Informasi dan Dokumentasi'),
    suffix: s('brand_suffix', 'CloneForBackup'),
    alamatKlon: s('alamat_klon', 'https://ppid.surakarta.go.id/CloneForBackup'),
    alamatAsli: s('alamat_asli', 'https://ppid.surakarta.go.id'),
    telepon: s('telepon', '(0271) 2941667'),
    email: s('email', 'ppid@surakarta.go.id'),
    alamat: s('alamat_kantor', 'Kompleks Balaikota, Surakarta, Jawa Tengah'),
    jam: s('jam_layanan', 'Senin–Kamis 08.00–16.00 WIB'),
    instagram: s('instagram', '#'),
    whatsapp: s('whatsapp', '#'),
    youtube: s('youtube', '#'),
    facebook: s('facebook', '#'),
    tema: s('tema_default', 'negative'),
    watermark: s('watermark_teks', 'CloneForBackup'),
    watermarkAktif: s('watermark_aktif', '1') === '1',
  };
  res.locals.navUtama = q.all('SELECT slug,judul AS nama,ikon,urutan,kelompok FROM halaman WHERE tampil=1 ORDER BY kelompok, urutan');
  res.locals.halamanLayanan = res.locals.navUtama.filter((h) => h.kelompok === 'layanan');
  res.locals.kategoriDip = q.all('SELECT * FROM kategori_dip ORDER BY urutan');
  res.locals.path = req.path;
  res.locals.query = req.query;
  res.locals.flash = req.query.msg || '';
  bumpVisit(req.path === '/permohonan-informasi' ? 1 : 0);
  next();
});

/* ---------- rute ---------- */
app.use('/', require('./src/routes/public'));
app.use('/api', require('./src/routes/api')(upload));
app.use('/admin', require('./src/routes/admin')(upload));

// Berkas contoh untuk unduhan (dibuat otomatis bila belum ada)
app.get('/unduh/berkas/:nama', (req, res) => {
  const nama = path.basename(req.params.nama);
  const p = path.join(__dirname, 'public', 'berkas', nama);
  if (fs.existsSync(p)) return res.download(p, nama);
  const isi = buatBerkasContoh(nama);
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${nama}"`);
  res.send(isi);
});

function buatBerkasContoh(nama) {
  const baris = [
    `DOKUMEN INFORMASI PUBLIK — BERKAS CONTOH`,
    `Nama berkas : ${nama}`,
    `Dihasilkan  : ${new Date().toISOString()}`,
    `Portal      : ${getSetting('alamat_klon')} (klon cadangan)`,
    ``,
    `Berkas ini dibuat otomatis oleh sistem klon sebagai pengganti dokumen asli.`,
    `Isi dokumen asli tidak disalin demi menghormati hak cipta badan publik pemiliknya.`,
  ];
  return baris.join('\n');
}

app.get('/healthz', (req, res) => res.json({ ok: true, layanan: 'PPID Clone', waktu: new Date().toISOString() }));

/* ---------- penanganan galat ---------- */
app.use((req, res) => {
  const kode = 404;
  if (req.path.startsWith('/api/')) return res.status(kode).json({ ok: false, pesan: 'Endpoint tidak ditemukan.' });
  res.status(kode).render('pages/error', {
    judul: '404 — Halaman Tidak Ditemukan',
    kode,
    pesan: 'Halaman yang Anda cari tidak tersedia atau telah dipindahkan.',
    tautan: '/',
    labelTautan: 'Kembali ke Beranda',
  });
});

app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  if (res.headersSent) return next(err);
  const pesan = /jenis berkas tidak diizinkan/i.test(err.message)
    ? 'Jenis berkas yang diunggah tidak diizinkan (maks. 8 MB; pdf/doc/xls/ppt/jpg/png/csv/zip).'
    : err.message;
  if (req.path.startsWith('/api/')) return res.status(400).json({ ok: false, pesan });
  res.status(500).render('pages/error', {
    judul: '500 — Terjadi Kesalahan',
    kode: 500,
    pesan,
    tautan: 'javascript:history.back()',
    labelTautan: 'Kembali',
  });
});

app.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}`;
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════════════════╗');
  console.log('  ║  Portal PPID — Klon Cadangan (CloneForBackup)                ║');
  console.log('  ╠══════════════════════════════════════════════════════════════╣');
  console.log(`  ║  Lokal   : ${url.padEnd(49)}║`);
  console.log(`  ║  Alamat  : ${getSetting('alamat_klon').slice(0, 49).padEnd(49)}║`);
  console.log(`  ║  Tema    : ${(getSetting('tema_default') + ' (Negative)').padEnd(49)}║`);
  console.log('  ║  Admin   : /admin  →  admin / admin123                       ║');
  console.log('  ╚══════════════════════════════════════════════════════════════╝');
  console.log('');
});
