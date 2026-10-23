/**
 * Widget Aksesibilitas Ramah Disabilitas (Mirrors UserWay Widget on dinsos.surakarta.go.id)
 * + Floating Hotline WhatsApp & Back-to-Top
 */
(function () {
  function mountWidgets() {
    if (document.getElementById("dinsos-a11y-root")) return;
    const state = {
      scale: 100,
      contrast: false,
      grayscale: false,
      links: false,
      spacing: false,
      readable: false,
      guide: false
    };

    const wrap = document.createElement("div");
    wrap.id = "dinsos-a11y-root";
    wrap.innerHTML = `
      <div class="a11y-reading-guide" id="a11yReadingGuide"></div>
      <button type="button" class="uwy-trigger-btn" id="uwyTrigger" title="Menu Aksesibilitas Disabilitas (Ctrl+U)" aria-label="Menu Aksesibilitas Disabilitas">
        <i class="bx bx-handicap"></i>
      </button>
      <div class="uwy-panel" id="uwyPanel" role="dialog" aria-label="Pengaturan Aksesibilitas">
        <div class="uwy-header">
          <div>
            <div class="fw-bold" style="font-size:14.5px;"><i class="bx bx-universal-access me-1 text-warning"></i> Menu Aksesibilitas</div>
            <div style="font-size:11px;opacity:0.8;">Ramah Disabilitas — Dinsos Surakarta</div>
          </div>
          <button type="button" class="btn btn-sm text-white p-0 fs-4" id="uwyClose" aria-label="Tutup">&times;</button>
        </div>
        <div class="uwy-grid">
          <button type="button" class="uwy-opt-btn" data-act="font-up"><i class="bx bx-zoom-in"></i><span>Perbesar Teks</span></button>
          <button type="button" class="uwy-opt-btn" data-act="font-down"><i class="bx bx-zoom-out"></i><span>Perkecil Teks</span></button>
          <button type="button" class="uwy-opt-btn" data-act="contrast"><i class="bx bx-adjust"></i><span>Kontras Tinggi</span></button>
          <button type="button" class="uwy-opt-btn" data-act="grayscale"><i class="bx bx-droplet"></i><span>Hitam Putih</span></button>
          <button type="button" class="uwy-opt-btn" data-act="links"><i class="bx bx-link"></i><span>Sorot Tautan</span></button>
          <button type="button" class="uwy-opt-btn" data-act="spacing"><i class="bx bx-text"></i><span>Spasi Lebar</span></button>
          <button type="button" class="uwy-opt-btn" data-act="readable"><i class="bx bx-font-family"></i><span>Font Disleksia</span></button>
          <button type="button" class="uwy-opt-btn" data-act="guide"><i class="bx bx-ruler"></i><span>Garis Baca</span></button>
        </div>
        <div class="px-3 pb-3">
          <button type="button" class="btn btn-sm btn-outline-secondary w-100 fw-bold" id="uwyReset">
            <i class="bx bx-reset me-1"></i> Atur Ulang Aksesibilitas
          </button>
        </div>
      </div>

      <div class="dinsos-float-right">
        <button type="button" class="dinsos-gotop-btn" id="dinsosGoTop" title="Kembali ke Atas" aria-label="Kembali ke Atas">
          <i class="bx bx-chevrons-up"></i>
        </button>
        <a href="https://wa.me/628112811919?text=Halo%20Dinas%20Sosial%20Kota%20Surakarta" target="_blank" rel="noopener" class="dinsos-wa-float" title="Hotline WhatsApp Dinsos Surakarta (+628112811919)" aria-label="WhatsApp Dinsos Surakarta">
          <i class="bx bxl-whatsapp"></i>
        </a>
      </div>
    `;
    document.body.appendChild(wrap);

    const panel = document.getElementById("uwyPanel");
    const trigger = document.getElementById("uwyTrigger");
    const closeBtn = document.getElementById("uwyClose");
    const resetBtn = document.getElementById("uwyReset");
    const guide = document.getElementById("a11yReadingGuide");
    const goTop = document.getElementById("dinsosGoTop");

    trigger.addEventListener("click", () => panel.classList.toggle("open"));
    closeBtn.addEventListener("click", () => panel.classList.remove("open"));

    function syncClasses() {
      const root = document.documentElement;
      root.style.fontSize = state.scale + "%";
      root.classList.toggle("a11y-contrast", state.contrast);
      root.classList.toggle("a11y-grayscale", state.grayscale);
      root.classList.toggle("a11y-links", state.links);
      root.classList.toggle("a11y-spacing", state.spacing);
      root.classList.toggle("a11y-readable", state.readable);
      root.classList.toggle("a11y-guide", state.guide);
      wrap.querySelectorAll(".uwy-opt-btn").forEach((b) => {
        const k = b.dataset.act;
        if (state[k] !== undefined) b.classList.toggle("active", Boolean(state[k]));
      });
    }

    wrap.querySelectorAll(".uwy-opt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const act = btn.dataset.act;
        if (act === "font-up") state.scale = Math.min(130, state.scale + 10);
        else if (act === "font-down") state.scale = Math.max(85, state.scale - 10);
        else if (act in state) {
          if (act === "contrast" && !state.contrast) state.grayscale = false;
          if (act === "grayscale" && !state.grayscale) state.contrast = false;
          state[act] = !state[act];
        }
        syncClasses();
      });
    });

    resetBtn.addEventListener("click", () => {
      state.scale = 100;
      state.contrast = false;
      state.grayscale = false;
      state.links = false;
      state.spacing = false;
      state.readable = false;
      state.guide = false;
      syncClasses();
    });

    document.addEventListener("mousemove", (e) => {
      if (state.guide && guide) {
        guide.style.top = (e.clientY - 5) + "px";
      }
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 280) goTop.classList.add("visible");
      else goTop.classList.remove("visible");
    });

    goTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountWidgets);
  } else {
    mountWidgets();
  }
})();
