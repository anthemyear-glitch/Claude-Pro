/**
 * Lapisan basis data — memakai `node:sqlite` bawaan Node 22 (tanpa dependensi native).
 * Berkas DB disimpan di ./data/ppid-clone.db
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = process.env.PPID_DB || path.join(DATA_DIR, 'ppid-clone.db');
const db = new DatabaseSync(DB_FILE);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  username   TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,          -- scrypt hash
  nama       TEXT NOT NULL,
  email      TEXT,
  role       TEXT NOT NULL DEFAULT 'petugas',  -- admin | petugas
  aktif      INTEGER NOT NULL DEFAULT 1,
  dibuat     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dibuat     TEXT NOT NULL DEFAULT (datetime('now')),
  kedaluwarsa TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  waktu    TEXT NOT NULL DEFAULT (datetime('now')),
  aktor    TEXT,
  aksi     TEXT NOT NULL,
  target   TEXT,
  ip       TEXT
);

-- ===== Konten publik =====
CREATE TABLE IF NOT EXISTS kategori_dip (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT UNIQUE NOT NULL,
  nama     TEXT NOT NULL,
  deskripsi TEXT,
  ikon     TEXT,
  urutan   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS opd (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nama     TEXT NOT NULL,
  singkatan TEXT,
  jenis    TEXT,
  alamat   TEXT,
  telepon  TEXT,
  email    TEXT,
  website  TEXT,
  nama_ppid TEXT,
  jabatan_ppid TEXT,
  aktif    INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS dip (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori_id   INTEGER NOT NULL REFERENCES kategori_dip(id) ON DELETE CASCADE,
  opd_id        INTEGER REFERENCES opd(id) ON DELETE SET NULL,
  ringkas_informasi TEXT NOT NULL,
  rincian       TEXT,
  jenis         TEXT DEFAULT 'Dokumen',     -- Dokumen | Data | Grafik | Video
  format        TEXT DEFAULT 'PDF',
  sarana       TEXT DEFAULT 'Website',
  tahun         INTEGER,
  jangka_waktu  TEXT,
  periode_penerbitan TEXT,
  berkala       INTEGER DEFAULT 1,
  unduhan       INTEGER NOT NULL DEFAULT 0,
  dilihat       INTEGER NOT NULL DEFAULT 0,
  berkas        TEXT,
  ukuran        TEXT,
  dibuat        TEXT NOT NULL DEFAULT (datetime('now')),
  diperbarui    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS halaman (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT UNIQUE NOT NULL,
  judul    TEXT NOT NULL,
  subjudul TEXT,
  isi      TEXT NOT NULL,          -- HTML
  ikon     TEXT,
  kelompok TEXT DEFAULT 'layanan', -- layanan | profil | lainnya
  urutan   INTEGER DEFAULT 0,
  tampil   INTEGER DEFAULT 1,
  diperbarui TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS berita (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  slug     TEXT UNIQUE NOT NULL,
  judul    TEXT NOT NULL,
  ringkasan TEXT,
  isi      TEXT NOT NULL,
  penulis  TEXT DEFAULT 'Admin PPID',
  kategori TEXT DEFAULT 'Kegiatan',
  sampul   TEXT,
  dilihat  INTEGER NOT NULL DEFAULT 0,
  terbit   INTEGER NOT NULL DEFAULT 1,
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS regulasi (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  judul    TEXT NOT NULL,
  nomor    TEXT,
  jenis    TEXT DEFAULT 'Peraturan',
  tahun    INTEGER,
  penerbit TEXT,
  berkas   TEXT,
  ukuran   TEXT,
  unduhan  INTEGER NOT NULL DEFAULT 0,
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS video (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  judul    TEXT NOT NULL,
  keterangan TEXT,
  kelompok TEXT DEFAULT 'informasi', -- layanan | informasi
  tautan   TEXT,
  durasi   TEXT,
  dilihat  INTEGER NOT NULL DEFAULT 0,
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS infografis (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  judul    TEXT NOT NULL,
  keterangan TEXT,
  berkas   TEXT,
  kategori TEXT DEFAULT 'Infografis',
  tahun    INTEGER,
  unduhan  INTEGER NOT NULL DEFAULT 0,
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS slider (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  judul    TEXT,
  subjudul TEXT,
  tautan   TEXT,
  berkas   TEXT,
  urutan   INTEGER DEFAULT 0,
  aktif    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS faq (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  pertanyaan TEXT NOT NULL,
  jawaban  TEXT NOT NULL,
  kelompok TEXT DEFAULT 'Umum',
  urutan   INTEGER DEFAULT 0
);

-- ===== Layanan permohonan =====
CREATE TABLE IF NOT EXISTS permohonan (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_tiket   TEXT UNIQUE NOT NULL,
  nama          TEXT NOT NULL,
  nik           TEXT,
  pekerjaan     TEXT,
  alamat        TEXT,
  email         TEXT NOT NULL,
  telepon       TEXT NOT NULL,
  jenis_pemohon TEXT NOT NULL DEFAULT 'Perorangan',
  nama_badan    TEXT,
  kategori_info TEXT NOT NULL,
  rincian_info  TEXT NOT NULL,
  tujuan        TEXT,
  cara_peroleh  TEXT DEFAULT 'Surat Elektronik (Email)',
  cara_kirim    TEXT DEFAULT 'Email',
  berkas_identitas TEXT,
  status        TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
  catatan_petugas TEXT,
  jawaban       TEXT,
  berkas_jawaban TEXT,
  petugas_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  dip_id        INTEGER REFERENCES dip(id) ON DELETE SET NULL,
  dibuat        TEXT NOT NULL DEFAULT (datetime('now')),
  diverifikasi  TEXT,
  dijawab       TEXT,
  diselesaikan  TEXT,
  puas          INTEGER
);

CREATE TABLE IF NOT EXISTS riwayat_permohonan (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  permohonan_id INTEGER NOT NULL REFERENCES permohonan(id) ON DELETE CASCADE,
  waktu         TEXT NOT NULL DEFAULT (datetime('now')),
  status        TEXT NOT NULL,
  keterangan    TEXT,
  aktor         TEXT DEFAULT 'sistem'
);

CREATE TABLE IF NOT EXISTS keberatan (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor_tiket   TEXT UNIQUE NOT NULL,
  permohonan_id INTEGER REFERENCES permohonan(id) ON DELETE SET NULL,
  nama          TEXT NOT NULL,
  email         TEXT NOT NULL,
  telepon       TEXT,
  alamat        TEXT,
  alasan        TEXT NOT NULL,
  uraian        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'Menunggu Telaah',
  tanggapan     TEXT,
  dibuat        TEXT NOT NULL DEFAULT (datetime('now')),
  dijawab       TEXT
);

CREATE TABLE IF NOT EXISTS survei (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nama     TEXT,
  email    TEXT,
  layanan  TEXT,
  mutu     INTEGER NOT NULL,     -- 1..5
  kecepatan INTEGER NOT NULL,
  kemudahan INTEGER NOT NULL,
  tanggapan TEXT,
  saran    TEXT,
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pesan_kontak (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  nama     TEXT NOT NULL,
  email    TEXT NOT NULL,
  subjek   TEXT NOT NULL,
  pesan    TEXT NOT NULL,
  dibaca   INTEGER DEFAULT 0,
  dibuat   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS statistik_kunjungan (
  tanggal  TEXT PRIMARY KEY,
  halaman  INTEGER DEFAULT 0,
  pemohon  INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_dip_kategori ON dip(kategori_id);
CREATE INDEX IF NOT EXISTS idx_dip_opd ON dip(opd_id);
CREATE INDEX IF NOT EXISTS idx_permohonan_status ON permohonan(status);
CREATE INDEX IF NOT EXISTS idx_berita_slug ON berita(slug);
`;

db.exec(SCHEMA);

/* ---------- pembantu query ---------- */
const q = {
  all: (sql, params = []) => db.prepare(sql).all(...params),
  get: (sql, params = []) => db.prepare(sql).get(...params),
  run: (sql, params = []) => db.prepare(sql).run(...params),
  insert: (sql, params = []) => db.prepare(sql).run(...params).lastInsertRowid,
  tx: (fn) => {
    db.exec('BEGIN');
    try {
      const r = fn();
      db.exec('COMMIT');
      return r;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  },
};

const getSetting = (key, fallback = '') => (q.get('SELECT value FROM settings WHERE key = ?', [key]) || {}).value ?? fallback;
const setSetting = (key, value) =>
  q.run('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', [key, String(value)]);

const bumpVisit = (pemohon = 0) => {
  const tgl = new Date().toISOString().slice(0, 10);
  q.run(
    `INSERT INTO statistik_kunjungan(tanggal,halaman,pemohon) VALUES(?,1,?)
     ON CONFLICT(tanggal) DO UPDATE SET halaman = halaman + 1, pemohon = pemohon + excluded.pemohon`,
    [tgl, pemohon]
  );
};

module.exports = { db, q, getSetting, setSetting, bumpVisit, DB_FILE };
