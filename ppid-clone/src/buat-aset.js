'use strict';

/**
 * Pembuat aset visual pengganti (digambar sebagai SVG asli oleh skrip ini).
 * Tidak menyalin gambar/logo dari situs aslinya.
 * Jalankan: node src/buat-aset.js
 */

const fs = require('fs');
const path = require('path');

const IMG = path.join(__dirname, '..', 'public', 'img');
const DIRS = [IMG, path.join(IMG, 'sampul'), path.join(IMG, 'infografis'), path.join(IMG, 'ikon')];
DIRS.forEach((d) => fs.mkdirSync(d, { recursive: true }));

const tulis = (rel, isi) => fs.writeFileSync(path.join(IMG, rel), isi.trim() + '\n');

/* ---------- favicon ---------- */
tulis('favicon.svg', `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#0a0f1a"/>
  <circle cx="32" cy="32" r="23" fill="none" stroke="#ffb43d" stroke-width="3"/>
  <path d="M32 15l12 5v10c0 8-5 14-12 16-7-2-12-8-12-16V20z" fill="none" stroke="#ff8a3d" stroke-width="3" stroke-linejoin="round"/>
  <path d="M26 32h12M32 26v12" stroke="#ffb43d" stroke-width="3" stroke-linecap="round"/>
</svg>`);

/* ---------- sampul berita generatif ---------- */
const palet = [
  ['#1d3a63', '#0b1424', '#ffb43d'],
  ['#4a2f6b', '#161026', '#54d3ff'],
  ['#14463f', '#0b1a20', '#45e0a0'],
  ['#5b3a12', '#1d1308', '#ffd166'],
  ['#2b3f6b', '#0d1526', '#ff8a3d'],
  ['#3d2b56', '#141024', '#ffb43d'],
];

function sampul(i, judul = 'Portal Informasi Publik') {
  const [c1, c2, ak] = palet[i % palet.length];
  const bars = Array.from({ length: 7 }, (_, k) => {
    const h = 12 + ((i * 17 + k * 29) % 60);
    return `<rect x="${30 + k * 22}" y="${150 - h}" width="13" height="${h}" rx="3" fill="${ak}" opacity="${0.35 + (k % 3) * 0.2}"/>`;
  }).join('');
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" role="img" aria-label="${judul}">
  <defs>
    <linearGradient id="g${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="p${i}" width="18" height="18" patternUnits="userSpaceOnUse">
      <path d="M18 0H0v18" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="320" height="180" fill="url(#g${i})"/>
  <rect width="320" height="180" fill="url(#p${i})"/>
  <circle cx="${250 - i * 9}" cy="46" r="34" fill="${ak}" opacity=".18"/>
  <g opacity=".9">
    <rect x="24" y="26" width="52" height="6" rx="3" fill="${ak}" opacity=".8"/>
    <rect x="24" y="40" width="34" height="6" rx="3" fill="#fff" opacity=".35"/>
  </g>
  ${bars}
  <rect x="0" y="158" width="320" height="22" fill="rgba(0,0,0,.35)"/>
  <text x="14" y="173" font-family="Segoe UI,Arial" font-size="10" fill="rgba(255,255,255,.75)" letter-spacing="1.6">PPID · KETERBUKAAN INFORMASI</text>
</svg>`;
}

for (let i = 1; i <= 8; i++) tulis(`sampul/news-${i}.svg`, sampul(i));
tulis('sampul/polos.svg', sampul(0, 'Sampul'));

/* ---------- infografis generatif ---------- */
function infografis(i, judul) {
  const [c1, c2, ak] = palet[(i + 2) % palet.length];
  const batang = Array.from({ length: 5 }, (_, k) => {
    const h = 30 + ((i * 23 + k * 41) % 110);
    return `<rect x="${70 + k * 88}" y="${330 - h}" width="46" height="${h}" rx="6" fill="${ak}" opacity="${0.4 + k * 0.12}"/>
            <text x="${93 + k * 88}" y="${352}" text-anchor="middle" font-family="Segoe UI,Arial" font-size="13" fill="rgba(255,255,255,.6)">${2022 + k}</text>`;
  }).join('');
  const donat = `
    <circle cx="470" cy="150" r="62" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="22"/>
    <circle cx="470" cy="150" r="62" fill="none" stroke="${ak}" stroke-width="22"
      stroke-dasharray="${120 + i * 30} 400" stroke-linecap="round" transform="rotate(-90 470 150)"/>
    <text x="470" y="156" text-anchor="middle" font-family="Segoe UI,Arial" font-size="20" font-weight="700" fill="#fff">${40 + i * 7}%</text>`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" role="img" aria-label="${judul}">
  <defs>
    <linearGradient id="ig${i}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="400" fill="url(#ig${i})"/>
  <g opacity=".25">
    ${Array.from({ length: 12 }, (_, k) => `<line x1="${k * 50}" y1="0" x2="${k * 50}" y2="400" stroke="#fff" stroke-width=".6"/>`).join('')}
  </g>
  <rect x="28" y="26" width="6" height="46" rx="3" fill="${ak}"/>
  <text x="48" y="48" font-family="Segoe UI,Arial" font-size="21" font-weight="700" fill="#fff">${judul.slice(0, 34)}</text>
  <text x="48" y="70" font-family="Segoe UI,Arial" font-size="13" fill="rgba(255,255,255,.7)">Infografis contoh · portal klon cadangan</text>
  ${donat}
  <line x1="40" y1="330" x2="560" y2="330" stroke="rgba(255,255,255,.3)" stroke-width="1.4"/>
  ${batang}
  <text x="40" y="384" font-family="Segoe UI,Arial" font-size="11" fill="rgba(255,255,255,.55)">Sumber: data contoh untuk keperluan tampilan klon — CloneForBackup</text>
</svg>`;
}

const judulInfografis = [
  'Alur Permohonan Informasi',
  'Kategori Informasi Publik',
  'Rekapitulasi Permohonan',
  'Hak dan Kewajiban Pemohon',
  'Prosedur Keberatan',
  'Standar Waktu Pelayanan',
];
judulInfografis.forEach((j, i) => tulis(`infografis/infografis-${i + 1}.svg`, infografis(i + 1, j)));

/* ---------- ikon kategori DIP ---------- */
const ikon = {
  berkala: `<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="3"/><path d="M32 20v12l9 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  setiapsaat: `<rect x="12" y="12" width="40" height="40" rx="7" fill="none" stroke="currentColor" stroke-width="3"/><path d="M21 25h22M21 34h22M21 43h12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>`,
  sertamerta: `<path d="M36 8L14 38h14l-3 18 21-30H33z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`,
  dikecualikan: `<rect x="14" y="28" width="36" height="26" rx="6" fill="none" stroke="currentColor" stroke-width="3"/><path d="M23 28v-8a9 9 0 0118 0v8" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="32" cy="41" r="3.4" fill="currentColor"/>`,
};
Object.entries(ikon).forEach(([nama, isi]) =>
  tulis(`ikon/${nama}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="color:#ffb43d">${isi}</svg>`)
);

console.log('[aset] Selesai — favicon, 9 sampul berita, 6 infografis, 4 ikon kategori.');
