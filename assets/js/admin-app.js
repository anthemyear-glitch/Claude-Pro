/**
 * BACKEND ADMIN CMS CONTROLLER — FREST BOOTSTRAP ADMIN (Dinas Sosial Kota Surakarta)
 * Mengelola seluruh tabel relasional secara real-time (Full CRUD + Moderasi Aduan + Export SQL/JSON).
 */
(function () {
  let activeModule = "dashboard";
  let chartInstances = [];

  function esc(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showToast(msg, type = "success") {
    const box = document.getElementById("adminToastArea");
    if (!box) return;
    const id = "t_" + Date.now();
    const bg = type === "danger" ? "bg-danger" : type === "warning" ? "bg-warning text-dark" : "bg-success";
    box.insertAdjacentHTML(
      "beforeend",
      `<div id="${id}" class="toast show align-items-center text-white ${bg} border-0 mb-2 shadow" role="alert">
        <div class="d-flex">
          <div class="toast-body fw-semibold">${esc(msg)}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}')?.remove()"></button>
        </div>
      </div>`
    );
    setTimeout(() => document.getElementById(id)?.remove(), 3500);
  }

  function destroyCharts() {
    chartInstances.forEach((c) => {
      try { c.destroy(); } catch (_) {}
    });
    chartInstances = [];
  }

  //Declarative Schema Definitions for All CRUD Modules (Matches CodeIgniter 3 Models)
  const MODULE_SCHEMAS = {
    slide_show: {
      title: "Manajemen Slide Show Beranda",
      table: "tb_slide_show",
      subtitle: "Mengelola banner utama (Hero Slider) pada halaman /home",
      fields: [
        { name: "urutan", label: "Urutan Tampil", type: "number", required: true },
        { name: "judul", label: "Judul Utama", type: "text", required: true },
        { name: "subjudul", label: "Subjudul / Keterangan Kegiatan", type: "text", required: true },
        { name: "gambar", label: "Path / URL Gambar", type: "text", default: "assets/images/slider/slide-dkt-1.jpg" },
        { name: "tautan", label: "Tautan Tombol", type: "text", default: "#/profil/detail/7" },
        { name: "aktif", label: "Status Aktif (1=Ya, 0=Tidak)", type: "number", default: 1 }
      ],
      cols: [
        { label: "#", key: "urutan", width: "65px" },
        { label: "Preview", width: "110px", render: (r) => `<img src="${esc(r.gambar)}" class="rounded border" style="width:85px;height:50px;object-fit:cover;">` },
        { label: "Judul & Subjudul", render: (r) => `<div class="fw-bold text-dark">${esc(r.judul)}</div><div class="small text-muted">${esc(r.subjudul)}</div>` },
        { label: "Status", width: "95px", render: (r) => Number(r.aktif) ? `<span class="badge bg-success">Aktif</span>` : `<span class="badge bg-secondary">Nonaktif</span>` }
      ]
    },
    tupoksi: {
      title: "Manajemen Tugas Pokok & Fungsi (Tupoksi)",
      table: "tb_tupoksi",
      subtitle: "Mengelola 6 kartu animasi Tupoksi pada halaman Beranda",
      fields: [
        { name: "urutan", label: "Urutan", type: "number", required: true },
        { name: "ikon", label: "Kelas Ikon Boxicons", type: "text", default: "bx bx-check-shield" },
        { name: "judul", label: "Judul Tupoksi", type: "text", required: true },
        { name: "deskripsi", label: "Uraian Tugas Pokok & Fungsi", type: "textarea", required: true }
      ],
      cols: [
        { label: "#", key: "urutan", width: "60px" },
        { label: "Judul Tupoksi", key: "judul" },
        { label: "Uraian", key: "deskripsi" }
      ]
    },
    profil_menu: {
      title: "Manajemen Halaman Profil & SK Pelayanan",
      table: "tb_profil",
      subtitle: "Mengelola seluruh submenu dropdown Profil (Visi Misi, Bagan, RENSTRA, Maklumat, SK 2026)",
      fields: [
        { name: "urutan", label: "Urutan Menu", type: "number", default: 1 },
        { name: "judul", label: "Judul Menu Profil", type: "text", required: true },
        { name: "slug", label: "Slug URL", type: "text" },
        { name: "gambar", label: "Path / URL Gambar (Opsional)", type: "text" },
        { name: "konten", label: "Konten HTML Halaman", type: "textarea", required: true }
      ],
      cols: [
        { label: "ID", key: "id", width: "65px" },
        { label: "Judul Halaman", key: "judul" },
        { label: "Route Publik", width: "190px", render: (r) => `<a href="home.html#/profil/detail/${r.id}" target="_blank" class="small font-monospace">/profil/detail/${r.id}</a>` }
      ]
    },
    standar_pelayanan: {
      title: "Manajemen 15 Layanan Portal & Standar Pelayanan",
      table: "tb_standar_pelayanan",
      subtitle: "Mengelola 15 Layanan Terintegrasi pada Portal (/) sekaligus Standar Pelayanan & Layanan per Bidang",
      fields: [
        { name: "urutan_portal", label: "Urutan di Portal (1-15)", type: "number", default: 1 },
        { name: "bidang_id", label: "ID Bidang (1=Dayasos, 2=Rehabsos, 3=Linjamsos, 4=Sekretariat)", type: "number", default: 1 },
        { name: "nama_portal", label: "Nama Layanan di Portal", type: "text", required: true },
        { name: "nama", label: "Judul Standar Pelayanan", type: "text", required: true },
        { name: "ikon", label: "Kelas Ikon Boxicons", type: "text", default: "bx bx-check-circle" },
        { name: "gambar", label: "Gambar Thumbnail", type: "text", default: "assets/images/slider/slide-pelayanan-2.jpg" },
        { name: "waktu", label: "Jangka Waktu Pelayanan", type: "text", default: "10 Menit / Hari Kerja" },
        { name: "biaya", label: "Biaya / Tarif", type: "text", default: "Gratis" },
        { name: "produk", label: "Produk Pelayanan", type: "text", required: true },
        { name: "persyaratan", label: "Persyaratan (Pisahkan baris baru)", type: "array_lines", required: true },
        { name: "prosedur", label: "Sistem, Mekanisme & Prosedur (Pisahkan baris baru)", type: "array_lines", required: true }
      ],
      cols: [
        { label: "#", key: "urutan_portal", width: "55px" },
        { label: "Layanan", render: (r) => `<div class="fw-bold text-dark">${esc(r.nama_portal || r.nama)}</div><div class="small text-muted">Produk: ${esc(r.produk)}</div>` },
        { label: "Waktu & Biaya", width: "180px", render: (r) => `<div class="small">${esc(r.waktu)}</div><span class="badge bg-success">${esc(r.biaya)}</span>` }
      ]
    },
    berita: {
      title: "Manajemen Berita Terkini",
      table: "tb_berita",
      subtitle: "Mengelola publikasi berita kegiatan Dinas Sosial Kota Surakarta (/berita)",
      fields: [
        { name: "judul", label: "Judul Berita", type: "text", required: true },
        { name: "tanggal", label: "Tanggal (YYYY-MM-DD)", type: "date", required: true },
        { name: "tanggal_label", label: "Label Tanggal Tampil (Contoh: 23 Oktober 2026)", type: "text", required: true },
        { name: "penulis", label: "Penulis / Bidang", type: "text", default: "Admin Dinsos Surakarta" },
        { name: "kategori", label: "Kategori Berita", type: "text", default: "Pelayanan Publik" },
        { name: "gambar", label: "Path / URL Gambar", type: "text", default: "assets/images/berita/berita-tagana.jpg" },
        { name: "ringkasan", label: "Ringkasan Singkat", type: "textarea", required: true },
        { name: "isi", label: "Isi Berita Lengkap (HTML)", type: "textarea", required: true }
      ],
      cols: [
        { label: "ID", key: "id", width: "65px" },
        { label: "Gambar", width: "95px", render: (r) => `<img src="${esc(r.gambar)}" class="rounded border" style="width:72px;height:48px;object-fit:cover;">` },
        { label: "Judul Berita", render: (r) => `<div class="fw-bold text-dark">${esc(r.judul)}</div><div class="small text-muted">${esc(r.tanggal_label || r.tanggal)} • ${esc(r.kategori || "")}</div>` }
      ]
    },
    pengumuman: {
      title: "Manajemen Pengumuman Resmi",
      table: "tb_pengumuman",
      subtitle: "Mengelola pengumuman SKM, Ombudsman, Kepegawaian & Jam Pelayanan (/pengumuman)",
      fields: [
        { name: "judul", label: "Judul Pengumuman", type: "text", required: true },
        { name: "tanggal", label: "Tanggal (YYYY-MM-DD)", type: "date", required: true },
        { name: "tanggal_label", label: "Label Tanggal Tampil", type: "text", required: true },
        { name: "gambar", label: "Path / URL Poster Gambar", type: "text", default: "assets/images/skm-poster.svg" },
        { name: "ringkasan", label: "Ringkasan", type: "textarea", required: true },
        { name: "isi", label: "Isi Lengkap Pengumuman (HTML)", type: "textarea", required: true }
      ],
      cols: [
        { label: "ID", key: "id", width: "65px" },
        { label: "Judul Pengumuman", key: "judul" },
        { label: "Tanggal", key: "tanggal_label", width: "160px" }
      ]
    },
    artikel: {
      title: "Manajemen Artikel Sosial",
      table: "tb_artikel",
      subtitle: "Mengelola artikel edukasi dan pendampingan sosial (/artikel)",
      fields: [
        { name: "judul", label: "Judul Artikel", type: "text", required: true },
        { name: "tanggal", label: "Tanggal", type: "date", required: true },
        { name: "tanggal_label", label: "Label Tanggal", type: "text", required: true },
        { name: "gambar", label: "Gambar", type: "text", default: "assets/images/berita/berita-tagana.jpg" },
        { name: "isi", label: "Isi Artikel (HTML)", type: "textarea", required: true }
      ],
      cols: [
        { label: "ID", key: "id", width: "65px" },
        { label: "Judul Artikel", key: "judul" },
        { label: "Tanggal", key: "tanggal_label", width: "160px" }
      ]
    },
    agenda: {
      title: "Manajemen Agenda Kegiatan",
      table: "tb_agenda",
      subtitle: "Mengelola jadwal kegiatan pada DataTables /agenda",
      fields: [
        { name: "acara", label: "Nama Acara / Kegiatan", type: "text", required: true },
        { name: "tempat", label: "Tempat Pelaksanaan", type: "text", required: true },
        { name: "tanggal", label: "Tanggal (YYYY-MM-DD)", type: "date", required: true },
        { name: "jam", label: "Jam Pelaksanaan", type: "text", default: "08.00 – 12.00 WIB" },
        { name: "status", label: "Status", type: "text", default: "Terjadwal" }
      ],
      cols: [
        { label: "#", key: "__index", width: "55px" },
        { label: "Acara", key: "acara" },
        { label: "Tempat", key: "tempat" },
        { label: "Tanggal & Jam", width: "180px", render: (r) => `<div>${esc(r.tanggal)}</div><small class="text-muted">${esc(r.jam)}</small>` }
      ]
    },
    bank_data: {
      title: "Manajemen Bank Data",
      table: "tb_bank_data",
      subtitle: "Mengelola dokumen e-SIK, Hibah Bansos & Statistik Sosial (/bank_data)",
      fields: [
        { name: "nama", label: "Nama Dataset / Dokumen", type: "text", required: true },
        { name: "kategori", label: "Kategori", type: "text", default: "Data Kesejahteraan Sosial" },
        { name: "tahun", label: "Tahun", type: "text", default: "2026" },
        { name: "file_url", label: "URL File / Unduhan", type: "text", required: true }
      ],
      cols: [
        { label: "#", key: "__index", width: "55px" },
        { label: "Nama Dokumen Bank Data", key: "nama" },
        { label: "Tahun", key: "tahun", width: "100px" }
      ]
    },
    galeri_gambar: {
      title: "Manajemen Galeri Gambar",
      table: "tb_galeri",
      subtitle: "Mengelola dokumentasi foto kegiatan pada /galeri/gambar",
      fields: [
        { name: "judul", label: "Judul / Caption Foto", type: "text", required: true },
        { name: "kategori", label: "Kategori Kegiatan", type: "text", default: "Pemberdayaan Sosial" },
        { name: "tanggal", label: "Tanggal", type: "date", default: "2026-10-23" },
        { name: "gambar", label: "Path / URL Foto", type: "text", default: "assets/images/slider/slide-dkt-1.jpg", required: true }
      ],
      cols: [
        { label: "Foto", width: "100px", render: (r) => `<img src="${esc(r.gambar)}" class="rounded border" style="width:76px;height:52px;object-fit:cover;">` },
        { label: "Judul Dokumentasi", key: "judul" },
        { label: "Kategori", key: "kategori", width: "170px" }
      ]
    },
    galeri_video: {
      title: "Manajemen Galeri Video YouTube",
      table: "tb_galeri_video",
      subtitle: "Mengelola embed video kanal YouTube DINAS SOSIAL KOTA SURAKARTA (/galeri/video)",
      fields: [
        { name: "judul", label: "Judul Video", type: "text", required: true },
        { name: "youtube_id", label: "YouTube Video ID", type: "text", required: true },
        { name: "embed_url", label: "URL Embed YouTube (https://www.youtube.com/embed/...)", type: "text", required: true },
        { name: "channel", label: "Nama Channel", type: "text", default: "DINAS SOSIAL KOTA SURAKARTA" }
      ],
      cols: [
        { label: "ID", key: "id", width: "60px" },
        { label: "Judul Video", key: "judul" },
        { label: "YouTube ID", key: "youtube_id", width: "140px" }
      ]
    },
    ppid_informasi: {
      title: "Manajemen Dokumen Informasi Publik (PPID)",
      table: "tb_ppid_informasi",
      subtitle: "Mengelola dokumen Informasi Berkala, Serta Merta, Setiap Saat, Dikecualikan & DIP",
      fields: [
        { name: "judul", label: "Judul Dokumen Informasi Publik", type: "text", required: true },
        { name: "jenis", label: "Klasifikasi (berkala / serta_merta / setiap_saat / dikecualikan)", type: "text", default: "berkala", required: true },
        { name: "kategori_id", label: "ID Kategori PPID (Contoh: 1=Profil Badan Publik, 2=Program, 4=Keuangan)", type: "number", default: 1 },
        { name: "tahun", label: "Tahun Dokumen", type: "text", default: "2026" },
        { name: "file_url", label: "URL Dokumen / Lampiran", type: "text", required: true }
      ],
      cols: [
        { label: "ID", key: "id", width: "60px" },
        { label: "Judul Dokumen", key: "judul" },
        { label: "Jenis", width: "135px", render: (r) => `<span class="badge bg-info text-dark text-uppercase">${esc(r.jenis)}</span>` },
        { label: "Tahun", key: "tahun", width: "90px" }
      ]
    },
    ppid_pimpinan: {
      title: "Manajemen Profil Pimpinan PPID",
      table: "tb_ppid_pimpinan",
      subtitle: "Mengelola data Kepala Dinas & Sekretaris Dinas pada /ppid/profil",
      fields: [
        { name: "nama", label: "Nama Lengkap & Gelar", type: "text", required: true },
        { name: "pangkat_golongan", label: "Pangkat / Gol. Ruang", type: "text", required: true },
        { name: "jabatan", label: "Jabatan Struktural", type: "text", required: true },
        { name: "peran_ppid", label: "Kedudukan dalam PPID", type: "text", default: "PPID Pelaksana" },
        { name: "foto", label: "Path Foto Pimpinan", type: "text", default: "assets/images/pimpinan-kadis.svg" }
      ],
      cols: [
        { label: "Nama Pimpinan", key: "nama" },
        { label: "Pangkat/Gol", key: "pangkat_golongan" },
        { label: "Jabatan", key: "jabatan" }
      ]
    },
    aduan_masyarakat: {
      title: "Moderasi & Tindak Lanjut Aduan Masyarakat (ULAS / Web)",
      table: "tb_aduan_masyarakat",
      subtitle: "Membalas dan memperbarui status penyelesaian aduan warga secara real-time",
      fields: [
        { name: "tiket", label: "Nomor Tiket", type: "text", required: true },
        { name: "tanggal", label: "Tanggal Masuk", type: "date", required: true },
        { name: "nama_pelapor", label: "Nama Pelapor", type: "text", required: true },
        { name: "kategori", label: "Kategori Aduan", type: "text", required: true },
        { name: "isi_aduan", label: "Isi Laporan Warga", type: "textarea", required: true },
        { name: "tanggapan", label: "Tanggapan / Tindak Lanjut Resmi Dinsos", type: "textarea", required: true },
        { name: "status", label: "Status (Menunggu Verifikasi / Diproses / Selesai)", type: "text", default: "Selesai", required: true }
      ],
      cols: [
        { label: "Tiket", key: "tiket", width: "130px" },
        { label: "Pelapor & Isi Aduan", render: (r) => `<div class="fw-bold text-dark">${esc(r.nama_pelapor)} <span class="badge bg-light text-dark border ms-1">${esc(r.kategori)}</span></div><div class="small text-muted mt-1">${esc(r.isi_aduan)}</div><div class="small text-success mt-1"><strong>Balasan:</strong> ${esc(r.tanggapan)}</div>` },
        {
          label: "Status",
          width: "130px",
          render: (r) => {
            const c = r.status === "Selesai" ? "bg-success" : r.status === "Diproses" ? "bg-primary" : "bg-warning text-dark";
            return `<span class="badge ${c}">${esc(r.status)}</span>`;
          }
        }
      ]
    },
    unduhan: {
      title: "Manajemen Dokumen Unduhan Publik",
      table: "tb_unduhan",
      subtitle: "Mengelola berkas unduhan pada halaman /unduhan",
      fields: [
        { name: "dokumen", label: "Nama Dokumen", type: "text", required: true },
        { name: "kategori", label: "Kategori", type: "text", default: "Surat Keputusan" },
        { name: "ukuran", label: "Ukuran Berkas", type: "text", default: "850 KB" },
        { name: "file_url", label: "Path / URL File", type: "text", required: true }
      ],
      cols: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Nama Dokumen", key: "dokumen" },
        { label: "Kategori", key: "kategori", width: "160px" }
      ]
    },
    faq: {
      title: "Manajemen FAQ (Pertanyaan & Jawaban)",
      table: "tb_faq",
      subtitle: "Mengelola daftar pertanyaan umum masyarakat pada halaman /faq",
      fields: [
        { name: "pertanyaan", label: "Pertanyaan", type: "text", required: true },
        { name: "jawaban", label: "Jawaban Lengkap", type: "textarea", required: true }
      ],
      cols: [
        { label: "#", key: "__index", width: "60px" },
        { label: "Pertanyaan", key: "pertanyaan" },
        { label: "Jawaban", render: (r) => `<div class="small text-muted">${esc(r.jawaban).slice(0, 140)}...</div>` }
      ]
    },
    pmks_psks: {
      title: "Manajemen Statistik SIM PMKS & PSKS Kecamatan",
      table: "tb_pmks_psks",
      subtitle: "Mengelola data agregat 5 Kecamatan pada sub-aplikasi /pmks",
      fields: [
        { name: "kecamatan", label: "Nama Kecamatan", type: "text", required: true },
        { name: "kelurahan_jml", label: "Jumlah Kelurahan", type: "number", required: true },
        { name: "fakir_miskin_kk", label: "Keluarga Fakir Miskin / DTKS (KK)", type: "number", required: true },
        { name: "lansia_terlantar", label: "Lansia Terlantar (Jiwa)", type: "number", required: true },
        { name: "disabilitas", label: "Penyandang Disabilitas (Jiwa)", type: "number", required: true },
        { name: "anak_terlantar", label: "Anak Terlantar / Rentan (Jiwa)", type: "number", required: true },
        { name: "kpm_pkh", label: "Penerima PKH (KPM)", type: "number", required: true },
        { name: "kpm_bpnt", label: "Penerima BPNT / Sembako (KPM)", type: "number", required: true },
        { name: "lks_terdaftar", label: "Jumlah LKS Terdaftar", type: "number", required: true }
      ],
      cols: [
        { label: "Kecamatan", key: "kecamatan" },
        { label: "DTKS (KK)", key: "fakir_miskin_kk" },
        { label: "Disabilitas", key: "disabilitas" },
        { label: "KPM PKH", key: "kpm_pkh" },
        { label: "KPM BPNT", key: "kpm_bpnt" },
        { label: "LKS", key: "lks_terdaftar" }
      ]
    },
    users: {
      title: "Manajemen Pengguna & Hak Akses (RBAC)",
      table: "tb_users",
      subtitle: "Mengelola akun administrator dan operator bidang pada sistem BackEnd",
      fields: [
        { name: "username", label: "Username Login", type: "text", required: true },
        { name: "password_hint", label: "Password", type: "text", required: true },
        { name: "nama_lengkap", label: "Nama Lengkap Pegawai", type: "text", required: true },
        { name: "role", label: "Role (Superadmin / Admin PPID / Admin Bidang)", type: "text", default: "Admin Bidang" },
        { name: "bidang", label: "Unit Kerja / Bidang", type: "text", default: "Sekretariat" }
      ],
      cols: [
        { label: "Username", key: "username" },
        { label: "Nama Lengkap", key: "nama_lengkap" },
        { label: "Role", key: "role" },
        { label: "Bidang", key: "bidang" },
        { label: "Login Terakhir", key: "last_login" }
      ]
    }
  };

  // =========================================================================
  // RENDER DASHBOARD ANALYTICS
  // =========================================================================
  function renderDashboard(container, state) {
    const kpis = [
      { label: "Layanan Terintegrasi", val: (state.tb_standar_pelayanan || []).length, icon: "bx bx-layer", color: "#5a8dee", bg: "rgba(90,141,238,0.15)" },
      { label: "Berita & Artikel", val: (state.tb_berita || []).length + (state.tb_artikel || []).length, icon: "bx bx-news", color: "#39da8a", bg: "rgba(57,218,138,0.15)" },
      { label: "Dokumen PPID", val: (state.tb_ppid_informasi || []).length, icon: "bx bx-folder-open", color: "#fdac41", bg: "rgba(253,172,65,0.16)" },
      { label: "Aduan Masyarakat", val: (state.tb_aduan_masyarakat || []).length, icon: "bx bx-message-rounded-dots", color: "#ff5b5c", bg: "rgba(255,91,92,0.15)" }
    ];

    const recentAduan = (state.tb_aduan_masyarakat || []).slice(0, 5);

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h4 class="mb-1">Dashboard Utama — CMS Dinas Sosial Kota Surakarta</h4>
          <div class="small text-muted">Sinkronisasi real-time antara BackEnd Admin (Frest) dan FrontEnd Publik (Bkro + Portal 15 Layanan).</div>
        </div>
        <div class="d-flex gap-2">
          <a href="index.html" target="_blank" class="btn btn-sm btn-outline-primary fw-semibold"><i class="bx bx-link-external me-1"></i>Buka Portal</a>
          <a href="home.html" target="_blank" class="btn btn-sm btn-frest-primary"><i class="bx bx-globe me-1"></i>Buka Website (/home)</a>
        </div>
      </div>

      <div class="row g-3 mb-4">
        ${kpis
          .map(
            (k) => `
          <div class="col-xl-3 col-sm-6">
            <div class="frest-card d-flex align-items-center justify-content-between">
              <div>
                <div class="small text-muted fw-semibold mb-1">${esc(k.label)}</div>
                <h3 class="mb-0 fw-bold">${k.val}</h3>
              </div>
              <div class="frest-kpi-icon" style="background:${k.bg};color:${k.color};">
                <i class="${k.icon}"></i>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>

      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="frest-card h-100">
            <h5 class="fs-6 mb-3">Sebaran KPM Bansos &amp; DTKS per Kecamatan (SIM PMKS Surakarta)</h5>
            <div style="height:290px;"><canvas id="chartPmksBar"></canvas></div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="frest-card h-100">
            <h5 class="fs-6 mb-3">Komposisi Dokumen PPID</h5>
            <div style="height:290px;"><canvas id="chartPpidDoughnut"></canvas></div>
          </div>
        </div>
      </div>

      <div class="frest-card">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fs-6 mb-0">Aduan Masyarakat Terbaru (Integrasi ULAS &amp; Formulir Website)</h5>
          <button type="button" class="btn btn-sm btn-outline-primary" data-jump-mod="aduan_masyarakat">Kelola Semua Aduan &rarr;</button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr><th>Tiket</th><th>Tanggal</th><th>Pelapor</th><th>Kategori</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${recentAduan
                .map(
                  (a) => `<tr>
                    <td class="font-monospace fw-bold">${esc(a.tiket)}</td>
                    <td>${esc(a.tanggal)}</td>
                    <td>${esc(a.nama_pelapor)}</td>
                    <td>${esc(a.kategori)}</td>
                    <td><span class="badge ${a.status === "Selesai" ? "bg-success" : "bg-warning text-dark"}">${esc(a.status)}</span></td>
                  </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelector("[data-jump-mod]")?.addEventListener("click", () => switchModule("aduan_masyarakat"));

    if (window.Chart) {
      const pmks = state.tb_pmks_psks || [];
      const ctx1 = document.getElementById("chartPmksBar");
      if (ctx1) {
        chartInstances.push(
          new Chart(ctx1, {
            type: "bar",
            data: {
              labels: pmks.map((x) => x.kecamatan),
              datasets: [
                { label: "Keluarga DTKS (KK)", data: pmks.map((x) => x.fakir_miskin_kk), backgroundColor: "#5a8dee" },
                { label: "Penerima BPNT", data: pmks.map((x) => x.kpm_bpnt), backgroundColor: "#39da8a" },
                { label: "Penerima PKH", data: pmks.map((x) => x.kpm_pkh), backgroundColor: "#fdac41" }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false }
          })
        );
      }

      const docs = state.tb_ppid_informasi || [];
      const countBy = (j) => docs.filter((d) => d.jenis === j).length;
      const ctx2 = document.getElementById("chartPpidDoughnut");
      if (ctx2) {
        chartInstances.push(
          new Chart(ctx2, {
            type: "doughnut",
            data: {
              labels: ["Berkala", "Serta Merta", "Setiap Saat", "Dikecualikan"],
              datasets: [
                {
                  data: [countBy("berkala"), countBy("serta_merta"), countBy("setiap_saat"), countBy("dikecualikan")],
                  backgroundColor: ["#5a8dee", "#fdac41", "#39da8a", "#ff5b5c"]
                }
              ]
            },
            options: { responsive: true, maintainAspectRatio: false }
          })
        );
      }
    }
  }

  // =========================================================================
  // RENDER SINGLETON PROFIL WEBSITE SETTINGS
  // =========================================================================
  function renderProfilWebsiteForm(container, state) {
    const p = state.tb_profil_website || {};
    container.innerHTML = `
      <div class="frest-card">
        <h4 class="mb-1">Pengaturan Identitas &amp; Konfigurasi Website</h4>
        <p class="small text-muted mb-4">Perubahan pada form ini langsung memperbarui Header, Motto, Visi-Misi, Kontak, QR SKM, dan Footer di seluruh halaman FrontEnd.</p>
        <form id="singletonProfilForm" class="row g-3">
          <div class="col-md-6">
            <label class="form-label fw-semibold">Nama Instansi</label>
            <input type="text" name="nama_instansi" class="form-control" value="${esc(p.nama_instansi)}">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Motto Pelayanan</label>
            <input type="text" name="motto_pelayanan" class="form-control" value="${esc(p.motto_pelayanan)}">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Visi Pelayanan</label>
            <textarea name="visi_pelayanan" rows="3" class="form-control">${esc(p.visi_pelayanan)}</textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Misi Pelayanan</label>
            <textarea name="misi_pelayanan" rows="3" class="form-control">${esc(p.misi_pelayanan)}</textarea>
          </div>
          <div class="col-md-8">
            <label class="form-label fw-semibold">Alamat Kantor Lengkap</label>
            <input type="text" name="alamat" class="form-control" value="${esc(p.alamat)}">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Email Resmi</label>
            <input type="email" name="email" class="form-control" value="${esc(p.email)}">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Nomor Telepon</label>
            <input type="text" name="telepon" class="form-control" value="${esc(p.telepon)}">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Hotline WhatsApp</label>
            <input type="text" name="whatsapp" class="form-control" value="${esc(p.whatsapp)}">
          </div>
          <div class="col-md-4">
            <label class="form-label fw-semibold">Nilai IKM SKM Terkini</label>
            <input type="text" name="skm_nilai_ikm" class="form-control" value="${esc(p.skm_nilai_ikm)}">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Jam Pelayanan Header</label>
            <input type="text" name="jam_pelayanan_header" class="form-control" value="${esc(p.jam_pelayanan_header)}">
          </div>
          <div class="col-md-6">
            <label class="form-label fw-semibold">Link Instrumen SKM Realtime (Appbagor)</label>
            <input type="text" name="skm_url" class="form-control" value="${esc(p.skm_url)}">
          </div>
          <div class="col-12 pt-2">
            <button type="submit" class="btn btn-frest-primary px-4"><i class="bx bx-save me-1"></i>Simpan Perubahan Konfigurasi</button>
          </div>
        </form>
      </div>
    `;

    document.getElementById("singletonProfilForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const patch = {};
      fd.forEach((v, k) => (patch[k] = v));
      await window.DinsosDB.updateSingleton("tb_profil_website", patch);
      showToast("Konfigurasi Profil Website berhasil diperbarui!");
    });
  }

  // =========================================================================
  // RENDER GENERIC CRUD MODULE
  // =========================================================================
  function renderCrudModule(container, state, modKey) {
    const schema = MODULE_SCHEMAS[modKey];
    if (!schema) return;
    const rows = state[schema.table] || [];

    container.innerHTML = `
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h4 class="mb-1">${esc(schema.title)}</h4>
          <div class="small text-muted">${esc(schema.subtitle)} • Tabel: <code>${esc(schema.table)}</code></div>
        </div>
        <button type="button" class="btn btn-frest-primary" id="btnAddRow">
          <i class="bx bx-plus-circle me-1"></i>Tambah Data Baru
        </button>
      </div>
      <div id="crudTableMount"></div>
    `;

    const colsWithActions = [
      ...schema.cols,
      {
        label: "Aksi CRUD",
        width: "155px",
        render: (row) => `
          <div class="d-flex gap-1">
            <button type="button" class="btn btn-sm btn-outline-primary btn-edit-row" data-id="${row.id}" title="Edit"><i class="bx bx-edit"></i> Edit</button>
            <button type="button" class="btn btn-sm btn-outline-danger btn-del-row" data-id="${row.id}" title="Hapus"><i class="bx bx-trash"></i></button>
          </div>
        `
      }
    ];

    window.DinsosDB.renderDataTable("#crudTableMount", {
      data: rows,
      pageSize: 10,
      columns: colsWithActions
    });

    container.querySelector("#btnAddRow").addEventListener("click", () => openCrudModal(schema, null));

    // Delegate edit & delete clicks inside crudTableMount
    document.getElementById("crudTableMount").addEventListener("click", async (e) => {
      const editBtn = e.target.closest(".btn-edit-row");
      if (editBtn) {
        const item = window.DinsosDB.getById(schema.table, editBtn.dataset.id);
        if (item) openCrudModal(schema, item);
        return;
      }
      const delBtn = e.target.closest(".btn-del-row");
      if (delBtn) {
        if (confirm("Yakin ingin menghapus data ID #" + delBtn.dataset.id + " dari tabel " + schema.table + "?")) {
          await window.DinsosDB.deleteRow(schema.table, delBtn.dataset.id);
          showToast("Data berhasil dihapus!", "warning");
          renderCrudModule(container, window.DinsosDB.getState(), modKey);
        }
      }
    });
  }

  function openCrudModal(schema, existingRow) {
    const titleEl = document.getElementById("crudModalTitle");
    const formBody = document.getElementById("crudModalFields");
    const formEl = document.getElementById("crudModalForm");
    if (!titleEl || !formBody || !formEl) return;

    titleEl.textContent = existingRow ? `Edit Data #${existingRow.id} — ${schema.title}` : `Tambah Data — ${schema.title}`;

    formBody.innerHTML = schema.fields
      .map((f) => {
        let val = existingRow ? existingRow[f.name] : f.default ?? "";
        if (f.type === "array_lines" && Array.isArray(val)) {
          val = val.join("\n");
        }
        if (f.type === "textarea" || f.type === "array_lines") {
          return `
            <div class="mb-3">
              <label class="form-label fw-semibold text-dark">${esc(f.label)}</label>
              <textarea name="${esc(f.name)}" rows="4" class="form-control" ${f.required ? "required" : ""}>${esc(val)}</textarea>
            </div>
          `;
        }
        return `
          <div class="mb-3">
            <label class="form-label fw-semibold text-dark">${esc(f.label)}</label>
            <input type="${f.type || "text"}" name="${esc(f.name)}" class="form-control" value="${esc(val)}" ${f.required ? "required" : ""}>
          </div>
        `;
      })
      .join("");

    const modalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById("crudFormModal"));
    modalInstance.show();

    formEl.onsubmit = async (ev) => {
      ev.preventDefault();
      const fd = new FormData(formEl);
      const payload = {};
      schema.fields.forEach((f) => {
        const raw = fd.get(f.name);
        if (f.type === "number") payload[f.name] = Number(raw) || 0;
        else if (f.type === "array_lines") {
          payload[f.name] = String(raw || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean);
        } else {
          payload[f.name] = raw;
        }
      });

      if (existingRow) {
        await window.DinsosDB.updateRow(schema.table, existingRow.id, payload);
        showToast("Perubahan berhasil disimpan & disinkronkan ke FrontEnd!");
      } else {
        await window.DinsosDB.insertRow(schema.table, payload);
        showToast("Data baru berhasil ditambahkan ke Database!");
      }
      modalInstance.hide();
      switchModule(activeModule);
    };
  }

  // =========================================================================
  // RENDER DATABASE BACKUP, SQL DUMP & RESET TOOLS
  // =========================================================================
  function renderDatabaseTools(container) {
    const sqlPreview = window.DinsosDB.generateSQLDump();
    container.innerHTML = `
      <div class="frest-card mb-4">
        <h4 class="mb-2">Manajemen Database, Export SQL Dump &amp; Backup JSON</h4>
        <p class="small text-muted mb-3">
          Ekspor seluruh struktur tabel dan data terkini menjadi skrip relasional <strong>MySQL / MariaDB (<code>.sql</code>)</strong> siap impor ke phpMyAdmin / CodeIgniter 3, atau unduh snapshot JSON.
        </p>
        <div class="d-flex flex-wrap gap-2 mb-4">
          <button type="button" class="btn btn-frest-primary" id="btnDownloadSql">
            <i class="bx bx-data me-1"></i>Download MySQL Dump (.sql)
          </button>
          <button type="button" class="btn btn-outline-success fw-semibold" id="btnDownloadJson">
            <i class="bx bx-code-curly me-1"></i>Download Database (.json)
          </button>
          <button type="button" class="btn btn-outline-danger fw-semibold ms-auto" id="btnResetSeed">
            <i class="bx bx-reset me-1"></i>Reset ke Data Awal Produksi Dinsos
          </button>
        </div>

        <label class="form-label fw-bold text-dark">Live Preview Skema Relasional &amp; Data SQL (MySQL 8.0 / MariaDB):</label>
        <textarea class="form-control font-monospace small bg-dark text-light" rows="16" readonly>${esc(sqlPreview)}</textarea>
      </div>
    `;

    const downloadBlob = (filename, content, mime) => {
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    };

    document.getElementById("btnDownloadSql").addEventListener("click", () => {
      downloadBlob("db_dinsos_surakarta.sql", window.DinsosDB.generateSQLDump(), "application/sql");
      showToast("File db_dinsos_surakarta.sql berhasil diunduh!");
    });
    document.getElementById("btnDownloadJson").addEventListener("click", () => {
      downloadBlob("dinsos_db_backup.json", JSON.stringify(window.DinsosDB.getState(), null, 2), "application/json");
      showToast("File dinsos_db_backup.json berhasil diunduh!");
    });
    document.getElementById("btnResetSeed").addEventListener("click", async () => {
      if (confirm("Kembalikan seluruh isi database ke data otentik awal Dinas Sosial Kota Surakarta?")) {
        await window.DinsosDB.resetToSeed();
        showToast("Database berhasil di-reset ke data awal produksi!");
        renderDatabaseTools(container);
      }
    });
  }

  // =========================================================================
  // MODULE SWITCHER
  // =========================================================================
  function switchModule(mod) {
    activeModule = mod;
    destroyCharts();

    document.querySelectorAll(".frest-menu-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mod === mod);
    });

    const container = document.getElementById("adminContentMount");
    const state = window.DinsosDB.getState();
    if (!container) return;

    if (mod === "dashboard") renderDashboard(container, state);
    else if (mod === "profil_website") renderProfilWebsiteForm(container, state);
    else if (mod === "database_tools") renderDatabaseTools(container);
    else renderCrudModule(container, state, mod);

    document.getElementById("frestSidebar")?.classList.remove("open");
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await window.DinsosDB.init();

    // Check Session (Auto-create demo session if opened directly so preview never blocks user, while still honoring login/logout)
    let user = window.DinsosDB.getCurrentUser();
    if (!user) {
      user = { username: "admin", nama_lengkap: "Administrator Utama Dinsos", role: "Superadmin", bidang: "Sekretariat / TI" };
    }
    const uNameEl = document.getElementById("adminUserName");
    const uRoleEl = document.getElementById("adminUserRole");
    if (uNameEl) uNameEl.textContent = user.nama_lengkap;
    if (uRoleEl) uRoleEl.textContent = `${user.role} • ${user.bidang}`;

    const modeBadge = document.getElementById("backendModeBadge");
    if (modeBadge) {
      if (window.DinsosDB.isServerConnected()) {
        modeBadge.className = "badge bg-success";
        modeBadge.innerHTML = `<i class="bx bx-server me-1"></i>REST API + Server DB Connected`;
      } else {
        modeBadge.className = "badge bg-primary";
        modeBadge.innerHTML = `<i class="bx bx-hdd me-1"></i>Static HTML Deploy Mode (LocalStorage Sync)`;
      }
    }

    document.querySelectorAll(".frest-menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => switchModule(btn.dataset.mod));
    });

    document.getElementById("sidebarMobileToggle")?.addEventListener("click", () => {
      document.getElementById("frestSidebar")?.classList.toggle("open");
    });

    document.getElementById("btnAdminLogout")?.addEventListener("click", () => {
      window.DinsosDB.logout();
      window.location.href = "login.html";
    });

    switchModule("dashboard");
  });
})();
