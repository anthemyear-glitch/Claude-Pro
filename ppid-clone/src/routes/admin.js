'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { q, setSetting, getSetting } = require('../db');
const util = require('../util');
const auth = require('../auth');

module.exports = (upload) => {
  const router = express.Router();
  const { uniqueSlug, bersihkanHtml, toCsv, nomorTiket, tanggalID } = util;
  const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

  router.use((req, res, next) => {
    res.locals.isAdmin = true;
    res.locals.aktif = req.path.split('/')[1] || 'dasbor';
    next();
  });

  /* ================= AUTENTIKASI ================= */
  router.get('/login', (req, res) => {
    if (res.locals.user) return res.redirect('/admin');
    res.render('admin/login', { judul: 'Masuk Panel Pengelola', galat: null, next: req.query.next || '/admin' });
  });

  router.post('/login', auth.sahkanCsrf, (req, res) => {
    const { username = '', password = '' } = req.body;
    const u = q.get('SELECT * FROM users WHERE username = ? AND aktif = 1', [String(username).trim()]);
    if (!u || !auth.verifyPassword(password, u.password)) {
      auth.catatAudit(req, 'login.gagal', username);
      return res.status(401).render('admin/login', { judul: 'Masuk Panel Pengelola', galat: 'Nama pengguna atau kata sandi salah.', next: '/admin' });
    }
    auth.buatSesi(u.id, res);
    auth.catatAudit({ ...req, res }, 'login.sukses', u.username);
    res.redirect(String(req.body.next || '/admin'));
  });

  router.post('/logout', (req, res) => {
    auth.hapusSesi(req.token, res);
    res.redirect('/admin/login');
  });

  /* ================= SEMUA RUTE DI BAWAH INI BUTUH LOGIN ================= */
  router.use(auth.wajibLogin);

  /* ---------- dasbor ---------- */
  router.get('/', (req, res) => {
    const kartu = [
      { label: 'Permohonan Masuk', nilai: q.get('SELECT COUNT(*) AS n FROM permohonan').n, ikon: 'permohonan', url: '/admin/permohonan' },
      { label: 'Perlu Ditindak', nilai: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status IN ('Menunggu Verifikasi','Diverifikasi','Sedang Diproses','Perlu Kelengkapan')").n, ikon: 'proses', url: '/admin/permohonan?status=Menunggu+Verifikasi' },
      { label: 'Selesai', nilai: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status='Selesai'").n, ikon: 'selesai', url: '/admin/permohonan?status=Selesai' },
      { label: 'Keberatan', nilai: q.get('SELECT COUNT(*) AS n FROM keberatan').n, ikon: 'keberatan', url: '/admin/keberatan' },
      { label: 'Entri DIP', nilai: q.get('SELECT COUNT(*) AS n FROM dip').n, ikon: 'dip', url: '/admin/dip' },
      { label: 'Perangkat Daerah', nilai: q.get('SELECT COUNT(*) AS n FROM opd').n, ikon: 'opd', url: '/admin/opd' },
      { label: 'Berita', nilai: q.get('SELECT COUNT(*) AS n FROM berita').n, ikon: 'berita', url: '/admin/berita' },
      { label: 'Pesan Kontak', nilai: q.get('SELECT COUNT(*) AS n FROM pesan_kontak WHERE dibaca=0').n, ikon: 'pesan', url: '/admin/pesan' },
    ];
    res.render('admin/dashboard', {
      judul: 'Dasbor',
      kartu,
      terbaru: q.all('SELECT * FROM permohonan ORDER BY id DESC LIMIT 8'),
      harian: q.all('SELECT tanggal,halaman,pemohon FROM statistik_kunjungan ORDER BY tanggal DESC LIMIT 30').reverse(),
      bulanan: q.all("SELECT substr(dibuat,1,7) AS ym, COUNT(*) AS n FROM permohonan GROUP BY ym ORDER BY ym DESC LIMIT 6").reverse(),
      status: q.all('SELECT status AS nama, COUNT(*) AS n FROM permohonan GROUP BY status'),
      log: q.all('SELECT * FROM audit_log ORDER BY id DESC LIMIT 10'),
    });
  });

  /* ---------- permohonan ---------- */
  router.get('/permohonan', (req, res) => {
    const where = []; const params = [];
    if (req.query.status) { where.push('p.status = ?'); params.push(req.query.status); }
    if (req.query.kategori) { where.push('p.kategori_info = ?'); params.push(req.query.kategori); }
    if (req.query.q) { where.push('(p.nomor_tiket LIKE ? OR p.nama LIKE ? OR p.email LIKE ? OR p.rincian_info LIKE ?)');
      const like = `%${req.query.q}%`; params.push(like, like, like, like); }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const total = q.get(`SELECT COUNT(*) AS n FROM permohonan p ${clause}`, params).n;
    const pg = util.paginasi(total, Number(req.query.halaman || 1), 15);
    const baris = q.all(`SELECT p.*, u.nama AS petugas_nama FROM permohonan p LEFT JOIN users u ON u.id=p.petugas_id
      ${clause} ORDER BY p.id DESC LIMIT 15 OFFSET ${pg.offset}`, params);

    if (req.query.format === 'csv') {
      const rows = q.all(`SELECT p.*, u.nama AS petugas_nama FROM permohonan p LEFT JOIN users u ON u.id=p.petugas_id ${clause} ORDER BY p.id DESC`, params);
      return res.type('text/csv').attachment(`permohonan-${Date.now()}.csv`).send(
        toCsv(rows, [
          { key: 'nomor_tiket', label: 'Nomor Tiket' }, { key: 'dibuat', label: 'Tanggal Masuk' },
          { key: 'nama', label: 'Nama Pemohon' }, { key: 'jenis_pemohon', label: 'Jenis Pemohon' },
          { key: 'email', label: 'Surel' }, { key: 'telepon', label: 'Telepon' },
          { key: 'kategori_info', label: 'Kategori Informasi' }, { key: 'rincian_info', label: 'Rincian Informasi' },
          { key: 'tujuan', label: 'Tujuan Penggunaan' }, { key: 'cara_peroleh', label: 'Cara Perolehan' },
          { key: 'status', label: 'Status' }, { key: 'diselesaikan', label: 'Tanggal Selesai' },
          { key: 'petugas_nama', label: 'Petugas' },
        ])
      );
    }

    res.render('admin/permohonan-list', {
      judul: 'Permohonan Informasi', baris, pg, hit: total,
      statusList: util.STATUS_PERMOHONAN, kategoriList: util.KATEGORI_INFO_PUBLIK,
    });
  });

  router.get('/permohonan/:id', (req, res) => {
    const p = q.get('SELECT p.*, u.nama AS petugas_nama FROM permohonan p LEFT JOIN users u ON u.id=p.petugas_id WHERE p.id=?', [req.params.id]);
    if (!p) return res.redirect('/admin/permohonan');
    const riwayat = q.all('SELECT * FROM riwayat_permohonan WHERE permohonan_id=? ORDER BY id', [p.id]);
    const dipTerkait = p.dip_id ? q.get('SELECT d.*, k.nama AS kategori_nama FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id WHERE d.id=?', [p.dip_id]) : null;
    const usulan = q.all(`SELECT d.id, d.ringkas_informasi, k.nama AS kategori_nama FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
      WHERE d.ringkas_informasi LIKE ? LIMIT 8`, [`%${String(p.rincian_info).split(' ').slice(0, 3).join(' ')}%`]);
    res.render('admin/permohonan-detail', { judul: `Permohonan ${p.nomor_tiket}`, p, riwayat, dipTerkait, usulan,
      petugasList: q.all('SELECT id,nama,username FROM users WHERE aktif=1') });
  });

  router.post('/permohonan/:id/proses', upload.single('berkas_jawaban'), auth.sahkanCsrf, (req, res) => {
    const p = q.get('SELECT * FROM permohonan WHERE id=?', [req.params.id]);
    if (!p) return res.redirect('/admin/permohonan');
    const status = util.STATUS_PERMOHONAN.includes(req.body.status) ? req.body.status : p.status;
    const berkas = req.file ? `uploads/${req.file.filename}` : p.berkas_jawaban;
    const kolom = {
      status,
      catatan_petugas: req.body.catatan ?? p.catatan_petugas,
      jawaban: req.body.jawaban ?? p.jawaban,
      berkas_jawaban: berkas,
      petugas_id: req.body.petugas_id ? Number(req.body.petugas_id) : res.locals.user.id,
      dip_id: req.body.dip_id ? Number(req.body.dip_id) : p.dip_id,
    };
    if (status === 'Diverifikasi' && !p.diverifikasi) kolom.diverifikasi = new Date().toISOString().slice(0, 19).replace('T', ' ');
    if (status === 'Selesai' || status === 'Ditolak') {
      kolom.dijawab = p.dijawab || new Date().toISOString().slice(0, 19).replace('T', ' ');
      kolom.diselesaikan = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    q.run(`UPDATE permohonan SET status=?, catatan_petugas=?, jawaban=?, berkas_jawaban=?, petugas_id=?, dip_id=?,
           diverifikasi=?, dijawab=?, diselesaikan=? WHERE id=?`,
      [kolom.status, kolom.catatan_petugas, kolom.jawaban, kolom.berkas_jawaban, kolom.petugas_id, kolom.dip_id,
       kolom.diverifikasi ?? p.diverifikasi, kolom.dijawab ?? p.dijawab, kolom.diselesaikan ?? p.diselesaikan, p.id]);
    q.run('INSERT INTO riwayat_permohonan(permohonan_id,status,keterangan,aktor) VALUES(?,?,?,?)',
      [p.id, status, req.body.catatan || 'Status diperbarui oleh petugas.', res.locals.user.username]);
    auth.catatAudit(req, `permohonan.${status}`, p.nomor_tiket);
    res.redirect(`/admin/permohonan/${p.id}?msg=${encodeURIComponent('Status permohonan diperbarui.')}`);
  });

  router.post('/permohonan/:id/hapus', auth.sahkanCsrf, auth.wajibAdmin, (req, res) => {
    const p = q.get('SELECT nomor_tiket FROM permohonan WHERE id=?', [req.params.id]);
    q.run('DELETE FROM permohonan WHERE id=?', [req.params.id]);
    auth.catatAudit(req, 'permohonan.hapus', p?.nomor_tiket || req.params.id);
    res.redirect('/admin/permohonan');
  });

  /* ---------- keberatan ---------- */
  router.get('/keberatan', (req, res) => {
    const baris = q.all('SELECT k.*, p.nomor_tiket AS tiket_permohonan FROM keberatan k LEFT JOIN permohonan p ON p.id=k.permohonan_id ORDER BY k.id DESC');
    res.render('admin/keberatan', { judul: 'Pengajuan Keberatan', baris });
  });

  router.post('/keberatan/:id/tanggapi', auth.sahkanCsrf, (req, res) => {
    const k = q.get('SELECT * FROM keberatan WHERE id=?', [req.params.id]);
    if (!k) return res.redirect('/admin/keberatan');
    const status = ['Menunggu Telaah', 'Sedang Ditelaah', 'Ditanggapi', 'Diteruskan ke Atasan PPID', 'Ditolak'].includes(req.body.status) ? req.body.status : k.status;
    q.run("UPDATE keberatan SET status=?, tanggapan=?, dijawab=datetime('now') WHERE id=?",
      [status, String(req.body.tanggapan || '').trim(), k.id]);
    auth.catatAudit(req, `keberatan.${status}`, k.nomor_tiket);
    res.redirect('/admin/keberatan?msg=' + encodeURIComponent('Tanggapan keberatan disimpan.'));
  });

  router.post('/keberatan/:id/hapus', auth.sahkanCsrf, auth.wajibAdmin, (req, res) => {
    q.run('DELETE FROM keberatan WHERE id=?', [req.params.id]);
    auth.catatAudit(req, 'keberatan.hapus', req.params.id);
    res.redirect('/admin/keberatan');
  });

  /* ---------- DIP ---------- */
  router.get('/dip', (req, res) => {
    const where = []; const params = [];
    if (req.query.kategori) { where.push('k.slug = ?'); params.push(req.query.kategori); }
    if (req.query.q) { where.push('d.ringkas_informasi LIKE ?'); params.push(`%${req.query.q}%`); }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const total = q.get(`SELECT COUNT(*) AS n FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id ${clause}`, params).n;
    const pg = util.paginasi(total, Number(req.query.halaman || 1), 20);
    const baris = q.all(`SELECT d.*, k.nama AS kategori_nama, o.singkatan AS opd_singkatan
      FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id LEFT JOIN opd o ON o.id=d.opd_id
      ${clause} ORDER BY d.id DESC LIMIT 20 OFFSET ${pg.offset}`, params);
    res.render('admin/dip-list', { judul: 'Daftar Informasi Publik', baris, pg, hit: total,
      opdList: q.all('SELECT id,nama,singkatan FROM opd ORDER BY nama') });
  });

  router.get('/dip/form', (req, res) => {
    res.render('admin/dip-form', { judul: 'Tambah Entri DIP', item: null,
      opdList: q.all('SELECT id,nama,singkatan FROM opd ORDER BY nama') });
  });
  router.get('/dip/form/:id', (req, res) => {
    const item = q.get('SELECT * FROM dip WHERE id=?', [req.params.id]);
    if (!item) return res.redirect('/admin/dip');
    res.render('admin/dip-form', { judul: `Sunting Entri DIP #${item.id}`, item,
      opdList: q.all('SELECT id,nama,singkatan FROM opd ORDER BY nama') });
  });

  router.post('/dip/simpan', upload.single('berkas'), auth.sahkanCsrf, (req, res) => {
    const b = req.body;
    if (!b.ringkas_informasi || !b.kategori_id) return res.redirect('/admin/dip/form?msg=' + encodeURIComponent('Ringkasan informasi dan kategori wajib diisi.'));
    const berkas = req.file ? `uploads/${req.file.filename}` : (b.berkas_lama || null);
    const data = [
      Number(b.kategori_id), b.opd_id ? Number(b.opd_id) : null, String(b.ringkas_informasi).trim(),
      b.rincian || null, b.jenis || 'Dokumen', b.format || 'PDF', b.sarana || 'Website',
      b.tahun ? Number(b.tahun) : null, b.jangka_waktu || null, b.periode_penerbitan || null, berkas, b.ukuran || null,
    ];
    if (b.id) {
      q.run(`UPDATE dip SET kategori_id=?,opd_id=?,ringkas_informasi=?,rincian=?,jenis=?,format=?,sarana=?,tahun=?,
             jangka_waktu=?,periode_penerbitan=?,berkas=?,ukuran=?,diperbarui=datetime('now') WHERE id=?`, [...data, Number(b.id)]);
      auth.catatAudit(req, 'dip.sunting', b.id);
    } else {
      const id = q.insert(`INSERT INTO dip(kategori_id,opd_id,ringkas_informasi,rincian,jenis,format,sarana,tahun,
        jangka_waktu,periode_penerbitan,berkas,ukuran) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`, data);
      auth.catatAudit(req, 'dip.tambah', id);
    }
    res.redirect('/admin/dip?msg=' + encodeURIComponent('Entri DIP tersimpan.'));
  });

  router.post('/dip/:id/hapus', auth.sahkanCsrf, (req, res) => {
    q.run('DELETE FROM dip WHERE id=?', [req.params.id]);
    auth.catatAudit(req, 'dip.hapus', req.params.id);
    res.redirect('/admin/dip');
  });

  /* ---------- berita ---------- */
  router.get('/berita', (req, res) => {
    const baris = q.all('SELECT * FROM berita ORDER BY dibuat DESC');
    res.render('admin/berita-list', { judul: 'Berita & Pengumuman', baris });
  });
  router.get('/berita/form', (req, res) => res.render('admin/berita-form', { judul: 'Tulis Berita', item: null }));
  router.get('/berita/form/:id', (req, res) => {
    const item = q.get('SELECT * FROM berita WHERE id=?', [req.params.id]);
    if (!item) return res.redirect('/admin/berita');
    res.render('admin/berita-form', { judul: `Sunting: ${item.judul}`, item });
  });
  router.post('/berita/simpan', upload.single('sampul'), auth.sahkanCsrf, (req, res) => {
    const b = req.body;
    if (!b.judul || !b.isi) return res.redirect('/admin/berita/form?msg=' + encodeURIComponent('Judul dan isi berita wajib diisi.'));
    const sampul = req.file ? `uploads/${req.file.filename}` : (b.sampul_lama || null);
    const slug = uniqueSlug(q, 'berita', b.judul, b.id ? Number(b.id) : null);
    if (b.id) {
      q.run('UPDATE berita SET slug=?,judul=?,ringkasan=?,isi=?,penulis=?,kategori=?,sampul=?,terbit=? WHERE id=?',
        [slug, String(b.judul).trim(), b.ringkasan || null, bersihkanHtml(b.isi), b.penulis || 'Admin PPID', b.kategori || 'Kegiatan', sampul, b.terbit ? 1 : 0, Number(b.id)]);
      auth.catatAudit(req, 'berita.sunting', slug);
    } else {
      q.insert('INSERT INTO berita(slug,judul,ringkasan,isi,penulis,kategori,sampul,terbit) VALUES(?,?,?,?,?,?,?,?)',
        [slug, String(b.judul).trim(), b.ringkasan || null, bersihkanHtml(b.isi), b.penulis || 'Admin PPID', b.kategori || 'Kegiatan', sampul, b.terbit ? 1 : 0]);
      auth.catatAudit(req, 'berita.tambah', slug);
    }
    res.redirect('/admin/berita?msg=' + encodeURIComponent('Berita tersimpan.'));
  });
  router.post('/berita/:id/hapus', auth.sahkanCsrf, (req, res) => {
    q.run('DELETE FROM berita WHERE id=?', [req.params.id]);
    auth.catatAudit(req, 'berita.hapus', req.params.id);
    res.redirect('/admin/berita');
  });

  /* ---------- CRUD generik (regulasi, video, infografis, faq, slider, halaman, kategori) ---------- */
  const KOLEKSI = {
    regulasi: {
      tabel: 'regulasi', judulMenu: 'Regulasi', label: 'Regulasi', urutkan: 'tahun DESC, id DESC',
      kolom: [
        { nama: 'judul', label: 'Judul', tipe: 'text', wajib: true, lebar: 12 },
        { nama: 'nomor', label: 'Nomor', tipe: 'text', lebar: 4 },
        { nama: 'jenis', label: 'Jenis', tipe: 'select', opsi: ['Undang-Undang', 'Peraturan Pemerintah', 'Peraturan Presiden', 'Peraturan Menteri', 'Peraturan Daerah', 'Keputusan', 'Peraturan Komisi Informasi', 'Pedoman', 'SOP', 'Petunjuk Teknis'], lebar: 4 },
        { nama: 'tahun', label: 'Tahun', tipe: 'number', lebar: 2 },
        { nama: 'penerbit', label: 'Penerbit', tipe: 'text', lebar: 2 },
        { nama: 'ukuran', label: 'Ukuran Berkas', tipe: 'text', lebar: 3 },
        { nama: 'berkas', label: 'Nama Berkas', tipe: 'text', lebar: 5, bantuan: 'Terisi otomatis bila mengunggah berkas.' },
      ],
      unggah: 'berkas',
      tampil: ['judul', 'nomor', 'jenis', 'tahun', 'penerbit', 'unduhan'],
    },
    video: {
      tabel: 'video', judulMenu: 'Video', label: 'Video', urutkan: 'id DESC',
      kolom: [
        { nama: 'judul', label: 'Judul Video', tipe: 'text', wajib: true, lebar: 8 },
        { nama: 'kelompok', label: 'Kelompok', tipe: 'select', opsi: ['layanan', 'informasi'], lebar: 4 },
        { nama: 'keterangan', label: 'Keterangan', tipe: 'textarea', lebar: 8 },
        { nama: 'durasi', label: 'Durasi', tipe: 'text', lebar: 2, bantuan: 'Contoh: 4:12' },
        { nama: 'tautan', label: 'Tautan Video', tipe: 'text', lebar: 2 },
      ],
      tampil: ['judul', 'kelompok', 'durasi', 'dilihat'],
    },
    infografis: {
      tabel: 'infografis', judulMenu: 'Infografis', label: 'Infografis', urutkan: 'id DESC',
      kolom: [
        { nama: 'judul', label: 'Judul', tipe: 'text', wajib: true, lebar: 8 },
        { nama: 'kategori', label: 'Kategori', tipe: 'text', lebar: 4 },
        { nama: 'keterangan', label: 'Keterangan', tipe: 'textarea', lebar: 8 },
        { nama: 'tahun', label: 'Tahun', tipe: 'number', lebar: 2 },
        { nama: 'berkas', label: 'Nama Berkas', tipe: 'text', lebar: 2 },
      ],
      unggah: 'berkas',
      tampil: ['judul', 'kategori', 'tahun', 'unduhan'],
    },
    faq: {
      tabel: 'faq', judulMenu: 'FAQ', label: 'Pertanyaan Umum', urutkan: 'kelompok, urutan',
      kolom: [
        { nama: 'pertanyaan', label: 'Pertanyaan', tipe: 'text', wajib: true, lebar: 10 },
        { nama: 'kelompok', label: 'Kelompok', tipe: 'text', lebar: 2 },
        { nama: 'jawaban', label: 'Jawaban', tipe: 'textarea', wajib: true, lebar: 10 },
        { nama: 'urutan', label: 'Urutan', tipe: 'number', lebar: 2 },
      ],
      tampil: ['pertanyaan', 'kelompok', 'urutan'],
    },
    slider: {
      tabel: 'slider', judulMenu: 'Slider Beranda', label: 'Slide', urutkan: 'urutan',
      kolom: [
        { nama: 'judul', label: 'Judul', tipe: 'text', wajib: true, lebar: 6 },
        { nama: 'subjudul', label: 'Subjudul', tipe: 'text', lebar: 6 },
        { nama: 'tautan', label: 'Tautan Tombol', tipe: 'text', lebar: 6 },
        { nama: 'berkas', label: 'Kode Visual', tipe: 'text', lebar: 4, bantuan: 'Contoh: slide-1 … slide-4' },
        { nama: 'urutan', label: 'Urutan', tipe: 'number', lebar: 2 },
      ],
      tampil: ['judul', 'subjudul', 'tautan', 'urutan'],
      sakelar: 'aktif',
    },
    halaman: {
      tabel: 'halaman', judulMenu: 'Halaman Statis', label: 'Halaman', urutkan: 'kelompok, urutan',
      kolom: [
        { nama: 'judul', label: 'Judul', tipe: 'text', wajib: true, lebar: 8 },
        { nama: 'slug', label: 'Slug URL', tipe: 'text', lebar: 4, bantuan: 'Kosongkan untuk dibuat otomatis.' },
        { nama: 'subjudul', label: 'Subjudul', tipe: 'text', lebar: 8 },
        { nama: 'kelompok', label: 'Kelompok', tipe: 'select', opsi: ['layanan', 'profil', 'lainnya'], lebar: 2 },
        { nama: 'urutan', label: 'Urutan', tipe: 'number', lebar: 2 },
        { nama: 'ikon', label: 'Kode Ikon', tipe: 'text', lebar: 4 },
        { nama: 'isi', label: 'Isi (HTML)', tipe: 'textarea', wajib: true, lebar: 12, tinggi: 16 },
      ],
      tampil: ['judul', 'slug', 'kelompok', 'urutan'],
      sakelar: 'tampil',
      slugOtomatis: true,
      sanitasi: ['isi'],
    },
    kategori_dip: {
      tabel: 'kategori_dip', judulMenu: 'Kategori DIP', label: 'Kategori', urutkan: 'urutan',
      kolom: [
        { nama: 'nama', label: 'Nama Kategori', tipe: 'text', wajib: true, lebar: 6 },
        { nama: 'slug', label: 'Slug', tipe: 'text', lebar: 4 },
        { nama: 'ikon', label: 'Kode Ikon', tipe: 'text', lebar: 2 },
        { nama: 'deskripsi', label: 'Deskripsi', tipe: 'textarea', lebar: 10 },
        { nama: 'urutan', label: 'Urutan', tipe: 'number', lebar: 2 },
      ],
      tampil: ['nama', 'slug', 'urutan'],
      slugOtomatis: true,
      slugSumber: 'nama',
    },
    opd: {
      tabel: 'opd', judulMenu: 'PPID Pelaksana', label: 'Perangkat Daerah', urutkan: 'nama',
      kolom: [
        { nama: 'nama', label: 'Nama Perangkat Daerah', tipe: 'text', wajib: true, lebar: 8 },
        { nama: 'singkatan', label: 'Singkatan', tipe: 'text', lebar: 4 },
        { nama: 'jenis', label: 'Jenis', tipe: 'select', opsi: ['Dinas', 'Badan', 'Sekretariat', 'Inspektorat', 'Kecamatan', 'Kelurahan', 'Satuan', 'BLUD'], lebar: 4 },
        { nama: 'telepon', label: 'Telepon', tipe: 'text', lebar: 4 },
        { nama: 'email', label: 'Surel', tipe: 'text', lebar: 4 },
        { nama: 'alamat', label: 'Alamat', tipe: 'textarea', lebar: 6 },
        { nama: 'website', label: 'Situs Web', tipe: 'text', lebar: 6 },
        { nama: 'nama_ppid', label: 'Nama Petugas PPID', tipe: 'text', lebar: 6 },
        { nama: 'jabatan_ppid', label: 'Jabatan', tipe: 'text', lebar: 6 },
      ],
      tampil: ['nama', 'singkatan', 'jenis', 'telepon', 'email'],
      sakelar: 'aktif',
    },
  };

  Object.entries(KOLEKSI).forEach(([kunci, def]) => {
    router.get(`/${kunci}`, (req, res) => {
      const baris = q.all(`SELECT * FROM ${def.tabel} ORDER BY ${def.urutkan}`);
      res.render('admin/koleksi', { judul: def.judulMenu, def, kunci, baris });
    });

    // Formulir koleksi memakai enctype multipart; tanpa berkas pun body harus tetap diparse.
    const mwUnggah = def.unggah ? upload.single(def.unggah) : upload.none();
    router.post(`/${kunci}/simpan`, mwUnggah, auth.sahkanCsrf, (req, res) => {
      const b = req.body;
      const kolom = def.kolom.filter((k) => b[k.nama] !== undefined || k.wajib);
      const nilai = [];
      kolom.forEach((k) => {
        let v = b[k.nama];
        if (k.tipe === 'number') v = v === '' || v === undefined ? null : Number(v);
        if (def.sanitasi && def.sanitasi.includes(k.nama)) v = bersihkanHtml(String(v || ''));
        nilai.push(v === undefined ? null : v);
      });
      if (def.unggah && req.file) {
        const idx = kolom.findIndex((k) => k.nama === def.unggah);
        const val = `uploads/${req.file.filename}`;
        if (idx >= 0) nilai[idx] = val; else { kolom.push({ nama: def.unggah }); nilai.push(val); }
      }
      if (def.slugOtomatis) {
        const sumber = b.slug || b[def.slugSumber || 'judul'] || b.judul || b.nama || '';
        const idx = kolom.findIndex((k) => k.nama === 'slug');
        const slug = uniqueSlug(q, def.tabel, sumber, b.id ? Number(b.id) : null);
        if (idx >= 0) nilai[idx] = slug;
        else { kolom.push({ nama: 'slug' }); nilai.push(slug); }
      }
      const wajibKurang = def.kolom.filter((k) => k.wajib && !String(b[k.nama] || '').trim());
      if (wajibKurang.length) return res.redirect(`/admin/${kunci}?msg=${encodeURIComponent('Isian wajib: ' + wajibKurang.map((k) => k.label).join(', '))}`);

      // Kolom sakelar (aktif/tampil) ikut disimpan baik saat menambah maupun menyunting.
      if (def.sakelar && !kolom.some((k) => k.nama === def.sakelar)) {
        kolom.push({ nama: def.sakelar });
        // Data baru dianggap aktif; saat menyunting ikuti centang pada formulir.
        const sw = b.id ? (b[def.sakelar] ? 1 : 0) : (b[def.sakelar] === undefined || b[def.sakelar] === '' ? 1 : 1);
        nilai.push(sw);
      }
      try {
        if (b.id) {
          q.run(`UPDATE ${def.tabel} SET ${kolom.map((k) => `${k.nama}=?`).join(',')} WHERE id=?`, [...nilai, Number(b.id)]);
          auth.catatAudit(req, `${kunci}.sunting`, b.id);
        } else {
          q.insert(`INSERT INTO ${def.tabel}(${kolom.map((k) => k.nama).join(',')}) VALUES(${kolom.map(() => '?').join(',')})`, nilai);
          auth.catatAudit(req, `${kunci}.tambah`, '-');
        }
      } catch (e) {
        return res.redirect(`/admin/${kunci}?msg=${encodeURIComponent('Gagal menyimpan: ' + e.message)}`);
      }
      res.redirect(`/admin/${kunci}?msg=${encodeURIComponent('Data tersimpan.')}`);
    });

    router.post(`/${kunci}/:id/hapus`, auth.sahkanCsrf, (req, res) => {
      q.run(`DELETE FROM ${def.tabel} WHERE id=?`, [req.params.id]);
      auth.catatAudit(req, `${kunci}.hapus`, req.params.id);
      res.redirect(`/admin/${kunci}`);
    });
  });

  /* ---------- survei ---------- */
  router.get('/survei', (req, res) => {
    res.render('admin/survei', { judul: 'Survei Kepuasan',
      baris: q.all('SELECT * FROM survei ORDER BY id DESC LIMIT 200'),
      ringkas: q.get('SELECT ROUND(AVG(mutu),2) AS mutu, ROUND(AVG(kecepatan),2) AS kecepatan, ROUND(AVG(kemudahan),2) AS kemudahan, COUNT(*) AS n FROM survei') });
  });

  /* ---------- pesan kontak ---------- */
  router.get('/pesan', (req, res) => {
    res.render('admin/pesan', { judul: 'Pesan & Pengaduan', baris: q.all('SELECT * FROM pesan_kontak ORDER BY id DESC LIMIT 200') });
  });
  router.post('/pesan/:id/tandai', auth.sahkanCsrf, (req, res) => {
    q.run('UPDATE pesan_kontak SET dibaca=? WHERE id=?', [req.body.dibaca ? 1 : 0, req.params.id]);
    res.redirect('/admin/pesan');
  });
  router.post('/pesan/:id/hapus', auth.sahkanCsrf, (req, res) => {
    q.run('DELETE FROM pesan_kontak WHERE id=?', [req.params.id]);
    res.redirect('/admin/pesan');
  });

  /* ---------- pengguna ---------- */
  router.get('/pengguna', auth.wajibAdmin, (req, res) => {
    res.render('admin/pengguna', { judul: 'Pengelola & Petugas', baris: q.all('SELECT * FROM users ORDER BY id') });
  });
  router.post('/pengguna/simpan', auth.sahkanCsrf, auth.wajibAdmin, (req, res) => {
    const b = req.body;
    if (!b.username || !b.nama) return res.redirect('/admin/pengguna?msg=' + encodeURIComponent('Nama pengguna dan nama lengkap wajib diisi.'));
    if (b.id) {
      if (b.password) {
        q.run('UPDATE users SET username=?,nama=?,email=?,role=?,aktif=?,password=? WHERE id=?',
          [b.username.trim(), b.nama.trim(), b.email || null, b.role === 'admin' ? 'admin' : 'petugas', b.aktif ? 1 : 0, auth.hashPassword(b.password), Number(b.id)]);
      } else {
        q.run('UPDATE users SET username=?,nama=?,email=?,role=?,aktif=? WHERE id=?',
          [b.username.trim(), b.nama.trim(), b.email || null, b.role === 'admin' ? 'admin' : 'petugas', b.aktif ? 1 : 0, Number(b.id)]);
      }
      auth.catatAudit(req, 'pengguna.sunting', b.username);
    } else {
      if (!b.password || String(b.password).length < 6) return res.redirect('/admin/pengguna?msg=' + encodeURIComponent('Kata sandi minimal 6 karakter.'));
      q.run('INSERT INTO users(username,password,nama,email,role,aktif) VALUES(?,?,?,?,?,?)',
        [b.username.trim(), auth.hashPassword(b.password), b.nama.trim(), b.email || null, b.role === 'admin' ? 'admin' : 'petugas', b.aktif ? 1 : 0]);
      auth.catatAudit(req, 'pengguna.tambah', b.username);
    }
    res.redirect('/admin/pengguna?msg=' + encodeURIComponent('Pengguna tersimpan.'));
  });
  router.post('/pengguna/:id/hapus', auth.sahkanCsrf, auth.wajibAdmin, (req, res) => {
    if (Number(req.params.id) === res.locals.user.id) return res.redirect('/admin/pengguna?msg=' + encodeURIComponent('Anda tidak dapat menghapus akun sendiri.'));
    q.run('DELETE FROM users WHERE id=?', [req.params.id]);
    auth.catatAudit(req, 'pengguna.hapus', req.params.id);
    res.redirect('/admin/pengguna');
  });

  /* ---------- pengaturan ---------- */
  router.get('/pengaturan', auth.wajibAdmin, (req, res) => {
    const daftar = [
      { key: 'site_name', label: 'Nama Situs' },
      { key: 'site_subtitle', label: 'Subjudul Situs' },
      { key: 'brand_suffix', label: 'Akhiran Merek (alamat klon)' },
      { key: 'alamat_klon', label: 'Alamat Klon (tampil di bilah alamat)' },
      { key: 'alamat_asli', label: 'Alamat Situs Asli (rujukan)' },
      { key: 'telepon', label: 'Telepon Layanan' },
      { key: 'email', label: 'Surel Layanan' },
      { key: 'alamat_kantor', label: 'Alamat Kantor' },
      { key: 'jam_layanan', label: 'Jam Layanan' },
      { key: 'instagram', label: 'Tautan Instagram' },
      { key: 'whatsapp', label: 'Tautan WhatsApp' },
      { key: 'youtube', label: 'Tautan YouTube' },
      { key: 'facebook', label: 'Tautan Facebook' },
      { key: 'watermark_teks', label: 'Teks Watermark' },
      { key: 'watermark_aktif', label: 'Watermark Aktif (1/0)' },
      { key: 'tema_default', label: 'Tema Bawaan (negative/positive)' },
    ];
    const nilai = {};
    daftar.forEach((d) => (nilai[d.key] = getSetting(d.key, '')));
    res.render('admin/pengaturan', { judul: 'Pengaturan Situs', daftar, nilai });
  });
  router.post('/pengaturan/simpan', auth.sahkanCsrf, auth.wajibAdmin, (req, res) => {
    Object.entries(req.body || {}).forEach(([k, v]) => {
      if (k === 'csrf') return;
      setSetting(k, String(v));
    });
    auth.catatAudit(req, 'pengaturan.simpan', '-');
    res.redirect('/admin/pengaturan?msg=' + encodeURIComponent('Pengaturan disimpan.'));
  });

  /* ---------- log audit ---------- */
  router.get('/audit', (req, res) => {
    const baris = q.all('SELECT * FROM audit_log ORDER BY id DESC LIMIT 300');
    res.render('admin/audit', { judul: 'Log Aktivitas', baris });
  });

  /* ---------- unggah berkas cepat ---------- */
  router.post('/unggah', upload.single('berkas'), auth.sahkanCsrf, (req, res) => {
    if (!req.file) return res.status(400).json({ ok: false, pesan: 'Tidak ada berkas yang diterima.' });
    res.json({ ok: true, path: `uploads/${req.file.filename}`, nama: req.file.originalname, ukuran: req.file.size });
  });

  return router;
};
