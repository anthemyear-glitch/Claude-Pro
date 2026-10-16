'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const { q, getSetting } = require('../db');
const util = require('../util');
const auth = require('../auth');

module.exports = (upload) => {
  const router = express.Router();
  const { nomorTiket, slugify, bersihkanHtml } = util;

  /* ---------- pencarian cepat (autocomplete) ---------- */
  router.get('/cari-cepat', (req, res) => {
    const qstr = String(req.query.q || '').trim();
    if (qstr.length < 2) return res.json({ ok: true, hasil: [] });
    const like = `%${qstr}%`;
    const hasil = [
      ...q.all(`SELECT 'informasi' AS jenis, d.id, d.ringkas_informasi AS judul, k.nama AS sub, '/informasi/'||d.id AS url
                FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
                WHERE d.ringkas_informasi LIKE ? ORDER BY d.unduhan DESC LIMIT 6`, [like]),
      ...q.all(`SELECT 'berita' AS jenis, id, judul, kategori AS sub, '/halaman-berita/'||slug AS url
                FROM berita WHERE terbit=1 AND judul LIKE ? ORDER BY dibuat DESC LIMIT 4`, [like]),
      ...q.all(`SELECT 'regulasi' AS jenis, id, judul, jenis AS sub, '/regulasi' AS url FROM regulasi WHERE judul LIKE ? LIMIT 3`, [like]),
      ...q.all(`SELECT 'perangkat-daerah' AS jenis, id, nama AS judul, singkatan AS sub, '/ppid-pelaksana' AS url FROM opd WHERE aktif=1 AND (nama LIKE ? OR singkatan LIKE ?) LIMIT 3`, [like, like]),
      ...q.all(`SELECT 'layanan' AS jenis, id, judul, subjudul AS sub, '/halaman-informasi/'||slug AS url FROM halaman WHERE tampil=1 AND judul LIKE ? LIMIT 3`, [like]),
    ];
    res.json({ ok: true, hasil });
  });

  /* ---------- daftar informasi publik ---------- */
  router.get('/dip', (req, res) => {
    const where = [];
    const params = [];
    if (req.query.kategori) { where.push('k.slug = ?'); params.push(req.query.kategori); }
    if (req.query.opd) { where.push('d.opd_id = ?'); params.push(Number(req.query.opd)); }
    if (req.query.tahun) { where.push('d.tahun = ?'); params.push(Number(req.query.tahun)); }
    if (req.query.q) { where.push('(d.ringkas_informasi LIKE ? OR d.rincian LIKE ?)'); params.push(`%${req.query.q}%`, `%${req.query.q}%`); }
    const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const limit = Math.min(100, Number(req.query.limit || 20));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const total = q.get(`SELECT COUNT(*) AS n FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id ${clause}`, params).n;
    const baris = q.all(`
      SELECT d.id, d.ringkas_informasi, d.rincian, d.jenis, d.format, d.sarana, d.tahun, d.berkas, d.ukuran,
             d.unduhan, d.dilihat, k.nama AS kategori_nama, k.slug AS kategori_slug, o.nama AS opd_nama
      FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id LEFT JOIN opd o ON o.id=d.opd_id
      ${clause} ORDER BY d.id DESC LIMIT ${limit} OFFSET ${offset}`, params);
    res.json({ ok: true, total, baris });
  });

  router.get('/dip/:id', (req, res) => {
    const item = q.get(`SELECT d.*, k.nama AS kategori_nama, o.nama AS opd_nama
      FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id LEFT JOIN opd o ON o.id=d.opd_id WHERE d.id=?`, [req.params.id]);
    if (!item) return res.status(404).json({ ok: false, pesan: 'Data tidak ditemukan.' });
    res.json({ ok: true, data: item });
  });

  /* ---------- unduhan (pencatatan + pengiriman berkas) ---------- */
  const kirimBerkas = (rel, namaAsli, res) => {
    if (!rel) return res.status(404).json({ ok: false, pesan: 'Berkas tidak tersedia.' });
    const aman = path.normalize(rel).replace(/^(\.\.[/\\])+/, '');
    const lokal = path.join(__dirname, '..', '..', 'public', 'berkas', path.basename(aman));
    const unggahan = path.join(__dirname, '..', '..', 'uploads', path.basename(aman));
    const nama = namaAsli || path.basename(aman);
    if (fs.existsSync(lokal)) return res.download(lokal, nama);
    if (fs.existsSync(unggahan)) return res.download(unggahan, nama);
    // Berkas contoh (dokumen asli tidak disalin pada klon ini)
    const isi = [
      'DOKUMEN INFORMASI PUBLIK — BERKAS PENGGANTI',
      `Berkas referensi : ${rel}`,
      `Diunduh pada     : ${new Date().toISOString()}`,
      `Portal           : ${getSetting('alamat_klon')}`,
      '',
      'Berkas ini dihasilkan otomatis oleh sistem klon cadangan.',
      'Dokumen asli milik badan publik tidak disalin di sini.',
    ].join('\n');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nama.replace(/\.[a-z0-9]+$/i, '')}.txt"`);
    res.send(isi);
  };

  router.get('/unduh/dip/:id', (req, res) => {
    const item = q.get('SELECT * FROM dip WHERE id=?', [req.params.id]);
    if (!item) return res.status(404).json({ ok: false, pesan: 'Data tidak ditemukan.' });
    if (item.kategori_id === q.get("SELECT id FROM kategori_dip WHERE slug='informasi-dikecualikan'").id)
      return res.status(403).json({ ok: false, pesan: 'Informasi ini termasuk yang dikecualikan dan tidak dapat diunduh.' });
    q.run('UPDATE dip SET unduhan = unduhan + 1 WHERE id=?', [item.id]);
    kirimBerkas(item.berkas, `${slugify(item.ringkas_informasi)}.${(item.format || 'pdf').toLowerCase()}`, res);
  });

  router.get('/unduh/regulasi/:id', (req, res) => {
    const r = q.get('SELECT * FROM regulasi WHERE id=?', [req.params.id]);
    if (!r) return res.status(404).json({ ok: false, pesan: 'Regulasi tidak ditemukan.' });
    q.run('UPDATE regulasi SET unduhan = unduhan + 1 WHERE id=?', [r.id]);
    kirimBerkas(r.berkas, `${slugify(r.judul)}.pdf`, res);
  });

  router.get('/unduh/infografis/:id', (req, res) => {
    const g = q.get('SELECT * FROM infografis WHERE id=?', [req.params.id]);
    if (!g) return res.status(404).json({ ok: false, pesan: 'Infografis tidak ditemukan.' });
    q.run('UPDATE infografis SET unduhan = unduhan + 1 WHERE id=?', [g.id]);
    kirimBerkas(g.berkas, `${slugify(g.judul)}.png`, res);
  });

  router.get('/unduh/jawaban/:tiket', (req, res) => {
    const p = q.get('SELECT * FROM permohonan WHERE nomor_tiket=?', [req.params.tiket]);
    const email = String(req.query.email || '').toLowerCase();
    if (!p || !p.berkas_jawaban || p.email.toLowerCase() !== email)
      return res.status(403).json({ ok: false, pesan: 'Berkas jawaban tidak dapat diakses.' });
    kirimBerkas(p.berkas_jawaban, `Jawaban-${p.nomor_tiket}.pdf`, res);
  });

  /* ---------- permohonan informasi publik ---------- */
  router.post('/permohonan', upload.single('berkas'), (req, res) => {
    const b = req.body || {};
    const wajib = ['nama', 'email', 'telepon', 'kategori_info', 'rincian_info'];
    const kurang = wajib.filter((f) => !String(b[f] || '').trim());
    if (kurang.length)
      return res.status(422).json({ ok: false, pesan: `Isian berikut wajib dilengkapi: ${kurang.join(', ')}.` });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))
      return res.status(422).json({ ok: false, pesan: 'Format alamat surel tidak valid.' });
    if (String(b.nik || '').trim() && !/^\d{16}$/.test(String(b.nik).trim()))
      return res.status(422).json({ ok: false, pesan: 'NIK harus terdiri dari 16 digit angka.' });

    const tiket = nomorTiket('PPID', q, 'permohonan');
    const berkas = req.file ? `uploads/${req.file.filename}` : null;
    const id = q.insert(
      `INSERT INTO permohonan(nomor_tiket,nama,nik,pekerjaan,alamat,email,telepon,jenis_pemohon,nama_badan,
        kategori_info,rincian_info,tujuan,cara_peroleh,cara_kirim,berkas_identitas,status,dip_id)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'Menunggu Verifikasi',?)`,
      [
        tiket, b.nama.trim(), b.nik || null, b.pekerjaan || null, b.alamat || null, b.email.trim(),
        b.telepon.trim(), b.jenis_pemohon || 'Perorangan', b.nama_badan || null,
        b.kategori_info, b.rincian_info.trim(), b.tujuan || null,
        b.cara_peroleh || 'Surat Elektronik (Email)', b.cara_kirim || 'Email', berkas,
        b.dip_id ? Number(b.dip_id) : null,
      ]
    );
    q.run('INSERT INTO riwayat_permohonan(permohonan_id,status,keterangan,aktor) VALUES(?,?,?,?)',
      [id, 'Menunggu Verifikasi', 'Permohonan diterima sistem dan menunggu verifikasi petugas.', 'sistem']);
    auth.catatAudit(req, 'permohonan.baru', tiket);
    res.json({
      ok: true, tiket, id,
      pesan: 'Permohonan Anda berhasil dikirim. Simpan nomor tiket untuk melacak status permohonan.',
      lacak: `/lacak-permohonan/${tiket}?email=${encodeURIComponent(b.email.trim())}`,
    });
  });

  router.get('/permohonan/:tiket', (req, res) => {
    const tiket = req.params.tiket.trim();
    const email = String(req.query.email || '').trim().toLowerCase();
    const p = q.get('SELECT * FROM permohonan WHERE nomor_tiket=?', [tiket]);
    if (!p) return res.status(404).json({ ok: false, pesan: 'Nomor tiket tidak ditemukan.' });
    if (!email || p.email.toLowerCase() !== email)
      return res.status(403).json({ ok: false, pesan: 'Alamat surel tidak cocok dengan data permohonan.' });
    const riwayat = q.all('SELECT waktu,status,keterangan,aktor FROM riwayat_permohonan WHERE permohonan_id=? ORDER BY id', [p.id]);
    res.json({
      ok: true,
      data: {
        nomor_tiket: p.nomor_tiket, nama: p.nama, status: p.status, kategori_info: p.kategori_info,
        rincian_info: p.rincian_info, tujuan: p.tujuan, cara_peroleh: p.cara_peroleh,
        dibuat: p.dibuat, diverifikasi: p.diverifikasi, dijawab: p.dijawab, diselesaikan: p.diselesaikan,
        catatan_petugas: p.catatan_petugas, jawaban: p.jawaban, ada_berkas: !!p.berkas_jawaban, riwayat,
      },
    });
  });

  /* ---------- keberatan ---------- */
  router.post('/keberatan', (req, res) => {
    const b = req.body || {};
    if (!b.nama || !b.email || !b.alasan || !b.uraian)
      return res.status(422).json({ ok: false, pesan: 'Nama, surel, alasan, dan uraian keberatan wajib diisi.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))
      return res.status(422).json({ ok: false, pesan: 'Format alamat surel tidak valid.' });
    const tiket = nomorTiket('KBR', q, 'keberatan');
    let permohonanId = null;
    if (b.nomor_permohonan) {
      const p = q.get('SELECT id,email FROM permohonan WHERE nomor_tiket=?', [String(b.nomor_permohonan).trim()]);
      if (!p) return res.status(422).json({ ok: false, pesan: 'Nomor permohonan yang dirujuk tidak ditemukan.' });
      if (p.email.toLowerCase() !== String(b.email).toLowerCase())
        return res.status(422).json({ ok: false, pesan: 'Surel tidak cocok dengan data permohonan yang dirujuk.' });
      permohonanId = p.id;
    }
    q.run(`INSERT INTO keberatan(nomor_tiket,permohonan_id,nama,email,telepon,alamat,alasan,uraian,status)
           VALUES(?,?,?,?,?,?,?,?,'Menunggu Telaah')`,
      [tiket, permohonanId, b.nama.trim(), b.email.trim(), b.telepon || null, b.alamat || null, b.alasan, String(b.uraian).trim()]);
    auth.catatAudit(req, 'keberatan.baru', tiket);
    res.json({ ok: true, tiket, pesan: 'Keberatan tercatat. Tanggapan Atasan PPID disampaikan paling lambat 30 hari kerja.' });
  });

  router.get('/keberatan/:tiket', (req, res) => {
    const k = q.get('SELECT * FROM keberatan WHERE nomor_tiket=?', [req.params.tiket]);
    if (!k) return res.status(404).json({ ok: false, pesan: 'Nomor tiket keberatan tidak ditemukan.' });
    if (String(req.query.email || '').toLowerCase() !== k.email.toLowerCase())
      return res.status(403).json({ ok: false, pesan: 'Surel tidak cocok.' });
    res.json({ ok: true, data: { nomor_tiket: k.nomor_tiket, status: k.status, tanggapan: k.tanggapan, dibuat: k.dibuat, dijawab: k.dijawab } });
  });

  /* ---------- survei kepuasan ---------- */
  router.post('/survei', (req, res) => {
    const b = req.body || {};
    const n = (v) => Math.max(1, Math.min(5, Number(v) || 0));
    if (!n(b.mutu) || !n(b.kecepatan) || !n(b.kemudahan))
      return res.status(422).json({ ok: false, pesan: 'Berikan penilaian 1–5 untuk mutu, kecepatan, dan kemudahan.' });
    q.run('INSERT INTO survei(nama,email,layanan,mutu,kecepatan,kemudahan,tanggapan,saran) VALUES(?,?,?,?,?,?,?,?)',
      [b.nama || null, b.email || null, b.layanan || 'Umum', n(b.mutu), n(b.kecepatan), n(b.kemudahan),
       b.tanggapan || null, b.saran || null]);
    res.json({ ok: true, pesan: 'Terima kasih, penilaian Anda telah tercatat.' });
  });

  router.get('/survei/ringkasan', (req, res) => {
    res.json({ ok: true, data: q.get('SELECT ROUND(AVG(mutu),2) AS mutu, ROUND(AVG(kecepatan),2) AS kecepatan, ROUND(AVG(kemudahan),2) AS kemudahan, COUNT(*) AS n FROM survei') });
  });

  /* ---------- kontak ---------- */
  router.post('/kontak', (req, res) => {
    const b = req.body || {};
    if (!b.nama || !b.email || !b.pesan) return res.status(422).json({ ok: false, pesan: 'Nama, surel, dan pesan wajib diisi.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return res.status(422).json({ ok: false, pesan: 'Format surel tidak valid.' });
    q.run('INSERT INTO pesan_kontak(nama,email,subjek,pesan) VALUES(?,?,?,?)',
      [String(b.nama).trim(), String(b.email).trim(), String(b.subjek || 'Umum').slice(0, 120), String(b.pesan).trim().slice(0, 4000)]);
    res.json({ ok: true, pesan: 'Pesan terkirim. Petugas akan menindaklanjuti pada jam kerja.' });
  });

  /* ---------- statistik ---------- */
  router.get('/statistik', (req, res) => {
    res.json({
      ok: true,
      data: {
        dip: q.get('SELECT COUNT(*) AS n FROM dip').n,
        opd: q.get('SELECT COUNT(*) AS n FROM opd WHERE aktif=1').n,
        permohonan: q.get('SELECT COUNT(*) AS n FROM permohonan').n,
        selesai: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status='Selesai'").n,
        ditolak: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status='Ditolak'").n,
        keberatan: q.get('SELECT COUNT(*) AS n FROM keberatan').n,
        kategori: q.all('SELECT k.nama, COUNT(d.id) AS n FROM kategori_dip k LEFT JOIN dip d ON d.kategori_id=k.id GROUP BY k.id'),
        status: q.all('SELECT status AS nama, COUNT(*) AS n FROM permohonan GROUP BY status'),
        bulanan: q.all("SELECT substr(dibuat,1,7) AS ym, COUNT(*) AS n FROM permohonan GROUP BY ym ORDER BY ym DESC LIMIT 12"),
        kunjungan: q.all('SELECT tanggal, halaman, pemohon FROM statistik_kunjungan ORDER BY tanggal DESC LIMIT 30'),
      },
    });
  });

  /* ---------- berita & regulasi (untuk konsumsi JS) ---------- */
  router.get('/berita', (req, res) => {
    const limit = Math.min(50, Number(req.query.limit || 9));
    const offset = Math.max(0, Number(req.query.offset || 0));
    const kategori = req.query.kategori ? 'WHERE terbit=1 AND kategori = ?' : 'WHERE terbit=1';
    const params = req.query.kategori ? [req.query.kategori] : [];
    res.json({
      ok: true,
      total: q.get(`SELECT COUNT(*) AS n FROM berita ${kategori}`, params).n,
      baris: q.all(`SELECT id,slug,judul,ringkasan,kategori,penulis,sampul,dilihat,dibuat FROM berita ${kategori} ORDER BY dibuat DESC LIMIT ${limit} OFFSET ${offset}`, params),
    });
  });

  /* ---------- preferensi tema ---------- */
  router.post('/tema', (req, res) => {
    const t = ['negative', 'positive'].includes(req.body?.tema) ? req.body.tema : 'negative';
    res.json({ ok: true, tema: t });
  });

  /* ---------- kesehatan sistem ---------- */
  router.get('/status', (req, res) => res.json({
    ok: true,
    layanan: 'PPID Clone (CloneForBackup)',
    waktu: new Date().toISOString(),
    versi: '1.0.0',
    basisData: q.get('SELECT COUNT(*) AS n FROM dip').n > 0 ? 'tersedia' : 'kosong',
  }));

  return router;
};
