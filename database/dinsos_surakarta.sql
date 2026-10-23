-- ============================================================================
-- DATABASE RELASIONAL 1:1 DINAS SOSIAL KOTA SURAKARTA (dinsos.surakarta.go.id)
-- Arsitektur Asli: CodeIgniter 3 MVC + MySQL/MariaDB (Phicos e-Gov CMS)
-- ============================================================================
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS `db_dinsos_surakarta` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_dinsos_surakarta`;

DROP TABLE IF EXISTS `tb_profil_website`;
CREATE TABLE `tb_profil_website` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_instansi` VARCHAR(500),
  `pemerintah` VARCHAR(500),
  `tagline_portal` VARCHAR(500),
  `judul_portal` VARCHAR(500),
  `deskripsi_portal` VARCHAR(500),
  `motto_pelayanan` VARCHAR(500),
  `tagline_footer` VARCHAR(500),
  `inovasi_unggulan` VARCHAR(500),
  `visi_pelayanan` VARCHAR(500),
  `misi_pelayanan` VARCHAR(500),
  `visi_ppid` VARCHAR(500),
  `misi_ppid` VARCHAR(500),
  `alamat` VARCHAR(500),
  `email` VARCHAR(500),
  `telepon` VARCHAR(500),
  `whatsapp` VARCHAR(500),
  `whatsapp_clean` VARCHAR(500),
  `jam_pelayanan_header` VARCHAR(500),
  `jam_pelayanan_footer` VARCHAR(500),
  `skm_url` VARCHAR(500),
  `skm_nilai_ikm` VARCHAR(500),
  `skm_mutu` VARCHAR(500),
  `ulas_url` VARCHAR(500),
  `lapor_url` VARCHAR(500),
  `sippn_url` VARCHAR(500),
  `moniks_url` VARCHAR(500),
  `instagram_url` VARCHAR(500),
  `twitter_url` VARCHAR(500),
  `facebook_url` VARCHAR(500),
  `youtube_url` VARCHAR(500),
  `logo_dark` VARCHAR(500),
  `logo_light` VARCHAR(500),
  `gedung_portal` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_profil_website` (`id`, `nama_instansi`, `pemerintah`, `tagline_portal`, `judul_portal`, `deskripsi_portal`, `motto_pelayanan`, `tagline_footer`, `inovasi_unggulan`, `visi_pelayanan`, `misi_pelayanan`, `visi_ppid`, `misi_ppid`, `alamat`, `email`, `telepon`, `whatsapp`, `whatsapp_clean`, `jam_pelayanan_header`, `jam_pelayanan_footer`, `skm_url`, `skm_nilai_ikm`, `skm_mutu`, `ulas_url`, `lapor_url`, `sippn_url`, `moniks_url`, `instagram_url`, `twitter_url`, `facebook_url`, `youtube_url`, `logo_dark`, `logo_light`, `gedung_portal`) VALUES (1, 'Dinas Sosial Kota Surakarta', 'Pemerintah Kota Surakarta', 'SUGENG RAWUH WONTEN', 'Layanan Dinas Sosial Kota Surakarta', 'Pada Laman Website ini, terdapat 15 layanan yang terintegrasi pada Dinas Sosial Kota Surakarta.', 'Menyapa dengan Senyum , Melayani dengan Ikhlas', 'Dinsos Hadir Di Tengah Masyarakat Kota Surakarta', 'PEKA (Penerbitan rEkomendasi Keringanan pAjak Kendaraan Bermotor)', 'Terwujudnya Kesejahteraan dan Pelayanan Prima Kepada Masyarakat di Bidang Sosial', 'Peningkatan Kualitas pelayanan Bagi Pemerlu Pelayanan Kesejahtraan Sosial Melalui Rehabilitasi Sosial, Pemberdayaan Sosial, Perlindungan dan Jaminan Sosial.', 'Terwujudnya kesejahteraan dan pelayanan prima melalui pembangunan di bidang sosial', 'Peningkatan kualitas pelayanan bagi penyandang masalah kesejahteraan sosial melalui rehabilitasi, jaminan sosial, pemberdayaan sosial dan perlindungan sosial', 'Jl. Slamet Riyadi No.368, Penumping, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57141', 'dinsos@surakarta.go.id', '(0271) 734123', '+628112811919', '628112811919', 'Senin – Kamis: 07:30 – 15:30 WIB (Tanpa Istirahat) | Jum\'at: 07:30 – 14:30 WIB', 'Senin – Kamis: 08:00 – 15:00 | Hari Jum\'at: 08:00 – 11:00 (Update 2026: Senin–Kamis 07.30–15.30, Jumat 07.30–14.30)', 'https://appbagor.surakarta.go.id/sop/skm/instrumen/isi/25', '89,64', 'A (Sangat Baik)', 'https://ulas.surakarta.go.id/index.php?mod=complain&sub=frameForm&act=view&typ=html&layout=horizontal&oid=85', 'https://surakarta.lapor.go.id/', 'https://sippn.menpan.go.id/instansi/173742/pemerintah-kota-surakarta/dinas-sosial-kota-surakarta', 'https://moniks.surakarta.go.id/', 'https://www.instagram.com/dinsos_surakarta/', 'https://twitter.com/dinsosjateng', 'https://www.facebook.com/profile.php?id=100092218391317', 'https://www.youtube.com/channel/UCRqfUK0smUc3LY4XCF_y68A', 'assets/images/logo-dinsos-surakarta.svg', 'assets/images/logo-dinsos-white.svg', 'assets/images/portal/img-gedung-dinsos.png');

DROP TABLE IF EXISTS `tb_slide_show`;
CREATE TABLE `tb_slide_show` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `urutan` INT DEFAULT 0,
  `judul` VARCHAR(500),
  `subjudul` VARCHAR(500),
  `gambar` VARCHAR(500),
  `tautan` VARCHAR(500),
  `aktif` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_slide_show` (`id`, `urutan`, `judul`, `subjudul`, `gambar`, `tautan`, `aktif`) VALUES (1, 1, 'Dinas Sosial Kota Surakarta', 'Revaluasi Target Kinerja RPJMD Tahun 2021-2026 Dinas Sosial Kota Surakarta', 'assets/images/slider/slide-dkt-1.jpg', '#/profil/detail/7', 1);
INSERT INTO `tb_slide_show` (`id`, `urutan`, `judul`, `subjudul`, `gambar`, `tautan`, `aktif`) VALUES (2, 2, 'Dinas Sosial Kota Surakarta', 'Pelaksanaan DKT (Diskusi Kelompok Terbatas) Tahun 2024', 'assets/images/slider/slide-pelayanan-2.jpg', '#/standar_pelayanan', 1);
INSERT INTO `tb_slide_show` (`id`, `urutan`, `judul`, `subjudul`, `gambar`, `tautan`, `aktif`) VALUES (3, 3, 'Dinas Sosial Kota Surakarta', 'Penandatanganan Berita Acara DKT', 'assets/images/slider/slide-ba-3.jpg', '#/berita', 1);
INSERT INTO `tb_slide_show` (`id`, `urutan`, `judul`, `subjudul`, `gambar`, `tautan`, `aktif`) VALUES (4, 4, 'Dinas Sosial Kota Surakarta', 'Dokumentasi Pelaksanaan DKT Tahun 2024 Dinas Sosial Kota Surakarta', 'assets/images/berita/berita-tagana.jpg', '#/galeri/gambar', 1);
INSERT INTO `tb_slide_show` (`id`, `urutan`, `judul`, `subjudul`, `gambar`, `tautan`, `aktif`) VALUES (5, 5, 'Dinas Sosial Kota Surakarta', 'Diskusi Kelompok Terbatas Dinas Sosial Kota Surakarta Tahun 2023', 'assets/images/slider/slide-dkt-1.jpg', '#/ppid/profil', 1);

DROP TABLE IF EXISTS `tb_tupoksi`;
CREATE TABLE `tb_tupoksi` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `urutan` INT DEFAULT 0,
  `ikon` VARCHAR(500),
  `judul` VARCHAR(500),
  `deskripsi` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_tupoksi` (`id`, `urutan`, `ikon`, `judul`, `deskripsi`) VALUES (1, 1, 'bx bx-file-find', 'Perumusan Kebijakan terkait Pemberdayaan Sosial', 'Penanganan warga migran korban tindak kekerasan, rehabilitasi sosial, perlindungan dan jaminan sosial, penanganan bencana, pemeliharaan taman makam pahlawan.');
INSERT INTO `tb_tupoksi` (`id`, `urutan`, `ikon`, `judul`, `deskripsi`) VALUES (2, 2, 'bx bx-buildings', 'Penyelenggaraan urusan pemerintahan dan pelayanan umum terkait pemberdayaan sosial', 'Penyelenggaraan urusan pemerintahan dan pelayanan umum terkait pemberdayaan sosial, penanganan warga migran korban tindak kekerasan, rehabilitasi sosial, perlindungan dan jaminan sosial, penanganan bencana, pemeliharaan taman makam pahlawan.');
INSERT INTO `tb_tupoksi` (`id`, `urutan`, `ikon`, `judul`, `deskripsi`) VALUES (3, 3, 'bx bx-group', 'Pembinaan dan pelaksanaan tugas', 'Pembinaan dan pelaksanaan tugas terkait pemberdayaan sosial, penanganan warga migran korban tindak kekerasan, rehabilitasi sosial, perlindungan dan jaminan sosial, penanganan bencana, pemeliharaan taman makam pahlawan.');
INSERT INTO `tb_tupoksi` (`id`, `urutan`, `ikon`, `judul`, `deskripsi`) VALUES (4, 4, 'bx bx-line-chart', 'Pemantauan, evaluasi dan pelaporan', 'Pemantauan, evaluasi dan pelaporan terkait pemberdayaan sosial, penanganan warga migran korban tindak kekerasan, rehabilitasi sosial, perlindungan dan jaminan sosial, penanganan bencana, pemeliharaan taman makam pahlawan;');
INSERT INTO `tb_tupoksi` (`id`, `urutan`, `ikon`, `judul`, `deskripsi`) VALUES (5, 5, 'bx bx-briefcase-alt-2', 'Pelaksanaan kesekretariatan', 'Pelaksanaan kesekretariatan dinas terkait perencanaan dan penganggaran, administrasi dan umum serta organisasi dan kepegawaian.');
INSERT INTO `tb_tupoksi` (`id`, `urutan`, `ikon`, `judul`, `deskripsi`) VALUES (6, 6, 'bx bx-award', 'Pelaksanaan tugas lain', 'Pelaksanaan tugas lain yang diberikan oleh Walikota sesuai dengan tugas dan fungsinya.');

DROP TABLE IF EXISTS `tb_profil`;
CREATE TABLE `tb_profil` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `slug` VARCHAR(500),
  `urutan` INT DEFAULT 0,
  `judul` VARCHAR(500),
  `gambar` VARCHAR(500),
  `konten` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (7, 'profil-kami', 1, 'Profil Kami', 'assets/images/portal/img-gedung-dinsos.png', '<p>Pembangunan bidang kesejahteraan sosial sebagai bagian tak terpisahkan dari pembangunan nasional telah mengambil peran aktif dalam meningkatkan kualitas hidup masyarakat untuk mewujudkan kehidupan yang layak dan bermartabat, memenuhi hak kebutuhan dasar yang diselenggarakan melalui pelayanan dan pengembangan kesejahteraan sosial secara terprogram, terarah, dan berkelanjutan sebagaimana diamanatkan oleh Undang-Undang RI Nomor 11 Tahun 2009 tentang Kesejahteraan Sosial Provinsi Jawa Tengah dengan fokus pada <strong>7 (tujuh) permasalahan sosial</strong> yakni:</p>\n        <ol>\n          <li>Kemiskinan</li>\n          <li>Keterlantaran</li>\n          <li>Kecacatan / Disabilitas</li>\n          <li>Ketunaan Sosial dan Penyimpangan Perilaku</li>\n          <li>Keterpencilan</li>\n          <li>Korban Bencana Alam maupun Sosial</li>\n          <li>Tindak Korban Kekerasan dan Pekerja Migran, baik yang bersifat primer maupun akibat/dampak non sosial.</li>\n        </ol>\n        <p>Dinas Sosial Kota Surakarta mempunyai tugas pokok menyelenggarakan urusan pemerintahan daerah bidang sosial berdasarkan asas otonomi daerah dan tugas pembantuan guna mendukung visi Kota Surakarta yang Waras, Wasis, Wareg, Mapan, dan Papan (3WMP).</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (8, 'visi-dan-misi', 2, 'Visi dan Misi', 'assets/images/maklumat-pelayanan.svg', '<div class="p-4 rounded-3 mb-4" style="background:#fff8f0;border-left:5px solid #f68820;">\n          <h4 class="mb-2">VISI PELAYANAN :</h4>\n          <p class="fst-italic fw-bold mb-0" style="color:#30296c;font-size:18px;">"TERWUJUDNYA KESEJAHTERAAN SOSIAL DAN PELAYANAN PRIMA KEPADA MASYARAKAT DI BIDANG SOSIAL."</p>\n        </div>\n        <div class="p-4 rounded-3" style="background:#f0f9ff;border-left:5px solid #30296c;">\n          <h4 class="mb-2">MISI PELAYANAN :</h4>\n          <p class="fst-italic fw-bold mb-0" style="color:#30296c;font-size:18px;">"PENINGKATAN KUALITAS PELAYANAN BAGI PEMERLU PELAYANAN KESEJAHTERAAN SOSIAL MELALUI REHABILITASI SOSIAL, PEMBERDAYAAN SOSIAL, PERLINDUNGAN DAN JAMINAN SOSIAL."</p>\n        </div>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (9, 'visi-dan-misi-layanan', 3, 'Visi dan Misi Layanan', '', '<p>Seluruh penyelenggaraan pelayanan publik pada Loket Terpadu (Front Office) Dinas Sosial Kota Surakarta berpedoman pada prinsip <strong>5S (Senyum, Salam, Sapa, Sopan, dan Santun)</strong> dengan target layanan cepat, transparan, akuntabel, ramah kelompok rentan/disabilitas, dan <strong>100% Tanpa Biaya (Gratis)</strong>.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (10, 'susunan-organisasi', 4, 'Susunan Organisasi', '', '<p><strong>Susunan Organisasi Dinas Sosial Kota Surakarta terdiri dari:</strong></p>\n        <ul>\n          <li><strong>a. Kepala Dinas:</strong> Drs. Samsu Tri Wahyudin, M.Si.</li>\n          <li><strong>b. Sekretariat</strong> (Margono, S.STP, M.Si), terdiri dari:\n            <ol>\n              <li>Subbagian Perencanaan dan Penganggaran;</li>\n              <li>Subbagian Administrasi dan Umum;</li>\n              <li>Subbagian Kepegawaian dan Organisasi.</li>\n            </ol>\n          </li>\n          <li><strong>c. Bidang Pemberdayaan Sosial, Kepahlawanan, dan Penanganan Bencana</strong>, terdiri dari:\n            <ol>\n              <li>Seksi Pemberdayaan Sosial;</li>\n              <li>Seksi Pengelolaan Taman Makam Pahlawan dan Penanganan Bencana;</li>\n            </ol>\n          </li>\n          <li><strong>d. Bidang Rehabilitasi Sosial</strong>, terdiri dari:\n            <ol>\n              <li>Seksi Rehabilitasi Sosial Dasar;</li>\n              <li>Seksi Rehabilitasi Sosial PMKS Lainnya;</li>\n            </ol>\n          </li>\n          <li><strong>e. Bidang Penanganan Fakir Miskin dan Perlindungan Sosial</strong>, terdiri dari:\n            <ol>\n              <li>Seksi Pendataan dan Pengelolaan Data Kemiskinan;</li>\n              <li>Seksi Penanganan Fakir Miskin dan Anak Terlantar;</li>\n              <li>Seksi Perlindungan Sosial;</li>\n            </ol>\n          </li>\n          <li><strong>f. UPT (Rumah Singgah &amp; SLRT Puskesos);</strong> dan</li>\n          <li><strong>g. Kelompok Jabatan Fungsional</strong> (Pekerja Sosial &amp; Penyuluh Sosial).</li>\n        </ul>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (11, 'bagan-organisasi', 5, 'Bagan Organisasi', 'assets/images/bagan-organisasi.svg', '<p>Bagan Struktur Organisasi Dinas Sosial Pemerintah Kota Surakarta sesuai Peraturan Wali Kota Surakarta tentang Kedudukan, Susunan Organisasi, Tugas dan Fungsi Serta Tata Kerja Dinas Sosial Kota Surakarta.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (12, 'rekognisasi', 6, 'Penghargaan & Rekognisasi', 'assets/images/skm-poster.svg', '<ul>\n          <li><strong>Penghargaan Penilaian Maladministrasi Pelayanan Publik Ombudsman RI Tahun 2026</strong> — Kategori Kepatuhan Tinggi / Opini Kualitas Tertinggi.</li>\n          <li><strong>Juara 1 Gelar Inovasi Perangkat Daerah Kota Surakarta Tahun 2024</strong> — Inovasi <em>"SIAGA RESCUE"</em> Dinas Sosial Kota Surakarta.</li>\n          <li><strong>Juara III ASN Berprestasi Kota Surakarta Tahun 2024</strong> — Inovasi Pelayanan Sosial Terpadu.</li>\n          <li><strong>Predikat Mutu Pelayanan A (Sangat Baik — IKM 89,64)</strong> pada Survei Kepuasan Masyarakat (SKM) Tahun 2025–2026.</li>\n        </ul>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (13, 'motto-pelayanan', 7, 'Motto Pelayanan', 'assets/images/slider/slide-pelayanan-2.jpg', '<div class="text-center p-5 rounded-4" style="background:linear-gradient(135deg,#30296c,#1e1b4b);color:#fff;">\n          <span class="badge bg-warning text-dark mb-3 px-3 py-2">MOTTO PELAYANAN DINSOS SURAKARTA</span>\n          <h2 class="text-white fw-bold">"Menyapa dengan Senyum , Melayani dengan Ikhlas"</h2>\n          <p class="mt-3 mb-0 text-light">Selalu Ada, Bersahaja, Bangga Melayani Masyarakat Kota Surakarta.</p>\n        </div>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (14, 'renstra-dinsos-2021-2026', 8, 'RENSTRA DINSOS 2021-2026', '', '<p>Dokumen Rencana Strategis (RENSTRA) Dinas Sosial Kota Surakarta Tahun 2021–2026 memuat tujuan, sasaran, strategi, kebijakan, serta indikator kinerja utama penanganan Pemerlu Pelayanan Kesejahteraan Sosial (PPKS) dan penguatan Potensi dan Sumber Kesejahteraan Sosial (PSKS) di Kota Surakarta.</p>\n        <div class="alert alert-info"><strong>Dokumen Terlampir:</strong> Keputusan Kepala Dinas Sosial Kota Surakarta tentang Revaluasi Target Kinerja RPJMD &amp; Renstra Perubahan Tahun 2021–2026.</div>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (15, 'maklumat-pelayanan-2026', 9, 'Maklumat Pelayanan 2026', 'assets/images/maklumat-pelayanan.svg', '<p>Maklumat Pelayanan Dinas Sosial Kota Surakarta Tahun 2026 ditetapkan melalui Surat Keputusan Kepala Dinas Sosial Kota Surakarta tentang Penetapan Maklumat Pelayanan, Visi, dan Misi Pelayanan Tahun 2026 sebagai wujud komitmen penyelenggaraan pelayanan publik berkualitas.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (16, 'sk-standar-pelayanan-2026', 10, 'SK STANDAR PELAYANAN DINSOS 2026', '', '<p>Surat Keputusan Kepala Dinas Sosial Kota Surakarta Tahun 2026 tentang Penetapan <strong>15 Standar Pelayanan Publik</strong> pada Dinas Sosial Kota Surakarta yang meliputi komponen Service Delivery dan Manufacturing sesuai PermenPANRB Nomor 15 Tahun 2014.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (17, 'sk-kompensasi-pelayanan-2026', 11, 'SK KOMPENSASI PELAYANAN DINSOS 2026', '', '<p>Surat Keputusan Kepala Dinas Sosial Kota Surakarta Tahun 2026 tentang Pemberian Kompensasi Pelayanan Publik apabila layanan tidak sesuai dengan Standar Operasional Prosedur (SOP) dan jangka waktu penyelesaian yang telah ditetapkan.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (18, 'sk-front-office-2026', 12, 'SK FRONT OFFICE 2026', 'assets/images/slider/slide-pelayanan-2.jpg', '<p>Surat Keputusan Kepala Dinas Sosial Kota Surakarta Tahun 2026 tentang Penunjukan Petugas Loket Pelayanan Terpadu (Front Office) dan Pendampingan Layanan Ramah Kelompok Rentan/Disabilitas.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (19, 'sk-jam-pelayanan-2026', 13, 'SK JAM PELAYANAN DINSOS 2026', 'assets/images/jam-pelayanan-poster.svg', '<p>Surat Keputusan Kepala Dinas Sosial Kota Surakarta Tahun 2026 tentang Penyesuaian Jam Pelayanan Publik: <strong>Senin–Kamis pukul 07.30–15.30 WIB (Tanpa Jam Istirahat)</strong> dan <strong>Jumat pukul 07.30–14.30 WIB (Istirahat 11.30–13.00 WIB)</strong>.</p>');
INSERT INTO `tb_profil` (`id`, `slug`, `urutan`, `judul`, `gambar`, `konten`) VALUES (20, 'sk-kode-etik-2026', 14, 'SK KODE ETIK DINSOS 2026', '', '<p>Surat Keputusan Kepala Dinas Sosial Kota Surakarta Tahun 2026 tentang Kode Etik dan Kode Perilaku Pelaksana Pelayanan Publik BerAKHLAK (Berorientasi Pelayanan, Akuntabel, Kompeten, Harmonis, Loyal, Adaptif, dan Kolaboratif) serta Budaya Kerja 5S.</p>');

DROP TABLE IF EXISTS `ref_bidang`;
CREATE TABLE `ref_bidang` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama_bidang` VARCHAR(500),
  `slug` VARCHAR(500),
  `deskripsi` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ref_bidang` (`id`, `nama_bidang`, `slug`, `deskripsi`) VALUES (1, 'Bidang Pemberdayaan Sosial', 'pemberdayaan-sosial', 'Seksi Pemberdayaan Sosial serta Seksi Pengelolaan Taman Makam Pahlawan (TMP) Kusuma Bhakti dan Penanganan Bencana.');
INSERT INTO `ref_bidang` (`id`, `nama_bidang`, `slug`, `deskripsi`) VALUES (2, 'Bidang Rehabilitasi Sosial', 'rehabilitasi-sosial', 'Seksi Rehabilitasi Sosial Dasar dan Seksi Rehabilitasi Sosial PMKS Lainnya (Disabilitas, Anak, Lansia, Tuna Sosial).');
INSERT INTO `ref_bidang` (`id`, `nama_bidang`, `slug`, `deskripsi`) VALUES (3, 'Bidang Perlindungan Dan Jaminan Sosial', 'perlindungan-jaminan-sosial', 'Pendataan & Pengelolaan Data Kemiskinan (DTKS/DTSEN/E-SIK), Penanganan Fakir Miskin, PKH, BPNT/BSP, PBI JKN-KIS.');
INSERT INTO `ref_bidang` (`id`, `nama_bidang`, `slug`, `deskripsi`) VALUES (4, 'Sekretariat / Bidang Lainnya', 'sekretariat', 'Perencanaan & Penganggaran, Administrasi Umum, serta Kepegawaian & Organisasi Dinas Sosial Kota Surakarta.');

DROP TABLE IF EXISTS `tb_standar_pelayanan`;
CREATE TABLE `tb_standar_pelayanan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `layanan_id` INT DEFAULT 0,
  `bidang_id` INT DEFAULT 0,
  `urutan_portal` INT DEFAULT 0,
  `ikon` VARCHAR(500),
  `nama_portal` VARCHAR(500),
  `nama` VARCHAR(500),
  `gambar` VARCHAR(500),
  `persyaratan` LONGTEXT,
  `prosedur` LONGTEXT,
  `waktu` VARCHAR(500),
  `biaya` VARCHAR(500),
  `produk` VARCHAR(500),
  `pengaduan` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (1, 24, 2, 1, 'bx bx-handicap', 'Layanan Penyediaan Alat Bantu', 'Penyediaan Alat Bantu', 'assets/images/berita/berita-tagana.jpg', '["Surat Permohonan kepada Walikota Surakarta yang ditandatangani Penerima Manfaat (PM) tanpa meterai","Terdaftar dalam SK Gakin / DTKS / Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan","Fotokopi Kartu Tanda Penduduk (KTP) Penerima Manfaat","Fotokopi Kartu Keluarga (KK) / Akta Kelahiran","Laporan Sosial Hasil Assessment Pekerja Sosial","Surat Keterangan Domisili dari Kelurahan","Foto Berwarna Seluruh Badan ukuran 4R"]', '["Pemohon mengajukan Surat Permohonan beserta berkas persyaratan ke Loket Layanan Dinas Sosial","Petugas memverifikasi dan melakukan assessment lapangan terhadap calon penerima manfaat","Petugas membuat Laporan Hasil Assessment","Penyusunan Rencana Anggaran Belanja Barang dan Jasa / usulan Sentra Kemensos","Penetapan SK Penerima Alat Bantu","Pengadaan dan Penyerahan Alat Bantu disertai penandatanganan Berita Acara Penyerahan Barang"]', '15 Menit Verifikasi Berkas (Realisasi Pengadaan maks. 6 Bulan)', 'Gratis', 'Alat Bantu Mobilitas Disabilitas / Lansia (Kursi Roda, Kruk, Alat Bantu Dengar, Tongkat Netra)', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123 | Email: dinsos@surakarta.go.id');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (2, 27, 2, 2, 'bx bx-happy-heart-eyes', 'Layanan Kesejahteraan Sosial Anak', 'Layanan Kesejahteraan Sosial Anak', 'assets/images/slider/slide-pelayanan-2.jpg', '["Fotokopi KTP Pelapor / Orang Tua / Wali","Fotokopi Kartu Keluarga (KK) dan Akta Kelahiran Anak","Surat Pengantar dari Kelurahan setempat / Laporan Kepolisian (khusus kasus penelantaran)","Dokumen pendukung kondisi kerentanan sosial anak"]', '["Pelapor menyerahkan berkas permohonan ke Loket Pelayanan / PLKSAI","Petugas Sakti Peksos melakukan penjangkauan dan asesmen komprehensif anak","Konferensi kasus dan penentuan rencana intervensi kesejahteraan sosial anak","Pendampingan sosial, psikososial, atau rujukan layanan perlindungan anak"]', '1 – 3 Hari Kerja', 'Gratis', 'Pendampingan, Rekomendasi & Layanan Kesejahteraan Sosial Anak Integratif (PLKSAI)', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (3, 26, 2, 3, 'bx bx-heart-circle', 'Layanan Rehabilitasi Sosial Dasar', 'Rehabilitasi Sosial Dasar', 'assets/images/slider/slide-pelayanan-2.jpg', '["Surat Pengantar / Berita Acara Penyerahan dari Kelurahan / Satpol PP / Kepolisian / Relawan","Fotokopi KTP dan KK (apabila memiliki identitas) atau Perekaman Biometrik Dukcapil bagi PPKS tanpa identitas","Surat Keterangan Sehat / Hasil Pemeriksaan Medis Awal (bila diperlukan rujukan panti)"]', '["PPKS diterima di Loket Layanan / Rumah Singgah (Rumsing) Dinas Sosial Kota Surakarta","Petugas membuat Berita Acara penerimaan PPKS dan melakukan asesmen awal","Layanan masa singgah 1–7 hari di Rumah Singgah untuk pemenuhan kebutuhan dasar","Penelusuran keluarga untuk reunifikasi atau rujukan ke Panti Provinsi Jawa Tengah / Sentra Kemensos"]', '1 – 7 Hari Masa Singgah', 'Gratis', 'Layanan Rumah Singgah, Reunifikasi Keluarga, Pemulangan Orang Terlantar, & Rujukan Panti', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (4, 28, 1, 4, 'bx bx-certification', 'Layanan Penerbitan Tanda Daftar LKS/Orsos', 'Penerbitan Tanda Daftar LKS/Orsos', 'assets/images/slider/slide-ba-3.jpg', '["Surat Permohonan Keterangan Terdaftar LKS kepada Kepala Dinas Sosial Kota Surakarta","Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART)","Fotokopi Akta Notaris Pendirian Yayasan/Lembaga","Fotokopi Surat Pengesahan Kemenkumham RI","Fotokopi KTP Ketua, Sekretaris, dan Bendahara","Fotokopi NPWP Lembaga","Surat Keterangan Domisili dari Kelurahan setempat","Susunan Pengurus LKS dan Data Binaan","Foto Sekretariat, Papan Nama, dan Dokumentasi Kegiatan","Surat Rekomendasi dari LKKS Kota Surakarta"]', '["Pengurus LKS menyerahkan berkas permohonan lengkap ke Loket Layanan Dinas Sosial","Petugas Bidang Pemberdayaan Sosial memverifikasi kelengkapan dokumen administrasi","Tim melakukan peninjauan lapangan (visitasi) ke sekretariat dan lokasi kegiatan LKS","Penerbitan dan penandatanganan Sertifikat Tanda Daftar LKS/Orsos oleh Kepala Dinas Sosial"]', '3 – 5 Hari Kerja (termasuk visitasi lapangan)', 'Gratis', 'Surat Tanda Daftar Lembaga Kesejahteraan Sosial (LKS) / Organisasi Sosial', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (5, 33, 1, 5, 'bx bx-car', 'Layanan Penerbitan Rekomendasi Keringanan Pajak Kendaraan Bermotor', 'Penerbitan Rekomendasi Keringanan Pajak Kendaraan Bermotor', 'assets/images/slider/slide-pelayanan-2.jpg', '["Surat Permohonan resmi dari Yayasan / LKS / Lembaga Sosial Keagamaan","Fotokopi STNK Kendaraan Operasional Sosial/Keagamaan","Fotokopi BPKB Kendaraan","Surat Rekomendasi dari Kementerian Agama (Khusus Masjid / Gereja / Lembaga Keagamaan)"]', '["Pemohon mengajukan Surat Permohonan beserta lampiran melalui layanan PEKA / Loket Dinsos","Petugas memverifikasi Permohonan Keringanan Pajak Kendaraan Bermotor","Pencetakan dan Pengesahan Surat Rekomendasi","Penyerahan Surat Rekomendasi kepada Pemohon untuk pengurusan ke UPPD Samsat"]', '1 Hari Kerja', 'Gratis', 'Surat Rekomendasi Keringanan Pajak Kendaraan Bermotor (Inovasi PEKA)', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (6, 29, 1, 6, 'bx bx-donate-heart', 'Layanan Penerbitan Rekomendasi Bantuan Sosial/Hibah Bagi LKS', 'Penerbitan Rekomendasi Bantuan Sosial/Hibah Bagi LKS', 'assets/images/slider/slide-dkt-1.jpg', '["Surat Permohonan Rekomendasi Hibah/Bansos kepada Kepala Dinas Sosial Kota Surakarta","Proposal Kegiatan dan Rencana Anggaran Biaya (RAB)","Fotokopi Tanda Daftar LKS yang masih berlaku","Fotokopi KTP Pengurus dan Rekening Bank atas nama Lembaga"]', '["LKS mengajukan berkas permohonan dan proposal kegiatan","Verifikasi kelayakan administrasi dan teknis oleh Bidang Pemberdayaan Sosial","Visitasi / evaluasi kegiatan LKS apabila diperlukan","Penerbitan Surat Rekomendasi Bantuan Sosial / Hibah bagi LKS"]', '2 Hari Kerja', 'Gratis', 'Surat Rekomendasi Bantuan Sosial / Hibah Bagi LKS', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (7, 31, 1, 7, 'bx bx-Bookmark-heart', 'Layanan Pemberian Izin Ziarah ke TMP', 'Pemberian Izin Ziarah ke TMP', 'assets/images/portal/img-gedung-dinsos.png', '["Surat Permohonan Izin Ziarah Rombongan / Instansi ditujukan ke Kepala Dinas Sosial Kota Surakarta","Mencantumkan hari, tanggal, waktu pelaksanaan, jumlah peserta, dan penanggung jawab kegiatan"]', '["Pemohon menyerahkan surat permohonan ke Loket Layanan Dinas Sosial","Petugas mengecek jadwal ziarah Taman Makam Pahlawan (TMP) Kusuma Bhakti Jurug","Penerbitan Surat Izin Ziarah dan koordinasi petugas pemandu TMP Kusuma Bhakti"]', '1 Hari Kerja (30 Menit apabila berkas lengkap)', 'Gratis', 'Surat Pemberian Izin Ziarah ke Taman Makam Pahlawan (TMP) Kusuma Bhakti', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (8, 30, 1, 8, 'bx bx-medal', 'Layanan Pemakaman TMP', 'Pelayanan Pemakaman TMP', 'assets/images/portal/img-gedung-dinsos.png', '["Surat Permohonan dari Ahli Waris / Instansi Militer/Sipil terkait","Fotokopi Piagam Tanda Kehormatan Bintang Gerilya / Bintang Republik / SK Pahlawan/Pejuang yang memenuhi syarat pemakaman TMP","Surat Keterangan Kematian dari Rumah Sakit / Kelurahan","Fotokopi KTP Almarhum dan Ahli Waris"]', '["Ahli waris / instansi menyerahkan berkas persyaratan ke Dinas Sosial","Verifikasi keabsahan tanda jasa/kehormatan bersama Kodim/Garnisun dan Bagian Kesra","Penyiapan petak makam dan fasilitasi upacara pemakaman di TMP Kusuma Bhakti"]', '1 Hari (Layanan Segera / Serta Merta)', 'Gratis', 'Fasilitasi Pelayanan Pemakaman di TMP Kusuma Bhakti Surakarta', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (9, 32, 1, 9, 'bx bx-first-aid', 'Layanan Perlindungan Sosial Kebencanaan', 'Perlindungan Sosial Kebencanaan', 'assets/images/berita/berita-tagana.jpg', '["Surat Permohonan / Nota Dinas dari Kelurahan lokasi kejadian bencana","Fotokopi Kartu Keluarga (KK) dan KTP warga yang terdampak","Foto dokumentasi kejadian / rumah terdampak bencana","Laporan Hasil Assessment Cepat dari TAGANA Kota Surakarta"]', '["Laporan kejadian bencana diterima dari Kelurahan / BPBD / Masyarakat","Tim TAGANA Dinas Sosial turun ke lokasi melakukan kaji cepat (assessment)","Penyiapan logistik permakanan, sandang, terpal, kasur, atau dapur umum","Pendistribusian bantuan sosial kebencanaan kepada korban terdampak"]', '1 x 24 Jam (Tanggap Darurat)', 'Gratis', 'Bantuan Logistik Permakanan, Sandang, Family Kit & Santunan Sosial Kebencanaan', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (10, 34, 3, 10, 'bx bx-package', 'Layanan Pengajuan Sembako Karantina Mandiri (Isoman)', 'Pengajuan Sembako Karantina Mandiri (Isoman)', 'assets/images/berita/berita-tagana.jpg', '["Fotokopi KTP dan Kartu Keluarga (KK) warga Kota Surakarta","Surat Keterangan Puskesmas / Kelurahan terkait pelaksanaan Karantina Mandiri / Kondisi Kedaruratan Kesehatan","Pengajuan kolektif melalui Kelurahan / Puskesos setempat"]', '["Kelurahan / Pemohon menyampaikan data warga yang menjalani karantina mandiri","Petugas memverifikasi data kependudukan dan kerentanan sosial","Penyiapan paket sembako bantuan pangan darurat","Penyaluran bantuan melalui Kelurahan / Satgas untuk diteruskan ke rumah warga"]', '1 – 2 Hari Kerja', 'Gratis', 'Paket Bantuan Sembako / Pangan Darurat Karantina Mandiri', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (11, 20, 3, 11, 'bx bx-home-heart', 'Layanan Bansos PKH', 'Bansos (Bantuan Sosial) PKH ( Program Keluarga Harapan)', 'assets/images/slider/slide-pelayanan-2.jpg', '["Fotokopi Kartu Tanda Penduduk (KTP)","Fotokopi Kartu Keluarga (KK)"]', '["Pemohon menyerahkan berkas persyaratan ke Loket Layanan","Petugas mengecek apakah yang bersangkutan masuk di dalam Sistem E-SIK","Petugas mengecek apakah yang bersangkutan masuk DTKS/DTSEN di dalam Sistem SIKS-NG","Petugas mengecek apakah yang bersangkutan masuk komponen penerima PKH atau tidak","Menjelaskan kepada yang bersangkutan sesuai kebutuhan dan koordinasi Pendamping PKH Kecamatan"]', '10 Menit / Hari Kerja', 'Gratis', 'Pendampingan dan Verifikasi Validasi (Verval) Data PKH', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123 | Email: dinsos@surakarta.go.id');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (12, 21, 3, 12, 'bx bx-basket', 'Layanan Bansos BPNT / BSP', 'Bansos (Bantuan Sosial) BPNT (Bantuan Pangan Non Tunai) / BSP (Bantuan Sosial Pangan)', 'assets/images/berita/berita-tagana.jpg', '["Fotokopi Kartu Tanda Penduduk (KTP)","Fotokopi Kartu Keluarga (KK)"]', '["Pemohon menyerahkan berkas persyaratan","Petugas mengecek apakah yang bersangkutan masuk di dalam Sistem E-SIK","Petugas mengecek apakah yang bersangkutan masuk DTKS di dalam Sistem SIKS-NG","Petugas mengecek yang bersangkutan masuk penerima BPNT / Sembako atau tidak","Menjelaskan kepada yang bersangkutan sesuai kebutuhan yang diinginkan"]', '10 Menit / Hari Kerja', 'Gratis', 'Pendampingan dan Verval Data BPNT / Bantuan Sosial Pangan (BSP)', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123 | Email: dinsos@surakarta.go.id');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (13, 19, 3, 13, 'bx bx-id-card', 'Layanan Pemberian Informasi mengenai Pengajuan GAKIN', 'Pemberian Informasi mengenai Pengajuan GAKIN', 'assets/images/slider/slide-pelayanan-2.jpg', '["Surat Pengantar RT/RW untuk pengajuan Home Visit di Kelurahan","Fotokopi Kartu Tanda Penduduk (KTP) Kepala Keluarga","Fotokopi Kartu Keluarga (KK)"]', '["Pemohon berkonsultasi ke Loket Layanan Dinas Sosial atau Puskesos Kelurahan","Petugas mengecek status kepesertaan keluarga pada database E-SIK Kota Surakarta","Memberikan informasi lengkap mekanisme pengajuan Home Visit GAKIN melalui Kelurahan","Verifikasi lapangan (Ground Check) oleh petugas Kelurahan & penetapan E-SIK"]', '10 Menit / Hari Kerja (Layanan Informasi Loket)', 'Gratis', 'Informasi Status E-SIK & Panduan Pengajuan Keluarga Miskin (GAKIN)', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (14, 22, 3, 14, 'bx bx-search-alt-2', 'Layanan Pengecekan status DTKS beserta Bantuan Sosial dari Pemerintah Pusat', 'Pengecekan status DTKS beserta Bantuan Sosial dari Pemerintah Pusat', 'assets/images/slider/slide-pelayanan-2.jpg', '["Fotokopi Kartu Tanda Penduduk (KTP);","Fotokopi Kartu Keluarga (KK)."]', '["Pemohon menyerahkan berkas yang akan dicek status DTKS/DTSEN oleh petugas;","Petugas melakukan cek di sistem SIKS-NG Kemensos;","Memberi Informasi Status DTKS beserta kepesertaan bantuan sosial (PKH, BPNT, PBI-JK) kepada yang bersangkutan;","Print Out Hasil DTKS jika pemohon masuk ke dalam sistem SIKS-NG."]', '10 Menit / Hari Kerja', 'Gratis', 'Print Out Hasil Status DTKS / Surat Keterangan ID DTKS dari SIKS-NG', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | Telp: (0271) 734123 | Email: dinsos@surakarta.go.id');
INSERT INTO `tb_standar_pelayanan` (`id`, `layanan_id`, `bidang_id`, `urutan_portal`, `ikon`, `nama_portal`, `nama`, `gambar`, `persyaratan`, `prosedur`, `waktu`, `biaya`, `produk`, `pengaduan`) VALUES (27, 35, 2, 15, 'bx bx-child', 'Layanan Pelaksanaan pengangkatan Anak Adopsi (COTA)', 'Pelaksanaan pengangkatan Anak Adopsi (COTA)', 'assets/images/slider/slide-pelayanan-2.jpg', '["Fotokopi Kartu Tanda Penduduk (KTP) Calon Orang Tua Angkat (COTA)","Fotokopi Kartu Keluarga (KK) dan Buku Nikah / Akta Perkawinan (minimal menikah 5 tahun)","Persyaratan administrasi lanjutan (SKCK, Surat Sehat Jasmani/Jiwa, Penghasilan, Pernyataan) setelah konsultasi dengan Pekerja Sosial (PEKSOS)"]', '["Pemohon menyerahkan berkas awal kepada petugas pelayanan","Petugas melakukan cek kelengkapan berkas persyaratan awal","Konsultasi dan Kunjungan Rumah (Home Visit) oleh Pekerja Sosial (PEKSOS) Dinas Sosial","Pemohon diinformasikan tindak lanjut proses rekomendasi ke Dinas Sosial Provinsi Jawa Tengah (Tim PIPA) hingga penetapan Pengadilan"]', '10 Menit Konsultasi Awal / Hari Kerja', 'Gratis', 'Laporan Sosial & Rekomendasi Pelaksanaan Pengangkatan Anak Adopsi (COTA)', 'WA: 08112811919 | ULAS: ulas.surakarta.go.id | SP4N LAPOR | Telp: (0271) 734123 | Email: dinsos@surakarta.go.id');

DROP TABLE IF EXISTS `tb_berita`;
CREATE TABLE `tb_berita` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(500),
  `tanggal` VARCHAR(500),
  `tanggal_label` VARCHAR(500),
  `penulis` VARCHAR(500),
  `kategori` VARCHAR(500),
  `gambar` VARCHAR(500),
  `ringkasan` VARCHAR(500),
  `isi` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (398, 'PENYESUAIAN JAM PELAYANAN DINAS SOSIAL KOTA SURAKARTA', '2026-10-01', '01 Oktober 2026', 'Admin Dinsos Surakarta', 'Pelayanan Publik', 'assets/images/jam-pelayanan-poster.svg', 'Sahabat Sosial, yuk catat jam pelayanan kami! Senin–Kamis 07.30–15.30 WIB Tanpa jam istirahat, Jumat 07.30–14.30 WIB.', '<p>⏰ <strong>PENYESUAIAN JAM PELAYANAN DINAS SOSIAL KOTA SURAKARTA</strong></p>\n        <p>Sahabat Sosial, yuk catat jam pelayanan kami!</p>\n        <p><strong># Senin–Kamis</strong><br>07.30–15.30 WIB<br>✨ Tanpa jam istirahat</p>\n        <p><strong># Jumat</strong><br>07.30–14.30 WIB<br>☕ Istirahat 11.30–13.00 WIB</p>\n        <p>Kami siap memberikan pelayanan yang ramah, cepat, dan mudah diakses bagi masyarakat Kota Surakarta.</p>\n        <p><em>Selalu Ada, Bersahaja, Bangga Melayani.</em></p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (397, 'PEMBERIAN PENGHARGAAN ASN BERPRESTASI', '2026-08-31', '31 Agustus 2026', 'Admin Dinsos Surakarta', 'Kepegawaian', 'assets/images/slider/slide-ba-3.jpg', 'Apresiasi atas dedikasi, integritas, dan inovasi pegawai Aparatur Sipil Negara di lingkungan Dinas Sosial Kota Surakarta.', '<p>Surakarta, 31 Agustus 2026 — Dinas Sosial Kota Surakarta melaksanakan kegiatan pemberian penghargaan kepada Aparatur Sipil Negara (ASN) Berprestasi sebagai bentuk apresiasi atas kinerja unggul, kedisiplinan, serta inovasi pelayanan sosial kepada masyarakat.</p>\n        <p>Kepala Dinas Sosial Kota Surakarta, Drs. Samsu Tri Wahyudin, M.Si., menyampaikan bahwa budaya kerja BerAKHLAK dan prinsip 5S (Senyum, Salam, Sapa, Sopan, dan Santun) harus terus dijaga demi menghadirkan pelayanan prima bagi Pemerlu Pelayanan Kesejahteraan Sosial (PPKS) di Kota Surakarta.</p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (396, 'TINDAK LANJUT PENGADUAN', '2026-08-28', '28 Agustus 2026', 'Tim SP4N & ULAS', 'Pengaduan', 'assets/images/berita/berita-tagana.jpg', 'Respon cepat Tim Reaksi Cepat dan Pekerja Sosial Dinas Sosial Kota Surakarta dalam menindaklanjuti laporan warga melalui kanal ULAS dan WhatsApp.', '<p>Surakarta, 28 Agustus 2026 — Tim Pengelola Pengaduan bersama Pekerja Sosial dan TAGANA Dinas Sosial Kota Surakarta bergerak cepat menindaklanjuti aduan masyarakat yang masuk melalui kanal ULAS Pemkot Surakarta dan Hotline WhatsApp Dinas Sosial.</p>\n        <p>Penanganan dilakukan melalui asesmen langsung ke lokasi (home visit), koordinasi bersama Pemerintah Kelurahan dan Puskesos SLRT, serta pemberian intervensi bantuan sosial sesuai kebutuhan penerima manfaat.</p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (395, 'DINAS SOSIAL KOTA SURAKARTA IKUT MERAMAIKAN PERTANDINGAN FUTSAL PERSAHABATAN SOEHARSO CUP', '2026-08-27', '27 Agustus 2026', 'Admin Dinsos Surakarta', 'Kegiatan', 'assets/images/slider/slide-dkt-1.jpg', 'Mempererat sinergi dan kolaborasi antar instansi penyelenggara kesejahteraan sosial bersama Sentra Terpadu Prof. Dr. Soeharso Surakarta.', '<p>Surakarta, 27 Agustus 2026 — Keluarga besar Dinas Sosial Kota Surakarta turut berpartisipasi memeriahkan pertandingan futsal persahabatan Soeharso Cup yang diselenggarakan oleh Sentra Terpadu Prof. Dr. Soeharso Surakarta.</p>\n        <p>Kegiatan olahraga bersama ini bertujuan meningkatkan kebugaran jasmani sekaligus memperkuat sinergitas kemitraan dalam pelayanan rehabilitasi sosial di wilayah Surakarta.</p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (394, 'DINAS SOSIAL KOTA SURAKARTA HADIR DITENGAH MASYARAKAT', '2026-08-26', '26 Agustus 2026', 'Admin Dinsos Surakarta', 'Pelayanan Publik', 'assets/images/slider/slide-pelayanan-2.jpg', 'Layanan jemput bola pengecekan status DTKS/DTSEN, konsultasi bansos, dan reaktivasi PBI JKN-KIS langsung di ruang publik Kota Surakarta.', '<p>Surakarta, 26 Agustus 2026 — Melalui inovasi layanan jemput bola <em>Mba Desi Manis</em> dan loket keliling pada Car Free Day (CFD) Jl. Slamet Riyadi, Dinas Sosial Kota Surakarta hadir langsung di tengah masyarakat untuk memudahkan konsultasi pengecekan desil DTSEN/DTKS, pemutakhiran data SIKS-NG melalui Kelurahan, serta layanan pengaduan sosial.</p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (393, 'MEMPERINGATI MAULID NABI MUHAMMAD SAW', '2026-08-25', '25 Agustus 2026', 'Admin Dinsos Surakarta', 'Pengumuman', 'assets/images/portal/img-gedung-dinsos.png', 'Keluarga Besar Dinas Sosial Kota Surakarta mengucapkan Selamat Memperingati Maulid Nabi Muhammad SAW, meneladani akhlak mulia dalam melayani sesama.', '<p>Keluarga Besar Dinas Sosial Kota Surakarta mengucapkan Selamat Memperingati Maulid Nabi Muhammad SAW. Mari kita jadikan momentum ini untuk meneladani kepedulian sosial, kasih sayang terhadap sesama, dan keikhlasan dalam melayani masyarakat pemerlu pelayanan kesejahteraan sosial di Kota Surakarta.</p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (306, 'Penerapan Budaya layanan Kerja 5S (Senyum, Salam, Sapa, Sopan, dan Santun) kepada Masyarakat di Dinas Sosial Kota Surakarta', '2025-09-02', '02 September 2025', 'Front Office Dinsos', 'Zona Integritas', 'assets/images/slider/slide-pelayanan-2.jpg', 'Petugas Dinas Sosial Kota Surakarta senantiasa memberikan pelayanan terbaik dengan mengedepankan prinsip Senyum, Salam, Sapa, Sopan, dan Santun (5S).', '<p>Petugas Dinas Sosial Kota Surakarta senantiasa memberikan pelayanan terbaik dengan mengedepankan prinsip <strong>Senyum, Salam, Sapa, Sopan, dan Santun (5S)</strong> dalam setiap interaksi dengan masyarakat. Setiap warga yang datang dilayani dengan penuh keramahan, kesabaran, dan perhatian, mulai dari proses penyambutan hingga penyelesaian kebutuhan.</p>');
INSERT INTO `tb_berita` (`id`, `judul`, `tanggal`, `tanggal_label`, `penulis`, `kategori`, `gambar`, `ringkasan`, `isi`) VALUES (279, 'Pengantaran PPKS ke Terminal Tirtonadi', '2025-04-17', '17 April 2025', 'Bidang Rehabilitasi Sosial', 'Rehabilitasi Sosial', 'assets/images/berita/berita-tagana.jpg', 'Bidang Rehabilitasi Sosial melakukan pengantaran PPKS beserta 4 anggota keluarga yang kehabisan bekal ke Terminal Tirtonadi.', '<p>Surakarta, 17 April 2025 — Dinas Sosial Kota Surakarta melalui Bidang Rehabilitasi Sosial melakukan pengantaran PPKS beserta pengikut (4 anggota keluarga) yang kehabisan bekal ke Terminal Tirtonadi dibantu oleh petugas Kemenhub Terminal untuk selanjutnya bisa pulang kembali ke daerah asalnya yaitu tujuan Purwakarta diestafetkan melalui Dinas Sosial Provinsi Jawa Tengah di Semarang.</p>');

DROP TABLE IF EXISTS `tb_instagram_feed`;
CREATE TABLE `tb_instagram_feed` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tanggal` VARCHAR(500),
  `tipe` VARCHAR(500),
  `gambar` VARCHAR(500),
  `caption` VARCHAR(500),
  `url` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_instagram_feed` (`id`, `tanggal`, `tipe`, `gambar`, `caption`, `url`) VALUES (1, 'October 21, 2026', 'Carousel', 'assets/images/slider/slide-dkt-1.jpg', 'Dinas Sosial menyelenggarakan Pelatihan Peningkatan Kapasitas Ekonomi Keluarga bagi PEKKA (Perempuan Kepala Keluarga) Kota Surakarta guna mendorong kemandirian usaha mikro.', 'https://www.instagram.com/dinsos_surakarta/');
INSERT INTO `tb_instagram_feed` (`id`, `tanggal`, `tipe`, `gambar`, `caption`, `url`) VALUES (2, 'October 03, 2026', 'Photo', 'assets/images/slider/slide-ba-3.jpg', '📢 SOSIALISASI PERLINSOS DIGITAL KOTA SURAKARTA — Dinas Sosial Kota Surakarta melaksanakan Sosialisasi Perlindungan Sosial Digital dan pemutakhiran DTSEN bersama operator SIKS-NG Kelurahan.', 'https://www.instagram.com/dinsos_surakarta/');
INSERT INTO `tb_instagram_feed` (`id`, `tanggal`, `tipe`, `gambar`, `caption`, `url`) VALUES (3, 'October 01, 2026', 'Photo', 'assets/images/jam-pelayanan-poster.svg', '⏰ JAM PELAYANAN DINAS SOSIAL KOTA SURAKARTA — Sahabat Sosial, yuk catat jam pelayanan kami! Senin–Kamis 07.30–15.30 WIB (Tanpa Istirahat), Jumat 07.30–14.30 WIB.', 'https://www.instagram.com/dinsos_surakarta/');
INSERT INTO `tb_instagram_feed` (`id`, `tanggal`, `tipe`, `gambar`, `caption`, `url`) VALUES (4, 'September 28, 2026', 'Photo', 'assets/images/berita/berita-tagana.jpg', 'YEU YAKKUM bersama Dinas Sosial dan BPBD berkolaborasi dalam program Disability Inclusive Disaster Risk Reduction (Pengurangan Risiko Bencana Inklusif Disabilitas) di Kota Surakarta.', 'https://www.instagram.com/dinsos_surakarta/');
INSERT INTO `tb_instagram_feed` (`id`, `tanggal`, `tipe`, `gambar`, `caption`, `url`) VALUES (5, 'September 27, 2026', 'Video', 'assets/images/slider/slide-pelayanan-2.jpg', 'Minggu pagi di CFD pekan ini ditutup manis bersama Mba Desi Manis! 📱✨ Layanan konsultasi IKD, Desil DTSEN, dan Pengaduan Sosial makin dekat dengan warga Solo.', 'https://www.instagram.com/dinsos_surakarta/');
INSERT INTO `tb_instagram_feed` (`id`, `tanggal`, `tipe`, `gambar`, `caption`, `url`) VALUES (6, 'September 25, 2026', 'Photo', 'assets/images/portal/img-gedung-dinsos.png', 'SOSIALISASI PENYEDIAAN ALAT BANTU DAN SEKALIGUS PERINGATAN HARI ALZHEIMER SE-DUNIA bersama Komda Lansia Kota Surakarta.', 'https://www.instagram.com/dinsos_surakarta/');

DROP TABLE IF EXISTS `tb_pengumuman`;
CREATE TABLE `tb_pengumuman` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(500),
  `tanggal` VARCHAR(500),
  `tanggal_label` VARCHAR(500),
  `gambar` VARCHAR(500),
  `ringkasan` VARCHAR(500),
  `isi` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_pengumuman` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `ringkasan`, `isi`) VALUES (40, 'PENILAIAN MALADMINISTRASI PELAYANAN PUBLIK OMBUDSMAN RI TAHUN 2026', '2026-08-04', '04 Agustus 2026', 'assets/images/maklumat-pelayanan.svg', 'Dinas Sosial Kota Surakarta terus berkomitmen dalam meningkatkan kualitas penyelenggaraan pelayanan publik yang transparan, profesional, dan responsif.', '<p>Dinas Sosial Kota Surakarta terus berkomitmen dalam meningkatkan kualitas penyelenggaraan pelayanan publik yang transparan, profesional, responsif, dan berorientasi pada kebutuhan masyarakat. Komitmen tersebut diwujudkan melalui berbagai upaya peningkatan standar pelayanan, penguatan tata kelola, serta pemenuhan hak masyarakat dalam memperoleh pelayanan sosial yang mudah, cepat, tepat, dan berkualitas.</p>\n        <p>Sebagai bentuk apresiasi terhadap upaya tersebut, Ombudsman Republik Indonesia (ORI) melalui penilaian penyelenggaraan pelayanan publik memberikan penghargaan/pengakuan atas kinerja pelayanan yang telah dilaksanakan oleh Dinas Sosial.</p>\n        <p>Penghargaan dari Ombudsman RI bukanlah akhir dari sebuah pencapaian, melainkan menjadi pemacu untuk terus berbenah, berinovasi, dan memberikan pelayanan terbaik bagi masyarakat Kota Surakarta.</p>');
INSERT INTO `tb_pengumuman` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `ringkasan`, `isi`) VALUES (39, 'SKM TRIWULAN 1 2026', '2026-04-06', '06 April 2026', 'assets/images/skm-poster.svg', 'Dinas Sosial Kota Surakarta terus berkomitmen untuk meningkatkan kualitas pelayanan publik melalui pelayanan yang mudah, cepat, transparan, dan gratis.', '<p>Publikasi Hasil Survei Kepuasan Masyarakat (SKM) Triwulan I Tahun 2026 pada Dinas Sosial Kota Surakarta menunjukkan capaian Mutu Pelayanan <strong>A (Sangat Baik)</strong>. Terima kasih atas partisipasi dan masukan seluruh masyarakat pengguna layanan Dinas Sosial Kota Surakarta.</p>');
INSERT INTO `tb_pengumuman` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `ringkasan`, `isi`) VALUES (38, 'SKM TW 2 TAHUN 2026', '2026-08-06', '06 Agustus 2026', 'assets/images/skm-poster.svg', 'Dinas Sosial Kota Surakarta terus berkomitmen untuk meningkatkan kualitas pelayanan publik melalui pelayanan yang mudah, cepat, transparan, dan akuntabel.', '<p>Publikasi Hasil Survei Kepuasan Masyarakat (SKM) Triwulan II Tahun 2026 Dinas Sosial Kota Surakarta dengan Nilai Indeks Kepuasan Masyarakat (IKM) sebesar <strong>89,64 (Kategori A - Sangat Baik)</strong>.</p>');
INSERT INTO `tb_pengumuman` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `ringkasan`, `isi`) VALUES (36, 'SKM TW 4 TAHUN 2025', '2025-12-03', '03 Desember 2025', 'assets/images/skm-poster.svg', 'Laporan Hasil Survei Kepuasan Masyarakat Triwulan IV Tahun 2025 Dinas Sosial Kota Surakarta.', '<p>Berikut disampaikan hasil pengukuran Survei Kepuasan Masyarakat (SKM) Triwulan IV Tahun 2025 sebagai bentuk transparansi dan akuntabilitas penyelenggaraan layanan publik Dinas Sosial Kota Surakarta.</p>');
INSERT INTO `tb_pengumuman` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `ringkasan`, `isi`) VALUES (33, 'JAM PELAYANAN DINSOS', '2025-01-06', '06 Januari 2025', 'assets/images/jam-pelayanan-poster.svg', 'Informasi resmi jam operasional Loket Pelayanan Terpadu Dinas Sosial Kota Surakarta.', '<p>Informasi Jam Pelayanan Loket Front Office Dinas Sosial Kota Surakarta: Senin–Kamis pukul 07.30–15.30 WIB dan Jumat pukul 07.30–14.30 WIB.</p>');
INSERT INTO `tb_pengumuman` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `ringkasan`, `isi`) VALUES (32, 'SKM TRIWULAN 1 2025', '2025-03-24', '24 Maret 2025', 'assets/images/skm-poster.svg', 'Publikasi Indeks Kepuasan Masyarakat Triwulan 1 Tahun 2025 pada Dinas Sosial Kota Surakarta.', '<p>Publikasi resmi capaian Survei Kepuasan Masyarakat Triwulan 1 Tahun 2025 Dinas Sosial Kota Surakarta.</p>');

DROP TABLE IF EXISTS `tb_artikel`;
CREATE TABLE `tb_artikel` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(500),
  `tanggal` VARCHAR(500),
  `tanggal_label` VARCHAR(500),
  `gambar` VARCHAR(500),
  `isi` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_artikel` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `isi`) VALUES (6, 'Taruna Siaga Bencana (TAGANA) Dinas Sosial Kota Surakarta melaksanakan pendampingan Kegiatan Pramuka Peduli (PRAMULI) Tingkat KwaRan Kota Surakarta.', '2021-11-03', '03 November 2021', 'assets/images/berita/berita-tagana.jpg', '<p>Waktu pelaksanaan pada Hari Rabu, 3 November 2021 pukul 07.30 WIB – 17.00 WIB bertempat di Halaman Depan Kantor TMP (Taman Makam Pahlawan) Kusuma Bhakti Surakarta. Kegiatan meliputi simulasi manajemen dapur umum lapangan, pendirian tenda pengungsian, dan kesiapsiagaan bencana bagi anggota Pramuka Peduli.</p>');
INSERT INTO `tb_artikel` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `isi`) VALUES (5, 'Pembinaan Anggota Taruna Siaga Bencana (TAGANA) Kota Surakarta', '2022-01-01', '01 Januari 2022', 'assets/images/slider/slide-dkt-1.jpg', '<p>Pembinaan rutin peningkatan kapasitas personel Taruna Siaga Bencana (TAGANA) Dinas Sosial Kota Surakarta dalam rangka kesiapsiagaan menghadapi potensi bencana hidrometeorologi dan pelayanan dukungan psikososial bagi warga terdampak.</p>');
INSERT INTO `tb_artikel` (`id`, `judul`, `tanggal`, `tanggal_label`, `gambar`, `isi`) VALUES (3, 'PENYALURAN BANTUAN SOSIAL', '2022-04-20', '20 April 2022', 'assets/images/berita/berita-tagana.jpg', '<p>Pelaksanaan monitoring dan evaluasi penyaluran Bantuan Sosial Program Keluarga Harapan (PKH) dan Bantuan Pangan Non Tunai (BPNT) di 5 Kecamatan se-Kota Surakarta agar tepat sasaran, tepat jumlah, dan tepat waktu.</p>');

DROP TABLE IF EXISTS `tb_agenda`;
CREATE TABLE `tb_agenda` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `acara` VARCHAR(500),
  `tempat` VARCHAR(500),
  `tanggal` VARCHAR(500),
  `jam` VARCHAR(500),
  `status` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_agenda` (`id`, `acara`, `tempat`, `tanggal`, `jam`, `status`) VALUES (1, 'Layanan Keliling Mba Desi Manis (Konsultasi DTSEN, SIKS-NG & Aduan Sosial)', 'Car Free Day Jl. Slamet Riyadi (Depan Kantor Dinsos No. 368)', '2026-10-25', '06.00 – 09.00 WIB', 'Terjadwal');
INSERT INTO `tb_agenda` (`id`, `acara`, `tempat`, `tanggal`, `jam`, `status`) VALUES (2, 'Rapat Koordinasi Pemutakhiran Data Kemiskinan & Verval SIKS-NG Kelurahan', 'Aula Dinas Sosial Kota Surakarta', '2026-11-04', '09.00 – 12.00 WIB', 'Terjadwal');
INSERT INTO `tb_agenda` (`id`, `acara`, `tempat`, `tanggal`, `jam`, `status`) VALUES (3, 'Monitoring Akreditasi Lembaga Kesejahteraan Sosial (LKS) Kota Surakarta', 'Sekretariat LKS se-Kota Surakarta', '2026-11-10', '08.30 – 15.00 WIB', 'Terjadwal');

DROP TABLE IF EXISTS `tb_bank_data`;
CREATE TABLE `tb_bank_data` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(500),
  `kategori` VARCHAR(500),
  `tahun` VARCHAR(500),
  `file_url` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_bank_data` (`id`, `nama`, `kategori`, `tahun`, `file_url`) VALUES (1, 'HIBAH DAN BANSOS DINAS SOSIAL TAHUN 2025', 'Keuangan & Bansos', '2025', 'http://drive.google.com/file/d/1gmzK1OuOxZxpv1mLWuPgs-J1TK-Ogcox/view?usp=sharing');
INSERT INTO `tb_bank_data` (`id`, `nama`, `kategori`, `tahun`, `file_url`) VALUES (2, 'REKAPITULASI DATA elektronik Sistem Informasi Kesejahteraan (e-SIK) Tahun 2022', 'Data Kemiskinan (e-SIK)', '2022', 'http://drive.google.com/file/d/12ZRpRxzjYeqh43qEM5CPemXzyvBXCGTq/view?usp=share_link');
INSERT INTO `tb_bank_data` (`id`, `nama`, `kategori`, `tahun`, `file_url`) VALUES (3, 'REKAPITULASI DATA elektronik Sistem Informasi Kesejahteraan (e-SIK)', 'Data Kemiskinan (e-SIK)', '2024', '#/pmks');
INSERT INTO `tb_bank_data` (`id`, `nama`, `kategori`, `tahun`, `file_url`) VALUES (4, 'REKAPITULASI DATA PMKS & PSKS PER KECAMATAN KOTA SURAKARTA TAHUN 2026', 'Statistik Sosial', '2026', 'pmks.html');

DROP TABLE IF EXISTS `tb_galeri`;
CREATE TABLE `tb_galeri` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(500),
  `kategori` VARCHAR(500),
  `tanggal` VARCHAR(500),
  `gambar` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_galeri` (`id`, `judul`, `kategori`, `tanggal`, `gambar`) VALUES (1, 'Pengarahan dan Pendampingan Pencairan Bantuan Kelompok Usaha Bersama (KUBE) Kota Surakarta Tahun 2024', 'Pemberdayaan Sosial', '2024-09-12', 'assets/images/slider/slide-dkt-1.jpg');
INSERT INTO `tb_galeri` (`id`, `judul`, `kategori`, `tanggal`, `gambar`) VALUES (2, 'Dokumentasi Pendampingan Kelompok Usaha Bersama (KUBE) Mandiri Sejahtera', 'Pemberdayaan Sosial', '2024-09-12', 'assets/images/slider/slide-pelayanan-2.jpg');
INSERT INTO `tb_galeri` (`id`, `judul`, `kategori`, `tanggal`, `gambar`) VALUES (3, 'Penyerahan Bantuan Kursi Roda & Paket Sembako Bersama TAGANA Surakarta', 'Rehabilitasi & Linjamsos', '2026-08-28', 'assets/images/berita/berita-tagana.jpg');
INSERT INTO `tb_galeri` (`id`, `judul`, `kategori`, `tanggal`, `gambar`) VALUES (4, 'Rapat KTI (Kota Layak Anak & Kesejahteraan Sosial Integratif)', 'Rapat Koordinasi', '2025-11-18', 'assets/images/slider/slide-ba-3.jpg');
INSERT INTO `tb_galeri` (`id`, `judul`, `kategori`, `tanggal`, `gambar`) VALUES (5, 'Pelayanan Loket Terpadu (Front Office) Ramah Kelompok Rentan & Disabilitas', 'Pelayanan Publik', '2026-10-01', 'assets/images/slider/slide-pelayanan-2.jpg');
INSERT INTO `tb_galeri` (`id`, `judul`, `kategori`, `tanggal`, `gambar`) VALUES (6, 'Gedung Pelayanan Dinas Sosial Pemerintah Kota Surakarta', 'Fasilitas Pelayanan', '2026-01-10', 'assets/images/portal/img-gedung-dinsos.png');

DROP TABLE IF EXISTS `tb_galeri_video`;
CREATE TABLE `tb_galeri_video` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(500),
  `youtube_id` VARCHAR(500),
  `embed_url` VARCHAR(500),
  `channel` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_galeri_video` (`id`, `judul`, `youtube_id`, `embed_url`, `channel`) VALUES (1, 'Agen Perubahan Dinas Sosial Kota Surakarta #ASNBerAKHLAK #BanggaMelayaniBangsa', 'CIzVPJ-A8Is', 'https://www.youtube.com/embed/CIzVPJ-A8Is', 'DINAS SOSIAL KOTA SURAKARTA');
INSERT INTO `tb_galeri_video` (`id`, `judul`, `youtube_id`, `embed_url`, `channel`) VALUES (2, 'Cara Mengatasi Kebosanan Dalam Belajar Daring - PLKSAI DINAS SOSIAL KOTA SURAKARTA', '0NoJhqS4NT0', 'https://www.youtube.com/embed/0NoJhqS4NT0', 'DINAS SOSIAL KOTA SURAKARTA');
INSERT INTO `tb_galeri_video` (`id`, `judul`, `youtube_id`, `embed_url`, `channel`) VALUES (3, 'Selamat Hari Anak Nasional (HAN) Tahun 2021 - PLKSAI Dinas Sosial Kota Surakarta', 'dk_rjgkl4HU', 'https://www.youtube.com/embed/dk_rjgkl4HU', 'DINAS SOSIAL KOTA SURAKARTA');
INSERT INTO `tb_galeri_video` (`id`, `judul`, `youtube_id`, `embed_url`, `channel`) VALUES (4, 'MERDEKA !! HUT RI KE - 76 PLKSAI DINAS SOSIAL KOTA SURAKARTA', 'NQEaOc4QJUg', 'https://www.youtube.com/embed/NQEaOc4QJUg', 'DINAS SOSIAL KOTA SURAKARTA');
INSERT INTO `tb_galeri_video` (`id`, `judul`, `youtube_id`, `embed_url`, `channel`) VALUES (5, 'Ayo Terapkan Pola Hidup Bersih Dan Sehat !! PLKSAI Dinas Sosial Kota Surakarta', 'ttIzX7nIOX8', 'https://www.youtube.com/embed/ttIzX7nIOX8', 'DINAS SOSIAL KOTA SURAKARTA');
INSERT INTO `tb_galeri_video` (`id`, `judul`, `youtube_id`, `embed_url`, `channel`) VALUES (6, 'Rapat Koordinasi Kesejahteraan Sosial Dinas Sosial Kota Surakarta', 'lm2B0mmv1B0', 'https://www.youtube.com/embed/lm2B0mmv1B0', 'DINAS SOSIAL KOTA SURAKARTA');

DROP TABLE IF EXISTS `tb_ppid_pimpinan`;
CREATE TABLE `tb_ppid_pimpinan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nama` VARCHAR(500),
  `pangkat_golongan` VARCHAR(500),
  `jabatan` VARCHAR(500),
  `peran_ppid` VARCHAR(500),
  `foto` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_ppid_pimpinan` (`id`, `nama`, `pangkat_golongan`, `jabatan`, `peran_ppid`, `foto`) VALUES (1, 'Drs. SAMSU TRI WAHYUDIN, M.Si.', 'Pembina Tingkat I / IVb', 'Kepala Dinas Sosial Kota Surakarta', 'Atasan PPID Pelaksana', 'assets/images/pimpinan-kadis.svg');
INSERT INTO `tb_ppid_pimpinan` (`id`, `nama`, `pangkat_golongan`, `jabatan`, `peran_ppid`, `foto`) VALUES (2, 'MARGONO, S.STP, M.Si', 'Pembina (IV/a)', 'Sekretaris Dinas Sosial Kota Surakarta', 'Ketua PPID Pelaksana', 'assets/images/pimpinan-sekdin.svg');

DROP TABLE IF EXISTS `ref_ppid_kategori`;
CREATE TABLE `ref_ppid_kategori` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `jenis` VARCHAR(500),
  `nama` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (1, 'berkala', 'INFORMASI TENTANG PROFIL BADAN PUBLIK');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (2, 'berkala', 'RINGKASAN PROGRAM DAN KEGIATAN YANG DIKERJAKAN');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (3, 'berkala', 'RINGKASAN INFORMASI KINERJA');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (4, 'berkala', 'RINGKASAN LAPORAN KEUANGAN');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (5, 'berkala', 'RINGKASAN LAPORAN AKSES INFORMASI PUBLIK');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (16, 'berkala', 'INFORMASI TENTANG PERATURAN, KEPUTUSAN ATAU KEBIJAKAN YANG MENGIKAT');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (17, 'berkala', 'INFORMASI TENTANG PROSEDUR MEMPEROLEH INFORMASI PUBLIK');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (24, 'berkala', 'INFORMASI TENTANG TATA CARA PENGADUAN PENYALAHGUNAAN WEWENANG ATAU PELANGGARAN');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (25, 'berkala', 'INFORMASI PENGADAAN BARANG DAN JASA');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (26, 'berkala', 'INFORMASI TENTANG PROSEDUR PERINGATAN DINI DAN PROSEDUR EVAKUASI KEADAAN DARURAT');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (28, 'berkala', 'Informasi Ketenagakerjaan');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (13, 'serta_merta', 'RADIO KONATA');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (14, 'serta_merta', 'PENGADUAN MASYARAKAT (ULAS)');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (15, 'serta_merta', 'OPEN DATA SURAKARTA');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (38, 'serta_merta', 'Definisi Bencana (BNPB)');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (39, 'serta_merta', 'Siaga Bencana (BNPB)');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (42, 'serta_merta', 'Informasi tentang Rencana Gangguan terhadap Utilitas Publik');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (43, 'serta_merta', 'Profil Dinas Sosial Kota Surakarta');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (51, 'setiap_saat', 'DAFTAR INFORMASI PUBLIK (DIP) DINAS SOSIAL');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (52, 'setiap_saat', 'DOKUMEN STANDAR OPERASIONAL PROSEDUR (SOP) PELAYANAN');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (53, 'setiap_saat', 'PERJANJIAN KERJA SAMA PIHAK KETIGA / LKS');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (54, 'setiap_saat', 'RENCANA STRATEGIS (RENSTRA) DAN RENCANA KERJA (RENJA)');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (61, 'dikecualikan', 'DATA PRIBADI BY NAME BY ADDRESS (BNBA) NIK PENERIMA MANFAAT DTKS/PKH');
INSERT INTO `ref_ppid_kategori` (`id`, `jenis`, `nama`) VALUES (62, 'dikecualikan', 'REKAM MEDIS & ASESMEN PSIKOSOSIAL ANAK BERHADAPAN DENGAN HUKUM / ADOPSI COTA');

DROP TABLE IF EXISTS `tb_ppid_informasi`;
CREATE TABLE `tb_ppid_informasi` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kategori_id` INT DEFAULT 0,
  `jenis` VARCHAR(500),
  `judul` VARCHAR(500),
  `tahun` VARCHAR(500),
  `file_url` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (1, 1, 'berkala', 'Anggaran DPA Dinas Sosial Kota Surakarta', '2025', 'http://nas-noc.surakarta.go.id/share.cgi?ssid=5dff493c44ea452ebc03e056a8d84fa5');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (2, 1, 'berkala', 'Daftar Aset / Barang Milik Daerah (BMD)', '2025', 'http://drive.google.com/file/d/19n7NKGle7o4NF0dOHZPXoIkJz2oxKj9F/view?usp=share_link');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (3, 1, 'berkala', 'Profil Pimpinan Dinas Sosial Kota Surakarta', '2026', '#/ppid/profil');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (4, 1, 'berkala', 'LHKPN Pimpinan Badan Publik', '2025', 'http://drive.google.com/file/d/10ZEBYnv5wq1e27CvCKQLEhqsK0fc3u0P/view?usp=share_link');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (5, 1, 'berkala', 'Struktur Organisasi Dinas Sosial Kota Surakarta', '2026', 'assets/images/bagan-organisasi.svg');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (6, 1, 'berkala', 'Tugas dan Fungsi Dinas Sosial Kota Surakarta', '2026', '#/profil/detail/10');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (7, 1, 'berkala', 'Visi dan Misi Pelayanan', '2026', 'assets/images/maklumat-pelayanan.svg');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (8, 1, 'berkala', 'Kedudukan/Domisili Beserta Alamat Lengkap', '2026', '#/profil/detail/7');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (9, 2, 'berkala', 'Ringkasan Program dan Kegiatan Dinas Sosial Tahun Anggaran 2026', '2026', '#/profil/detail/14');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (10, 3, 'berkala', 'Laporan Kinerja Instansi Pemerintah (LKjIP) Dinas Sosial', '2025', '#/profil/detail/12');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (11, 4, 'berkala', 'Laporan Realisasi Anggaran (LRA), Neraca, dan CaLK Audited', '2025', '#/bank_data');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (12, 5, 'berkala', 'Laporan Tahunan Layanan Informasi Publik PPID Pelaksana', '2025', '#/ppid/profil');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (13, 16, 'berkala', 'SK Standar Pelayanan, Maklumat Pelayanan & Kode Etik Dinsos 2026', '2026', '#/standar_pelayanan');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (14, 17, 'berkala', 'SOP Tata Cara Permohonan & Keberatan Informasi Publik PPID', '2026', 'assets/images/alur-pengaduan.svg');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (15, 24, 'berkala', 'Mekanisme Pengaduan Masyarakat, SP4N-LAPOR! & Whistleblowing System', '2026', 'assets/images/alur-pengaduan.svg');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (16, 25, 'berkala', 'Rencana Umum Pengadaan (RUP) SiRUP LKPP Dinas Sosial Kota Surakarta', '2026', 'https://sirup.lkpp.go.id/');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (17, 26, 'berkala', 'SOP Peringatan Dini Kebencanaan & Dapur Umum TAGANA Kota Surakarta', '2026', '#/standar_pelayanan/detail/9');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (18, 28, 'berkala', 'Informasi Pengadaan TKPK & Kepegawaian Dinas Sosial Kota Surakarta', '2025', '#/pengumuman');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (19, 14, 'serta_merta', 'Kanal Unit Layanan Aduan Surakarta (ULAS) Terintegrasi', '2026', 'https://ulas.surakarta.go.id/');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (20, 15, 'serta_merta', 'Portal Open Data Sektor Kesejahteraan Sosial Kota Surakarta (29 Dataset)', '2026', 'https://data.surakarta.go.id/organization/dinas-sosial-kota-surakarta');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (21, 39, 'serta_merta', 'Layanan Tanggap Darurat Sosial & Bencana TAGANA 24 Jam', '2026', '#/standar_pelayanan/detail/9');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (22, 51, 'setiap_saat', 'SK Penetapan Daftar Informasi Publik (DIP) Dinas Sosial Kota Surakarta Tahun 2026', '2026', '#/ppid/daftar_informasi_publik');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (23, 52, 'setiap_saat', 'Dokumen Lengkap 15 Standar Pelayanan Publik Dinas Sosial Kota Surakarta', '2026', '#/standar_pelayanan');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (24, 54, 'setiap_saat', 'Dokumen RENSTRA 2021-2026 & RENJA Dinas Sosial Kota Surakarta', '2026', '#/profil/detail/14');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (25, 61, 'dikecualikan', 'Penetapan Uji Konsekuensi Data Pribadi BNBA NIK/KK dalam SIKS-NG & E-SIK (Pasal 17 huruf h UU KIP & UU PDP)', '2026', '#/ppid/informasi_dikecualikan');
INSERT INTO `tb_ppid_informasi` (`id`, `kategori_id`, `jenis`, `judul`, `tahun`, `file_url`) VALUES (26, 62, 'dikecualikan', 'Penetapan Uji Konsekuensi Dokumen Rahasia Pengangkatan Anak (COTA) & Klien Rehabilitasi Anak', '2026', '#/ppid/informasi_dikecualikan');

DROP TABLE IF EXISTS `tb_halaman_aduan`;
CREATE TABLE `tb_halaman_aduan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `judul` VARCHAR(500),
  `tipe` VARCHAR(500),
  `konten` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_halaman_aduan` (`id`, `judul`, `tipe`, `konten`) VALUES (1, 'SK Kepala Diskominfo SP No.011 Tentang Susunan Tim Pengelola Pengaduan Dan Admin SP4N Tahun 2025', 'dokumen', '<p>Keputusan Kepala Dinas Komunikasi, Informatika, Statistik dan Persandian Kota Surakarta Nomor 011 Tahun 2025 tentang Susunan Tim Pengelola Pengaduan dan Admin Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional (SP4N-LAPOR!) Pemerintah Kota Surakarta.</p>');
INSERT INTO `tb_halaman_aduan` (`id`, `judul`, `tipe`, `konten`) VALUES (2, 'Mekanisme/Alur Penanganan Pengaduan Masyarakat', 'gambar', '<p>Alur resmi penanganan pengaduan masyarakat pada Dinas Sosial Kota Surakarta yang terintegrasi melalui Loket Pengaduan, Hotline WhatsApp 0811-2811-919, ULAS Pemkot Surakarta, dan SP4N-LAPOR!.</p>');
INSERT INTO `tb_halaman_aduan` (`id`, `judul`, `tipe`, `konten`) VALUES (3, 'Pengelolaan Aduan Ulas', 'ulas', '<p>Unit Layanan Aduan Surakarta (ULAS) merupakan sistem pengelolaan aspirasi dan pengaduan masyarakat terpadu Pemerintah Kota Surakarta. Pada sistem produksi asli terdapat integrasi iframe ke portal ULAS (<code>ulas.surakarta.go.id</code>).</p>');
INSERT INTO `tb_halaman_aduan` (`id`, `judul`, `tipe`, `konten`) VALUES (4, 'Sampaikan Aduan', 'form_aduan', '<p>Silakan sampaikan aspirasi, saran, permohonan informasi layanan, atau pengaduan kesejahteraan sosial melalui formulir resmi di bawah ini. Setiap aduan tercatat secara otomatis ke database BackEnd Dinas Sosial Kota Surakarta.</p>');
INSERT INTO `tb_halaman_aduan` (`id`, `judul`, `tipe`, `konten`) VALUES (5, 'Publikasi & Tampilkan Aduan (Rekap TW I–III 2026)', 'tabel_aduan', '<p>Transparansi publikasi tindak lanjut aduan masyarakat yang masuk ke Dinas Sosial Kota Surakarta beserta status penyelesaian oleh Bidang terkait.</p>');
INSERT INTO `tb_halaman_aduan` (`id`, `judul`, `tipe`, `konten`) VALUES (6, 'SK TIM PENGELOLA ADUAN SP4N LAPOR 2026', 'dokumen', '<p>Surat Keputusan Kepala Dinas Sosial Kota Surakarta Tahun 2026 tentang Pembentukan Tim Pengelola Pengaduan Pelayanan Publik, Pejabat Penghubung SP4N-LAPOR!, dan Admin ULAS Dinas Sosial Kota Surakarta Periode 2025–2027.</p>');

DROP TABLE IF EXISTS `tb_aduan_masyarakat`;
CREATE TABLE `tb_aduan_masyarakat` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tiket` VARCHAR(500),
  `tanggal` VARCHAR(500),
  `nama_pelapor` VARCHAR(500),
  `nik_masked` VARCHAR(500),
  `kontak` VARCHAR(500),
  `kategori` VARCHAR(500),
  `isi_aduan` VARCHAR(500),
  `tanggapan` LONGTEXT,
  `status` VARCHAR(500),
  `kanal` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_aduan_masyarakat` (`id`, `tiket`, `tanggal`, `nama_pelapor`, `nik_masked`, `kontak`, `kategori`, `isi_aduan`, `tanggapan`, `status`, `kanal`) VALUES (1, 'ADU-2026-0101', '2026-10-18', 'Bapak Suyanto (Warga Kel. Pajang, Laweyan)', '337201******0004', '0812****8821', 'Pengecekan DTKS / Desil DTSEN', 'Mohon informasi cara sanggah desil DTSEN karena keluarga kami lansia tidak bekerja namun status KIS PBI sempat nonaktif.', 'Terima kasih Bapak Suyanto. Silakan hadir ke Petugas Puskesos/SLRT Kelurahan Pajang membawa FC KTP dan KK untuk pemutakhiran SIKS-NG dan pengajuan Rekomendasi Reaktivasi PBI (bila nonaktif < 6 bulan). Petugas kami telah berkoordinasi dengan Puskesos Pajang.', 'Selesai', 'Website / ULAS');
INSERT INTO `tb_aduan_masyarakat` (`id`, `tiket`, `tanggal`, `nama_pelapor`, `nik_masked`, `kontak`, `kategori`, `isi_aduan`, `tanggapan`, `status`, `kanal`) VALUES (2, 'ADU-2026-0102', '2026-10-20', 'Ibu Siti Aminah (Warga Kel. Mojosongo, Jebres)', '337204******0012', '0857****3310', 'Permohonan Alat Bantu Kursi Roda', 'Ingin menanyakan tindak lanjut pengajuan permohonan kursi roda untuk orang tua kami pasca stroke yang sudah diajukan awal bulan.', 'Berkas permohonan atas nama keluarga Ibu Siti Aminah telah terverifikasi oleh Bidang Rehabilitasi Sosial dan dijadwalkan asesmen kunjungan rumah (Home Visit) oleh Pekerja Sosial pada pekan ini.', 'Diproses', 'WhatsApp 08112811919');
INSERT INTO `tb_aduan_masyarakat` (`id`, `tiket`, `tanggal`, `nama_pelapor`, `nik_masked`, `kontak`, `kategori`, `isi_aduan`, `tanggapan`, `status`, `kanal`) VALUES (3, 'ADU-2026-0103', '2026-10-22', 'Pengurus LKS Al-Ikhlas Surakarta', '337205******0009', '0813****9044', 'Layanan PEKA (Keringanan Pajak Kendaraan Sosial)', 'Apakah pengajuan rekomendasi keringanan pajak mobil ambulans yayasan dikenakan biaya dan berapa lama prosesnya?', 'Seluruh layanan di Dinas Sosial Kota Surakarta 100% GRATIS (Rp 0). Untuk inovasi layanan PEKA, waktu penyelesaian adalah 1 Hari Kerja dengan melampirkan Surat Permohonan, FC STNK, FC BPKB, dan Rekomendasi Kemenag/Tanda Daftar LKS.', 'Selesai', 'SP4N-LAPOR!');

DROP TABLE IF EXISTS `tb_unduhan`;
CREATE TABLE `tb_unduhan` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `dokumen` VARCHAR(500),
  `kategori` VARCHAR(500),
  `ukuran` VARCHAR(500),
  `file_url` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_unduhan` (`id`, `dokumen`, `kategori`, `ukuran`, `file_url`) VALUES (1, 'Mekanisme / Alur Penanganan Pengaduan Masyarakat', 'Pengaduan', '420 KB', 'assets/images/alur-pengaduan.svg');
INSERT INTO `tb_unduhan` (`id`, `dokumen`, `kategori`, `ukuran`, `file_url`) VALUES (2, 'SK. PEMBENTUKAN TIM KONSULTASI DAN PENGELOLAAN PENGADUAN PELAYANAN DINAS SOSIAL KOTA SURAKARTA TAHUN 2022', 'Surat Keputusan', '1.2 MB', '#/aduan/detail/1');
INSERT INTO `tb_unduhan` (`id`, `dokumen`, `kategori`, `ukuran`, `file_url`) VALUES (3, 'SK. Pengelola Ulas Dinas Sosial Kota Surakarta', 'Surat Keputusan', '890 KB', '#/aduan/detail/6');
INSERT INTO `tb_unduhan` (`id`, `dokumen`, `kategori`, `ukuran`, `file_url`) VALUES (4, 'SK Petugas Loket Layanan (Front Office) Dinas Sosial Kota Surakarta', 'Pelayanan Publik', '950 KB', '#/profil/detail/18');
INSERT INTO `tb_unduhan` (`id`, `dokumen`, `kategori`, `ukuran`, `file_url`) VALUES (5, 'Pengaruh Disiplin Kerja terhadap Prestasi Kerja Pelayanan Sosial', 'Kajian & Publikasi', '1.5 MB', '#/profil/detail/12');
INSERT INTO `tb_unduhan` (`id`, `dokumen`, `kategori`, `ukuran`, `file_url`) VALUES (6, 'Maklumat Pelayanan & Jam Pelayanan Dinas Sosial Kota Surakarta Tahun 2026', 'Standar Pelayanan', '540 KB', 'assets/images/maklumat-pelayanan.svg');

DROP TABLE IF EXISTS `tb_faq`;
CREATE TABLE `tb_faq` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `pertanyaan` VARCHAR(500),
  `jawaban` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (1, 'Bagaimana cara mendaftar Gakin?', 'Persyaratan Gakin:\n- Surat pengantar RT/RW untuk pengajuan Home Visit di Kelurahan\n- Fotokopi KK dan KTP Kepala Keluarga\nBerkas diserahkan ke petugas Home Visit / Puskesos SLRT di Kelurahan setempat.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (2, 'Bagaimana cara mengaktifkan JKN-KIS?', 'Persyaratan reaktivasi JKN-KIS (PBI):\n- Terdaftar dalam ID SEMESTA / data DTKS (SIKS-NG)\n- Status kepesertaan nonaktif kurang dari 6 bulan\n- Membawa FC KK, FC KTP, dan Surat Keterangan Sakit/Kontrol dari Faskes jika kondisi emergency.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (3, 'Bagaimana beralih dari Iuran Mandiri BPJS ke KIS PBI?', 'Untuk pengalihan dari iuran Mandiri ke KIS PBI APBD silakan ke Kelurahan dengan membawa persyaratan:\n- Surat keterangan RT/RW\n- Fotokopi KTP dan KK\n- Membuat surat pernyataan bahwa sudah tidak mampu melanjutkan pembayaran iuran Mandiri diberi meterai 10.000 (dimohon agar tidak ada tunggakan dalam pembayaran iuran; jika ada tunggakan harus dilunasi terlebih dahulu).');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (4, 'Bagaimana Solusi Kartu ATM KKS hilang ?', 'Datang menemui pendamping PKH/Bansos di Kecamatan setempat untuk meminta surat rekomendasi pencetakan ATM KKS ke Bank BNI/Himbara.\nPersyaratan Percepatan ATM KKS:\n1. KTP Asli\n2. Surat Rekomendasi Pendampingan PKH\n3. Surat Kehilangan dari Kepolisian.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (5, 'Bagaimana prosedur untuk memasukkan lansia ke panti ?', 'Prosedur Lansia yang akan masuk ke Panti Lansia ada 2 kategori: terlantar yang sebatang kara dan masih memiliki keluarga/kakak/adik/anak. Untuk kategori yang bisa masuk di panti milik pemerintah adalah lansia yang sebatang kara dan tidak ada keluarga. Sesuai dengan UU Nomor 23 Tahun 2014 kewenangan pengelolaan Panti berada di Provinsi.\nAdapun syarat lansia yang bisa dirujuk ke panti milik pemerintah/provinsi:\n- Usia 60 tahun ke atas\n- Tidak memiliki keluarga/kakak/adik/anak\n- Domisili dan KTP Surakarta (untuk luar Kota Surakarta dikoordinasikan ke Dinas Sosial setempat sesuai alamat identitasnya)\n- Mandiri atau ADL (Aktivitas sehari-hari) bisa beraktivitas tanpa bantuan orang lain.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (6, 'Bagaimana cara mendapatkan bantuan orang kehabisan bekal?', 'Penanganan Orang Kehabisan Bekal:\n- Menyerahkan surat keterangan kehabisan bekal dari pihak Kepolisian\n- Menunjukkan KTP atau jika kehilangan KTP wajib menyerahkan surat keterangan kehilangan KTP dari pihak Kepolisian\n- Menyerahkan surat estafet atau penerusan pemulangan dari Dinas Sosial lain yang mengestafetkan jika proses pemulangan dilakukan dengan cara pengestafetan\n- Dinas Sosial tidak akan memproses atau memberikan bantuan pemulangan jika orang kehabisan bekal tersebut sudah pernah dibantu pemulangannya di lain waktu baik dari Dinas Sosial Kota Surakarta atau Dinas Sosial daerah lain\n- Tujuan pemulangan PPKS harus sesuai dengan KTP.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (7, 'Bagaimana cara menangani orang yang terlantar dan tidak dikenali identitas dirinya?', 'Penanganan orang yang terlantar dan tidak dikenali identitasnya (Alur Penanganan):\n- PPKS (Pemerlu Pelayanan Kesejahteraan Sosial) diantar oleh Satpol PP / petugas Kelurahan / relawan ke Rumsing (Rumah Singgah)\n- Petugas Rumsing membuat Berita Acara penerimaan PPKS + foto + kronologi penyerahan dari pengirim PPKS ke petugas Rumsing\n- Petugas Rumsing melakukan assessment awal kepada PPKS mengenai data diri PPKS\n- Apabila tidak ada identitas diri, dibawa ke Dukcapil untuk perekaman Biometrik guna mengetahui alamat asal PPKS\n- Apabila PPKS dalam keadaan sakit akan dirujuk untuk dilakukan pengobatan/perawatan awal terlebih dahulu\n- Apabila sehat, PPKS dimasukkan dalam Rumsing dengan masa singgah 1–7 hari untuk assessment lanjutan dan penelusuran keluarga/kerabat\n- Apabila diketahui keluarga PPKS, Petugas Rumsing melaksanakan penyerahan/reunifikasi PPKS ke keluarganya dengan Berita Acara penyerahan.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (8, 'Bagaimana cara mendapatkan bantuan permohonan alat bantu ?', 'Syarat-syarat permohonan alat bantu:\n- Fotokopi KK dan KTP PM (Penerima Manfaat)\n- Foto diri seluruh badan PM\n- Surat Keterangan Tidak Mampu (SKTM) / Surat Keterangan dari Kelurahan keperluan permohonan bantuan ke Walikota Surakarta\n- Surat permohonan bantuan kepada Walikota yang ditandatangani PM tanpa meterai\n- Pengajuan berkas ke Dinas Sosial Kota Surakarta.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (9, 'Bagaimana cara mendaftar mendirikan LKS (Lembaga Kesejahteraan Sosial) ?', 'Persyaratan pengajuan Tanda Daftar LKS:\n1. Surat Permohonan Keterangan Terdaftar LKS kepada Kepala Dinas Sosial Kota Surakarta\n2. AD/ART\n3. FC Akta Notaris\n4. FC Surat Kemenkumham\n5. FC KTP (Ketua, Bendahara, dan Sekretaris)\n6. FC NPWP\n7. Surat Keterangan Domisili dari Kelurahan\n8. Susunan Pengurus LKS\n9. Foto Sekretariat dan Kegiatan-kegiatan\n10. Rekomendasi dari LKKS.');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (10, 'Apa saja persyaratan pengajuan keringanan pajak kendaraan bagi LKS/Yayasan Sosial Keagamaan?', 'Persyaratan pengajuan keringanan pajak kendaraan bagi LKS/Yayasan Sosial Keagamaan (Layanan PEKA):\n1. Surat Permohonan\n2. FC STNK\n3. FC BPKB\n4. Rekomendasi dari Kementerian Agama (Khusus Masjid / Gereja).');
INSERT INTO `tb_faq` (`id`, `pertanyaan`, `jawaban`) VALUES (11, 'Bagaimana cara mendapatkan bantuan untuk korban bencana alam?', 'Persyaratan Permohonan Pengajuan Bantuan untuk Korban Bencana Alam:\n1. Surat Permohonan / Nota Dinas dari Kelurahan\n2. FC KK dan KTP yang terdampak\n3. Foto kejadian / rumah terdampak\n4. Laporan Assessment dari TAGANA Surakarta.');

DROP TABLE IF EXISTS `tb_pmks_psks`;
CREATE TABLE `tb_pmks_psks` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kecamatan` VARCHAR(500),
  `kelurahan_jml` INT DEFAULT 0,
  `fakir_miskin_kk` INT DEFAULT 0,
  `lansia_terlantar` INT DEFAULT 0,
  `disabilitas` INT DEFAULT 0,
  `anak_terlantar` INT DEFAULT 0,
  `kpm_pkh` INT DEFAULT 0,
  `kpm_bpnt` INT DEFAULT 0,
  `lks_terdaftar` INT DEFAULT 0,
  `tksk_psm_tagana` INT DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_pmks_psks` (`id`, `kecamatan`, `kelurahan_jml`, `fakir_miskin_kk`, `lansia_terlantar`, `disabilitas`, `anak_terlantar`, `kpm_pkh`, `kpm_bpnt`, `lks_terdaftar`, `tksk_psm_tagana`) VALUES (1, 'Laweyan', 11, 6420, 412, 538, 145, 2890, 5140, 18, 64);
INSERT INTO `tb_pmks_psks` (`id`, `kecamatan`, `kelurahan_jml`, `fakir_miskin_kk`, `lansia_terlantar`, `disabilitas`, `anak_terlantar`, `kpm_pkh`, `kpm_bpnt`, `lks_terdaftar`, `tksk_psm_tagana`) VALUES (2, 'Serengan', 7, 4310, 298, 342, 96, 1940, 3680, 11, 45);
INSERT INTO `tb_pmks_psks` (`id`, `kecamatan`, `kelurahan_jml`, `fakir_miskin_kk`, `lansia_terlantar`, `disabilitas`, `anak_terlantar`, `kpm_pkh`, `kpm_bpnt`, `lks_terdaftar`, `tksk_psm_tagana`) VALUES (3, 'Pasar Kliwon', 10, 7180, 486, 495, 182, 3420, 6120, 15, 58);
INSERT INTO `tb_pmks_psks` (`id`, `kecamatan`, `kelurahan_jml`, `fakir_miskin_kk`, `lansia_terlantar`, `disabilitas`, `anak_terlantar`, `kpm_pkh`, `kpm_bpnt`, `lks_terdaftar`, `tksk_psm_tagana`) VALUES (4, 'Jebres', 11, 10450, 695, 814, 264, 4980, 8740, 27, 86);
INSERT INTO `tb_pmks_psks` (`id`, `kecamatan`, `kelurahan_jml`, `fakir_miskin_kk`, `lansia_terlantar`, `disabilitas`, `anak_terlantar`, `kpm_pkh`, `kpm_bpnt`, `lks_terdaftar`, `tksk_psm_tagana`) VALUES (5, 'Banjarsari', 15, 12190, 784, 946, 298, 5640, 9890, 31, 102);

DROP TABLE IF EXISTS `tb_users`;
CREATE TABLE `tb_users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(500),
  `password_hint` VARCHAR(500),
  `nama_lengkap` VARCHAR(500),
  `role` VARCHAR(500),
  `bidang` VARCHAR(500),
  `aktif` INT DEFAULT 0,
  `last_login` VARCHAR(500),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `tb_users` (`id`, `username`, `password_hint`, `nama_lengkap`, `role`, `bidang`, `aktif`, `last_login`) VALUES (1, 'admin', 'dinsos2026', 'Administrator Utama Dinsos', 'Superadmin', 'Sekretariat / TI', 1, '2026-10-23 02:34:16');
INSERT INTO `tb_users` (`id`, `username`, `password_hint`, `nama_lengkap`, `role`, `bidang`, `aktif`, `last_login`) VALUES (2, 'ppid_dinsos', 'ppid2026', 'Admin PPID Pelaksana', 'Admin PPID', 'Sekretariat', 1, '2026-10-22 14:20:00');
INSERT INTO `tb_users` (`id`, `username`, `password_hint`, `nama_lengkap`, `role`, `bidang`, `aktif`, `last_login`) VALUES (3, 'admin_dayasos', 'dayasos2026', 'Operator Pemberdayaan Sosial', 'Admin Bidang', 'Bidang Pemberdayaan Sosial', 1, '2026-10-22 11:05:00');
INSERT INTO `tb_users` (`id`, `username`, `password_hint`, `nama_lengkap`, `role`, `bidang`, `aktif`, `last_login`) VALUES (4, 'admin_rehabsos', 'rehabsos2026', 'Operator Rehabilitasi Sosial', 'Admin Bidang', 'Bidang Rehabilitasi Sosial', 1, '2026-10-21 15:10:00');
INSERT INTO `tb_users` (`id`, `username`, `password_hint`, `nama_lengkap`, `role`, `bidang`, `aktif`, `last_login`) VALUES (5, 'admin_linjamsos', 'linjamsos2026', 'Operator Linjamsos & SIKS-NG', 'Admin Bidang', 'Bidang Perlindungan & Jaminan Sosial', 1, '2026-10-23 07:45:00');
