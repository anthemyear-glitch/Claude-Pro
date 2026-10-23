/**
 * FRONTEND ROUTER & VIEW ENGINE — DINAS SOSIAL KOTA SURAKARTA (1:1 Clone of dinsos.surakarta.go.id)
 * Mendukung Clean URLs (/berita/detail/398) maupun Hash URLs (home.html#/berita/detail/398) untuk Static HTML Deploy!
 */
(function () {
  let sliderTimer = null;
  let activeSlideIdx = 0;

  function escHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getRoute() {
    if (window.location.hash && window.location.hash.startsWith("#/")) {
      return window.location.hash.slice(1);
    }
    const p = window.location.pathname;
    if (p && p !== "/" && !p.endsWith(".html") && p !== "/home") {
      return p;
    }
    return "/home";
  }

  function navTo(route) {
    window.location.hash = "#" + (route.startsWith("/") ? route : "/" + route);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderBreadcrumb(title, crumbs) {
    const items = crumbs
      .map((c, idx) => {
        if (idx === crumbs.length - 1 || !c.href) {
          return `<li class="active">${escHtml(c.label)}</li>`;
        }
        return `<li><a href="${c.href}">${escHtml(c.label)}</a> <span class="ms-2 opacity-50">/</span></li>`;
      })
      .join("");
    return `
      <section class="page-title-area">
        <div class="container">
          <h2>${escHtml(title)}</h2>
          <ul class="page-title-breadcrumb">${items}</ul>
        </div>
      </section>
    `;
  }

  function renderInfoTerkaitSidebar(state, mode = "berita") {
    const beritaList = (state.tb_berita || []).slice(0, 5);
    const pengumumanList = (state.tb_pengumuman || []).slice(0, 5);
    const listHtml =
      mode === "pengumuman"
        ? pengumumanList
            .map(
              (p) => `<div class="pb-3 mb-3 border-bottom">
                <a href="#/pengumuman/detail/${p.id}" class="fw-bold d-block text-dark mb-1">${escHtml(p.judul)}</a>
                <span class="small text-warning fw-bold"><i class="bx bx-calendar me-1"></i>${escHtml(p.tanggal_label || p.tanggal)}</span>
              </div>`
            )
            .join("")
        : beritaList
            .map(
              (b) => `<div class="pb-3 mb-3 border-bottom">
                <a href="#/berita/detail/${b.id}" class="fw-bold d-block text-dark mb-1">${escHtml(b.judul)}</a>
                <span class="small text-warning fw-bold"><i class="bx bx-calendar me-1"></i>${escHtml(b.tanggal_label || b.tanggal)}</span>
              </div>`
            )
            .join("");

    return `
      <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
        <h4 class="fs-5 pb-2 mb-3 border-bottom" style="border-color:#f68820 !important;">
          ${mode === "pengumuman" ? "Pengumuman Terbaru" : "Berita Terbaru"}
        </h4>
        ${listHtml}
      </div>
      <div class="bg-white p-4 rounded-4 shadow-sm border">
        <h4 class="fs-5 pb-2 mb-3 border-bottom">Informasi Terkait</h4>
        <ul class="list-unstyled mb-0 d-grid gap-2">
          <li><a href="#/berita" class="d-flex justify-content-between align-items-center p-2 rounded bg-light fw-bold"><span><i class="bx bx-news text-warning me-2"></i>Berita</span><i class="bx bx-chevron-right"></i></a></li>
          <li><a href="#/artikel" class="d-flex justify-content-between align-items-center p-2 rounded bg-light fw-bold"><span><i class="bx bx-book-content text-warning me-2"></i>Artikel</span><i class="bx bx-chevron-right"></i></a></li>
          <li><a href="index.html" class="d-flex justify-content-between align-items-center p-2 rounded bg-light fw-bold"><span><i class="bx bx-layer text-warning me-2"></i>Layanan (15 Terintegrasi)</span><i class="bx bx-chevron-right"></i></a></li>
          <li><a href="#/pengumuman" class="d-flex justify-content-between align-items-center p-2 rounded bg-light fw-bold"><span><i class="bx bx-bullhorn text-warning me-2"></i>Pengumuman</span><i class="bx bx-chevron-right"></i></a></li>
          <li><a href="#/agenda" class="d-flex justify-content-between align-items-center p-2 rounded bg-light fw-bold"><span><i class="bx bx-calendar-event text-warning me-2"></i>Agenda</span><i class="bx bx-chevron-right"></i></a></li>
          <li><a href="#/bank_data" class="d-flex justify-content-between align-items-center p-2 rounded bg-light fw-bold"><span><i class="bx bx-data text-warning me-2"></i>Bank Data</span><i class="bx bx-chevron-right"></i></a></li>
        </ul>
      </div>
    `;
  }

  // =========================================================================
  // DYNAMIC NAVBAR & FOOTER SYNC
  // =========================================================================
  function syncHeaderAndFooter(state) {
    const p = state.tb_profil_website || {};

    // Top Header
    const topLeft = document.getElementById("topHeaderLeft");
    if (topLeft) {
      topLeft.innerHTML = `
        <li><a href="mailto:${escHtml(p.email)}"><i class="bx bx-envelope"></i> ${escHtml(p.email)}</a></li>
        <li><a href="tel:${escHtml(p.telepon)}"><i class="bx bx-phone-call"></i> ${escHtml(p.telepon)}</a></li>
        <li class="d-none d-xl-inline-block"><span><i class="bx bx-time-five"></i> ${escHtml(p.jam_pelayanan_header)}</span></li>
      `;
    }

    // Dynamic Dropdowns in Desktop & Offcanvas Mobile Nav
    const profilMenu = (state.tb_profil || []).sort((a, b) => (a.urutan || 99) - (b.urutan || 99));
    const bidangMenu = state.ref_bidang || [];
    const aduanMenu = state.tb_halaman_aduan || [];

    const profilLinksHtml = profilMenu
      .map((item) => `<li><a href="#/profil/detail/${item.id}">${escHtml(item.judul)}</a></li>`)
      .join("");

    const layananLinksHtml = `
      <li><a href="index.html"><i class="bx bx-grid-alt text-warning me-1"></i>Portal 15 Layanan Terintegrasi</a></li>
      ${bidangMenu.map((b) => `<li><a href="#/layanan/bidang/${b.id}">${escHtml(b.nama_bidang)}</a></li>`).join("")}
      <li><a href="pmks.html"><i class="bx bx-bar-chart-alt-2 text-primary me-1"></i>SIM PMKS &amp; PSKS</a></li>
    `;

    const aduanLinksHtml = aduanMenu
      .map((a) => `<li><a href="#/aduan/detail/${a.id}">${escHtml(a.judul)}</a></li>`)
      .join("");

    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };
    setHtml("navDropdownProfil", profilLinksHtml);
    setHtml("navDropdownLayanan", layananLinksHtml);
    setHtml("navDropdownAduan", aduanLinksHtml);
    setHtml("mobDropdownProfil", profilLinksHtml);
    setHtml("mobDropdownLayanan", layananLinksHtml);
    setHtml("mobDropdownAduan", aduanLinksHtml);

    // Footer Contact
    setHtml("footerTagline", escHtml(p.tagline_footer || "Dinsos Hadir Di Tengah Masyarakat Kota Surakarta"));
    setHtml("footerInovasi", escHtml(p.inovasi_unggulan || "PEKA (Penerbitan rEkomendasi Keringanan pAjak Kendaraan Bermotor)"));
    const footerAddr = document.getElementById("footerAddressList");
    if (footerAddr) {
      footerAddr.innerHTML = `
        <li><i class="bx bx-map"></i><span>${escHtml(p.alamat)}</span></li>
        <li><i class="bx bx-envelope"></i><a href="mailto:${escHtml(p.email)}">${escHtml(p.email)}</a></li>
        <li><i class="bx bx-phone-call"></i><a href="tel:${escHtml(p.telepon)}">${escHtml(p.telepon)}</a></li>
        <li><i class="bx bxl-whatsapp"></i><a href="https://wa.me/${escHtml(p.whatsapp_clean || "628112811919")}" target="_blank" rel="noopener">${escHtml(p.whatsapp)}</a></li>
        <li><i class="bx bx-time"></i><span>Senin – Kamis: 07:30 – 15:30 WIB<br>Hari Jum'at: 07:30 – 14:30 WIB</span></li>
      `;
    }
  }

  // =========================================================================
  // VIEW 1: BERANDA (/home) — 100% MIRRORS https://dinsos.surakarta.go.id/home
  // =========================================================================
  function renderHomeView(container, state) {
    const p = state.tb_profil_website || {};
    const slides = (state.tb_slide_show || []).filter((s) => Number(s.aktif) !== 0);
    const tupoksi = state.tb_tupoksi || [];
    const pengumuman = (state.tb_pengumuman || []).slice(0, 3);
    const igPosts = (state.tb_instagram_feed || []).slice(0, 6);
    const berita = (state.tb_berita || []).slice(0, 3);

    if (activeSlideIdx >= slides.length) activeSlideIdx = 0;
    const currentSlide = slides[activeSlideIdx] || {
      judul: "Dinas Sosial Kota Surakarta",
      subjudul: "Revaluasi Target Kinerja RPJMD Tahun 2021-2026 Dinas Sosial Kota Surakarta",
      gambar: "assets/images/slider/slide-dkt-1.jpg",
      tautan: "#/profil/detail/7"
    };

    container.innerHTML = `
      <!-- 1. HERO SLIDER AREA (Bkro Home-3 Hero Slider + Numbered Owl Thumbs 1..5) -->
      <section class="hero-slider-area">
        <div class="container">
          <div class="row align-items-center g-5" id="heroSlideStage">
            <div class="col-lg-6">
              <span class="badge rounded-pill px-3 py-2 mb-3 fw-bold" style="background:#fff8f0;color:#f68820;border:1px solid #fed7aa;">
                <i class="bx bxs-institution me-1"></i>PEMERINTAH KOTA SURAKARTA
              </span>
              <h1 class="hero-slide-title" id="heroSlideTitle">${escHtml(currentSlide.judul)}</h1>
              <p class="hero-slide-sub" id="heroSlideSub">${escHtml(currentSlide.subjudul)}</p>
              <div class="d-flex flex-wrap align-items-center gap-3">
                <a href="${escHtml(currentSlide.tautan || "#/profil/detail/7")}" id="heroSlideBtn" class="default-btn">
                  <span>Selengkapnya</span>
                  <i class="bx bx-right-arrow-alt fs-5"></i>
                </a>
                <a href="index.html" class="btn btn-outline-dark fw-bold px-4 py-3 rounded-2">
                  <i class="bx bx-grid-alt me-1 text-warning"></i>15 Layanan Online
                </a>
              </div>
              <div class="owl-thumbs-bar" aria-label="Navigasi Slide">
                ${slides
                  .map(
                    (s, idx) => `<button type="button" class="owl-thumb-btn ${idx === activeSlideIdx ? "active" : ""}" data-slide-idx="${idx}">
                      ${idx + 1}
                    </button>`
                  )
                  .join("")}
              </div>
            </div>
            <div class="col-lg-6">
              <div class="slider-blob-img">
                <img id="heroSlideImg" src="${escHtml(currentSlide.gambar)}" alt="${escHtml(currentSlide.subjudul)}">
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. MOTTO PELAYANAN & VISI MISI SECTION -->
      <section class="about-area ptb-100">
        <div class="container">
          <div class="section-title mb-5">
            <span>MOTTO PELAYANAN</span>
            <h2>Motto Pelayanan "${escHtml(p.motto_pelayanan)}"</h2>
          </div>
          <div class="row align-items-center g-5">
            <div class="col-lg-6">
              <div class="about-morph-wrap text-center">
                <img src="assets/images/slider/slide-pelayanan-2.jpg" alt="Pelayanan Dinas Sosial Kota Surakarta">
              </div>
            </div>
            <div class="col-lg-6">
              <span class="fw-bold text-uppercase d-block mb-2" style="color:#f68820;letter-spacing:1px;">VISI DAN MISI</span>
              <h2 class="mb-4" style="font-size:36px;">Visi dan Misi</h2>

              <div class="p-4 rounded-4 mb-3 border-start border-4" style="background:#f9fbfe;border-color:#30296c !important;">
                <h3 class="fs-4 mb-2"><i class="bx bx-bullseye text-warning me-2"></i>Visi Pelayanan</h3>
                <p class="mb-0 fw-semibold">${escHtml(p.visi_pelayanan)}</p>
              </div>

              <div class="p-4 rounded-4 mb-4 border-start border-4" style="background:#fff8f0;border-color:#f68820 !important;">
                <h3 class="fs-4 mb-2"><i class="bx bx-rocket text-warning me-2"></i>Misi Pelayanan</h3>
                <p class="mb-0 fw-semibold">${escHtml(p.misi_pelayanan)}</p>
              </div>

              <a href="#/profil/detail/7" class="default-btn">
                <span>Lihat Profil Kami</span>
                <i class="bx bx-right-arrow-alt fs-5"></i>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. TUGAS POKOK DAN FUNGSI (6 Animated Hover Cards) -->
      <section class="services-area bg-color ptb-100">
        <div class="container">
          <div class="section-title">
            <span>TUPOKSI DINAS SOSIAL</span>
            <h2>Tugas Pokok dan Fungsi</h2>
            <p>Tugas Pokok dan Fungsi Dinas Sosial Kota Surakarta dalam penyelenggaraan kesejahteraan sosial.</p>
          </div>
          <div class="row g-4">
            ${tupoksi
              .map(
                (t) => `
              <div class="col-lg-4 col-md-6">
                <div class="single-services-box-wrap">
                  <div class="top-content">
                    <div class="tupoksi-icon-blob"><i class="${escHtml(t.ikon || "bx bx-check-shield")}"></i></div>
                    <h3>${escHtml(t.judul)}</h3>
                    <p class="small mb-0">${escHtml(t.deskripsi).slice(0, 115)}...</p>
                  </div>
                  <div class="bottom-content">
                    <h3>${escHtml(t.judul)}</h3>
                    <p>${escHtml(t.deskripsi)}</p>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- 4. PENGUMUMAN SECTION -->
      <section class="ptb-70">
        <div class="container">
          <div class="d-flex flex-wrap justify-content-between align-items-end mb-4 gap-3">
            <div>
              <span class="fw-bold text-uppercase" style="color:#f68820;font-size:14px;">INFORMASI RESMI</span>
              <h2 class="mb-0 mt-1" style="font-size:38px;">Pengumuman</h2>
            </div>
            <a href="#/pengumuman" class="default-btn py-3 px-4">
              <span>Lihat Selengkapnya</span>
              <i class="bx bx-right-arrow-alt"></i>
            </a>
          </div>
          <div class="row g-4">
            ${pengumuman
              .map(
                (item) => `
              <div class="col-lg-4 col-md-6">
                <article class="single-blog">
                  <div class="blog-thumb">
                    <a href="#/pengumuman/detail/${item.id}">
                      <img src="${escHtml(item.gambar || "assets/images/skm-poster.svg")}" alt="${escHtml(item.judul)}">
                    </a>
                  </div>
                  <div class="blog-body">
                    <div class="blog-date"><i class="bx bx-calendar"></i> ${escHtml(item.tanggal_label || item.tanggal)}</div>
                    <h3><a href="#/pengumuman/detail/${item.id}">${escHtml(item.judul)}</a></h3>
                    <p class="small flex-grow-1">${escHtml(item.ringkasan || "")}</p>
                    <a href="#/pengumuman/detail/${item.id}" class="read-more mt-2">
                      Baca Selengkapnya <i class="bx bx-right-arrow-alt"></i>
                    </a>
                  </div>
                </article>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- 5. BERITA TERKINI + INSTAGRAM EMBED FEED @dinsos_surakarta -->
      <section class="bg-color ptb-100">
        <div class="container">
          <div class="section-title">
            <span>Berita Terkini</span>
            <h2>Ikuti Perkembangan Berita Terkini dari Dinas Sosial</h2>
          </div>

          <!-- Instagram Widget Mirroring EmbedSocial on dinsos.surakarta.go.id -->
          <div class="bg-white p-4 rounded-4 shadow-sm border mb-5">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-2 border-bottom gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="d-inline-flex align-items-center justify-content-center rounded-circle text-white" style="width:40px;height:40px;background:linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888);">
                  <i class="bx bxl-instagram fs-4"></i>
                </span>
                <div>
                  <div class="fw-bold text-dark">@dinsos_surakarta</div>
                  <div class="small text-muted">Official Instagram Feed — Dinas Sosial Kota Surakarta</div>
                </div>
              </div>
              <a href="${escHtml(p.instagram_url)}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-dark fw-bold rounded-pill px-3">
                <i class="bx bxl-instagram me-1 text-danger"></i>Ikuti di Instagram
              </a>
            </div>
            <div class="row g-3">
              ${igPosts
                .map(
                  (ig) => `
                <div class="col-lg-4 col-md-6">
                  <div class="ig-feed-card">
                    <div class="ig-feed-thumb">
                      <img src="${escHtml(ig.gambar)}" alt="Instagram Dinsos Surakarta" loading="lazy">
                      <span class="ig-type-badge"><i class="bx bx-camera me-1"></i>${escHtml(ig.tipe)}</span>
                    </div>
                    <div class="p-3 d-flex flex-column flex-grow-1">
                      <div class="small text-muted fw-bold mb-1">${escHtml(ig.tanggal)}</div>
                      <p class="small mb-2 flex-grow-1 text-dark">${escHtml(ig.caption)}</p>
                      <a href="${escHtml(ig.url)}" target="_blank" rel="noopener" class="small fw-bold text-warning">Lihat Postingan &rarr;</a>
                    </div>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>

          <!-- 3 Latest Website News Cards -->
          <div class="row g-4">
            ${berita
              .map(
                (b) => `
              <div class="col-lg-4 col-md-6">
                <article class="single-blog">
                  <div class="blog-thumb">
                    <a href="#/berita/detail/${b.id}">
                      <img src="${escHtml(b.gambar)}" alt="${escHtml(b.judul)}">
                    </a>
                  </div>
                  <div class="blog-body">
                    <div class="blog-date"><i class="bx bx-calendar"></i> ${escHtml(b.tanggal_label || b.tanggal)}</div>
                    <h3><a href="#/berita/detail/${b.id}">${escHtml(b.judul)}</a></h3>
                    <p class="small flex-grow-1">${escHtml(b.ringkasan || "")}</p>
                    <a href="#/berita/detail/${b.id}" class="read-more mt-2">
                      Baca Selengkapnya <i class="bx bx-right-arrow-alt"></i>
                    </a>
                  </div>
                </article>
              </div>
            `
              )
              .join("")}
          </div>
          <div class="text-center mt-4 pt-2">
            <a href="#/berita" class="default-btn"><span>Semua Berita Dinas Sosial</span><i class="bx bx-news"></i></a>
          </div>
        </div>
      </section>

      <!-- 6. SURVEY KEPUASAN MASYARAKAT (QR CODE + LINK INSTRUMEN REALTIME APPBAGOR) -->
      <section id="skm-section" class="ptb-70 bg-white">
        <div class="container">
          <div class="section-title mb-4">
            <span>PARTISIPASI PUBLIK</span>
            <h2>Survey Kepuasan Masyarakat</h2>
          </div>
          <div class="bg-color-e9f7fe p-4 p-lg-5 rounded-4 border shadow-sm">
            <div class="row align-items-center g-4">
              <div class="col-md-4 text-center">
                <div class="bg-white p-3 rounded-4 d-inline-block shadow-sm border">
                  <img src="assets/images/skm-qrcode.svg" alt="QR Code SKM Dinas Sosial Surakarta" style="width:220px;height:220px;">
                </div>
              </div>
              <div class="col-md-8">
                <span class="badge bg-success px-3 py-2 mb-2">CAPAIAN IKM 2026: ${escHtml(p.skm_nilai_ikm || "89,64")} — MUTU ${escHtml(p.skm_mutu || "A (Sangat Baik)")}</span>
                <h3 class="fs-2 mb-2">LINK INSTRUMEN (REALTIME)</h3>
                <p class="mb-3">
                  Pindai kode QR di samping atau klik tautan resmi Bagian Organisasi Setda Kota Surakarta di bawah ini untuk mengisi penilaian Survei Kepuasan Masyarakat (SKM) atas layanan Dinas Sosial Kota Surakarta:
                </p>
                <div class="p-3 bg-white rounded-3 border mb-3 font-monospace small text-break">
                  <a href="${escHtml(p.skm_url)}" target="_blank" rel="noopener" class="fw-bold text-primary">
                    <i class="bx bx-link-external me-1"></i>${escHtml(p.skm_url)}
                  </a>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <a href="${escHtml(p.skm_url)}" target="_blank" rel="noopener" class="default-btn py-3 px-4">
                    <span>Buka Instrumen Appbagor</span>
                    <i class="bx bx-link-external"></i>
                  </a>
                  <a href="#/aduan/detail/4" class="btn btn-outline-primary fw-bold px-4 py-3">
                    <i class="bx bx-message-square-edit me-1"></i>Kirim Saran / Pengaduan
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 7. KANAL PENGADUAN & TAUTAN INTEGRASI (8 Official Badges from dinsos.surakarta.go.id) -->
      <section class="pb-70 bg-white">
        <div class="container">
          <div class="row g-3">
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.ulas_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bx-Comment-detail bxs-message-dots fs-3 text-danger"></i>
                <div><div>ULAS Surakarta</div><small class="text-muted fw-normal">Unit Layanan Aduan</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="https://wa.me/${escHtml(p.whatsapp_clean || "628112811919")}?text=Halo%20Dinsos" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bxl-whatsapp fs-3 text-success"></i>
                <div><div>WhatsApp Hotline</div><small class="text-muted fw-normal">${escHtml(p.whatsapp)}</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.lapor_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bxs-megaphone fs-3 text-danger"></i>
                <div><div>SP4N - LAPOR!</div><small class="text-muted fw-normal">Pengaduan Nasional</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.sippn_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bx-building-house fs-3 text-primary"></i>
                <div><div>SIPPN MenpanRB</div><small class="text-muted fw-normal">Informasi Pelayanan Publik</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.moniks_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bx-line-chart fs-3 text-info"></i>
                <div><div>MONIKS Surakarta</div><small class="text-muted fw-normal">Monitoring Kesejahteraan</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.instagram_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bxl-instagram-alt fs-3" style="color:#e1306c;"></i>
                <div><div>@dinsos_surakarta</div><small class="text-muted fw-normal">Instagram Resmi</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.facebook_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bxl-facebook-circle fs-3 text-primary"></i>
                <div><div>Dinas Sosial Surakarta</div><small class="text-muted fw-normal">Facebook Resmi</small></div>
              </a>
            </div>
            <div class="col-lg-3 col-sm-6">
              <a href="${escHtml(p.twitter_url)}" target="_blank" rel="noopener" class="partner-channel-pill">
                <i class="bx bxl-twitter fs-3 text-info"></i>
                <div><div>Twitter / X Sosial</div><small class="text-muted fw-normal">@dinsosjateng</small></div>
              </a>
            </div>
          </div>
        </div>
      </section>
    `;

    // Bind Hero Slider Thumbs + Autoplay
    function updateSlideDom(idx) {
      if (!slides.length) return;
      activeSlideIdx = idx % slides.length;
      const s = slides[activeSlideIdx];
      const tEl = document.getElementById("heroSlideTitle");
      const subEl = document.getElementById("heroSlideSub");
      const imgEl = document.getElementById("heroSlideImg");
      const btnEl = document.getElementById("heroSlideBtn");
      if (!tEl || !subEl || !imgEl) return;
      tEl.textContent = s.judul;
      subEl.textContent = s.subjudul;
      imgEl.src = s.gambar;
      if (btnEl) btnEl.href = s.tautan || "#/profil/detail/7";
      container.querySelectorAll(".owl-thumb-btn").forEach((b, i) => {
        b.classList.toggle("active", i === activeSlideIdx);
      });
    }

    container.querySelectorAll(".owl-thumb-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        updateSlideDom(Number(btn.dataset.slideIdx) || 0);
        resetAutoplay();
      });
    });

    function resetAutoplay() {
      if (sliderTimer) clearInterval(sliderTimer);
      sliderTimer = setInterval(() => {
        if (!document.getElementById("heroSlideTitle")) {
          clearInterval(sliderTimer);
          return;
        }
        updateSlideDom(activeSlideIdx + 1);
      }, 6000);
    }
    resetAutoplay();
  }

  // =========================================================================
  // VIEW 2: PROFIL DETAIL (#/profil/detail/:id)
  // =========================================================================
  function renderProfilDetail(container, state, id) {
    const list = state.tb_profil || [];
    const item = list.find((x) => String(x.id) === String(id)) || list[0];
    if (!item) return renderNotFound(container);

    container.innerHTML = `
      ${renderBreadcrumb(item.judul, [
        { label: "Beranda", href: "#/home" },
        { label: "Profil", href: "#/profil/detail/7" },
        { label: item.judul }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="bg-white p-4 p-lg-5 rounded-4 shadow-sm border">
                <h1 class="fs-2 mb-4 pb-3 border-bottom">${escHtml(item.judul)}</h1>
                ${item.gambar ? `<div class="mb-4 text-center"><img src="${escHtml(item.gambar)}" alt="${escHtml(item.judul)}" class="rounded-3 shadow-sm border"></div>` : ""}
                <div class="profil-rich-content">${item.konten || ""}</div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="bg-white p-4 rounded-4 shadow-sm border">
                <h4 class="fs-5 pb-2 mb-3 border-bottom">Menu Profil Dinas Sosial</h4>
                <div class="list-group list-group-flush">
                  ${list
                    .map(
                      (m) => `<a href="#/profil/detail/${m.id}" class="list-group-item list-group-item-action fw-semibold d-flex justify-content-between align-items-center ${String(m.id) === String(item.id) ? "active" : ""}" style="${String(m.id) === String(item.id) ? "background:#30296c;border-color:#30296c;" : ""}">
                        <span>${escHtml(m.judul)}</span>
                        <i class="bx bx-chevron-right"></i>
                      </a>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // VIEW 3: STANDAR PELAYANAN LIST & LAYANAN BIDANG LIST (DataTables)
  // =========================================================================
  function renderStandarPelayananList(container, state) {
    const rows = state.tb_standar_pelayanan || [];
    container.innerHTML = `
      ${renderBreadcrumb("Standar Pelayanan", [
        { label: "Beranda", href: "#/home" },
        { label: "Informasi Terkait", href: "#/standar_pelayanan" },
        { label: "Standar Pelayanan" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div id="dtStandarContainer"></div>
        </div>
      </section>
    `;
    window.DinsosDB.renderDataTable("#dtStandarContainer", {
      data: rows,
      pageSize: 10,
      columns: [
        { label: "#", key: "__index", width: "65px" },
        { label: "Nama", key: "nama" },
        {
          label: "File/Berkas",
          width: "150px",
          render: (row) => `<a href="#/standar_pelayanan/detail/${row.id}" class="btn btn-sm text-white fw-bold px-3" style="background:#f68820;">Detail</a>`
        }
      ]
    });
  }

  function renderLayananBidang(container, state, bidangId) {
    const bidang = (state.ref_bidang || []).find((b) => String(b.id) === String(bidangId)) || {
      id: bidangId,
      nama_bidang: "Bidang Pelayanan Sosial",
      deskripsi: ""
    };
    const rows = (state.tb_standar_pelayanan || []).filter((s) => String(s.bidang_id) === String(bidangId));

    container.innerHTML = `
      ${renderBreadcrumb(`Layanan - ${bidang.nama_bidang}`, [
        { label: "Beranda", href: "#/home" },
        { label: "Layanan", href: "index.html" },
        { label: bidang.nama_bidang }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          ${bidang.deskripsi ? `<div class="alert bg-white border shadow-sm rounded-3 mb-4"><i class="bx bx-info-circle text-warning me-2"></i><strong>${escHtml(bidang.nama_bidang)}:</strong> ${escHtml(bidang.deskripsi)}</div>` : ""}
          <div id="dtLayananBidangContainer"></div>
        </div>
      </section>
    `;
    window.DinsosDB.renderDataTable("#dtLayananBidangContainer", {
      data: rows,
      pageSize: 10,
      columns: [
        { label: "#", key: "__index", width: "65px" },
        { label: "Judul", key: "nama" },
        {
          label: "Detail",
          width: "150px",
          render: (row) => `<a href="#/layanan/detail/${row.layanan_id || row.id}" class="btn btn-sm text-white fw-bold px-3" style="background:#30296c;">Detail</a>`
        }
      ]
    });
  }

  function renderStandarOrLayananDetail(container, state, id, isLayananRoute) {
    const all = state.tb_standar_pelayanan || [];
    const item =
      all.find((x) => (isLayananRoute ? String(x.layanan_id) === String(id) || String(x.id) === String(id) : String(x.id) === String(id))) ||
      all[0];
    if (!item) return renderNotFound(container);

    const bidang = (state.ref_bidang || []).find((b) => Number(b.id) === Number(item.bidang_id));
    const related = all.filter((x) => Number(x.bidang_id) === Number(item.bidang_id));

    const persyaratanHtml = Array.isArray(item.persyaratan)
      ? `<ol class="mb-0">${item.persyaratan.map((p) => `<li class="mb-1">${escHtml(p)}</li>`).join("")}</ol>`
      : `<p class="mb-0">${escHtml(item.persyaratan)}</p>`;

    const prosedurHtml = Array.isArray(item.prosedur)
      ? `<ol class="mb-0">${item.prosedur.map((p) => `<li class="mb-1">${escHtml(p)}</li>`).join("")}</ol>`
      : `<p class="mb-0">${escHtml(item.prosedur)}</p>`;

    container.innerHTML = `
      ${renderBreadcrumb(item.nama, [
        { label: "Beranda", href: "#/home" },
        isLayananRoute && bidang
          ? { label: bidang.nama_bidang, href: `#/layanan/bidang/${bidang.id}` }
          : { label: "Standar Pelayanan", href: "#/standar_pelayanan" },
        { label: item.nama }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="bg-white p-4 p-lg-5 rounded-4 shadow-sm border">
                <div class="d-flex flex-wrap gap-2 mb-3">
                  <span class="badge px-3 py-2" style="background:#30296c;">${escHtml(bidang ? bidang.nama_bidang : "Standar Pelayanan")}</span>
                  <span class="badge bg-success px-3 py-2">Biaya: ${escHtml(item.biaya)}</span>
                  <span class="badge bg-warning text-dark px-3 py-2">Waktu: ${escHtml(item.waktu)}</span>
                </div>
                <h2 class="fs-3 mb-4">${escHtml(item.nama)}</h2>
                ${item.gambar ? `<img src="${escHtml(item.gambar)}" alt="${escHtml(item.nama)}" class="rounded-3 mb-4 border w-100" style="max-height:340px;object-fit:cover;">` : ""}

                <div class="p-3 rounded-3 mb-3" style="background:#f8fafc;border-left:4px solid #30296c;">
                  <h5 class="fs-6 fw-bold mb-2">A. Persyaratan :</h5>
                  ${persyaratanHtml}
                </div>

                <div class="p-3 rounded-3 mb-3" style="background:#fff8f0;border-left:4px solid #f68820;">
                  <h5 class="fs-6 fw-bold mb-2">B. Sistem, Mekanisme dan Prosedur :</h5>
                  ${prosedurHtml}
                </div>

                <div class="row g-3 mb-3">
                  <div class="col-md-4">
                    <div class="p-3 border rounded-3 h-100">
                      <div class="small text-muted fw-bold">C. Jangka Waktu Pelayanan</div>
                      <div class="fw-bold text-dark mt-1">${escHtml(item.waktu)}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 border rounded-3 h-100">
                      <div class="small text-muted fw-bold">D. Biaya / Tarif</div>
                      <div class="fw-bold text-success mt-1">${escHtml(item.biaya)}</div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="p-3 border rounded-3 h-100">
                      <div class="small text-muted fw-bold">E. Produk Pelayanan</div>
                      <div class="fw-bold text-dark mt-1 small">${escHtml(item.produk)}</div>
                    </div>
                  </div>
                </div>

                <div class="p-3 border rounded-3 bg-light">
                  <h5 class="fs-6 fw-bold mb-2">F. Penanganan Pengaduan, Saran dan Masukan :</h5>
                  <ol class="small mb-0 ps-3">
                    <li>Whatsapp : 08112811919</li>
                    <li>Ulas : ulas.surakarta.go.id</li>
                    <li>SP4N LAPOR : surakarta.lapor.go.id</li>
                    <li>Telephone : (0271) 734123</li>
                    <li>Email : dinsos@surakarta.go.id</li>
                    <li>Instagram : @dinsos_surakarta</li>
                    <li>Youtube : DINAS SOSIAL KOTA SURAKARTA</li>
                    <li>Pengaduan Langsung : Loket Layanan Dinas Sosial Kota Surakarta</li>
                  </ol>
                </div>
              </div>
            </div>
            <div class="col-lg-4">
              <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <h4 class="fs-5 pb-2 mb-3 border-bottom">Data Lainnya</h4>
                <div class="d-grid gap-2">
                  ${related
                    .map(
                      (r) => `<a href="#/standar_pelayanan/detail/${r.id}" class="p-2 rounded border text-dark fw-semibold small ${String(r.id) === String(item.id) ? "bg-warning bg-opacity-25 border-warning" : "bg-light"}">
                        <i class="bx bx-check-circle text-warning me-1"></i>${escHtml(r.nama)}
                      </a>`
                    )
                    .join("")}
                </div>
              </div>
              ${renderInfoTerkaitSidebar(state, "berita")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // VIEW 4: BERITA, PENGUMUMAN & ARTIKEL (LIST + DETAIL)
  // =========================================================================
  function renderCardGridPage(container, state, cfg) {
    const items = state[cfg.table] || [];
    container.innerHTML = `
      ${renderBreadcrumb(cfg.title, [
        { label: "Beranda", href: "#/home" },
        { label: "Informasi Terkait", href: `#/${cfg.baseRoute}` },
        { label: cfg.title }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="section-title">
            <span>${escHtml(cfg.eyebrow)}</span>
            <h2>${escHtml(cfg.heading)}</h2>
          </div>
          <div class="row g-4">
            ${items
              .map(
                (it) => `
              <div class="col-lg-4 col-md-6">
                <article class="single-blog">
                  <div class="blog-thumb">
                    <a href="#/${cfg.baseRoute}/detail/${it.id}">
                      <img src="${escHtml(it.gambar || "assets/images/portal/img-gedung-dinsos.png")}" alt="${escHtml(it.judul)}">
                    </a>
                  </div>
                  <div class="blog-body">
                    <div class="blog-date"><i class="bx bx-calendar"></i> ${escHtml(it.tanggal_label || it.tanggal)}</div>
                    <h3><a href="#/${cfg.baseRoute}/detail/${it.id}">${escHtml(it.judul)}</a></h3>
                    ${it.ringkasan ? `<p class="small flex-grow-1">${escHtml(it.ringkasan)}</p>` : `<div class="flex-grow-1"></div>`}
                    <a href="#/${cfg.baseRoute}/detail/${it.id}" class="read-more mt-2">
                      Baca Selengkapnya <i class="bx bx-right-arrow-alt"></i>
                    </a>
                  </div>
                </article>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  function renderPostDetailPage(container, state, cfg, id) {
    const items = state[cfg.table] || [];
    const item = items.find((x) => String(x.id) === String(id)) || items[0];
    if (!item) return renderNotFound(container);

    container.innerHTML = `
      ${renderBreadcrumb(cfg.breadcrumbTitle, [
        { label: "Beranda", href: "#/home" },
        { label: "Informasi Terkait", href: `#/${cfg.baseRoute}` },
        { label: cfg.listLabel, href: `#/${cfg.baseRoute}` },
        { label: item.judul }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-8">
              <article class="bg-white p-4 p-lg-5 rounded-4 shadow-sm border">
                <div class="mb-3 d-flex flex-wrap align-items-center gap-3 small fw-bold text-warning">
                  <span><i class="bx bx-calendar me-1"></i>${escHtml(item.tanggal_label || item.tanggal)}</span>
                  ${item.penulis ? `<span class="text-muted"><i class="bx bx-user me-1"></i>${escHtml(item.penulis)}</span>` : ""}
                  ${item.kategori ? `<span class="badge bg-light text-dark border">${escHtml(item.kategori)}</span>` : ""}
                </div>
                <h1 class="fs-2 mb-4">${escHtml(item.judul)}</h1>
                ${item.gambar ? `<div class="mb-4 text-center"><img src="${escHtml(item.gambar)}" alt="${escHtml(item.judul)}" class="rounded-3 border shadow-sm w-100" style="max-height:460px;object-fit:contain;background:#f8fafc;"></div>` : ""}
                <div class="lh-lg">${item.isi || `<p>${escHtml(item.ringkasan || "")}</p>`}</div>
              </article>
            </div>
            <div class="col-lg-4">
              ${renderInfoTerkaitSidebar(state, cfg.baseRoute === "pengumuman" ? "pengumuman" : "berita")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // VIEW 5: AGENDA, BANK DATA, UNDUHAN (DataTables 1:1)
  // =========================================================================
  function renderAgendaPage(container, state) {
    container.innerHTML = `
      ${renderBreadcrumb("Agenda", [
        { label: "Beranda", href: "#/home" },
        { label: "Informasi Terkait", href: "#/agenda" },
        { label: "Agenda" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container"><div id="dtAgenda"></div></div>
      </section>
    `;
    window.DinsosDB.renderDataTable("#dtAgenda", {
      data: state.tb_agenda || [],
      columns: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Acara", key: "acara" },
        { label: "Tempat", key: "tempat" },
        { label: "Tanggal", key: "tanggal", width: "130px" },
        { label: "Jam", key: "jam", width: "150px" },
        {
          label: "Aksi",
          width: "120px",
          render: (row) => `<span class="badge bg-success">${escHtml(row.status || "Terjadwal")}</span>`
        }
      ]
    });
  }

  function renderBankDataPage(container, state) {
    container.innerHTML = `
      ${renderBreadcrumb("Bank Data", [
        { label: "Beranda", href: "#/home" },
        { label: "Informasi Terkait", href: "#/bank_data" },
        { label: "Bank Data" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container"><div id="dtBankData"></div></div>
      </section>
    `;
    window.DinsosDB.renderDataTable("#dtBankData", {
      data: state.tb_bank_data || [],
      columns: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Nama", key: "nama" },
        {
          label: "File/Berkas",
          width: "150px",
          render: (row) => {
            const ext = String(row.file_url || "").startsWith("http") ? `target="_blank" rel="noopener"` : "";
            return `<a href="${escHtml(row.file_url || "#")}" ${ext} class="btn btn-sm btn-primary fw-bold px-3"><i class="bx bx-download me-1"></i>Download</a>`;
          }
        }
      ]
    });
  }

  function renderUnduhanPage(container, state) {
    container.innerHTML = `
      ${renderBreadcrumb("Unduhan Dokumen", [
        { label: "Beranda", href: "#/home" },
        { label: "Unduhan Dokumen" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container"><div id="dtUnduhan"></div></div>
      </section>
    `;
    window.DinsosDB.renderDataTable("#dtUnduhan", {
      data: state.tb_unduhan || [],
      columns: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Dokumen", key: "dokumen" },
        {
          label: "Aksi",
          width: "150px",
          render: (row) => {
            const isAsset = String(row.file_url || "").startsWith("assets/") || String(row.file_url || "").startsWith("http");
            return `<a href="${escHtml(row.file_url || "#")}" ${isAsset ? 'target="_blank" rel="noopener"' : ""} class="btn btn-sm text-white fw-bold px-3" style="background:#f68820;"><i class="bx bx-download me-1"></i>Download</a>`;
          }
        }
      ]
    });
  }

  // =========================================================================
  // VIEW 6: GALERI GAMBAR & GALERI VIDEO
  // =========================================================================
  function renderGaleriGambar(container, state) {
    const items = state.tb_galeri || [];
    container.innerHTML = `
      ${renderBreadcrumb("Galeri Gambar", [
        { label: "Beranda", href: "#/home" },
        { label: "Galeri", href: "#/galeri/gambar" },
        { label: "Galeri Gambar" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="section-title">
            <span>Galeri Gambar</span>
            <h2>Galeri Gambar Dinas Sosial</h2>
          </div>
          <div class="row g-4">
            ${items
              .map(
                (g) => `
              <div class="col-lg-4 col-md-6">
                <div class="single-blog">
                  <div class="blog-thumb" style="cursor:pointer;" data-lightbox-img="${escHtml(g.gambar)}" data-lightbox-caption="${escHtml(g.judul)}">
                    <img src="${escHtml(g.gambar)}" alt="${escHtml(g.judul)}">
                  </div>
                  <div class="blog-body">
                    <div class="blog-date"><i class="bx bx-image"></i> ${escHtml(g.kategori || "Dokumentasi")}</div>
                    <h3 class="fs-6 mb-0">${escHtml(g.judul)}</h3>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;

    container.querySelectorAll("[data-lightbox-img]").forEach((el) => {
      el.addEventListener("click", () => {
        const img = document.getElementById("lightboxModalImg");
        const cap = document.getElementById("lightboxModalCaption");
        if (img) img.src = el.dataset.lightboxImg;
        if (cap) cap.textContent = el.dataset.lightboxCaption;
        const mEl = document.getElementById("galeriLightboxModal");
        if (mEl && window.bootstrap) bootstrap.Modal.getOrCreateInstance(mEl).show();
      });
    });
  }

  function renderGaleriVideo(container, state) {
    const vids = state.tb_galeri_video || [];
    container.innerHTML = `
      ${renderBreadcrumb("Galeri Video", [
        { label: "Beranda", href: "#/home" },
        { label: "Galeri", href: "#/galeri/video" },
        { label: "Galeri Video" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="section-title">
            <span>Galeri Video</span>
            <h2>Galeri Video Dinas Sosial</h2>
            <p>Dokumentasi kegiatan dan edukasi layanan sosial pada kanal YouTube resmi <strong>DINAS SOSIAL KOTA SURAKARTA</strong>.</p>
          </div>
          <div class="row g-4">
            ${vids
              .map(
                (v) => `
              <div class="col-lg-6">
                <div class="bg-white rounded-4 shadow-sm border overflow-hidden h-100">
                  <div class="ratio ratio-16x9 bg-dark">
                    <iframe src="${escHtml(v.embed_url)}" title="${escHtml(v.judul)}" loading="lazy" allowfullscreen></iframe>
                  </div>
                  <div class="p-3">
                    <div class="small text-danger fw-bold mb-1"><i class="bx bxl-youtube me-1"></i>${escHtml(v.channel)}</div>
                    <h3 class="fs-6 mb-0">${escHtml(v.judul)}</h3>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // VIEW 7: PPID MODULE (PROFIL, DIP, BERKALA, SERTA MERTA, SETIAP SAAT, DIKECUALIKAN)
  // =========================================================================
  function renderPpidProfil(container, state) {
    const p = state.tb_profil_website || {};
    const pimpinan = state.tb_ppid_pimpinan || [];
    container.innerHTML = `
      ${renderBreadcrumb("Profil PPID", [
        { label: "Beranda", href: "#/home" },
        { label: "PPID", href: "#/ppid/profil" },
        { label: "Profil PPID" }
      ])}
      <section class="ptb-70 bg-white">
        <div class="container">
          <div class="section-title">
            <span>PEJABAT PENGELOLA INFORMASI DAN DOKUMENTASI</span>
            <h2>Profil Pimpinan Dinas Sosial</h2>
          </div>

          <div class="row g-4 justify-content-center mb-5">
            ${pimpinan
              .map(
                (pim) => `
              <div class="col-lg-5 col-md-6">
                <div class="bg-color p-4 rounded-4 border shadow-sm text-center h-100">
                  <img src="${escHtml(pim.foto)}" alt="${escHtml(pim.nama)}" class="rounded-4 mb-3 shadow-sm" style="max-height:300px;">
                  <span class="badge bg-warning text-dark mb-2">${escHtml(pim.peran_ppid || pim.jabatan)}</span>
                  <h3 class="fs-4 mb-2">${escHtml(pim.jabatan)}</h3>
                  <div class="text-start bg-white p-3 rounded-3 border small">
                    <div class="mb-1"><strong>Nama :</strong> ${escHtml(pim.nama)}</div>
                    <div class="mb-1"><strong>Pangkat/Gol. Ruang :</strong> ${escHtml(pim.pangkat_golongan)}</div>
                    <div><strong>Jabatan :</strong> ${escHtml(pim.jabatan)}</div>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="row g-4 mb-5">
            <div class="col-md-6">
              <div class="p-4 rounded-4 h-100 text-white" style="background:#30296c;">
                <h3 class="text-warning mb-2">V I S I</h3>
                <p class="mb-0 fs-5">${escHtml(p.visi_ppid)}</p>
              </div>
            </div>
            <div class="col-md-6">
              <div class="p-4 rounded-4 h-100" style="background:#fff8f0;border:2px solid #f68820;">
                <h3 class="mb-2">M I S I</h3>
                <p class="mb-0 fs-5 text-dark">${escHtml(p.misi_ppid)}</p>
              </div>
            </div>
          </div>

          <div class="section-title">
            <span>Informasi</span>
            <h2>PPID</h2>
          </div>
          <div class="row g-4">
            <div class="col-lg-3 col-md-6">
              <div class="bg-color p-4 rounded-4 border h-100 d-flex flex-column text-center">
                <div class="fs-1 text-warning mb-2"><i class="bx bx-calendar-check"></i></div>
                <h4 class="fs-5">Informasi Berkala</h4>
                <p class="small flex-grow-1">Informasi yang wajib diperbaharui kemudian disediakan dan diumumkan kepada publik secara berkala sekurang-kurangnya setiap 6 bulan sekali.</p>
                <a href="#/ppid/informasi_berkala" class="default-btn py-2 px-3 w-100 justify-content-center">Selengkapnya</a>
              </div>
            </div>
            <div class="col-lg-3 col-md-6">
              <div class="bg-color p-4 rounded-4 border h-100 d-flex flex-column text-center">
                <div class="fs-1 text-primary mb-2"><i class="bx bx-folder-open"></i></div>
                <h4 class="fs-5">Informasi Setiap Saat</h4>
                <p class="small flex-grow-1">Informasi yang harus disediakan oleh Badan Publik dan siap tersedia untuk dapat langsung diberikan kepada Pemohon Informasi Publik ketika terdapat permohonan.</p>
                <a href="#/ppid/informasi_setiap_saat" class="default-btn py-2 px-3 w-100 justify-content-center">Selengkapnya</a>
              </div>
            </div>
            <div class="col-lg-3 col-md-6">
              <div class="bg-color p-4 rounded-4 border h-100 d-flex flex-column text-center">
                <div class="fs-1 text-danger mb-2"><i class="bx bx-broadcast"></i></div>
                <h4 class="fs-5">Informasi Serta Merta</h4>
                <p class="small flex-grow-1">Informasi yang berkaitan dengan hajat hidup orang banyak dan ketertiban umum serta wajib diumumkan secara serta merta tanpa penundaan.</p>
                <a href="#/ppid/informasi_serta_merta" class="default-btn py-2 px-3 w-100 justify-content-center">Selengkapnya</a>
              </div>
            </div>
            <div class="col-lg-3 col-md-6">
              <div class="bg-color p-4 rounded-4 border h-100 d-flex flex-column text-center">
                <div class="fs-1 text-secondary mb-2"><i class="bx bx-lock"></i></div>
                <h4 class="fs-5">Informasi Dikecualikan</h4>
                <p class="small flex-grow-1">Informasi yang tidak dapat diakses Pemohon Informasi Publik sesuai Undang-Undang Nomor 14 Tahun 2008 Tentang Keterbukaan Informasi Publik.</p>
                <a href="#/ppid/informasi_dikecualikan" class="default-btn py-2 px-3 w-100 justify-content-center">Selengkapnya</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderPpidJenisPage(container, state, jenis, kategoriId) {
    const metaMap = {
      berkala: {
        title: "Informasi Berkala",
        subtitle: "Informasi yang wajib diperbaharui kemudian disediakan dan diumumkan kepada publik secara berkala sekurang-kurangnya setiap 6 bulan sekali",
        penjelasan: `<div class="row g-4 mt-4">
          <div class="col-md-6">
            <div class="bg-white p-4 rounded-4 border h-100">
              <h4 class="fs-5 mb-2"><i class="bx bx-book-open text-warning me-1"></i>Pengertian (Pasal 9 UU KIP)</h4>
              <p class="small mb-2">UU KIP memberi kategori terhadap informasi publik yang dikuasai oleh badan publik, yaitu informasi publik terbuka dan informasi publik yang dikecualikan. Informasi berkala wajib diperbaharui dan diumumkan secara rutin sekurang-kurangnya setiap 6 bulan sekali, meliputi:</p>
              <ol class="small mb-0">
                <li>Keberadaan badan publik (alamat jelas, kontak, status hukum);</li>
                <li>Kepengurusan badan publik (struktur organisasi &amp; pejabat struktural);</li>
                <li>Maksud, tujuan, visi dan misi, program, kinerja, serta laporan keuangan.</li>
              </ol>
            </div>
          </div>
          <div class="col-md-6">
            <div class="bg-white p-4 rounded-4 border h-100">
              <h4 class="fs-5 mb-2"><i class="bx bx-share-alt text-warning me-1"></i>Cara Penyampaian</h4>
              <p class="small mb-2">Penyampaian informasi menggunakan berbagai media dengan asas cepat, tepat waktu, biaya ringan, dan cara sederhana:</p>
              <ol class="small mb-0">
                <li>Internet, melalui website resmi <code>dinsos.surakarta.go.id</code> &amp; <code>ppid.surakarta.go.id</code>;</li>
                <li>Media cetak: papan pengumuman loket, poster, leaflet, maklumat;</li>
                <li>Media elektronik, radio (Radio Konata), dan media sosial resmi.</li>
              </ol>
            </div>
          </div>
        </div>`
      },
      serta_merta: {
        title: "Informasi Serta Merta",
        subtitle: "Informasi yang berkaitan dengan hajat hidup orang banyak dan ketertiban umum serta wajib diumumkan secara serta merta tanpa penundaan",
        penjelasan: `<div class="bg-white p-4 rounded-4 border mt-4">
          <h4 class="fs-5 mb-2">I. Pengertian &amp; Fasilitasi Kedaruratan</h4>
          <p class="small mb-2">Informasi Serta Merta wajib diumumkan tanpa penundaan agar masyarakat dapat mengantisipasi keadaan darurat bencana alam, bencana non-alam, bencana sosial, maupun gangguan utilitas publik. Fasilitas terintegrasi Pemkot Surakarta meliputi Radio Konata, ULAS Surakarta, Open Data Surakarta, dan Tim TAGANA Dinas Sosial Kota Surakarta.</p>
        </div>`
      },
      setiap_saat: {
        title: "Informasi Setiap Saat",
        subtitle: "Informasi yang harus disediakan oleh Badan Publik dan siap tersedia untuk dapat langsung diberikan kepada Pemohon Informasi Publik ketika terdapat permohonan",
        penjelasan: `<div class="bg-white p-4 rounded-4 border mt-4">
          <h4 class="fs-5 mb-2">Ketentuan Informasi Setiap Saat (Pasal 11 UU KIP)</h4>
          <p class="small mb-0">Meliputi Daftar Informasi Publik (DIP), seluruh Standar Operasional Prosedur (SOP) Pelayanan, Perjanjian Kerja Sama dengan Pihak Ketiga/LKS, serta dokumen perencanaan RENSTRA dan RENJA Dinas Sosial Kota Surakarta.</p>
        </div>`
      },
      dikecualikan: {
        title: "Informasi Dikecualikan",
        subtitle: "Informasi yang tidak dapat diakses Pemohon Informasi Publik sesuai Pasal 17 UU Nomor 14 Tahun 2008 tentang KIP & UU Pelindungan Data Pribadi",
        penjelasan: `<div class="bg-white p-4 rounded-4 border mt-4">
          <h4 class="fs-5 mb-2">Perlindungan Data Pribadi Pemerlu Pelayanan Kesejahteraan Sosial (PPKS)</h4>
          <p class="small mb-0">Sesuai Uji Konsekuensi PPID, data individu <em>By Name By Address</em> (NIK, Nomor KK, alamat rinci, kondisi medis/psikososial anak adopsi COTA &amp; klien rehabilitasi) merupakan Informasi Dikecualikan demi melindungi hak privasi warga negara.</p>
        </div>`
      }
    };

    const m = metaMap[jenis] || metaMap.berkala;
    const cats = (state.ref_ppid_kategori || []).filter((c) => c.jenis === jenis);
    const activeCat = kategoriId ? cats.find((c) => String(c.id) === String(kategoriId)) : null;

    if (activeCat) {
      const docs = (state.tb_ppid_informasi || []).filter((d) => String(d.kategori_id) === String(activeCat.id));
      container.innerHTML = `
        ${renderBreadcrumb(activeCat.nama, [
          { label: "Beranda", href: "#/home" },
          { label: "PPID", href: "#/ppid/profil" },
          { label: m.title, href: `#/ppid/informasi_${jenis}` },
          { label: activeCat.nama }
        ])}
        <section class="ptb-70 bg-color">
          <div class="container">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h3 class="fs-4 mb-0">${escHtml(activeCat.nama)}</h3>
              <a href="#/ppid/informasi_${jenis}" class="btn btn-sm btn-outline-secondary fw-bold">&larr; Kembali ke Kategori ${escHtml(m.title)}</a>
            </div>
            <div id="dtPpidKategori"></div>
          </div>
        </section>
      `;
      window.DinsosDB.renderDataTable("#dtPpidKategori", {
        data: docs,
        yearFilterField: "tahun",
        columns: [
          { label: "#", key: "__index", width: "60px" },
          { label: "Judul", key: "judul" },
          { label: "Tahun", key: "tahun", width: "110px" },
          {
            label: "File/Berkas",
            width: "150px",
            render: (row) =>
              row.file_url
                ? `<a href="${escHtml(row.file_url)}" ${String(row.file_url).startsWith("http") || String(row.file_url).startsWith("assets/") ? 'target="_blank" rel="noopener"' : ""} class="btn btn-sm text-white fw-bold px-3" style="background:#f68820;">Download</a>`
                : `<span class="text-muted small">-</span>`
          }
        ]
      });
      return;
    }

    const docsByJenis = (state.tb_ppid_informasi || []).filter((d) => d.jenis === jenis);
    container.innerHTML = `
      ${renderBreadcrumb(m.title, [
        { label: "Beranda", href: "#/home" },
        { label: "PPID", href: "#/ppid/profil" },
        { label: m.title }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="text-center mb-4">
            <h3 class="fs-4">${escHtml(m.subtitle)}</h3>
          </div>
          <div class="row g-3 mb-4">
            ${cats
              .map(
                (c) => `
              <div class="col-lg-6">
                <a href="#/ppid/informasi_${jenis}/kategori/${c.id}" class="ppid-cat-btn">
                  <span>${escHtml(c.nama)}</span>
                  <i class="bx bx-right-arrow-alt fs-4"></i>
                </a>
              </div>
            `
              )
              .join("")}
          </div>
          <div id="dtPpidAllJenis" class="mb-4"></div>
          ${m.penjelasan}
        </div>
      </section>
    `;

    window.DinsosDB.renderDataTable("#dtPpidAllJenis", {
      data: docsByJenis,
      yearFilterField: "tahun",
      columns: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Judul Informasi Publik", key: "judul" },
        { label: "Tahun", key: "tahun", width: "110px" },
        {
          label: "File/Berkas",
          width: "150px",
          render: (row) => `<a href="${escHtml(row.file_url || "#")}" ${String(row.file_url || "").startsWith("http") || String(row.file_url || "").startsWith("assets/") ? 'target="_blank" rel="noopener"' : ""} class="btn btn-sm btn-primary fw-bold px-3">Buka / Unduh</a>`
        }
      ]
    });
  }

  function renderDaftarInformasiPublik(container, state) {
    const allDocs = state.tb_ppid_informasi || [];
    container.innerHTML = `
      ${renderBreadcrumb("Daftar Informasi Publik (DIP)", [
        { label: "Beranda", href: "#/home" },
        { label: "PPID", href: "#/ppid/profil" },
        { label: "Daftar Informasi Publik" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="alert bg-white border shadow-sm rounded-3 mb-4">
            <strong>Daftar Informasi Publik (DIP) Dinas Sosial Kota Surakarta</strong> memuat seluruh dokumen Informasi Berkala, Serta Merta, Setiap Saat, dan Penetapan Informasi Dikecualikan.
          </div>
          <div id="dtDipAll"></div>
        </div>
      </section>
    `;
    window.DinsosDB.renderDataTable("#dtDipAll", {
      data: allDocs,
      yearFilterField: "tahun",
      columns: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Judul Dokumen Informasi", key: "judul" },
        {
          label: "Klasifikasi",
          key: "jenis",
          width: "160px",
          render: (r) => `<span class="badge bg-secondary text-uppercase">${escHtml(String(r.jenis).replace("_", " "))}</span>`
        },
        { label: "Tahun", key: "tahun", width: "100px" },
        {
          label: "Aksi",
          width: "140px",
          render: (r) => `<a href="${escHtml(r.file_url || "#")}" ${String(r.file_url || "").startsWith("http") || String(r.file_url || "").startsWith("assets/") ? 'target="_blank" rel="noopener"' : ""} class="btn btn-sm text-white fw-bold" style="background:#f68820;">Download</a>`
        }
      ]
    });
  }

  // =========================================================================
  // VIEW 8: ADUAN MASYARAKAT & ULAS (#/aduan/detail/:id)
  // =========================================================================
  function renderAduanPage(container, state, id) {
    const pages = state.tb_halaman_aduan || [];
    const page = pages.find((p) => String(p.id) === String(id)) || pages[0];
    if (!page) return renderNotFound(container);

    let extraBody = "";
    if (page.tipe === "form_aduan") {
      extraBody = `
        <form id="publicAduanForm" class="mt-4 p-4 rounded-4 border" style="background:#f9fbfe;">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-bold text-dark">Nama Lengkap Pelapor *</label>
              <input type="text" name="nama_pelapor" class="form-control bg-white" required placeholder="Contoh: Budi Santoso (Kel. Penumping)">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold text-dark">NIK (Disamarkan otomatis demi privasi) *</label>
              <input type="text" name="nik" maxlength="16" class="form-control bg-white" required placeholder="16 Digit NIK KTP Surakarta">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold text-dark">Nomor WhatsApp / Telepon Aktif *</label>
              <input type="text" name="kontak" class="form-control bg-white" required placeholder="0812xxxxxxxx">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-bold text-dark">Kategori Layanan / Aduan *</label>
              <select name="kategori" class="form-select bg-white" style="height:55px;">
                <option value="Pengecekan DTKS / Desil DTSEN">Pengecekan DTKS / Desil DTSEN</option>
                <option value="Bansos PKH / BPNT Sembako">Bansos PKH / BPNT Sembako</option>
                <option value="Reaktivasi JKN-KIS PBI">Reaktivasi JKN-KIS PBI</option>
                <option value="Permohonan Alat Bantu Disabilitas/Lansia">Permohonan Alat Bantu Disabilitas/Lansia</option>
                <option value="Penanganan PPKS / Orang Terlantar">Penanganan PPKS / Orang Terlantar</option>
                <option value="Layanan PEKA / LKS / TMP">Layanan PEKA / LKS / TMP</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-bold text-dark">Uraian Aspirasi / Kronologi Pengaduan *</label>
              <textarea name="isi_aduan" rows="4" class="form-control bg-white" required placeholder="Tuliskan uraian lengkap pengaduan, lokasi kelurahan/kecamatan, dan permohonan tindak lanjut..."></textarea>
            </div>
            <div class="col-12 d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
              <div class="small text-muted"><i class="bx bx-lock-alt text-success me-1"></i>Data NIK &amp; Nomor HP disamarkan otomatis sesuai UU Pelindungan Data Pribadi.</div>
              <button type="submit" class="default-btn">
                <span>Kirim Pengaduan Resmi</span>
                <i class="bx bx-send"></i>
              </button>
            </div>
          </div>
        </form>
        <div id="aduanSubmitResult" class="mt-3"></div>
      `;
    } else if (page.tipe === "tabel_aduan" || page.tipe === "ulas") {
      extraBody = `
        <div class="mt-4">
          <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span class="badge bg-success px-3 py-2">Integrasi Realtime Database Aduan Masyarakat &amp; ULAS</span>
            <a href="#/aduan/detail/4" class="btn btn-sm btn-warning fw-bold"><i class="bx bx-plus-circle me-1"></i>Buat Aduan Baru</a>
          </div>
          <div id="dtPublikasiAduan"></div>
        </div>
      `;
    }

    container.innerHTML = `
      ${renderBreadcrumb(page.judul, [
        { label: "Beranda", href: "#/home" },
        { label: "Aduan", href: "#/aduan/detail/4" },
        { label: page.judul }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="row g-4">
            <div class="col-lg-8">
              <div class="bg-white p-4 p-lg-5 rounded-4 shadow-sm border">
                <h1 class="fs-3 mb-3 pb-3 border-bottom">${escHtml(page.judul)}</h1>
                ${page.gambar ? `<div class="mb-4 text-center"><img src="${escHtml(page.gambar)}" alt="${escHtml(page.judul)}" class="rounded-3 border w-100"></div>` : ""}
                <div>${page.konten || ""}</div>
                ${extraBody}
              </div>
            </div>
            <div class="col-lg-4">
              <div class="bg-white p-4 rounded-4 shadow-sm border mb-4">
                <h4 class="fs-5 pb-2 mb-3 border-bottom">Menu Layanan Pengaduan</h4>
                <div class="list-group list-group-flush">
                  ${pages
                    .map(
                      (m) => `<a href="#/aduan/detail/${m.id}" class="list-group-item list-group-item-action fw-semibold small ${String(m.id) === String(page.id) ? "active" : ""}" style="${String(m.id) === String(page.id) ? "background:#30296c;border-color:#30296c;" : ""}">
                        ${escHtml(m.judul)}
                      </a>`
                    )
                    .join("")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    const form = document.getElementById("publicAduanForm");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const created = await window.DinsosDB.submitAduan({
          nama_pelapor: fd.get("nama_pelapor"),
          nik: fd.get("nik"),
          kontak: fd.get("kontak"),
          kategori: fd.get("kategori"),
          isi_aduan: fd.get("isi_aduan")
        });
        form.reset();
        const resBox = document.getElementById("aduanSubmitResult");
        if (resBox) {
          resBox.innerHTML = `
            <div class="alert alert-success rounded-4 p-4 shadow-sm">
              <h5 class="fw-bold mb-2"><i class="bx bx-check-circle me-1"></i>Pengaduan Berhasil Tercatat!</h5>
              <p class="mb-2">Nomor Tiket Pengaduan Anda: <strong class="font-monospace fs-5">${escHtml(created.tiket)}</strong></p>
              <p class="small mb-3">Aduan Anda telah masuk ke Panel BackEnd Admin Dinas Sosial Kota Surakarta dan dapat dipantau secara transparan pada halaman Publikasi Aduan.</p>
              <a href="#/aduan/detail/5" class="btn btn-sm btn-success fw-bold">Lihat Status di Publikasi Aduan &rarr;</a>
            </div>
          `;
        }
      });
    }

    if (document.getElementById("dtPublikasiAduan")) {
      window.DinsosDB.renderDataTable("#dtPublikasiAduan", {
        data: state.tb_aduan_masyarakat || [],
        columns: [
          { label: "Tiket", key: "tiket", width: "130px" },
          { label: "Pelapor & Kategori", render: (r) => `<div class="fw-bold text-dark">${escHtml(r.nama_pelapor)}</div><div class="small text-warning fw-bold">${escHtml(r.kategori)}</div><div class="small text-muted">${escHtml(r.tanggal)}</div>` },
          { label: "Aduan & Tindak Lanjut Dinsos", render: (r) => `<div class="small mb-2"><strong>Aduan:</strong> ${escHtml(r.isi_aduan)}</div><div class="small p-2 rounded bg-light border-start border-3 border-success"><strong>Tindak Lanjut:</strong> ${escHtml(r.tanggapan)}</div>` },
          {
            label: "Status",
            width: "125px",
            render: (r) => {
              const cls = r.status === "Selesai" ? "bg-success" : r.status === "Diproses" ? "bg-primary" : "bg-warning text-dark";
              return `<span class="badge ${cls}">${escHtml(r.status)}</span>`;
            }
          }
        ]
      });
    }
  }

  // =========================================================================
  // VIEW 9: FAQ ACCORDION (#/faq — All 11 Official Items)
  // =========================================================================
  function renderFaqPage(container, state) {
    const faqs = state.tb_faq || [];
    container.innerHTML = `
      ${renderBreadcrumb("FAQ", [
        { label: "Beranda", href: "#/home" },
        { label: "FAQ" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <div class="section-title">
            <span>FAQ DINAS SOSIAL</span>
            <h2>Pertanyaan dan Jawaban</h2>
            <p>Seputar Pertanyaan dan Jawaban Layanan Kesejahteraan Sosial Dinas Sosial Kota Surakarta</p>
          </div>
          <div class="mx-auto" style="max-width:920px;">
            ${faqs
              .map(
                (f, idx) => `
              <div class="bkro-faq-item">
                <button type="button" class="bkro-faq-btn ${idx === 0 ? "active" : ""}">
                  <span>${idx + 1}. ${escHtml(f.pertanyaan)}</span>
                  <i class="bx ${idx === 0 ? "bx-minus" : "bx-plus"} fs-4"></i>
                </button>
                <div class="bkro-faq-body ${idx === 0 ? "show" : ""}">${escHtml(f.jawaban)}</div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      </section>
    `;

    container.querySelectorAll(".bkro-faq-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const body = btn.nextElementSibling;
        const icon = btn.querySelector("i");
        const isOpen = body.classList.contains("show");
        container.querySelectorAll(".bkro-faq-body").forEach((b) => b.classList.remove("show"));
        container.querySelectorAll(".bkro-faq-btn").forEach((b) => {
          b.classList.remove("active");
          const ic = b.querySelector("i");
          if (ic) ic.className = "bx bx-plus fs-4";
        });
        if (!isOpen) {
          btn.classList.add("active");
          body.classList.add("show");
          if (icon) icon.className = "bx bx-minus fs-4";
        }
      });
    });
  }

  // =========================================================================
  // VIEW 10: GLOBAL SITE SEARCH (#/pencarian?q=...)
  // =========================================================================
  function renderSearchPage(container, state, query) {
    const q = String(query || "").trim().toLowerCase();
    const hits = [];
    if (q) {
      (state.tb_standar_pelayanan || []).forEach((s) => {
        if (`${s.nama} ${s.nama_portal} ${s.produk}`.toLowerCase().includes(q)) {
          hits.push({ tipe: "Standar Pelayanan", judul: s.nama_portal || s.nama, deskripsi: s.produk, href: `#/standar_pelayanan/detail/${s.id}` });
        }
      });
      (state.tb_berita || []).forEach((b) => {
        if (`${b.judul} ${b.ringkasan} ${b.isi}`.toLowerCase().includes(q)) {
          hits.push({ tipe: "Berita", judul: b.judul, deskripsi: b.tanggal_label, href: `#/berita/detail/${b.id}` });
        }
      });
      (state.tb_pengumuman || []).forEach((p) => {
        if (`${p.judul} ${p.ringkasan}`.toLowerCase().includes(q)) {
          hits.push({ tipe: "Pengumuman", judul: p.judul, deskripsi: p.tanggal_label, href: `#/pengumuman/detail/${p.id}` });
        }
      });
      (state.tb_faq || []).forEach((f) => {
        if (`${f.pertanyaan} ${f.jawaban}`.toLowerCase().includes(q)) {
          hits.push({ tipe: "FAQ", judul: f.pertanyaan, deskripsi: f.jawaban.slice(0, 140) + "...", href: "#/faq" });
        }
      });
      (state.tb_ppid_informasi || []).forEach((d) => {
        if (`${d.judul} ${d.jenis}`.toLowerCase().includes(q)) {
          hits.push({ tipe: "PPID", judul: d.judul, deskripsi: `Tahun ${d.tahun || "-"}`, href: "#/ppid/daftar_informasi_publik" });
        }
      });
    }

    container.innerHTML = `
      ${renderBreadcrumb(`Hasil Pencarian: "${query}"`, [
        { label: "Beranda", href: "#/home" },
        { label: "Pencarian" }
      ])}
      <section class="ptb-70 bg-color">
        <div class="container">
          <h4 class="mb-4">Ditemukan ${hits.length} hasil untuk kata kunci "${escHtml(query)}"</h4>
          <div class="d-grid gap-3">
            ${
              hits.length === 0
                ? `<div class="bg-white p-5 rounded-4 border text-center">Tidak ditemukan konten yang cocok. Coba kata kunci seperti <strong>DTKS</strong>, <strong>PKH</strong>, <strong>Alat Bantu</strong>, <strong>PEKA</strong>, atau <strong>Jam Pelayanan</strong>.</div>`
                : hits
                    .map(
                      (h) => `<a href="${h.href}" class="bg-white p-4 rounded-4 border shadow-sm d-block">
                        <span class="badge bg-warning text-dark mb-2">${escHtml(h.tipe)}</span>
                        <h5 class="mb-1">${escHtml(h.judul)}</h5>
                        <p class="small text-muted mb-0">${escHtml(h.deskripsi || "")}</p>
                      </a>`
                    )
                    .join("")
            }
          </div>
        </div>
      </section>
    `;
  }

  function renderNotFound(container) {
    container.innerHTML = `
      <section class="ptb-100 bg-color text-center">
        <div class="container">
          <div class="display-1 fw-bold" style="color:#30296c;">404</div>
          <h2 class="mb-3">Halaman Tidak Ditemukan</h2>
          <p class="mb-4">Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan.</p>
          <a href="#/home" class="default-btn"><span>Kembali ke Beranda</span><i class="bx bx-home"></i></a>
        </div>
      </section>
    `;
  }

  // =========================================================================
  // MAIN ROUTE DISPATCHER
  // =========================================================================
  function dispatchRoute() {
    const state = window.DinsosDB.getState();
    syncHeaderAndFooter(state);

    const container = document.getElementById("frontendAppRoot");
    if (!container) return;
    if (sliderTimer) {
      clearInterval(sliderTimer);
      sliderTimer = null;
    }

    const rawRoute = getRoute();
    const [pathPart, queryPart] = rawRoute.split("?");
    const cleanPath = pathPart.replace(/\/+$/, "") || "/home";

    // Highlight active menu
    document.querySelectorAll(".dinsos-nav-link").forEach((a) => a.classList.remove("active"));

    if (cleanPath === "/home" || cleanPath === "") {
      document.title = "Beranda - Dinas Sosial Kota Surakarta";
      return renderHomeView(container, state);
    }

    let m;
    if ((m = cleanPath.match(/^\/profil\/detail\/(.+)$/))) {
      document.title = "Profil - Dinas Sosial Kota Surakarta";
      return renderProfilDetail(container, state, m[1]);
    }
    if (cleanPath === "/standar_pelayanan") {
      document.title = "Standar Pelayanan - Dinas Sosial Kota Surakarta";
      return renderStandarPelayananList(container, state);
    }
    if ((m = cleanPath.match(/^\/standar_pelayanan\/detail\/(.+)$/))) {
      document.title = "Detail Standar Pelayanan - Dinas Sosial Kota Surakarta";
      return renderStandarOrLayananDetail(container, state, m[1], false);
    }
    if ((m = cleanPath.match(/^\/layanan\/bidang\/(.+)$/))) {
      document.title = "Layanan Bidang - Dinas Sosial Kota Surakarta";
      return renderLayananBidang(container, state, m[1]);
    }
    if ((m = cleanPath.match(/^\/layanan\/detail\/(.+)$/))) {
      document.title = "Detail Layanan - Dinas Sosial Kota Surakarta";
      return renderStandarOrLayananDetail(container, state, m[1], true);
    }
    if (cleanPath === "/berita") {
      document.title = "Berita - Dinas Sosial Kota Surakarta";
      return renderCardGridPage(container, state, {
        table: "tb_berita",
        baseRoute: "berita",
        title: "Berita Terkini",
        eyebrow: "Berita Terkini",
        heading: "Ikuti Perkembangan Berita Terkini dari Dinas Sosial"
      });
    }
    if ((m = cleanPath.match(/^\/berita\/detai?l?\/(.+)$/))) {
      document.title = "Detail Berita - Dinas Sosial Kota Surakarta";
      return renderPostDetailPage(container, state, {
        table: "tb_berita",
        baseRoute: "berita",
        breadcrumbTitle: "Detail Berita",
        listLabel: "Berita Terkini"
      }, m[1]);
    }
    if (cleanPath === "/pengumuman") {
      document.title = "Pengumuman - Dinas Sosial Kota Surakarta";
      return renderCardGridPage(container, state, {
        table: "tb_pengumuman",
        baseRoute: "pengumuman",
        title: "Pengumuman",
        eyebrow: "Pengumuman",
        heading: "Pengumuman Resmi Dinas Sosial Kota Surakarta"
      });
    }
    if ((m = cleanPath.match(/^\/pengumuman\/detai?l?\/(.+)$/))) {
      document.title = "Detail Pengumuman - Dinas Sosial Kota Surakarta";
      return renderPostDetailPage(container, state, {
        table: "tb_pengumuman",
        baseRoute: "pengumuman",
        breadcrumbTitle: "Detail Berita",
        listLabel: "Pengumuman Terkini"
      }, m[1]);
    }
    if (cleanPath === "/artikel") {
      document.title = "Artikel - Dinas Sosial Kota Surakarta";
      return renderCardGridPage(container, state, {
        table: "tb_artikel",
        baseRoute: "artikel",
        title: "Artikel",
        eyebrow: "Artikel",
        heading: "Artikel & Edukasi Kesejahteraan Sosial"
      });
    }
    if ((m = cleanPath.match(/^\/artikel\/detail\/(.+)$/))) {
      document.title = "Detail Artikel - Dinas Sosial Kota Surakarta";
      return renderPostDetailPage(container, state, {
        table: "tb_artikel",
        baseRoute: "artikel",
        breadcrumbTitle: "Detail Artikel",
        listLabel: "Artikel"
      }, m[1]);
    }
    if (cleanPath === "/agenda") {
      document.title = "Agenda - Dinas Sosial Kota Surakarta";
      return renderAgendaPage(container, state);
    }
    if (cleanPath === "/bank_data") {
      document.title = "bank_data - Dinas Sosial Kota Surakarta";
      return renderBankDataPage(container, state);
    }
    if (cleanPath === "/unduhan") {
      document.title = "Unduhan - Dinas Sosial Kota Surakarta";
      return renderUnduhanPage(container, state);
    }
    if (cleanPath === "/galeri/gambar") {
      document.title = "Galeri Gambar - Dinas Sosial Kota Surakarta";
      return renderGaleriGambar(container, state);
    }
    if (cleanPath === "/galeri/video") {
      document.title = "Galeri Video - Dinas Sosial Kota Surakarta";
      return renderGaleriVideo(container, state);
    }
    if (cleanPath === "/ppid/profil") {
      document.title = "Profil PPID - Dinas Sosial Kota Surakarta";
      return renderPpidProfil(container, state);
    }
    if (cleanPath === "/ppid/daftar_informasi_publik") {
      document.title = "Daftar Informasi Publik - Dinas Sosial Kota Surakarta";
      return renderDaftarInformasiPublik(container, state);
    }
    if ((m = cleanPath.match(/^\/ppid\/informasi_(berkala|serta_merta|setiap_saat|dikecualikan)(?:\/kategori\/(.+))?$/))) {
      document.title = "PPID Informasi Publik - Dinas Sosial Kota Surakarta";
      return renderPpidJenisPage(container, state, m[1], m[2] || null);
    }
    if ((m = cleanPath.match(/^\/aduan\/detail\/(.+)$/))) {
      document.title = "Layanan Pengaduan - Dinas Sosial Kota Surakarta";
      return renderAduanPage(container, state, m[1]);
    }
    if (cleanPath === "/faq") {
      document.title = "FAQ - Dinas Sosial Kota Surakarta";
      return renderFaqPage(container, state);
    }
    if (cleanPath === "/pencarian") {
      const params = new URLSearchParams(queryPart || "");
      return renderSearchPage(container, state, params.get("q") || "");
    }

    return renderNotFound(container);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await window.DinsosDB.init();
    dispatchRoute();

    window.addEventListener("hashchange", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      dispatchRoute();
    });

    window.DinsosDB.subscribe(() => {
      dispatchRoute();
    });

    // Sticky Navbar behavior
    const navArea = document.getElementById("mainNavbarArea");
    window.addEventListener("scroll", () => {
      if (!navArea) return;
      if (window.scrollY > 110) navArea.classList.add("is-sticky");
      else navArea.classList.remove("is-sticky");
    });

    // Search Popup
    const searchBtn = document.getElementById("navSearchToggle");
    const searchBox = document.getElementById("navSearchPopup");
    const searchForm = document.getElementById("navSearchForm");
    if (searchBtn && searchBox) {
      searchBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        searchBox.classList.toggle("open");
        const inp = searchBox.querySelector("input");
        if (searchBox.classList.contains("open") && inp) inp.focus();
      });
      document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target) && e.target !== searchBtn) {
          searchBox.classList.remove("open");
        }
      });
    }
    if (searchForm) {
      searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = searchForm.querySelector("input").value.trim();
        if (searchBox) searchBox.classList.remove("open");
        navTo(`/pencarian?q=${encodeURIComponent(q)}`);
      });
    }

    // Handle hash route links smoothly across both static HTML and clean URL modes
    document.body.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#/']");
      if (link) {
        e.preventDefault();
        const targetHash = link.getAttribute("href");
        const offcanvasEl = document.getElementById("mobileNavOffcanvas");
        if (offcanvasEl && offcanvasEl.classList.contains("show") && window.bootstrap) {
          bootstrap.Offcanvas.getInstance(offcanvasEl)?.hide();
        }
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
          dispatchRoute();
        }
      }
    });
  });
})();
