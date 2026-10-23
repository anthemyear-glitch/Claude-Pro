/**
 * PORTAL CONTROLLER — PORTAL | Dinas Sosial Kota Surakarta (15 Layanan Terintegrasi)
 */
(function () {
  let currentBidang = "all";
  let searchQuery = "";

  function getBidangName(bidangList, bidangId) {
    const b = bidangList.find((x) => Number(x.id) === Number(bidangId));
    return b ? b.nama_bidang : "Layanan Terpadu";
  }

  function renderServices(state) {
    const grid = document.getElementById("portalServicesGrid");
    const countBadge = document.getElementById("portalServiceCount");
    if (!grid) return;

    const bidangList = state.ref_bidang || [];
    const allServices = [...(state.tb_standar_pelayanan || [])].sort(
      (a, b) => (Number(a.urutan_portal) || 99) - (Number(b.urutan_portal) || 99)
    );

    const filtered = allServices.filter((item) => {
      const matchBidang = currentBidang === "all" || String(item.bidang_id) === String(currentBidang);
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        String(item.nama_portal || "").toLowerCase().includes(q) ||
        String(item.nama || "").toLowerCase().includes(q) ||
        String(item.produk || "").toLowerCase().includes(q);
      return matchBidang && matchSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} dari ${allServices.length} Layanan Terintegrasi`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="bg-white rounded-4 p-5 text-center border">
            <i class="bx bx-search-alt fs-1 text-warning mb-2"></i>
            <h4>Layanan tidak ditemukan</h4>
            <p class="text-muted mb-3">Silakan ubah kata kunci pencarian atau pilih kategori bidang lainnya.</p>
            <button type="button" class="btn btn-sm btn-warning fw-bold" id="resetPortalFilter">Tampilkan Semua 15 Layanan</button>
          </div>
        </div>
      `;
      const rst = document.getElementById("resetPortalFilter");
      if (rst) {
        rst.addEventListener("click", () => {
          currentBidang = "all";
          searchQuery = "";
          const inp = document.getElementById("portalSearchInput");
          if (inp) inp.value = "";
          document.querySelectorAll(".portal-filter-btn").forEach((b) => {
            b.classList.toggle("active", b.dataset.bidang === "all");
          });
          renderServices(state);
        });
      }
      return;
    }

    grid.innerHTML = filtered
      .map((srv, idx) => {
        const bidangLabel = getBidangName(bidangList, srv.bidang_id);
        return `
          <div class="col-xl-4 col-md-6">
            <article class="portal-service-card">
              <div class="portal-service-thumb">
                <img src="${srv.gambar || "assets/images/slider/slide-pelayanan-2.jpg"}" alt="${srv.nama_portal || srv.nama}" loading="lazy">
                <span class="portal-service-num">Layanan #${srv.urutan_portal || idx + 1}</span>
                <span class="portal-service-free"><i class="bx bx-check-shield me-1"></i>${srv.biaya || "Gratis"}</span>
              </div>
              <div class="portal-service-icon-badge">
                <i class="${srv.ikon || "bx bx-check-circle"}"></i>
              </div>
              <div class="portal-service-body">
                <div class="small fw-bold text-uppercase mb-1" style="color:#f68820;font-size:11.5px;">${bidangLabel}</div>
                <h3>${srv.nama_portal || srv.nama}</h3>
                <p class="mb-2">${srv.nama}</p>
                <div class="d-flex align-items-center gap-2 small text-muted mb-3">
                  <span><i class="bx bx-time-five text-warning me-1"></i>${srv.waktu || "Hari Kerja"}</span>
                </div>
                <button type="button" class="btn-selengkapnya" data-service-id="${srv.id}">
                  <span>Selengkapnya</span>
                  <i class="bx bx-right-arrow-alt fs-5"></i>
                </button>
              </div>
            </article>
          </div>
        `;
      })
      .join("");

    grid.querySelectorAll(".btn-selengkapnya").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.serviceId;
        openServiceModal(state, id);
      });
    });
  }

  function openServiceModal(state, serviceId) {
    const srv = (state.tb_standar_pelayanan || []).find((x) => String(x.id) === String(serviceId));
    if (!srv) return;
    const bidangLabel = getBidangName(state.ref_bidang || [], srv.bidang_id);
    const modalBody = document.getElementById("sopModalBody");
    const modalTitle = document.getElementById("sopModalLabel");
    const fullLink = document.getElementById("sopModalFullLink");

    if (modalTitle) modalTitle.textContent = srv.nama_portal || srv.nama;
    if (fullLink) fullLink.href = `home.html#/standar_pelayanan/detail/${srv.id}`;

    const persyaratanList = Array.isArray(srv.persyaratan)
      ? srv.persyaratan.map((p) => `<li class="mb-1">${p}</li>`).join("")
      : `<li>${srv.persyaratan || "-"}</li>`;

    const prosedurList = Array.isArray(srv.prosedur)
      ? srv.prosedur.map((p) => `<li class="mb-1">${p}</li>`).join("")
      : `<li>${srv.prosedur || "-"}</li>`;

    if (modalBody) {
      modalBody.innerHTML = `
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span class="badge rounded-pill px-3 py-2" style="background:#30296c;">${bidangLabel}</span>
          <span class="badge rounded-pill bg-success px-3 py-2"><i class="bx bx-check-circle me-1"></i>Biaya: ${srv.biaya || "Gratis"}</span>
          <span class="badge rounded-pill bg-warning text-dark px-3 py-2"><i class="bx bx-time me-1"></i>Waktu: ${srv.waktu}</span>
        </div>

        <div class="row g-3">
          <div class="col-md-6">
            <div class="p-3 rounded-3 h-100" style="background:#f8fafc;border:1px solid #e2e8f0;">
              <h6 class="fw-bold mb-2" style="color:#30296c;"><i class="bx bx-list-check text-warning me-1"></i>A. Persyaratan Pelayanan</h6>
              <ol class="ps-3 mb-0 small text-dark">${persyaratanList}</ol>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-3 rounded-3 h-100" style="background:#fff8f0;border:1px solid #fed7aa;">
              <h6 class="fw-bold mb-2" style="color:#30296c;"><i class="bx bx-git-branch text-warning me-1"></i>B. Sistem, Mekanisme &amp; Prosedur</h6>
              <ol class="ps-3 mb-0 small text-dark">${prosedurList}</ol>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded-3 border bg-white h-100">
              <div class="small text-muted fw-bold">C. Jangka Waktu</div>
              <div class="fw-bold text-dark mt-1">${srv.waktu}</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded-3 border bg-white h-100">
              <div class="small text-muted fw-bold">D. Biaya / Tarif</div>
              <div class="fw-bold text-success mt-1">${srv.biaya} (Rp 0,-)</div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="p-3 rounded-3 border bg-white h-100">
              <div class="small text-muted fw-bold">E. Produk Pelayanan</div>
              <div class="fw-bold text-dark mt-1 small">${srv.produk}</div>
            </div>
          </div>
          <div class="col-12">
            <div class="p-3 rounded-3 border bg-light">
              <div class="small fw-bold" style="color:#30296c;"><i class="bx bx-support text-warning me-1"></i>F. Penanganan Pengaduan, Saran &amp; Masukan</div>
              <div class="small text-muted mt-1">${srv.pengaduan}</div>
            </div>
          </div>
        </div>
      `;
    }

    const modalEl = document.getElementById("sopDetailModal");
    if (modalEl && window.bootstrap) {
      const m = bootstrap.Modal.getOrCreateInstance(modalEl);
      m.show();
    }
  }

  function applyBranding(state) {
    const p = state.tb_profil_website || {};
    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el && val) el.textContent = val;
    };
    setTxt("portalTagline", p.tagline_portal);
    setTxt("portalDesc", p.deskripsi_portal);
    setTxt("portalFooterAddress", p.alamat);
    setTxt("portalFooterEmail", p.email);
    setTxt("portalFooterPhone", `${p.telepon} / WA ${p.whatsapp}`);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const state = await window.DinsosDB.init();
    applyBranding(state);
    renderServices(state);

    window.DinsosDB.subscribe((newState) => {
      applyBranding(newState);
      renderServices(newState);
    });

    document.querySelectorAll(".portal-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".portal-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        currentBidang = btn.dataset.bidang || "all";
        renderServices(window.DinsosDB.getState());
      });
    });

    const searchInput = document.getElementById("portalSearchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value;
        renderServices(window.DinsosDB.getState());
      });
    }
  });
})();
