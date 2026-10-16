/* =========================================================================
   Grafik kanvas tanpa dependensi — membaca warna dari variabel tema
   ========================================================================= */
(function () {
  'use strict';

  const css = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const tema = () => ({
    teks: css('--teks-redup') || '#a7b3c6',
    garis: css('--garis') || '#22304a',
    aksen: css('--aksen') || '#ffb43d',
    aksen2: css('--aksen-2') || '#ff8a3d',
    info: css('--info') || '#54d3ff',
    ok: css('--ok') || '#45e0a0',
    warn: css('--warn') || '#ffd166',
    danger: css('--danger') || '#ff6b7d',
    panel: css('--panel') || '#111a28',
  });

  function siap(canvas) {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, r.width * dpr);
    canvas.height = Math.max(1, r.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, r.width, r.height);
    return { ctx, w: r.width, h: r.height };
  }

  function garisBatang(ctx, w, h, t, nilaiMax, langkah = 4) {
    ctx.strokeStyle = t.garis;
    ctx.fillStyle = t.teks;
    ctx.font = '11px Segoe UI, Arial';
    ctx.lineWidth = 1;
    for (let i = 0; i <= langkah; i++) {
      const y = h - (h - 26) * (i / langkah) - 6;
      ctx.globalAlpha = .45;
      ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(w - 6, y); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillText(String(Math.round((nilaiMax * i) / langkah) || 0), 4, y + 4);
    }
  }

  const registry = [];

  function garis(canvas, data) {
    // data: [{label, nilai}]
    const { ctx, w, h } = siap(canvas);
    const t = tema();
    if (!data.length) return;
    const max = Math.max(...data.map((d) => d.nilai)) * 1.15 || 1;
    garisBatang(ctx, w, h, t, max);
    const langkahX = (w - 46) / Math.max(1, data.length - 1);
    const titik = data.map((d, i) => [38 + i * langkahX, h - 12 - ((h - 34) * d.nilai) / max]);

    // area
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, t.aksen + '55');
    g.addColorStop(1, t.aksen + '00');
    ctx.beginPath();
    ctx.moveTo(titik[0][0], h - 12);
    titik.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(titik[titik.length - 1][0], h - 12);
    ctx.closePath(); ctx.fillStyle = g; ctx.fill();

    // garis
    ctx.beginPath();
    ctx.lineWidth = 2.2; ctx.strokeStyle = t.aksen; ctx.lineJoin = 'round';
    titik.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.stroke();

    titik.forEach((p, i) => {
      ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
      ctx.fillStyle = t.aksen2; ctx.fill();
      if (data.length <= 14 || i % 2 === 0) {
        ctx.fillStyle = t.teks; ctx.font = '10px Segoe UI, Arial'; ctx.textAlign = 'center';
        ctx.fillText(String(data[i].label).slice(-5), p[0], h - 1);
      }
    });
    ctx.textAlign = 'left';
  }

  function batang(canvas, data, opts = {}) {
    const { ctx, w, h } = siap(canvas);
    const t = tema();
    if (!data.length) return;
    const max = Math.max(...data.map((d) => d.nilai)) * 1.15 || 1;
    garisBatang(ctx, w, h, t, max);
    const lebar = Math.min(38, (w - 46) / data.length - 8);
    data.forEach((d, i) => {
      const x = 38 + i * ((w - 46) / data.length) + ((w - 46) / data.length - lebar) / 2;
      const tinggi = ((h - 34) * d.nilai) / max;
      const y = h - 12 - tinggi;
      const grad = ctx.createLinearGradient(0, y, 0, h - 12);
      grad.addColorStop(0, opts.warna || t.aksen);
      grad.addColorStop(1, t.aksen2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      const r = Math.min(5, lebar / 2);
      ctx.moveTo(x, h - 12); ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y); ctx.lineTo(x + lebar - r, y);
      ctx.quadraticCurveTo(x + lebar, y, x + lebar, y + r); ctx.lineTo(x + lebar, h - 12);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = t.teks; ctx.font = '11px Segoe UI, Arial'; ctx.textAlign = 'center';
      ctx.fillText(String(d.nilai), x + lebar / 2, y - 5);
      ctx.font = '10px Segoe UI, Arial';
      ctx.fillText(String(d.label).slice(0, 8), x + lebar / 2, h - 1);
    });
    ctx.textAlign = 'left';
  }

  function donat(canvas, data) {
    const { ctx, w, h } = siap(canvas);
    const t = tema();
    const total = data.reduce((a, b) => a + b.nilai, 0) || 1;
    const cx = h + 8, cy = h / 2, R = Math.min(h / 2 - 6, 70), r = R * 0.6;
    const warna = [t.aksen, t.info, t.ok, t.warn, t.danger, t.aksen2];
    let mulai = -Math.PI / 2;
    data.forEach((d, i) => {
      const sudut = (d.nilai / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, mulai, mulai + sudut);
      ctx.arc(cx, cy, r, mulai + sudut, mulai, true);
      ctx.closePath();
      ctx.fillStyle = warna[i % warna.length];
      ctx.fill();
      mulai += sudut;
    });
    ctx.fillStyle = t.teks; ctx.font = '700 18px Segoe UI, Arial'; ctx.textAlign = 'center';
    ctx.fillText(String(total), cx, cy + 2);
    ctx.font = '10px Segoe UI, Arial';
    ctx.fillText('total', cx, cy + 16);

    ctx.textAlign = 'left'; ctx.font = '11px Segoe UI, Arial';
    let y = cy - (data.length * 16) / 2 + 8;
    data.forEach((d, i) => {
      ctx.fillStyle = warna[i % warna.length];
      ctx.fillRect(2 * h + 14, y - 8, 9, 9);
      ctx.fillStyle = t.teks;
      ctx.fillText(`${d.label} (${d.nilai})`, 2 * h + 28, y);
      y += 16;
    });
  }

  function gambarSemua() {
    registry.forEach(({ el, tipe, data, opsi }) => {
      try {
        if (tipe === 'garis') garis(el, data);
        else if (tipe === 'batang') batang(el, data, opsi);
        else if (tipe === 'donat') donat(el, data);
      } catch (e) { /* canvas kosong */ }
    });
  }

  function daftar(el) {
    if (!el) return;
    let data = [];
    try { data = JSON.parse(el.dataset.data || '[]'); } catch { data = []; }
    registry.push({ el, tipe: el.dataset.tipe || 'garis', data, opsi: { warna: el.dataset.warna ? css(el.dataset.warna) : null } });
  }

  function mulai() {
    registry.length = 0;
    document.querySelectorAll('canvas[data-tipe]').forEach(daftar);
    gambarSemua();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mulai);
  else mulai();

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(gambarSemua, 180); });

  window.PPIDGrafik = { gambarUlang: gambarSemua, mulai };
})();
