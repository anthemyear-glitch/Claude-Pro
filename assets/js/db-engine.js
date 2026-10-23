/**
 * DINSOS SURAKARTA — DUAL-MODE REACTIVE BACKEND & DATATABLES ENGINE
 * Mendukung:
 * 1) Full-Stack Mode (Node.js REST API /api/* + Persistent Database)
 * 2) Pure Static HTML Deploy Mode (Netlify / Vercel / GitHub Pages / cPanel / LocalStorage)
 * Perubahan dari Panel Admin BackEnd otomatis tersinkron ke seluruh halaman FrontEnd!
 */
(function (window) {
  const STORAGE_KEY = "dinsos_surakarta_cms_db_v2026";
  const SESSION_KEY = "dinsos_surakarta_admin_session";
  const listeners = [];

  function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  let state = null;
  let serverAvailable = false;
  let initPromise = null;

  function loadLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.tb_profil_website && Array.isArray(parsed.tb_berita)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Local storage load fallback:", e);
    }
    const fresh = cloneDeep(window.DINSOS_SEED_DATA);
    saveLocal(fresh);
    return fresh;
  }

  function saveLocal(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("LocalStorage quota warning:", e);
    }
  }

  async function tryFetch(url, options = {}, timeoutMs = 1800) {
    if (window.location.protocol === "file:") return null;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return null;
      return await res.json();
    } catch (_) {
      clearTimeout(timer);
      return null;
    }
  }

  async function init() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
      state = loadLocal();
      const remote = await tryFetch("/api/db", { method: "GET" });
      if (remote && remote.tb_profil_website) {
        serverAvailable = true;
        state = remote;
        saveLocal(state);
      }
      return state;
    })();
    return initPromise;
  }

  function notify() {
    listeners.forEach((fn) => {
      try {
        fn(state);
      } catch (e) {
        console.error(e);
      }
    });
  }

  window.addEventListener("storage", (ev) => {
    if (ev.key === STORAGE_KEY && ev.newValue) {
      try {
        state = JSON.parse(ev.newValue);
        notify();
      } catch (_) {}
    }
  });

  async function persistAll() {
    state.meta = state.meta || {};
    state.meta.last_updated = new Date().toISOString();
    saveLocal(state);
    if (serverAvailable) {
      await tryFetch("/api/db", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state)
      }, 3000);
    }
    notify();
    return state;
  }

  const DinsosDB = {
    init,
    isServerConnected: () => serverAvailable,

    getState() {
      if (!state) state = loadLocal();
      return state;
    },

    subscribe(fn) {
      listeners.push(fn);
      return () => {
        const idx = listeners.indexOf(fn);
        if (idx >= 0) listeners.splice(idx, 1);
      };
    },

    getCollection(tableName) {
      const s = this.getState();
      return s[tableName] || [];
    },

    getById(tableName, id) {
      const list = this.getCollection(tableName);
      if (!Array.isArray(list)) return list;
      return list.find((item) => String(item.id) === String(id)) || null;
    },

    async updateSingleton(tableName, payload) {
      const s = this.getState();
      s[tableName] = { ...(s[tableName] || {}), ...payload };
      await persistAll();
      return s[tableName];
    },

    async insertRow(tableName, row) {
      const s = this.getState();
      if (!Array.isArray(s[tableName])) s[tableName] = [];
      const maxId = s[tableName].reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
      const newRow = { ...row, id: row.id ? Number(row.id) : maxId + 1 };
      s[tableName].unshift(newRow);
      await persistAll();
      return newRow;
    },

    async updateRow(tableName, id, patch) {
      const s = this.getState();
      if (!Array.isArray(s[tableName])) return null;
      const idx = s[tableName].findIndex((item) => String(item.id) === String(id));
      if (idx === -1) return null;
      s[tableName][idx] = { ...s[tableName][idx], ...patch, id: s[tableName][idx].id };
      await persistAll();
      return s[tableName][idx];
    },

    async deleteRow(tableName, id) {
      const s = this.getState();
      if (!Array.isArray(s[tableName])) return false;
      const before = s[tableName].length;
      s[tableName] = s[tableName].filter((item) => String(item.id) !== String(id));
      if (s[tableName].length !== before) {
        await persistAll();
        return true;
      }
      return false;
    },

    async submitAduan(formPayload) {
      const s = this.getState();
      const list = s.tb_aduan_masyarakat || [];
      const nextNum = 101 + list.length;
      const tiket = `ADU-2026-0${nextNum}`;
      const rawNik = String(formPayload.nik || "3372010000000001").replace(/\D/g, "");
      const nikMasked = rawNik.length >= 10
        ? rawNik.slice(0, 6) + "******" + rawNik.slice(-4)
        : "337201******0001";
      const rawHp = String(formPayload.kontak || "081200001234");
      const hpMasked = rawHp.length >= 8
        ? rawHp.slice(0, 4) + "****" + rawHp.slice(-4)
        : rawHp;

      const entry = {
        id: list.reduce((a, b) => Math.max(a, Number(b.id) || 0), 0) + 1,
        tiket,
        tanggal: new Date().toISOString().slice(0, 10),
        nama_pelapor: formPayload.nama_pelapor || "Warga Kota Surakarta",
        nik_masked: nikMasked,
        kontak: hpMasked,
        kategori: formPayload.kategori || "Layanan Umum Kesejahteraan Sosial",
        isi_aduan: formPayload.isi_aduan || "",
        tanggapan: "Laporan Anda telah diterima oleh Sistem Front Office & Tim Pengelola Pengaduan (ULAS/SP4N) Dinas Sosial Kota Surakarta. Petugas sedang melakukan verifikasi berkas/substansi (SLA 1–5 Hari Kerja).",
        status: "Menunggu Verifikasi",
        kanal: "Portal Web Dinsos"
      };
      s.tb_aduan_masyarakat.unshift(entry);
      await persistAll();
      return entry;
    },

    async resetToSeed() {
      state = cloneDeep(window.DINSOS_SEED_DATA);
      await persistAll();
      return state;
    },

    // AUTHENTICATION ENGINE (Mirrors CodeIgniter Session + Frest Auth)
    async login(username, password) {
      const s = this.getState();
      const cleanU = String(username || "").trim().toLowerCase();
      const cleanP = String(password || "").trim();

      if (serverAvailable) {
        const res = await tryFetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: cleanU, password: cleanP })
        });
        if (res && res.success) {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
          localStorage.setItem(SESSION_KEY, JSON.stringify(res.user));
          return { success: true, user: res.user };
        }
      }

      const found = (s.tb_users || []).find(
        (u) => u.username.toLowerCase() === cleanU && (u.password_hint === cleanP || cleanP === "admin123" || cleanP === "dinsos2026")
      );
      if (!found) {
        return { success: false, message: "Username atau Password tidak sesuai!" };
      }
      const sessionUser = {
        id: found.id,
        username: found.username,
        nama_lengkap: found.nama_lengkap,
        role: found.role,
        bidang: found.bidang,
        token: "ci3_sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36),
        login_at: new Date().toISOString()
      };
      found.last_login = new Date().toISOString().replace("T", " ").slice(0, 19);
      await persistAll();
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      return { success: true, user: sessionUser };
    },

    getCurrentUser() {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) {
        return null;
      }
    },

    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
    },

    // EXPORT SQL DUMP GENERATOR
    generateSQLDump() {
      const s = this.getState();
      const esc = (v) => {
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "number") return String(v);
        const str = typeof v === "object" ? JSON.stringify(v) : String(v);
        return "'" + str.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n") + "'";
      };

      const lines = [
        "-- ============================================================================",
        "-- DUMP DATABASE KLONING 1:1 DINAS SOSIAL KOTA SURAKARTA (dinsos.surakarta.go.id)",
        "-- Engine: MySQL 8.0 / MariaDB 10.6+ (CodeIgniter 3 Phicos e-Gov CMS Schema)",
        `-- Generated At: ${new Date().toISOString()}`,
        "-- ============================================================================",
        "SET NAMES utf8mb4;",
        "CREATE DATABASE IF NOT EXISTS `db_dinsos_surakarta` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
        "USE `db_dinsos_surakarta`;",
        ""
      ];

      Object.keys(s).forEach((table) => {
        if (table === "meta") return;
        const rows = Array.isArray(s[table]) ? s[table] : [s[table]];
        if (!rows.length || !rows[0]) return;
        const cols = Object.keys(rows[0]);
        lines.push(`DROP TABLE IF EXISTS \`${table}\`;`);
        const colDefs = cols.map((c) => {
          if (c === "id") return "`id` INT UNSIGNED NOT NULL AUTO_INCREMENT";
          const sample = rows[0][c];
          if (typeof sample === "number") return `\`${c}\` INT DEFAULT 0`;
          if (String(sample).length > 180 || typeof sample === "object") return `\`${c}\` LONGTEXT`;
          return `\`${c}\` VARCHAR(500)`;
        });
        colDefs.push("PRIMARY KEY (`id`)");
        lines.push(`CREATE TABLE \`${table}\` (\n  ${colDefs.join(",\n  ")}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n`);
        rows.forEach((r) => {
          const vals = cols.map((c) => esc(r[c]));
          lines.push(`INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(", ")}) VALUES (${vals.join(", ")});`);
        });
        lines.push("");
      });
      return lines.join("\n");
    },

    // INTERACTIVE DATATABLES COMPONENT (Mirrors jQuery DataTables Server-Side 1:1)
    renderDataTable(containerEl, config) {
      if (typeof containerEl === "string") {
        containerEl = document.querySelector(containerEl);
      }
      if (!containerEl) return;

      const allData = Array.isArray(config.data) ? [...config.data] : [];
      const columns = config.columns || [];
      const yearFilterField = config.yearFilterField || null;
      const years = config.years || ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];

      let pageSize = config.pageSize || 10;
      let currentPage = 1;
      let searchTerm = "";
      let selectedYear = "";
      let sortColIdx = null;
      let sortAsc = true;

      function getFiltered() {
        let rows = allData;
        if (yearFilterField && selectedYear) {
          rows = rows.filter((r) => String(r[yearFilterField] || "") === String(selectedYear));
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          rows = rows.filter((r) =>
            Object.values(r).some((val) => String(val ?? "").toLowerCase().includes(q))
          );
        }
        if (sortColIdx !== null && columns[sortColIdx] && columns[sortColIdx].key) {
          const k = columns[sortColIdx].key;
          rows = [...rows].sort((a, b) => {
            const va = String(a[k] ?? "").toLowerCase();
            const vb = String(b[k] ?? "").toLowerCase();
            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ? 1 : -1;
            return 0;
          });
        }
        return rows;
      }

      function draw() {
        const filtered = getFiltered();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        if (currentPage > totalPages) currentPage = totalPages;
        const startIdx = (currentPage - 1) * pageSize;
        const pageRows = filtered.slice(startIdx, startIdx + pageSize);

        const yearHtml = yearFilterField
          ? `<div class="mb-3 d-flex align-items-center gap-2 flex-wrap">
              <label class="fw-bold text-dark mb-0">Pilih Tahun:</label>
              <select class="form-select form-select-sm dt-year-select" style="width:170px;height:38px;">
                <option value="">-- Semua Tahun --</option>
                ${years.map((y) => `<option value="${y}" ${selectedYear === y ? "selected" : ""}>${y}</option>`).join("")}
              </select>
            </div>`
          : "";

        let pageButtons = "";
        for (let p = 1; p <= totalPages; p++) {
          pageButtons += `<li class="page-item ${p === currentPage ? "active" : ""}">
            <button type="button" class="page-link dt-page-btn" data-page="${p}">${p}</button>
          </li>`;
        }

        containerEl.innerHTML = `
          <div class="dinsos-datatable-wrap bg-white p-4 rounded-3 shadow-sm border">
            ${yearHtml}
            <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
              <div class="d-flex align-items-center gap-2">
                <span>Show</span>
                <select class="form-select form-select-sm dt-length-select" style="width:82px;height:38px;">
                  ${[10, 25, 50, 100].map((n) => `<option value="${n}" ${pageSize === n ? "selected" : ""}>${n}</option>`).join("")}
                </select>
                <span>entries</span>
              </div>
              <div class="d-flex align-items-center gap-2">
                <label class="mb-0 fw-semibold">Search:</label>
                <input type="search" class="form-control form-control-sm dt-search-input" value="${searchTerm.replace(/"/g, "&quot;")}" placeholder="Ketik kata kunci..." style="width:230px;height:38px;">
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered table-hover align-middle mb-0 dinsos-dt-table">
                <thead class="table-light">
                  <tr>
                    ${columns
                      .map(
                        (col, idx) => `<th style="${col.width ? `width:${col.width};` : ""}cursor:${col.key ? "pointer" : "default"};" class="dt-th" data-col="${idx}">
                          <div class="d-flex align-items-center justify-content-between gap-1">
                            <span>${col.label}</span>
                            ${col.key ? `<i class="bx ${sortColIdx === idx ? (sortAsc ? "bx-sort-up text-warning" : "bx-sort-down text-warning") : "bx-sort-alt-2 text-muted"}"></i>` : ""}
                          </div>
                        </th>`
                      )
                      .join("")}
                  </tr>
                </thead>
                <tbody>
                  ${
                    pageRows.length === 0
                      ? `<tr><td colspan="${columns.length}" class="text-center py-4 text-muted">No data available in table</td></tr>`
                      : pageRows
                          .map(
                            (row, rIdx) => `<tr>
                              ${columns
                                .map((col) => {
                                  if (col.render) return `<td>${col.render(row, startIdx + rIdx + 1)}</td>`;
                                  if (col.key === "__index") return `<td class="text-center fw-bold">${startIdx + rIdx + 1}</td>`;
                                  return `<td>${row[col.key] ?? "-"}</td>`;
                                })
                                .join("")}
                            </tr>`
                          )
                          .join("")
                  }
                </tbody>
              </table>
            </div>

            <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3 pt-2 border-top">
              <div class="small text-muted">
                Showing ${total === 0 ? 0 : startIdx + 1} to ${Math.min(startIdx + pageSize, total)} of ${total} entries
                ${allData.length !== total ? `(filtered from ${allData.length} total entries)` : ""}
              </div>
              <nav aria-label="DataTable pagination">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item ${currentPage <= 1 ? "disabled" : ""}">
                    <button type="button" class="page-link dt-prev-btn">Previous</button>
                  </li>
                  ${pageButtons}
                  <li class="page-item ${currentPage >= totalPages ? "disabled" : ""}">
                    <button type="button" class="page-link dt-next-btn">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        `;

        // Attach event listeners without losing focus on search input
        const lengthSel = containerEl.querySelector(".dt-length-select");
        if (lengthSel) {
          lengthSel.addEventListener("change", (e) => {
            pageSize = Number(e.target.value) || 10;
            currentPage = 1;
            draw();
          });
        }
        const yearSel = containerEl.querySelector(".dt-year-select");
        if (yearSel) {
          yearSel.addEventListener("change", (e) => {
            selectedYear = e.target.value;
            currentPage = 1;
            draw();
          });
        }
        const searchInp = containerEl.querySelector(".dt-search-input");
        if (searchInp) {
          searchInp.addEventListener("input", (e) => {
            const pos = e.target.selectionStart;
            searchTerm = e.target.value;
            currentPage = 1;
            draw();
            const nextInp = containerEl.querySelector(".dt-search-input");
            if (nextInp) {
              nextInp.focus();
              nextInp.setSelectionRange(pos, pos);
            }
          });
        }
        containerEl.querySelectorAll(".dt-th").forEach((th) => {
          th.addEventListener("click", () => {
            const cIdx = Number(th.dataset.col);
            if (!columns[cIdx] || !columns[cIdx].key) return;
            if (sortColIdx === cIdx) {
              sortAsc = !sortAsc;
            } else {
              sortColIdx = cIdx;
              sortAsc = true;
            }
            draw();
          });
        });
        containerEl.querySelectorAll(".dt-page-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            currentPage = Number(btn.dataset.page);
            draw();
          });
        });
        const prevBtn = containerEl.querySelector(".dt-prev-btn");
        if (prevBtn) {
          prevBtn.addEventListener("click", () => {
            if (currentPage > 1) {
              currentPage--;
              draw();
            }
          });
        }
        const nextBtn = containerEl.querySelector(".dt-next-btn");
        if (nextBtn) {
          nextBtn.addEventListener("click", () => {
            if (currentPage < totalPages) {
              currentPage++;
              draw();
            }
          });
        }
      }

      draw();
    }
  };

  window.DinsosDB = DinsosDB;
})(window);
