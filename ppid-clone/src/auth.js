'use strict';

const crypto = require('crypto');
const { q, getSetting } = require('./db');
const { tokenAcak } = require('./util');

const COOKIE = 'ppid_session';

const hashPassword = (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
};

const verifyPassword = (password, stored = '') => {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'));
  } catch {
    return false;
  }
};

const parseCookies = (header = '') => {
  const out = {};
  header.split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > -1) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
};

const buatSesi = (userId, res, hari = 1) => {
  const token = tokenAcak(24);
  const exp = new Date(Date.now() + hari * 864e5).toISOString().slice(0, 19).replace('T', ' ');
  q.run('INSERT INTO sessions(token,user_id,kedaluwarsa) VALUES(?,?,?)', [token, userId, exp]);
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${hari * 86400}`);
  return token;
};

const hapusSesi = (token, res) => {
  if (token) q.run('DELETE FROM sessions WHERE token = ?', [token]);
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Max-Age=0`);
};

const userDariToken = (token) => {
  if (!token) return null;
  const row = q.get(
    `SELECT u.*, s.kedaluwarsa FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ? AND u.aktif = 1 AND s.kedaluwarsa > datetime('now')`,
    [token]
  );
  return row || null;
};

/** Pasang res.locals.user + res.locals.csrf untuk semua request. */
const muatSesi = (req, res, next) => {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies[COOKIE];
  req.cookies = cookies;
  req.token = token;
  res.locals.user = userDariToken(token);
  res.locals.csrf = cookies.ppid_csrf || '';
  if (!res.locals.csrf) {
    const c = tokenAcak(8);
    res.setHeader('Set-Cookie', `ppid_csrf=${c}; Path=/; SameSite=Lax`);
    res.locals.csrf = c;
  }
  res.locals.siteName = getSetting('site_name', 'PPID Kota Surakarta');
  res.locals.brandSuffix = getSetting('brand_suffix', 'CloneForBackup');
  next();
};

const wajibLogin = (req, res, next) => {
  if (res.locals.user) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ ok: false, pesan: 'Sesi berakhir, silakan masuk kembali.' });
  return res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
};

const wajibAdmin = (req, res, next) => {
  if (res.locals.user && res.locals.user.role === 'admin') return next();
  if (req.path.startsWith('/api/')) return res.status(403).json({ ok: false, pesan: 'Butuh hak akses admin.' });
  return res.status(403).render('pages/error', {
    judul: '403 — Akses Ditolak',
    kode: 403,
    pesan: 'Halaman ini hanya untuk administrator.',
    tautan: '/admin',
    labelTautan: 'Kembali ke Dasbor',
  });
};

const sahkanCsrf = (req, res, next) => {
  const dikirim = req.body?.csrf || req.headers['x-csrf-token'] || req.query.csrf;
  if (!dikirim || dikirim !== res.locals.csrf) {
    const pesan = 'Token keamanan tidak cocok. Muat ulang halaman lalu coba lagi.';
    if (req.path.startsWith('/api/')) return res.status(419).json({ ok: false, pesan });
    return res.status(419).render('pages/error', { judul: '419', kode: 419, pesan, tautan: 'javascript:history.back()', labelTautan: 'Kembali' });
  }
  next();
};

/** req.res selalu tersedia di Express; dipakai untuk membaca user sesi berjalan. */
const catatAudit = (req, aksi, target = '') => {
  const user = req.res && req.res.locals ? req.res.locals.user : null;
  q.run('INSERT INTO audit_log(aktor,aksi,target,ip) VALUES(?,?,?,?)', [
    user ? user.username : 'publik', aksi, String(target).slice(0, 200), req.ip || '-',
  ]);
};

module.exports = {
  COOKIE, hashPassword, verifyPassword, parseCookies, buatSesi, hapusSesi,
  userDariToken, muatSesi, wajibLogin, wajibAdmin, sahkanCsrf, catatAudit,
};
