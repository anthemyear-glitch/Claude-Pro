'use strict';

const express = require('express');
const { q, getSetting } = require('../db');
const util = require('../util');

const router = express.Router();
const { paginasi, uniqueSlug } = util;

/* helper: hitung total dengan filter yang sama */
const filterDip = (query) => {
  const where = [];
  const params = [];
  if (query.kategori) { where.push('k.slug = ?'); params.push(query.kategori); }
  if (query.opd) { where.push('o.id = ?'); params.push(Number(query.opd)); }
  if (query.tahun) { where.push('d.tahun = ?'); params.push(Number(query.tahun)); }
  if (query.jenis) { where.push('d.jenis = ?'); params.push(query.jenis); }
  if (query.q) {
    where.push('(d.ringkas_informasi LIKE ? OR d.rincian LIKE ? OR o.nama LIKE ?)');
    const like = `%${query.q}%`;
    params.push(like, like, like);
  }
  return { clause: where.length ? 'WHERE ' + where.join(' AND ') : '', params };
};

/* ============================ BERANDA ============================ */
router.get('/', (req, res) => {
  const kat = q.all(`
    SELECT k.*, COUNT(d.id) AS jumlah
    FROM kategori_dip k LEFT JOIN dip d ON d.kategori_id = k.id
    GROUP BY k.id ORDER BY k.urutan`);

  const berita = q.all('SELECT * FROM berita WHERE terbit=1 ORDER BY dibuat DESC LIMIT 3');
  const slider = q.all('SELECT * FROM slider WHERE aktif=1 ORDER BY urutan LIMIT 6');
  const layanan = q.all("SELECT * FROM halaman WHERE kelompok='layanan' AND tampil=1 ORDER BY urutan");
  const video = q.all('SELECT * FROM video ORDER BY kelompok, id DESC LIMIT 8');
  const infografis = q.all('SELECT * FROM infografis ORDER BY id DESC LIMIT 4');
  const dipBaru = q.all(`
    SELECT d.*, k.nama AS kategori_nama, o.nama AS opd_nama
    FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
    LEFT JOIN opd o ON o.id=d.opd_id
    ORDER BY d.id DESC LIMIT 5`);

  const statistik = {
    dip: q.get('SELECT COUNT(*) AS n FROM dip').n,
    opd: q.get('SELECT COUNT(*) AS n FROM opd WHERE aktif=1').n,
    permohonan: q.get('SELECT COUNT(*) AS n FROM permohonan').n,
    selesai: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status='Selesai'").n,
    berita: q.get('SELECT COUNT(*) AS n FROM berita WHERE terbit=1').n,
    regulasi: q.get('SELECT COUNT(*) AS n FROM regulasi').n,
  };

  const tentang = q.get("SELECT * FROM halaman WHERE slug='tentang-ppid'");

  res.render('pages/home', {
    judul: 'Beranda',
    kat, berita, slider, layanan, video, infografis, dipBaru, statistik, tentang,
    opdList: q.all('SELECT id,nama,singkatan FROM opd WHERE aktif=1 ORDER BY nama LIMIT 40'),
  });
});

/* ======================= INFORMASI PUBLIK ======================= */
router.get('/daftar-informasi-publik', (req, res) => {
  const f = filterDip(req.query);
  const per = Number(req.query.per || 12);
  const total = q.get(`SELECT COUNT(*) AS n FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id LEFT JOIN opd o ON o.id=d.opd_id ${f.clause}`, f.params).n;
  const pg = paginasi(total, Number(req.query.halaman || 1), per);
  const baris = q.all(`
    SELECT d.*, k.nama AS kategori_nama, k.slug AS kategori_slug, o.nama AS opd_nama
    FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
    LEFT JOIN opd o ON o.id=d.opd_id
    ${f.clause}
    ORDER BY d.kategori_id, d.tahun DESC, d.id DESC
    LIMIT ${per} OFFSET ${pg.offset}`, f.params);

  res.render('pages/dip-list', {
    judul: 'Daftar Informasi Publik',
    subjudul: 'Kumpulan informasi publik yang wajib disediakan dan diumumkan oleh badan publik',
    baris, pg,
    opdList: q.all('SELECT id,nama,singkatan FROM opd ORDER BY nama'),
    tahunList: q.all('SELECT DISTINCT tahun FROM dip WHERE tahun IS NOT NULL ORDER BY tahun DESC'),
    jenisList: q.all('SELECT DISTINCT jenis FROM dip ORDER BY jenis'),
    hit: total,
  });
});

router.get('/dip/:slug', (req, res) => {
  const kat = q.get('SELECT * FROM kategori_dip WHERE slug = ?', [req.params.slug]);
  if (!kat) return res.status(404).render('pages/error', {
    judul: '404', kode: 404, pesan: 'Kategori informasi tidak ditemukan.', tautan: '/daftar-informasi-publik', labelTautan: 'Ke Daftar Informasi Publik',
  });
  const f = filterDip({ ...req.query, kategori: kat.slug });
  const per = Number(req.query.per || 12);
  const total = q.get(`SELECT COUNT(*) AS n FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id LEFT JOIN opd o ON o.id=d.opd_id ${f.clause}`, f.params).n;
  const pg = paginasi(total, Number(req.query.halaman || 1), per);
  const baris = q.all(`
    SELECT d.*, k.nama AS kategori_nama, k.slug AS kategori_slug, o.nama AS opd_nama, o.singkatan AS opd_singkatan
    FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
    LEFT JOIN opd o ON o.id=d.opd_id
    ${f.clause}
    ORDER BY d.tahun DESC, d.id DESC
    LIMIT ${per} OFFSET ${pg.offset}`, f.params);

  res.render('pages/dip-kategori', { judul: kat.nama, kat, baris, pg, hit: total,
    opdList: q.all('SELECT id,nama,singkatan FROM opd ORDER BY nama'),
    tahunList: q.all('SELECT DISTINCT tahun FROM dip WHERE tahun IS NOT NULL AND kategori_id=? ORDER BY tahun DESC', [kat.id]),
  });
});

router.get('/informasi/:id', (req, res) => {
  const item = q.get(`
    SELECT d.*, k.nama AS kategori_nama, k.slug AS kategori_slug, k.deskripsi AS kategori_deskripsi,
           o.nama AS opd_nama, o.alamat AS opd_alamat, o.telepon AS opd_telepon, o.email AS opd_email
    FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
    LEFT JOIN opd o ON o.id=d.opd_id WHERE d.id = ?`, [req.params.id]);
  if (!item) return res.status(404).render('pages/error', { judul: '404', kode: 404, pesan: 'Data informasi tidak ditemukan.', tautan: '/daftar-informasi-publik', labelTautan: 'Kembali', });
  q.run('UPDATE dip SET dilihat = dilihat + 1 WHERE id = ?', [item.id]);
  const terkait = q.all('SELECT d.id, d.ringkas_informasi, k.slug AS kategori_slug FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id WHERE d.kategori_id=? AND d.id<>? ORDER BY RANDOM() LIMIT 5', [item.kategori_id, item.id]);
  res.render('pages/dip-detail', { judul: item.ringkas_informasi, item, terkait });
});

/* ======================= HALAMAN STATIS ======================= */
const renderHalaman = (slug) => (req, res) => {
  const h = q.get('SELECT * FROM halaman WHERE slug = ? AND tampil = 1', [slug]);
  if (!h) return res.status(404).render('pages/error', { judul: '404', kode: 404, pesan: 'Halaman tidak tersedia.', tautan: '/', labelTautan: 'Beranda' });
  res.render('pages/halaman', { judul: h.judul, h, terkait: q.all('SELECT slug,judul,ikon,kelompok FROM halaman WHERE tampil=1 AND id<>? ORDER BY kelompok,urutan', [h.id]) });
};

router.get('/halaman-informasi/:slug', (req, res, next) => renderHalaman(req.params.slug)(req, res, next));
router.get('/tentang', renderHalaman('tentang-ppid'));
router.get('/mekanisme', renderHalaman('mekanisme-pelayanan-informasi-publik'));
router.get('/maklumat-pelayanan', renderHalaman('maklumat-pelayanan'));
router.get('/struktur-organisasi', renderHalaman('struktur-organisasi'));
router.get('/regulasi-kip', renderHalaman('regulasi-keterbukaan-informasi'));

/* ======================= PPID PELAKSANA ======================= */
router.get('/ppid-pelaksana', (req, res) => {
  const search = req.query.q || '';
  const jenis = req.query.jenis || '';
  const where = [];
  const params = [];
  if (search) { where.push('(nama LIKE ? OR singkatan LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (jenis) { where.push('jenis = ?'); params.push(jenis); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') + ' AND aktif=1' : 'WHERE aktif=1';
  const total = q.get(`SELECT COUNT(*) AS n FROM opd ${clause}`, params).n;
  const pg = paginasi(total, Number(req.query.halaman || 1), 15);
  const baris = q.all(`
    SELECT o.*, (SELECT COUNT(*) FROM dip d WHERE d.opd_id=o.id) AS jumlah_dip,
           (SELECT COUNT(*) FROM permohonan p JOIN dip d ON d.id=p.dip_id WHERE d.opd_id=o.id) AS jumlah_permohonan
    FROM opd o ${clause} ORDER BY o.nama LIMIT 15 OFFSET ${pg.offset}`, params);
  res.render('pages/ppid-pelaksana', { judul: 'PPID Pelaksana', baris, pg, hit: total,
    jenisList: q.all('SELECT DISTINCT jenis FROM opd ORDER BY jenis'), search, jenis });
});

/* ======================= LAYANAN PERMOHONAN ======================= */
router.get('/permohonan-informasi', (req, res) => {
  res.render('pages/permohonan', {
    judul: 'Permohonan Informasi Publik',
    dipTerbaru: q.all(`SELECT d.id, d.ringkas_informasi, k.slug AS kategori_slug, k.nama AS kategori_nama
      FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
      WHERE k.slug <> 'informasi-dikecualikan' ORDER BY d.id DESC LIMIT 200`),
  });
});

router.get('/lacak-permohonan', (req, res) => {
  res.render('pages/lacak', { judul: 'Lacak Permohonan', hasil: null });
});

router.get('/lacak-permohonan/:tiket', (req, res) => {
  const tiket = req.params.tiket.trim();
  const email = (req.query.email || '').trim().toLowerCase();
  const p = q.get(`SELECT p.*, u.nama AS petugas_nama FROM permohonan p LEFT JOIN users u ON u.id=p.petugas_id WHERE p.nomor_tiket = ?`, [tiket]);
  const cocok = p && (!email || p.email.toLowerCase() === email);
  const riwayat = cocok ? q.all('SELECT * FROM riwayat_permohonan WHERE permohonan_id=? ORDER BY id', [p.id]) : [];
  res.render('pages/lacak', { judul: 'Lacak Permohonan', hasil: cocok ? { ...p, riwayat } : null, tiket, email, gagal: !!p && !cocok });
});

router.get('/pengajuan-keberatan', (req, res) => {
  res.render('pages/keberatan', { judul: 'Pengajuan Keberatan Informasi' });
});

/* ======================= PUBLIKASI ======================= */
router.get('/berita', (req, res) => {
  const kategori = req.query.kategori || '';
  const search = req.query.q || '';
  const where = ['terbit=1'];
  const params = [];
  if (kategori) { where.push('kategori = ?'); params.push(kategori); }
  if (search) { where.push('(judul LIKE ? OR ringkasan LIKE ? OR isi LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  const clause = 'WHERE ' + where.join(' AND ');
  const total = q.get(`SELECT COUNT(*) AS n FROM berita ${clause}`, params).n;
  const pg = paginasi(total, Number(req.query.halaman || 1), 9);
  const baris = q.all(`SELECT * FROM berita ${clause} ORDER BY dibuat DESC LIMIT 9 OFFSET ${pg.offset}`, params);
  res.render('pages/berita-list', { judul: 'Berita & Pengumuman', baris, pg, hit: total,
    kategoriList: q.all('SELECT kategori, COUNT(*) AS n FROM berita WHERE terbit=1 GROUP BY kategori'), kategori, search });
});
router.get('/all-berita', (req, res) => res.redirect('/berita'));

router.get('/halaman-berita/:slug', (req, res) => {
  const b = q.get('SELECT * FROM berita WHERE slug = ? AND terbit=1', [req.params.slug]);
  if (!b) return res.status(404).render('pages/error', { judul: '404', kode: 404, pesan: 'Berita tidak ditemukan.', tautan: '/berita', labelTautan: 'Semua Berita' });
  q.run('UPDATE berita SET dilihat = dilihat + 1 WHERE id=?', [b.id]);
  res.render('pages/berita-detail', { judul: b.judul, b,
    lainnya: q.all('SELECT slug,judul,sampul,dibuat,dilihat FROM berita WHERE terbit=1 AND id<>? ORDER BY dibuat DESC LIMIT 5', [b.id]),
    kategoriList: q.all('SELECT kategori, COUNT(*) AS n FROM berita WHERE terbit=1 GROUP BY kategori') });
});

router.get('/regulasi', (req, res) => {
  const search = req.query.q || '';
  const jenis = req.query.jenis || '';
  const where = []; const params = [];
  if (search) { where.push('(judul LIKE ? OR nomor LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (jenis) { where.push('jenis = ?'); params.push(jenis); }
  const clause = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const total = q.get(`SELECT COUNT(*) AS n FROM regulasi ${clause}`, params).n;
  const pg = paginasi(total, Number(req.query.halaman || 1), 12);
  const baris = q.all(`SELECT * FROM regulasi ${clause} ORDER BY tahun DESC, id DESC LIMIT 12 OFFSET ${pg.offset}`, params);
  res.render('pages/regulasi', { judul: 'Regulasi', baris, pg, hit: total,
    jenisList: q.all('SELECT DISTINCT jenis FROM regulasi ORDER BY jenis'), search, jenis });
});

router.get('/video', (req, res) => {
  const kelompok = req.query.kelompok || '';
  const clause = kelompok ? 'WHERE kelompok = ?' : '';
  const params = kelompok ? [kelompok] : [];
  const baris = q.all(`SELECT * FROM video ${clause} ORDER BY id DESC`, params);
  res.render('pages/video', { judul: 'Galeri Video', baris, kelompok });
});
router.get('/all-video', (req, res) => res.redirect('/video'));

router.get('/infografis', (req, res) => {
  const baris = q.all('SELECT * FROM infografis ORDER BY id DESC');
  res.render('pages/infografis', { judul: 'Infografis', baris,
    kategoriList: q.all('SELECT kategori, COUNT(*) AS n FROM infografis GROUP BY kategori') });
});
router.get('/all-infografis', (req, res) => res.redirect('/infografis'));

router.get('/halaman-infografis/:id', (req, res) => {
  const g = q.get('SELECT * FROM infografis WHERE id=?', [req.params.id]);
  if (!g) return res.status(404).render('pages/error', { judul: '404', kode: 404, pesan: 'Infografis tidak ditemukan.', tautan: '/infografis', labelTautan: 'Galeri Infografis' });
  res.render('pages/infografis-detail', { judul: g.judul, g,
    lainnya: q.all('SELECT id,judul,berkas FROM infografis WHERE id<>? ORDER BY id DESC LIMIT 6', [g.id]) });
});

router.get('/faq', (req, res) => {
  res.render('pages/faq', { judul: 'Pertanyaan yang Sering Diajukan',
    baris: q.all('SELECT * FROM faq ORDER BY kelompok, urutan') });
});

/* ======================= STATISTIK ======================= */
router.get('/statistik', (req, res) => {
  const bulan = q.all(`
    SELECT substr(dibuat,1,7) AS ym, COUNT(*) AS n
    FROM permohonan GROUP BY ym ORDER BY ym DESC LIMIT 12`).reverse();
  const status = q.all('SELECT status, COUNT(*) AS n FROM permohonan GROUP BY status ORDER BY n DESC');
  const kategori = q.all('SELECT kategori_info AS nama, COUNT(*) AS n FROM permohonan GROUP BY nama ORDER BY n DESC');
  const pemohon = q.all('SELECT jenis_pemohon AS nama, COUNT(*) AS n FROM permohonan GROUP BY nama ORDER BY n DESC');
  const dipPerKat = q.all('SELECT k.nama, COUNT(d.id) AS n FROM kategori_dip k LEFT JOIN dip d ON d.kategori_id=k.id GROUP BY k.id ORDER BY k.urutan');
  const opd = q.all(`
    SELECT o.nama, COUNT(d.id) AS n FROM opd o LEFT JOIN dip d ON d.opd_id=o.id
    GROUP BY o.id HAVING n > 0 ORDER BY n DESC LIMIT 10`);
  const harian = q.all('SELECT tanggal, halaman, pemohon FROM statistik_kunjungan ORDER BY tanggal DESC LIMIT 30').reverse();
  const rata = q.get(`
    SELECT ROUND(AVG((julianday(diselesaikan)-julianday(dibuat))*24),1) AS jam
    FROM permohonan WHERE diselesaikan IS NOT NULL`).jam || 0;

  res.render('pages/statistik', {
    judul: 'Statistik Layanan',
    total: q.get('SELECT COUNT(*) AS n FROM permohonan').n,
    selesai: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status='Selesai'").n,
    ditolak: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status='Ditolak'").n,
    proses: q.get("SELECT COUNT(*) AS n FROM permohonan WHERE status IN ('Menunggu Verifikasi','Diverifikasi','Sedang Diproses','Perlu Kelengkapan')").n,
    keberatan: q.get('SELECT COUNT(*) AS n FROM keberatan').n,
    rataJam: rata,
    bulan, status, kategori, pemohon, dipPerKat, opd, harian,
    survei: q.get('SELECT ROUND(AVG(mutu),2) AS mutu, ROUND(AVG(kecepatan),2) AS kecepatan, ROUND(AVG(kemudahan),2) AS kemudahan, COUNT(*) AS n FROM survei'),
  });
});

/* ======================= SURVEI & KONTAK ======================= */
router.get('/survei-kepuasan', (req, res) => {
  const s = q.get('SELECT ROUND(AVG(mutu),2) AS mutu, ROUND(AVG(kecepatan),2) AS kecepatan, ROUND(AVG(kemudahan),2) AS kemudahan, COUNT(*) AS n FROM survei');
  res.render('pages/survei', { judul: 'Survei Kepuasan Layanan', s,
    tanggapan: q.all('SELECT layanan,mutu,kecepatan,kemudahan,tanggapan,dibuat FROM survei WHERE tanggapan IS NOT NULL ORDER BY id DESC LIMIT 6') });
});

router.get('/kontak', (req, res) => {
  res.render('pages/kontak', { judul: 'Kontak & Kanal Layanan' });
});

/* ======================= PENCARIAN GLOBAL ======================= */
router.get('/cari', (req, res) => {
  const qstr = (req.query.q || '').trim();
  let hasil = { dip: [], berita: [], halaman: [], regulasi: [], video: [], infografis: [], opd: [], faq: [] };
  if (qstr.length > 1) {
    const like = `%${qstr}%`;
    hasil.dip = q.all(`SELECT d.id, d.ringkas_informasi, d.rincian, k.nama AS kategori_nama, k.slug AS kategori_slug
      FROM dip d JOIN kategori_dip k ON k.id=d.kategori_id
      WHERE d.ringkas_informasi LIKE ? OR d.rincian LIKE ? ORDER BY d.id DESC LIMIT 20`, [like, like]);
    hasil.berita = q.all('SELECT slug,judul,ringkasan,dibuat FROM berita WHERE terbit=1 AND (judul LIKE ? OR ringkasan LIKE ? OR isi LIKE ?) ORDER BY dibuat DESC LIMIT 15', [like, like, like]);
    hasil.halaman = q.all('SELECT slug,judul,subjudul FROM halaman WHERE tampil=1 AND (judul LIKE ? OR isi LIKE ?) LIMIT 10', [like, like]);
    hasil.regulasi = q.all('SELECT id,judul,nomor,jenis,tahun FROM regulasi WHERE judul LIKE ? OR nomor LIKE ? LIMIT 10', [like, like]);
    hasil.video = q.all('SELECT id,judul,keterangan,kelompok FROM video WHERE judul LIKE ? OR keterangan LIKE ? LIMIT 10', [like, like]);
    hasil.infografis = q.all('SELECT id,judul,keterangan FROM infografis WHERE judul LIKE ? OR keterangan LIKE ? LIMIT 10', [like, like]);
    hasil.opd = q.all('SELECT id,nama,singkatan,jenis FROM opd WHERE aktif=1 AND (nama LIKE ? OR singkatan LIKE ?) LIMIT 10', [like, like]);
    hasil.faq = q.all('SELECT id,pertanyaan,jawaban FROM faq WHERE pertanyaan LIKE ? OR jawaban LIKE ? LIMIT 10', [like, like]);
  }
  const total = Object.values(hasil).reduce((a, b) => a + b.length, 0);
  res.render('pages/cari', { judul: qstr ? `Hasil pencarian: ${qstr}` : 'Pencarian', hasil, qstr, total });
});

module.exports = router;
