'use strict';

const crypto = require('crypto');

const BULAN_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const slugify = (s = '') =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

const uniqueSlug = (q, table, base, id = null) => {
  let slug = slugify(base) || 'item';
  let n = 2;
  const exists = (s) => {
    const row = id
      ? q.get(`SELECT id FROM ${table} WHERE slug = ? AND id <> ?`, [s, id])
      : q.get(`SELECT id FROM ${table} WHERE slug = ?`, [s]);
    return !!row;
  };
  while (exists(slug)) slug = `${slugify(base)}-${n++}`;
  return slug;
};

/** 2026-10-16 03:11:00 -> 16 Oktober 2026 */
const tanggalID = (iso) => {
  if (!iso) return '-';
  const s = String(iso).replace('T', ' ');
  const [d, t] = s.split(' ');
  const [y, m, day] = d.split('-');
  const jam = t ? t.slice(0, 8) : '';
  const out = `${parseInt(day, 10)} ${BULAN_ID[parseInt(m, 10) - 1]} ${y}`;
  return jam ? `${out}, ${jam} WIB` : out;
};

const tanggalPendek = (iso) => {
  if (!iso) return '-';
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

const waktuRelatif = (iso) => {
  if (!iso) return '-';
  const t = new Date(String(iso).replace(' ', 'T') + 'Z').getTime();
  const diff = (Date.now() - t) / 1000;
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} hari lalu`;
  return tanggalPendek(iso);
};

const escapeHtml = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Sanitasi ringan untuk isi HTML dari editor admin. */
const bersihkanHtml = (html = '') =>
  String(html)
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*iframe[\s\S]*?<\s*\/\s*iframe\s*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '');

const toCsv = (rows, kolom) => {
  const esc = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = kolom.map((k) => esc(k.label || k.key)).join(';');
  const body = rows.map((r) => kolom.map((k) => esc(r[k.key])).join(';')).join('\n');
  return `\uFEFF${head}\n${body}`;
};

const nomorTiket = (prefix, q, table) => {
  const tahun = new Date().getFullYear();
  const last = q.get(
    `SELECT nomor_tiket AS t FROM ${table} WHERE nomor_tiket LIKE ? ORDER BY id DESC LIMIT 1`,
    [`${prefix}-${tahun}-%`]
  );
  let urut = 1;
  if (last && last.t) {
    const n = parseInt(String(last.t).split('-').pop(), 10);
    if (!Number.isNaN(n)) urut = n + 1;
  }
  return `${prefix}-${tahun}-${String(urut).padStart(5, '0')}`;
};

const tokenAcak = (n = 32) => crypto.randomBytes(n).toString('hex');

const paginasi = (total, halaman, perHalaman) => {
  const totalHal = Math.max(1, Math.ceil(total / perHalaman));
  halaman = Math.min(Math.max(1, halaman || 1), totalHal);
  const awal = Math.max(1, halaman - 2);
  const akhir = Math.min(totalHal, awal + 4);
  const items = [];
  for (let i = awal; i <= akhir; i++) items.push(i);
  return { total, totalHal, halaman, perHalaman, items, awal, akhir, offset: (halaman - 1) * perHalaman };
};

const formatAngka = (n) => new Intl.NumberFormat('id-ID').format(Number(n || 0));

const STATUS_PERMOHONAN = [
  'Menunggu Verifikasi',
  'Diverifikasi',
  'Sedang Diproses',
  'Perlu Kelengkapan',
  'Ditolak',
  'Selesai',
];

const WARNA_STATUS = {
  'Menunggu Verifikasi': 'warn',
  Diverifikasi: 'info',
  'Sedang Diproses': 'info',
  'Perlu Kelengkapan': 'warn',
  Ditolak: 'danger',
  Selesai: 'ok',
  'Menunggu Telaah': 'warn',
  'Sedang Ditelaah': 'info',
  Ditanggapi: 'ok',
  'Diteruskan ke Atasan PPID': 'info',
};

const JENIS_PEMOHON = ['Perorangan', 'Badan Hukum', 'Kelompok Masyarakat', 'Badan Publik Lain', 'Peneliti/Mahasiswa'];
const CARA_PEROLEH = [
  'Surat Elektronik (Email)',
  'Diambil Langsung di Kantor PPID',
  'Dikirim Melalui Pos/Kurir',
  'Diunduh dari Website',
];
const KATEGORI_INFO_PUBLIK = [
  'Informasi Berkala',
  'Informasi Setiap Saat',
  'Informasi Serta Merta',
  'Informasi Dikecualikan',
];

module.exports = {
  BULAN_ID, slugify, uniqueSlug, tanggalID, tanggalPendek, waktuRelatif, escapeHtml,
  bersihkanHtml, toCsv, nomorTiket, tokenAcak, paginasi, formatAngka,
  STATUS_PERMOHONAN, WARNA_STATUS, JENIS_PEMOHON, CARA_PEROLEH, KATEGORI_INFO_PUBLIK,
};
