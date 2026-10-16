/* =========================================================================
   Skrip sisi klien — portal publik PPID (klon cadangan)
   Tanpa dependensi eksternal.
   ========================================================================= */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';

  /* ---------- jam & tanggal WIB ---------- */
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  function perbaruiJam() {
    const now = new Date();
    // WIB = UTC+7
    const wib = new Date(now.getTime() + (now.getTimezoneOffset() + 420) * 60000);
    const el = $('#jam-wib');
    if (el) el.textContent = wib.toTimeString().slice(0, 8) + ' WIB';
    const tgl = $('#tanggal-wib');
    if (tgl) tgl.textContent = `${HARI[wib.getDay()]}, ${wib.getDate()} ${BULAN[wib.getMonth()]} ${wib.getFullYear()}`;
    const hari = $('#tanggal-hari');
    if (hari) hari.textContent = `${wib.getDate().toString().padStart(2, '0')}-${(wib.getMonth() + 1).toString().padStart(2, '0')}-${wib.getFullYear()}`;
  }
  perbaruiJam();
  setInterval(perbaruiJam, 1000);

  /* ---------- bilah alamat: tampilkan jalur + akhiran klon ---------- */
  (function alamatBar() {
    const el = $('#alamat-jalur');
    if (!el) return;
    const jalur = location.pathname === '/' ? '' : location.pathname;
    el.textContent = jalur;
    const foot = $('#alamat-klon-footer');
    if (foot) foot.textContent = `https://ppid.surakarta.go.id${jalur}/${'CloneForBackup'}`;
  })();

  /* ---------- saklar tema (Negative ⇄ Positive) ---------- */
  (function tema() {
    const tombol = $('#saklar-tema');
    if (!tombol) return;
    const terapkan = (t) => {
      document.documentElement.setAttribute('data-tema', t);
      localStorage.setItem('ppid-tema', t);
      const use = tombol.querySelector('use');
      const label = tombol.querySelector('span');
      if (use) use.setAttribute('href', t === 'negative' ? '#i-gelap' : '#i-terang');
      if (label) label.textContent = t === 'negative' ? 'Negative' : 'Positive';
    };
    terapkan(localStorage.getItem('ppid-tema') || document.documentElement.getAttribute('data-tema') || 'negative');
    tombol.addEventListener('click', () => {
      terapkan(document.documentElement.getAttribute('data-tema') === 'negative' ? 'positive' : 'negative');
      if (window.PPIDGrafik) window.PPIDGrafik.gambarUlang();
    });
  })();

  /* ---------- menu mobile ---------- */
  const tombolMenu = $('#tombol-menu');
  if (tombolMenu) tombolMenu.addEventListener('click', () => $('#menu-utama')?.classList.toggle('buka'));

  /* ---------- slider beranda ---------- */
  $$('.slider').forEach((s) => {
    const trek = $('.trek', s);
    const slide = $$('.slide', s);
    if (!trek || slide.length < 2) return;
    let i = 0;
    let timer;
    const titik = $('.titik', s);
    slide.forEach((_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Slide ${n + 1}`);
      b.addEventListener('click', () => pergi(n, true));
      titik?.appendChild(b);
    });
    function pergi(n, manual) {
      i = (n + slide.length) % slide.length;
      trek.style.transform = `translateX(-${i * 100}%)`;
      $$('button', titik || document).forEach((b, k) => b.classList.toggle('aktif', k === i));
      if (manual) mulai();
    }
    function mulai() { clearInterval(timer); timer = setInterval(() => pergi(i + 1), 6000); }
    $('.nav-slide.prev', s)?.addEventListener('click', () => pergi(i - 1, true));
    $('.nav-slide.next', s)?.addEventListener('click', () => pergi(i + 1, true));
    s.addEventListener('mouseenter', () => clearInterval(timer));
    s.addEventListener('mouseleave', mulai);
    pergi(0);
    mulai();
  });

  /* ---------- akordeon ---------- */
  $$('.akordeon > button').forEach((b) => {
    b.addEventListener('click', () => b.parentElement.classList.toggle('buka'));
  });

  /* ---------- tombol kembali ke atas ---------- */
  $('#ke-atas')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- pencarian cepat (autocomplete) ---------- */
  (function cariCepat() {
    const input = $('#input-cari-nav');
    const kotak = $('#hasil-cepat');
    if (!input || !kotak) return;
    let t;
    input.addEventListener('input', () => {
      clearTimeout(t);
      const q = input.value.trim();
      if (q.length < 2) { kotak.classList.remove('tampil'); kotak.innerHTML = ''; return; }
      t = setTimeout(async () => {
        try {
          const r = await fetch(`/api/cari-cepat?q=${encodeURIComponent(q)}`);
          const j = await r.json();
          if (!j.hasil.length) {
            kotak.innerHTML = `<div style="padding:.8rem;font-size:.84rem" class="samar">Tidak ada hasil untuk “${q}”.</div>`;
          } else {
            kotak.innerHTML = j.hasil.map((h) => `
              <a href="${h.url}" role="option">
                <div class="j">${escapeHtml(h.judul)}</div>
                <div class="s">${escapeHtml(h.jenis)}${h.sub ? ' · ' + escapeHtml(h.sub) : ''}</div>
              </a>`).join('');
          }
          kotak.classList.add('tampil');
        } catch { /* diamkan */ }
      }, 220);
    });
    document.addEventListener('click', (e) => { if (!kotak.contains(e.target) && e.target !== input) kotak.classList.remove('tampil'); });
    input.addEventListener('keydown', (e) => { if (e.key === 'Escape') kotak.classList.remove('tampil'); });
  })();

  function escapeHtml(s = '') {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- pemberitahuan mengambang ---------- */
  function toast(pesan, jenis = 'ok') {
    let w = $('#toast-wadah');
    if (!w) {
      w = document.createElement('div');
      w.id = 'toast-wadah';
      w.style.cssText = 'position:fixed;left:1rem;bottom:1rem;z-index:10001;display:flex;flex-direction:column;gap:.5rem;max-width:min(92vw,420px)';
      document.body.appendChild(w);
    }
    const d = document.createElement('div');
    d.className = `pesan ${jenis}`;
    d.style.cssText += ';margin:0;box-shadow:var(--bayangan);background:var(--panel)';
    d.innerHTML = `<span>${escapeHtml(pesan)}</span>`;
    w.appendChild(d);
    setTimeout(() => { d.style.opacity = '0'; d.style.transition = '.3s'; setTimeout(() => d.remove(), 320); }, 5200);
  }
  window.PPIDToast = toast;

  /* ---------- helper POST JSON ---------- */
  async function kirimJson(url, data) {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf },
      body: JSON.stringify({ ...data, csrf }),
    });
    let j = {};
    try { j = await r.json(); } catch { j = { ok: false, pesan: 'Respons tidak valid.' }; }
    return { status: r.status, ...j };
  }
  window.PPIDKirim = kirimJson;

  /* ---------- formulir permohonan informasi ---------- */
  const formPermohonan = $('#form-permohonan');
  if (formPermohonan) {
    const isiOpsiDip = () => {
      const kat = formPermohonan.querySelector('[name=kategori_info]');
      const dip = formPermohonan.querySelector('[name=dip_id]');
      if (!kat || !dip) return;
      const semua = JSON.parse(dip.dataset.opsi || '[]');
      const slugMap = {
        'Informasi Berkala': 'informasi-berkala',
        'Informasi Setiap Saat': 'informasi-setiap-saat',
        'Informasi Serta Merta': 'informasi-serta-merta',
        'Informasi Dikecualikan': 'informasi-dikecualikan',
      };
      const slug = slugMap[kat.value];
      const opsi = slug ? semua.filter((d) => d.kategori_slug === slug) : [];
      dip.innerHTML = '<option value="">— Pilih entri (opsional) —</option>' +
        opsi.map((d) => `<option value="${d.id}">${escapeHtml(d.ringkas_informasi)}</option>`).join('');
      dip.closest('.field').style.display = opsi.length ? '' : 'none';
    };
    formPermohonan.querySelector('[name=kategori_info]')?.addEventListener('change', isiOpsiDip);
    isiOpsiDip();

    // jenis pemohon -> tampilkan isian badan hukum
    const jenis = formPermohonan.querySelector('[name=jenis_pemohon]');
    const badanField = formPermohonan.querySelector('[name=nama_badan]')?.closest('.field');
    const aturBadan = () => { if (badanField) badanField.style.display = jenis && jenis.value === 'Perorangan' ? 'none' : ''; };
    jenis?.addEventListener('change', aturBadan);
    aturBadan();

    formPermohonan.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tombol = formPermohonan.querySelector('button[type=submit]');
      const fd = new FormData(formPermohonan);
      fd.append('csrf', csrf);
      tombol.disabled = true;
      tombol.dataset.teks = tombol.innerHTML;
      tombol.innerHTML = 'Mengirim…';
      try {
        const r = await fetch('/api/permohonan', { method: 'POST', headers: { 'X-CSRF-Token': csrf }, body: fd });
        const j = await r.json();
        if (!j.ok) throw new Error(j.pesan || 'Permohonan gagal dikirim.');
        const hasil = $('#hasil-permohonan');
        hasil.innerHTML = `
          <div class="pesan ok"><svg width="18" height="18"><use href="#i-sukses"></use></svg>
            <div><strong>Permohonan berhasil dikirim.</strong><br>
            Nomor tiket Anda: <span class="mono tebal" style="font-size:1.05rem">${escapeHtml(j.tiket)}</span><br>
            <span class="kecil">Salinan nomor tiket dikirim ke alamat surel yang dicantumkan. Gunakan nomor ini untuk melacak status permohonan.</span></div>
          </div>
          <div class="fleks">
            <a class="tombol" href="${j.lacak}"><svg width="15" height="15"><use href="#i-lacak"></use></svg> Lacak Status Permohonan</a>
            <button type="button" class="tombol garis" id="permohonan-baru">Ajukan Permohonan Lain</button>
            <a class="tombol halus" href="/daftar-informasi-publik">Jelajahi Daftar Informasi</a>
          </div>`;
        hasil.scrollIntoView({ behavior: 'smooth', block: 'center' });
        formPermohonan.style.display = 'none';
        $('#permohonan-baru').addEventListener('click', () => location.reload());
        toast('Permohonan tercatat dengan nomor tiket ' + j.tiket, 'ok');
      } catch (err) {
        toast(err.message, 'galat');
      } finally {
        tombol.disabled = false;
        tombol.innerHTML = tombol.dataset.teks || 'Kirim Permohonan';
      }
    });
  }

  /* ---------- lacak permohonan ---------- */
  const formLacak = $('#form-lacak');
  if (formLacak) {
    formLacak.addEventListener('submit', async (e) => {
      e.preventDefault();
      const tiket = formLacak.nomor_tiket.value.trim();
      const email = formLacak.email.value.trim();
      const kotak = $('#hasil-lacak');
      if (!tiket || !email) { kotak.innerHTML = '<div class="pesan galat">Nomor tiket dan surel wajib diisi.</div>'; return; }
      kotak.innerHTML = '<div class="pesan info">Memuat status permohonan…</div>';
      const r = await fetch(`/api/permohonan/${encodeURIComponent(tiket)}?email=${encodeURIComponent(email)}`);
      const j = await r.json();
      if (!j.ok) { kotak.innerHTML = `<div class="pesan galat">${escapeHtml(j.pesan || 'Data tidak ditemukan.')}</div>`; return; }
      const d = j.data;
      const warna = { 'Selesai': 'ok', 'Ditolak': 'danger', 'Menunggu Verifikasi': 'warn', 'Perlu Kelengkapan': 'warn' };
      kotak.innerHTML = `
        <div class="panel">
          <div class="kepala">
            <div><h3 style="margin:0">Permohonan ${escapeHtml(d.nomor_tiket)}</h3>
            <span class="kecil samar">Diajukan ${escapeHtml(d.dibuat)} oleh ${escapeHtml(d.nama)}</span></div>
            <span class="lencana ${warna[d.status] || 'info'}">${escapeHtml(d.status)}</span>
          </div>
          <div class="isi-panel">
            <div class="baris grid-2 mb-2">
              <div><span class="kecil samar">Kategori Informasi</span><div class="tebal">${escapeHtml(d.kategori_info)}</div></div>
              <div><span class="kecil samar">Cara Perolehan</span><div class="tebal">${escapeHtml(d.cara_peroleh)}</div></div>
            </div>
            <div class="mb-2"><span class="kecil samar">Rincian Informasi yang Dimohon</span><div>${escapeHtml(d.rincian_info)}</div></div>
            ${d.tujuan ? `<div class="mb-2"><span class="kecil samar">Tujuan Penggunaan</span><div>${escapeHtml(d.tujuan)}</div></div>` : ''}
            ${d.catatan_petugas ? `<div class="note mb-2"><strong>Catatan petugas:</strong> ${escapeHtml(d.catatan_petugas)}</div>` : ''}
            ${d.jawaban ? `<div class="note mb-2"><strong>Jawaban:</strong> ${escapeHtml(d.jawaban)}</div>` : ''}
            ${d.ada_berkas ? `<a class="tombol kecil" href="/api/unduh/jawaban/${encodeURIComponent(d.nomor_tiket)}?email=${encodeURIComponent(email)}"><svg width="14" height="14"><use href="#i-unduh"></use></svg> Unduh Berkas Jawaban</a>` : ''}
            <hr>
            <h4 style="margin-bottom:.6rem">Riwayat Proses</h4>
            <ul class="timeline">
              ${d.riwayat.map((r2, k) => `<li class="${k === d.riwayat.length - 1 ? 'akhir' : ''}">
                <span class="w">${escapeHtml(r2.waktu)}</span>
                <strong>${escapeHtml(r2.status)}</strong>
                <p>${escapeHtml(r2.keterangan || '')} <span class="samar">· oleh ${escapeHtml(r2.aktor)}</span></p>
              </li>`).join('')}
            </ul>
          </div>
        </div>`;
    });
  }

  /* ---------- keberatan ---------- */
  const formKeberatan = $('#form-keberatan');
  if (formKeberatan) {
    formKeberatan.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(formKeberatan).entries());
      const kotak = $('#hasil-keberatan');
      const j = await kirimJson('/api/keberatan', data);
      if (!j.ok) { kotak.innerHTML = `<div class="pesan galat">${escapeHtml(j.pesan)}</div>`; toast(j.pesan, 'galat'); return; }
      formKeberatan.style.display = 'none';
      kotak.innerHTML = `<div class="pesan ok"><svg width="18" height="18"><use href="#i-sukses"></use></svg>
        <div><strong>Keberatan tercatat.</strong><br>Nomor tiket keberatan: <span class="mono tebal">${escapeHtml(j.tiket)}</span><br>
        <span class="kecil">Tanggapan Atasan PPID disampaikan paling lambat 30 hari kerja sejak keberatan tercatat.</span></div></div>
        <a class="tombol garis" href="/halaman-informasi/upaya-tidak-ditanggapi-atas-keberatan">Pelajari upaya lanjutan bila tidak ditanggapi</a>`;
      toast('Keberatan terkirim: ' + j.tiket, 'ok');
    });
  }

  /* ---------- survei ---------- */
  const formSurvei = $('#form-survei');
  if (formSurvei) {
    $$('input[type=radio][name=mutu],input[type=radio][name=kecepatan],input[type=radio][name=kemudahan]').forEach((r) => {
      r.addEventListener('change', () => {
        const kotak = r.closest('.bintang');
        if (!kotak) return;
        const n = Number(r.value);
        $$('label', kotak).forEach((l, k) => l.classList.toggle('terpilih', k < n));
      });
    });
    formSurvei.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(formSurvei).entries());
      const j = await kirimJson('/api/survei', data);
      const kotak = $('#hasil-survei');
      kotak.innerHTML = j.ok
        ? `<div class="pesan ok">${escapeHtml(j.pesan)}</div>`
        : `<div class="pesan galat">${escapeHtml(j.pesan)}</div>`;
      if (j.ok) formSurvei.reset();
    });
  }

  /* ---------- kontak ---------- */
  const formKontak = $('#form-kontak');
  if (formKontak) {
    formKontak.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(formKontak).entries());
      const j = await kirimJson('/api/kontak', data);
      const kotak = $('#hasil-kontak');
      kotak.innerHTML = j.ok ? `<div class="pesan ok">${escapeHtml(j.pesan)}</div>` : `<div class="pesan galat">${escapeHtml(j.pesan)}</div>`;
      if (j.ok) formKontak.reset();
    });
  }

  /* ---------- penyaringan tabel DIP tanpa muat ulang ---------- */
  const formFilter = $('#form-filter-dip');
  if (formFilter) {
    formFilter.addEventListener('submit', () => {
      $$('#form-filter-dip select, #form-filter-dip input').forEach((f) => { if (!f.value) f.removeAttribute('name'); });
    });
  }

  /* ---------- konfirmasi hapus ---------- */
  $$('[data-konfirmasi]').forEach((b) => {
    b.addEventListener('click', (e) => { if (!confirm(b.dataset.konfirmasi)) e.preventDefault(); });
  });

  /* ---------- modal detail informasi ---------- */
  $$('[data-modal-buka]').forEach((t) => {
    t.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = t.dataset.modalBuka;
      const lapis = $('#modal-lapis');
      const badan = $('#modal-badan');
      if (!lapis || !badan) return;
      badan.innerHTML = '<div class="pesan info">Memuat data…</div>';
      lapis.classList.add('buka');
      try {
        const r = await fetch(`/api/dip/${id}`);
        const j = await r.json();
        if (!j.ok) throw new Error(j.pesan);
        const d = j.data;
        badan.innerHTML = `
          <div class="fleks-antara mb-1"><span class="lencana aksen">${escapeHtml(d.kategori_nama)}</span>
            <span class="kecil samar">Diperbarui ${escapeHtml(String(d.diperbarui || d.dibuat).slice(0, 10))}</span></div>
          <h3>${escapeHtml(d.ringkas_informasi)}</h3>
          <p class="redup">${escapeHtml(d.rincian || '')}</p>
          <table class="tabel mb-2"><tbody>
            <tr><th style="width:180px">Jenis</th><td>${escapeHtml(d.jenis || '-')}</td></tr>
            <tr><th>Format</th><td>${escapeHtml(d.format || '-')}</td></tr>
            <tr><th>Sarana Pengumuman</th><td>${escapeHtml(d.sarana || '-')}</td></tr>
            <tr><th>Tahun</th><td>${escapeHtml(String(d.tahun || '-'))}</td></tr>
            <tr><th>Perangkat Daerah</th><td>${escapeHtml(d.opd_nama || '-')}</td></tr>
            <tr><th>Jangka Waktu</th><td>${escapeHtml(d.jangka_waktu || '-')}</td></tr>
          </tbody></table>
          <div class="fleks">
            <a class="tombol" href="/informasi/${d.id}">Halaman Detail</a>
            ${d.berkas ? `<a class="tombol garis" href="/api/unduh/dip/${d.id}"><svg width="15" height="15"><use href="#i-unduh"></use></svg> Unduh Berkas</a>` : ''}
            <a class="tombol halus" href="/permohonan-informasi?dip=${d.id}">Mohonkan Informasi Ini</a>
          </div>`;
      } catch (err) {
        badan.innerHTML = `<div class="pesan galat">${escapeHtml(err.message)}</div>`;
      }
    });
  });
  $('#modal-tutup')?.addEventListener('click', () => $('#modal-lapis')?.classList.remove('buka'));
  $('#modal-lapis')?.addEventListener('click', (e) => { if (e.target.id === 'modal-lapis') e.target.classList.remove('buka'); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#modal-lapis')?.classList.remove('buka'); });

  /* ---------- animasi angka statistik ---------- */
  $$('[data-hitung]').forEach((el) => {
    const target = Number(el.dataset.hitung) || 0;
    let mulai = null;
    const durasi = 900;
    function langkah(t) {
      if (!mulai) mulai = t;
      const p = Math.min(1, (t - mulai) / durasi);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString('id-ID');
      if (p < 1) requestAnimationFrame(langkah);
    }
    const io = new IntersectionObserver((ent) => {
      if (ent[0].isIntersecting) { requestAnimationFrame(langkah); io.disconnect(); }
    });
    io.observe(el);
  });
})();
