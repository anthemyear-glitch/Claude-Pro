'use strict';

/**
 * Pengisi data awal (seed). Semua teks di sini ditulis ulang sebagai konten contoh
 * untuk keperluan kloning cadangan — bukan salinan isi situs aslinya.
 * Jalankan: npm run seed  (atau otomatis saat pertama kali server dinyalakan)
 */

const path = require('path');
const { q, setSetting } = require('./db');
const { hashPassword } = require('./auth');
const { slugify, uniqueSlug } = require('./util');

const adaData = () => q.get('SELECT COUNT(*) AS n FROM dip').n > 0;

const KATEGORI = [
  {
    slug: 'informasi-berkala',
    nama: 'Informasi Berkala',
    ikon: 'berkala',
    deskripsi:
      'Informasi yang wajib disediakan dan diumumkan secara berkala, sekurang-kurangnya enam bulan sekali, tanpa perlu permohonan.',
    urutan: 1,
  },
  {
    slug: 'informasi-setiap-saat',
    nama: 'Informasi Setiap Saat',
    ikon: 'setiapsaat',
    deskripsi:
      'Informasi yang wajib tersedia setiap saat, dapat diakses langsung oleh masyarakat atau melalui permohonan resmi.',
    urutan: 2,
  },
  {
    slug: 'informasi-serta-merta',
    nama: 'Informasi Serta Merta',
    ikon: 'sertamerta',
    deskripsi:
      'Informasi yang wajib diumumkan tanpa penundaan karena menyangkut hajat hidup orang banyak dan ketertiban umum.',
    urutan: 3,
  },
  {
    slug: 'informasi-dikecualikan',
    nama: 'Informasi Dikecualikan',
    ikon: 'dikecualikan',
    deskripsi:
      'Daftar informasi yang dikecualikan berdasarkan hasil uji konsekuensi, beserta dasar pengecualiannya.',
    urutan: 4,
  },
];

const OPD = [
  ['Dinas Komunikasi, Informatika, Statistik dan Persandian', 'Diskominfo SP', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931667', 'diskominfo@contoh.go.id', 'https://diskominfo.contoh.go.id'],
  ['Sekretariat Daerah', 'Setda', 'Sekretariat', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931600', 'setda@contoh.go.id', 'https://setda.contoh.go.id'],
  ['Badan Perencanaan Pembangunan Daerah', 'Bappeda', 'Badan', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931611', 'bappeda@contoh.go.id', 'https://bappeda.contoh.go.id'],
  ['Badan Pengelolaan Keuangan dan Aset Daerah', 'BPKAD', 'Badan', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931612', 'bpkad@contoh.go.id', 'https://bpkad.contoh.go.id'],
  ['Badan Pendapatan Daerah', 'Bapenda', 'Badan', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931613', 'bapenda@contoh.go.id', 'https://bapenda.contoh.go.id'],
  ['Inspektorat Daerah', 'Inspektorat', 'Inspektorat', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931614', 'inspektorat@contoh.go.id', 'https://inspektorat.contoh.go.id'],
  ['Dinas Pendidikan', 'Disdik', 'Dinas', 'Jl. Dr. Sutomo No. 12, Surakarta', '(0271) 2931620', 'disdik@contoh.go.id', 'https://disdik.contoh.go.id'],
  ['Dinas Kesehatan', 'Dinkes', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931621', 'dinkes@contoh.go.id', 'https://dinkes.contoh.go.id'],
  ['Dinas Pekerjaan Umum dan Penataan Ruang', 'DPUPR', 'Dinas', 'Jl. Menteri Supeno No. 7, Surakarta', '(0271) 2931622', 'dpupr@contoh.go.id', 'https://dpupr.contoh.go.id'],
  ['Dinas Perumahan, Kawasan Permukiman dan Pertanahan', 'Disperkimtan', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931623', 'disperkimtan@contoh.go.id', 'https://disperkimtan.contoh.go.id'],
  ['Dinas Perhubungan', 'Dishub', 'Dinas', 'Jl. Menteri Supeno No. 5, Surakarta', '(0271) 2931624', 'dishub@contoh.go.id', 'https://dishub.contoh.go.id'],
  ['Dinas Lingkungan Hidup', 'DLH', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931625', 'dlh@contoh.go.id', 'https://dlh.contoh.go.id'],
  ['Dinas Sosial, Pemberdayaan Perempuan dan Perlindungan Anak', 'Dinsos P3A', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931626', 'dinsos@contoh.go.id', 'https://dinsos.contoh.go.id'],
  ['Dinas Koperasi, Usaha Kecil dan Menengah serta Perindustrian', 'Dinkop UKM Perin', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931627', 'dinkop@contoh.go.id', 'https://dinkop.contoh.go.id'],
  ['Dinas Perdagangan', 'Disdag', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931628', 'disdag@contoh.go.id', 'https://disdag.contoh.go.id'],
  ['Dinas Kebudayaan dan Pariwisata', 'Disbudpar', 'Dinas', 'Jl. Slamet Riyadi No. 275, Surakarta', '(0271) 2931629', 'disbudpar@contoh.go.id', 'https://disbudpar.contoh.go.id'],
  ['Dinas Pemuda dan Olahraga', 'Dispora', 'Dinas', 'Jl. Adi Sucipto No. 1, Surakarta', '(0271) 2931630', 'dispora@contoh.go.id', 'https://dispora.contoh.go.id'],
  ['Dinas Kependudukan dan Pencatatan Sipil', 'Disdukcapil', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931631', 'disdukcapil@contoh.go.id', 'https://disdukcapil.contoh.go.id'],
  ['Dinas Penanaman Modal dan Pelayanan Terpadu Satu Pintu', 'DPMPTSP', 'Dinas', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931632', 'dpmptsp@contoh.go.id', 'https://dpmptsp.contoh.go.id'],
  ['Satuan Polisi Pamong Praja', 'Satpol PP', 'Satuan', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931633', 'satpolpp@contoh.go.id', 'https://satpolpp.contoh.go.id'],
  ['Badan Penanggulangan Bencana Daerah', 'BPBD', 'Badan', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931634', 'bpbd@contoh.go.id', 'https://bpbd.contoh.go.id'],
  ['Badan Kepegawaian dan Pengembangan Sumber Daya Manusia', 'BKPSDM', 'Badan', 'Jl. Jend. Sudirman No. 2, Surakarta', '(0271) 2931635', 'bkpsdm@contoh.go.id', 'https://bkpsdm.contoh.go.id'],
  ['Kecamatan Pasar Kliwon', 'Kec. Pasar Kliwon', 'Kecamatan', 'Jl. Kapten Mulyadi No. 100, Surakarta', '(0271) 2931640', 'pasarkliwon@contoh.go.id', 'https://pasarkliwon.contoh.go.id'],
  ['Kecamatan Serengan', 'Kec. Serengan', 'Kecamatan', 'Jl. Veteran No. 200, Surakarta', '(0271) 2931641', 'serengan@contoh.go.id', 'https://serengan.contoh.go.id'],
  ['Kecamatan Laweyan', 'Kec. Laweyan', 'Kecamatan', 'Jl. Dr. Rajiman No. 300, Surakarta', '(0271) 2931642', 'laweyan@contoh.go.id', 'https://laweyan.contoh.go.id'],
  ['Kecamatan Banjarsari', 'Kec. Banjarsari', 'Kecamatan', 'Jl. Adi Sucipto No. 400, Surakarta', '(0271) 2931643', 'banjarsari@contoh.go.id', 'https://banjarsari.contoh.go.id'],
  ['Kecamatan Jebres', 'Kec. Jebres', 'Kecamatan', 'Jl. Ir. Sutami No. 500, Surakarta', '(0271) 2931644', 'jebres@contoh.go.id', 'https://jebres.contoh.go.id'],
];

/* Ringkasan informasi contoh untuk tiap kategori */
const DIP_DATA = [
  // --- Berkala ---
  ['informasi-berkala', 'Profil, visi, misi, dan struktur organisasi perangkat daerah', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap 6 bulan', 'Dokumen profil diperbarui bila terjadi perubahan struktur.'],
  ['informasi-berkala', 'Ringkasan program dan kegiatan yang sedang berjalan', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap 6 bulan', 'Memuat nama program, sasaran, pagu anggaran, dan jadwal pelaksanaan.'],
  ['informasi-berkala', 'Ringkasan laporan kinerja instansi pemerintah', 'Dokumen', 'PDF', 'Website', 2025, 'Tahunan', 'Disampaikan paling lambat tiga bulan setelah tahun anggaran berakhir.'],
  ['informasi-berkala', 'Ringkasan laporan keuangan: realisasi pendapatan, belanja, dan pembiayaan', 'Data', 'XLSX', 'Website', 2025, 'Tahunan', 'Mengikuti format yang ditetapkan peraturan perundang-undangan.'],
  ['informasi-berkala', 'Daftar serta ringkasan hasil pengadaan barang dan jasa', 'Dokumen', 'PDF', 'Website', 2026, 'Semester', 'Bersumber dari sistem informasi pengadaan.'],
  ['informasi-berkala', 'Pengumuman layanan publik dan jadwal pelayanan', 'Dokumen', 'PDF', 'Website + Papan Pengumuman', 2026, 'Berkala', 'Termasuk perubahan jam layanan pada hari libur nasional.'],
  ['informasi-berkala', 'Informasi tentang rencana strategis dan rencana kerja tahunan', 'Dokumen', 'PDF', 'Website', 2026, 'Tahunan', 'Diselaraskan dengan dokumen perencanaan daerah.'],
  ['informasi-berkala', 'Laporan akses informasi publik: jumlah permohonan, keberatan, dan penyelesaiannya', 'Data', 'XLSX', 'Website', 2025, 'Tahunan', 'Rekapitulasi seluruh permohonan yang masuk ke PPID.'],
  ['informasi-berkala', 'Peraturan dan keputusan kepala daerah yang telah ditetapkan', 'Dokumen', 'PDF', 'Website', 2026, 'Berkala', 'Diunggah setelah diundangkan dalam berita daerah.'],
  ['informasi-berkala', 'Ringkasan hak dan tata cara memperoleh informasi publik', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap pembaruan', 'Berisi alur permohonan, keberatan, dan sengketa informasi.'],
  ['informasi-berkala', 'Data statistik sektoral daerah per urusan pemerintahan', 'Data', 'XLSX', 'Website', 2025, 'Semester', 'Dihimpun dari masing-masing perangkat daerah.'],
  ['informasi-berkala', 'Daftar aset daerah yang dikelola badan publik', 'Data', 'XLSX', 'Website', 2025, 'Tahunan', 'Tidak memuat informasi yang dikecualikan.'],

  // --- Setiap saat ---
  ['informasi-setiap-saat', 'Daftar informasi publik yang berada di bawah penguasaan badan publik', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Diperbarui mengikuti perubahan Daftar Informasi Publik.'],
  ['informasi-setiap-saat', 'Hasil keputusan badan publik beserta pertimbangannya', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Termasuk keputusan yang berdampak pada kepentingan publik.'],
  ['informasi-setiap-saat', 'Kebijakan badan publik dan dokumen pendukungnya', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Naskah akademik, kajian, dan nota penjelasan bila tersedia.'],
  ['informasi-setiap-saat', 'Rencana kerja dan anggaran tahunan badan publik', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Versi yang telah ditetapkan.'],
  ['informasi-setiap-saat', 'Perjanjian badan publik dengan pihak ketiga', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Bagian yang dikecualikan disamarkan sesuai uji konsekuensi.'],
  ['informasi-setiap-saat', 'Perjanjian kerja sama antar perangkat daerah', 'Dokumen', 'PDF', 'Website', 2025, 'Setiap saat', 'Disertai ringkasan maksud dan ruang lingkup kerja sama.'],
  ['informasi-setiap-saat', 'Data perizinan yang telah diterbitkan beserta dasar pemberiannya', 'Data', 'XLSX', 'Website', 2026, 'Setiap saat', 'Diperbarui mengikuti penerbitan izin.'],
  ['informasi-setiap-saat', 'Surat-menyurat pimpinan dalam rangka pelaksanaan tugas', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Agenda surat masuk dan keluar yang bersifat terbuka.'],
  ['informasi-setiap-saat', 'Data perbendaharaan dan inventaris', 'Data', 'XLSX', 'Website', 2025, 'Setiap saat', 'Ringkasan inventaris barang milik daerah.'],
  ['informasi-setiap-saat', 'Rencana strategis dan rencana kerja badan publik', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Dokumen perencanaan lima tahunan dan turunannya.'],
  ['informasi-setiap-saat', 'Agenda kerja pimpinan perangkat daerah', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Agenda yang bersifat terbuka untuk publik.'],
  ['informasi-setiap-saat', 'Informasi mengenai kegiatan pelayanan informasi publik', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Laporan layanan, jumlah pemohon, dan kanal pengaduan.'],
  ['informasi-setiap-saat', 'Laporan pelayanan akses informasi publik', 'Dokumen', 'PDF', 'Website', 2025, 'Setiap saat', 'Laporan tahunan layanan keterbukaan informasi.'],
  ['informasi-setiap-saat', 'Standar operasional prosedur layanan', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'SOP front office, verifikasi, dan penyampaian jawaban.'],
  ['informasi-setiap-saat', 'Prosedur peringatan dini dan prosedur evakuasi keadaan darurat', 'Dokumen', 'PDF', 'Website', 2026, 'Setiap saat', 'Termasuk peta jalur evakuasi dan titik kumpul.'],

  // --- Serta merta ---
  ['informasi-serta-merta', 'Informasi potensi bencana dan langkah penanganannya', 'Dokumen', 'PDF', 'Website + Media Sosial', 2026, 'Serta merta', 'Disampaikan tanpa penundaan saat muncul potensi bencana.'],
  ['informasi-serta-merta', 'Peringatan dini cuaca ekstrem dan status kewaspadaan wilayah', 'Data', 'Portal', 'Website', 2026, 'Serta merta', 'Berkoordinasi dengan instansi meteorologi dan BPBD.'],
  ['informasi-serta-merta', 'Informasi gangguan pelayanan publik yang bersifat mendadak', 'Dokumen', 'Teks', 'Website + Media Sosial', 2026, 'Serta merta', 'Misalnya gangguan sistem, pemadaman, atau penutupan sementara layanan.'],
  ['informasi-serta-merta', 'Kejadian luar biasa di bidang kesehatan dan langkah mitigasinya', 'Dokumen', 'PDF', 'Website', 2026, 'Serta merta', 'Diumumkan bersama instansi kesehatan.'],
  ['informasi-serta-merta', 'Informasi ancaman pencemaran lingkungan dan penanganannya', 'Dokumen', 'PDF', 'Website', 2026, 'Serta merta', 'Termasuk lokasi terdampak dan imbauan bagi warga.'],
  ['informasi-serta-merta', 'Nomor darurat dan kanal pelaporan cepat masyarakat', 'Data', 'Teks', 'Website', 2026, 'Serta merta', 'Daftar nomor layanan darurat terpadu.'],

  // --- Dikecualikan ---
  ['informasi-dikecualikan', 'Dokumen hasil pemeriksaan aparat pengawas internal yang masih berproses', 'Dokumen', 'Tertutup', 'Tidak dipublikasikan', 2026, 'Sesuai uji konsekuensi', 'Pengecualian karena dapat menghambat proses pengawasan dan pemeriksaan.'],
  ['informasi-dikecualikan', 'Data pribadi pemohon layanan yang bersifat rahasia', 'Data', 'Tertutup', 'Tidak dipublikasikan', 2026, 'Sesuai uji konsekuensi', 'Dilindungi ketentuan pelindungan data pribadi.'],
  ['informasi-dikecualikan', 'Materi yang berkaitan dengan proses penegakan hukum yang berjalan', 'Dokumen', 'Tertutup', 'Tidak dipublikasikan', 2026, 'Sesuai uji konsekuensi', 'Pengecualian untuk menjaga proses hukum yang sedang berjalan.'],
  ['informasi-dikecualikan', 'Dokumen penawaran dalam proses pengadaan yang belum ditetapkan pemenangnya', 'Dokumen', 'Tertutup', 'Tidak dipublikasikan', 2026, 'Sesuai uji konsekuensi', 'Dibuka setelah penetapan hasil pengadaan.'],
  ['informasi-dikecualikan', 'Notula rapat yang memuat pembahasan bersifat tertutup', 'Dokumen', 'Tertutup', 'Tidak dipublikasikan', 2026, 'Sesuai uji konsekuensi', 'Ringkasan terbuka tetap diumumkan pada daftar informasi berkala.'],
  ['informasi-dikecualikan', 'Dokumen yang memuat strategi pertahanan dan keamanan daerah', 'Dokumen', 'Tertutup', 'Tidak dipublikasikan', 2026, 'Sesuai uji konsekuensi', 'Pengecualian demi kepentingan keamanan.'],
];

const HALAMAN = [
  {
    slug: 'mekanisme-pelayanan-informasi-publik',
    judul: 'Mekanisme Pelayanan Informasi Publik',
    subjudul: 'Alur permohonan informasi dari pengajuan sampai penyampaian jawaban',
    ikon: 'mekanisme',
    kelompok: 'layanan',
    urutan: 1,
    isi: `
<p>Setiap orang berhak memperoleh informasi publik yang berada di bawah penguasaan badan publik. Permohonan dapat disampaikan secara langsung, melalui surat elektronik, maupun lewat formulir daring pada portal ini.</p>
<h3>Alur Pelayanan</h3>
<ol>
<li><strong>Pengajuan permohonan.</strong> Pemohon mengisi formulir permohonan informasi dan melampirkan identitas diri atau akta pendirian bagi badan hukum.</li>
<li><strong>Pencatatan dan penomoran.</strong> Petugas PPID mencatat permohonan lalu menerbitkan nomor tiket sebagai bukti tanda terima.</li>
<li><strong>Verifikasi kelengkapan.</strong> Petugas memeriksa identitas, kejelasan rincian informasi, dan tujuan penggunaan. Bila kurang lengkap, pemohon diberi kesempatan melengkapi.</li>
<li><strong>Koordinasi dengan PPID Pelaksana.</strong> Bila informasi berada pada perangkat daerah, permohonan diteruskan ke PPID Pelaksana terkait.</li>
<li><strong>Penelaahan dan uji konsekuensi.</strong> Informasi yang dimohonkan dicocokkan dengan Daftar Informasi Publik serta daftar informasi yang dikecualikan.</li>
<li><strong>Penyampaian jawaban.</strong> Jawaban tertulis diberikan paling lambat sepuluh hari kerja sejak permohonan diterima, dan dapat diperpanjang tujuh hari kerja berikutnya dengan pemberitahuan tertulis.</li>
<li><strong>Penyerahan informasi.</strong> Informasi disampaikan sesuai cara perolehan yang dipilih pemohon: email, diunduh dari portal, diambil langsung, atau dikirim melalui pos.</li>
</ol>
<h3>Hak Pemohon Setelah Menerima Jawaban</h3>
<p>Apabila permohonan ditolak, tidak ditanggapi, atau informasi yang diberikan tidak sesuai dengan yang dimohonkan, pemohon berhak mengajukan keberatan kepada Atasan PPID paling lambat tiga puluh hari kerja sejak ditemukan alasan keberatan.</p>
<h3>Biaya</h3>
<p>Permohonan informasi publik tidak dipungut biaya. Biaya penggandaan atau perekaman, apabila ada, mengikuti ketentuan tarif yang berlaku dan diinformasikan terlebih dahulu kepada pemohon.</p>`,
  },
  {
    slug: 'pengajuan-keberatan-informasi',
    judul: 'Pengajuan Keberatan Informasi',
    subjudul: 'Prosedur ketika permohonan informasi tidak ditanggapi atau ditolak',
    ikon: 'keberatan',
    kelompok: 'layanan',
    urutan: 2,
    isi: `
<p>Keberatan adalah upaya yang dapat ditempuh pemohon informasi ketika merasa tidak puas atas jawaban badan publik.</p>
<h3>Alasan Keberatan</h3>
<ul>
<li>Permohonan informasi ditolak dengan alasan telah dikecualikan, padahal pemohon menilai alasan tersebut tidak tepat.</li>
<li>Permohonan tidak ditanggapi dalam batas waktu yang ditentukan.</li>
<li>Permohonan ditanggapi tidak sebagaimana yang diminta.</li>
<li>Informasi yang diminta tidak disampaikan secara berkala sebagaimana mestinya.</li>
<li>Permohonan informasi dikenakan biaya yang tidak wajar.</li>
</ul>
<h3>Tata Cara</h3>
<ol>
<li>Keberatan diajukan kepada <strong>Atasan PPID</strong> paling lambat 30 hari kerja sejak ditemukan alasan keberatan, baik langsung maupun tidak langsung.</li>
<li>Pengajuan dilengkapi identitas pemohon, nomor tiket permohonan sebelumnya, dan uraian alasan keberatan.</li>
<li>Atasan PPID memberikan tanggapan tertulis paling lambat 30 hari kerja sejak keberatan tercatat.</li>
</ol>
<h3>Upaya Lanjutan</h3>
<p>Bila pemohon masih tidak puas atas tanggapan Atasan PPID, pemohon berhak mengajukan sengketa informasi publik kepada Komisi Informasi paling lambat 14 hari kerja sejak diterimanya tanggapan tertulis.</p>`,
  },
  {
    slug: 'upaya-tidak-ditanggapi-atas-keberatan',
    judul: 'Upaya Ketika Keberatan Tidak Ditanggapi',
    subjudul: 'Langkah lanjutan bila tanggapan Atasan PPID tidak diterima',
    ikon: 'upaya',
    kelompok: 'layanan',
    urutan: 3,
    isi: `
<p>Apabila keberatan yang telah diajukan tidak ditanggapi dalam batas waktu yang ditentukan, pemohon tidak kehilangan haknya. Berikut langkah yang dapat ditempuh:</p>
<ol>
<li><strong>Pencatatan bukti pengajuan.</strong> Simpan nomor tiket keberatan, tanda terima, atau tangkapan layar pengiriman surat elektronik sebagai bukti tanggal pengajuan.</li>
<li><strong>Permintaan klarifikasi.</strong> Pemohon dapat menghubungi kanal layanan PPID untuk meminta keterangan mengenai status keberatan.</li>
<li><strong>Pengajuan sengketa informasi.</strong> Pemohon berhak mengajukan permohonan penyelesaian sengketa informasi publik kepada <strong>Komisi Informasi</strong> paling lambat 14 hari kerja sejak berakhirnya batas waktu tanggapan atas keberatan.</li>
<li><strong>Proses di Komisi Informasi.</strong> Penyelesaian sengketa dapat melalui mediasi dan/atau ajudikasi nonlitigasi yang dilakukan oleh Komisi Informasi.</li>
<li><strong>Upaya hukum lanjutan.</strong> Terhadap putusan Komisi Informasi, para pihak dapat mengajukan gugatan ke pengadilan sesuai ketentuan peraturan perundang-undangan.</li>
</ol>
<p class="note">Catatan: seluruh tahapan di atas tidak dipungut biaya oleh badan publik. Biaya perkara di Komisi Informasi dan pengadilan mengikuti ketentuan masing-masing lembaga.</p>`,
  },
  {
    slug: 'tentang-ppid',
    judul: 'Tentang PPID',
    subjudul: 'Pejabat Pengelola Informasi dan Dokumentasi',
    ikon: 'tentang',
    kelompok: 'profil',
    urutan: 10,
    isi: `
<p>PPID adalah singkatan dari <strong>Pejabat Pengelola Informasi dan Dokumentasi</strong>, yaitu pejabat yang bertanggung jawab di bidang penyimpanan, pendokumentasian, penyediaan, dan pelayanan informasi publik pada badan publik.</p>
<h3>Dasar Hukum</h3>
<p>Keberadaan PPID merupakan amanat Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik beserta peraturan pelaksanaannya. Undang-undang tersebut menegaskan bahwa informasi publik merupakan hak setiap warga negara, sementara badan publik berkewajiban menyediakan, mengumumkan, dan melayani permohonan informasi dengan cepat, tepat waktu, sederhana, dan biaya ringan.</p>
<h3>Tugas Utama</h3>
<ul>
<li>Mengkoordinasikan pengumpulan seluruh informasi publik yang dikuasai setiap unit kerja.</li>
<li>Menyusun dan memutakhirkan Daftar Informasi Publik serta daftar informasi yang dikecualikan melalui uji konsekuensi.</li>
<li>Melayani permohonan informasi publik, termasuk menerbitkan tanda terima dan jawaban tertulis.</li>
<li>Mengelola dokumentasi informasi publik agar mudah diakses dan tersimpan dengan baik.</li>
<li>Menyusun laporan tahunan layanan keterbukaan informasi publik.</li>
</ul>
<h3>Struktur Layanan</h3>
<p>Pada tingkat kota terdapat <strong>PPID Utama</strong> yang berkedudukan di dinas yang membidangi komunikasi dan informatika, serta <strong>PPID Pelaksana</strong> yang berada pada setiap perangkat daerah, kecamatan, dan badan layanan umum daerah. PPID Utama berperan mengkoordinasikan dan menghimpun layanan informasi dari seluruh PPID Pelaksana.</p>
<h3>Komitmen Pelayanan</h3>
<p>PPID berkomitmen menyelenggarakan layanan informasi publik yang transparan, akuntabel, mudah diakses, serta ramah bagi seluruh lapisan masyarakat termasuk penyandang disabilitas.</p>`,
  },
  {
    slug: 'maklumat-pelayanan',
    judul: 'Maklumat Pelayanan',
    subjudul: 'Pernyataan komitmen penyelenggaraan layanan informasi publik',
    ikon: 'maklumat',
    kelompok: 'profil',
    urutan: 11,
    isi: `
<p>Dengan ini kami menyatakan sanggup menyelenggarakan layanan informasi publik sesuai standar pelayanan yang telah ditetapkan, dan apabila tidak menepati janji ini kami siap menerima sanksi sesuai peraturan perundang-undangan yang berlaku.</p>
<h3>Standar Pelayanan yang Kami Janjikan</h3>
<ul>
<li>Permohonan informasi dicatat dan diberi nomor tiket pada hari kerja yang sama.</li>
<li>Jawaban tertulis disampaikan paling lambat sepuluh hari kerja, dengan kemungkinan perpanjangan tujuh hari kerja disertai pemberitahuan.</li>
<li>Layanan informasi publik tidak dipungut biaya.</li>
<li>Kanal pengaduan tersedia melalui telepon, surat elektronik, dan formulir daring.</li>
<li>Petugas memberikan layanan tanpa diskriminasi dan mengutamakan kemudahan akses bagi penyandang disabilitas.</li>
</ul>`,
  },
  {
    slug: 'struktur-organisasi',
    judul: 'Struktur Organisasi PPID',
    subjudul: 'Susunan penyelenggara layanan informasi publik',
    ikon: 'struktur',
    kelompok: 'profil',
    urutan: 12,
    isi: `
<p>Penyelenggaraan layanan informasi publik dijalankan melalui struktur berikut.</p>
<ul>
<li><strong>Atasan PPID</strong> — Sekretaris Daerah, bertugas menindaklanjuti keberatan pemohon informasi.</li>
<li><strong>PPID Utama</strong> — Kepala dinas yang membidangi komunikasi dan informatika, bertanggung jawab atas penyimpanan, pendokumentasian, penyediaan, dan pelayanan informasi publik lingkup kota.</li>
<li><strong>Bidang Pelayanan dan Dokumentasi</strong> — melayani permohonan, mendokumentasikan, dan menyerahkan informasi.</li>
<li><strong>Bidang Pengolahan Data dan Klasifikasi</strong> — menghimpun data, memutakhirkan Daftar Informasi Publik, dan melakukan uji konsekuensi.</li>
<li><strong>Bidang Penyelesaian Sengketa</strong> — menangani keberatan dan pendampingan proses sengketa informasi.</li>
<li><strong>PPID Pelaksana</strong> — berada pada setiap perangkat daerah, kecamatan, dan badan layanan umum daerah.</li>
</ul>`,
  },
  {
    slug: 'regulasi-keterbukaan-informasi',
    judul: 'Regulasi Keterbukaan Informasi',
    subjudul: 'Dasar hukum penyelenggaraan layanan informasi publik',
    ikon: 'regulasi',
    kelompok: 'lainnya',
    urutan: 20,
    isi: `
<ul>
<li>Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik.</li>
<li>Peraturan Pemerintah Nomor 61 Tahun 2010 tentang Pelaksanaan Undang-Undang Nomor 14 Tahun 2008.</li>
<li>Peraturan Komisi Informasi mengenai standar layanan informasi publik dan petunjuk teknis klasifikasi informasi.</li>
<li>Peraturan daerah dan keputusan kepala daerah tentang pedoman pengelolaan informasi dan dokumentasi di lingkungan pemerintah kota.</li>
</ul>
<p>Seluruh naskah yang dapat diunduh tersedia pada menu <a href="/regulasi">Regulasi</a>.</p>`,
  },
];

const BERITA = [
  {
    judul: 'PPID Gelar Sosialisasi Standar Layanan Informasi Publik bagi Perangkat Daerah',
    kategori: 'Kegiatan',
    ringkasan:
      'Kegiatan sosialisasi ditujukan agar setiap PPID Pelaksana memiliki pemahaman yang sama mengenai alur permohonan, klasifikasi informasi, dan batas waktu pelayanan.',
    isi: `
<p>PPID menyelenggarakan sosialisasi standar layanan informasi publik yang diikuti perwakilan PPID Pelaksana dari seluruh perangkat daerah, kecamatan, dan badan layanan umum daerah.</p>
<p>Materi yang disampaikan mencakup penyusunan Daftar Informasi Publik, tata cara uji konsekuensi terhadap informasi yang dikecualikan, alur verifikasi permohonan, serta pengelolaan dokumentasi agar informasi mudah ditemukan kembali saat diminta.</p>
<p>Peserta juga diajak mempraktikkan pengisian formulir permohonan, penerbitan nomor tiket, dan penyusunan jawaban tertulis. Pada sesi tanya jawab, sejumlah perangkat daerah menyampaikan kendala pemutakhiran data dan keterbatasan petugas yang merangkap tugas.</p>
<p>Sebagai tindak lanjut, dijadwalkan pendampingan teknis per kelompok perangkat daerah serta pemantauan berkala atas kelengkapan Daftar Informasi Publik masing-masing unit kerja.</p>`,
  },
  {
    judul: 'Pemutakhiran Daftar Informasi Publik Semester Kedua Telah Rampung',
    kategori: 'Pengumuman',
    ringkasan:
      'Seluruh perangkat daerah telah menyerahkan pemutakhiran Daftar Informasi Publik yang mencakup informasi berkala, setiap saat, serta merta, dan yang dikecualikan.',
    isi: `
<p>Proses pemutakhiran Daftar Informasi Publik (DIP) semester kedua dinyatakan selesai setelah seluruh perangkat daerah menyerahkan daftar mutakhir beserta berkas pendukungnya.</p>
<p>Pemutakhiran meliputi penambahan informasi baru, perbaikan metadata seperti tahun, format berkas, dan sarana pengumuman, serta penyesuaian daftar informasi yang dikecualikan berdasarkan hasil uji konsekuensi terbaru.</p>
<p>Masyarakat dapat mengakses daftar tersebut melalui menu Daftar Informasi Publik pada portal ini, lengkap dengan fitur pencarian dan penyaringan berdasarkan kategori maupun perangkat daerah.</p>`,
  },
  {
    judul: 'Uji Konsekuensi terhadap Informasi yang Dikecualikan Dilakukan Bersama Tim Ahli',
    kategori: 'Kegiatan',
    ringkasan:
      'Pengujian dilakukan untuk memastikan setiap pengecualian informasi memiliki dasar yang kuat dan tidak mengurangi hak masyarakat atas informasi.',
    isi: `
<p>Tim uji konsekuensi menggelar pengujian terhadap sejumlah dokumen yang diusulkan masuk daftar informasi yang dikecualikan. Pengujian dilakukan dengan menimbang akibat yang timbul apabila informasi dibuka serta kepentingan yang dilindungi oleh pengecualian tersebut.</p>
<p>Hasil pengujian dituangkan dalam berita acara dan menjadi dasar penetapan daftar informasi yang dikecualikan. Dokumen yang tidak memenuhi kriteria pengecualian dikembalikan untuk dibuka sebagai informasi publik.</p>
<p>Langkah ini menegaskan bahwa pengecualian informasi bersifat ketat, terukur, dan dapat dipertanggungjawabkan.</p>`,
  },
  {
    judul: 'Layanan Permohonan Informasi Kini Dilengkapi Pelacakan Nomor Tiket Daring',
    kategori: 'Layanan',
    ringkasan:
      'Pemohon dapat memantau posisi permohonannya secara mandiri menggunakan nomor tiket yang diterima saat pengajuan.',
    isi: `
<p>Portal layanan informasi publik kini dilengkapi fitur pelacakan permohonan. Setiap permohonan yang masuk otomatis memperoleh nomor tiket yang dikirim melalui surel dan ditampilkan pada layar konfirmasi.</p>
<p>Dengan memasukkan nomor tiket beserta alamat surel yang digunakan saat pengajuan, pemohon dapat melihat status terkini, catatan petugas, riwayat perubahan status, serta mengunduh berkas jawaban apabila permohonan telah selesai diproses.</p>
<p>Fitur ini diharapkan mengurangi kebutuhan pemohon untuk datang langsung ke kantor dan mempercepat komunikasi antara petugas dan pemohon.</p>`,
  },
  {
    judul: 'Keterbukaan Anggaran Daerah Dipaparkan dalam Forum Publik',
    kategori: 'Kegiatan',
    ringkasan:
      'Forum publik membahas gambaran umum perencanaan, penganggaran, dan pelaporan keuangan daerah yang dapat diakses masyarakat.',
    isi: `
<p>Forum publik digelar untuk memaparkan gambaran umum siklus anggaran daerah, mulai dari perencanaan, penganggaran, pelaksanaan, hingga pelaporan dan pertanggungjawaban.</p>
<p>Peserta forum yang terdiri dari unsur masyarakat sipil, akademisi, dan media memperoleh penjelasan mengenai jenis dokumen yang tersedia untuk publik, cara memperolehnya, serta kanal yang dapat digunakan untuk mengajukan permohonan informasi.</p>
<p>Kegiatan ditutup dengan sesi tanya jawab dan penyampaian saran perbaikan layanan.</p>`,
  },
  {
    judul: 'Imbauan Kewaspadaan terhadap Cuaca Ekstrem Disebarluaskan ke Kelurahan',
    kategori: 'Serta Merta',
    ringkasan:
      'Informasi yang menyangkut keselamatan warga disebarluaskan tanpa penundaan melalui berbagai kanal komunikasi.',
    isi: `
<p>Menindaklanjuti prakiraan cuaca ekstrem, informasi kewaspadaan disebarluaskan kepada warga melalui portal, media sosial resmi, dan jaringan komunikasi kelurahan.</p>
<p>Informasi yang disampaikan meliputi potensi hujan intensitas tinggi disertai angin kencang, lokasi yang perlu diwaspadai, langkah pengaman yang dapat dilakukan warga, serta nomor layanan darurat yang dapat dihubungi.</p>
<p>Penyebarluasan informasi yang menyangkut keselamatan warga dilakukan tanpa penundaan sebagai bagian dari kewajiban penyampaian informasi serta merta.</p>`,
  },
];

const REGULASI = [
  ['Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik', 'UU 14/2008', 'Undang-Undang', 2008, 'Pemerintah Republik Indonesia'],
  ['Peraturan Pemerintah Nomor 61 Tahun 2010 tentang Pelaksanaan UU Keterbukaan Informasi Publik', 'PP 61/2010', 'Peraturan Pemerintah', 2010, 'Pemerintah Republik Indonesia'],
  ['Peraturan Komisi Informasi tentang Standar Layanan Informasi Publik', 'Perki SLIP', 'Peraturan Komisi Informasi', 2021, 'Komisi Informasi'],
  ['Pedoman Klasifikasi Informasi Publik di Lingkungan Badan Publik', 'Pedoman Klasifikasi', 'Pedoman', 2022, 'Komisi Informasi'],
  ['Petunjuk Teknis Uji Konsekuensi Informasi yang Dikecualikan', 'Juknis Uji Konsekuensi', 'Petunjuk Teknis', 2023, 'PPID Utama'],
  ['Standar Operasional Prosedur Pelayanan Permohonan Informasi Publik', 'SOP Layanan', 'SOP', 2026, 'PPID Utama'],
  ['Keputusan tentang Penetapan PPID Utama dan PPID Pelaksana', 'SK Penetapan PPID', 'Keputusan', 2026, 'Kepala Daerah'],
  ['Pedoman Penyusunan Daftar Informasi Publik Perangkat Daerah', 'Pedoman DIP', 'Pedoman', 2026, 'PPID Utama'],
];

const VIDEO = [
  ['Alur Permohonan Informasi Publik dalam Tiga Menit', 'Ringkasan langkah pengajuan permohonan informasi melalui portal layanan.', 'layanan', '4:12'],
  ['Cara Melacak Status Permohonan dengan Nomor Tiket', 'Panduan singkat menggunakan fitur pelacakan permohonan.', 'layanan', '3:05'],
  ['Mengenal Daftar Informasi Publik', 'Penjelasan kategori informasi yang wajib disediakan badan publik.', 'informasi', '5:48'],
  ['Layanan Ramah bagi Penyandang Disabilitas', 'Fasilitas dan pendampingan yang tersedia bagi pemohon berkebutuhan khusus.', 'layanan', '6:20'],
  ['Prosedur Pengajuan Keberatan Informasi', 'Langkah yang dapat ditempuh bila jawaban badan publik belum memuaskan.', 'layanan', '4:55'],
  ['Profil Layanan Informasi Publik Kota', 'Gambaran umum kanal layanan dan jam operasional.', 'informasi', '7:10'],
  ['Uji Konsekuensi: Mengapa Ada Informasi yang Dikecualikan', 'Penjelasan sederhana mengenai pengecualian informasi.', 'informasi', '8:02'],
  ['Statistik Layanan Informasi Publik', 'Cara membaca rekapitulasi permohonan dan kinerja layanan.', 'informasi', '3:40'],
];

const FAQ = [
  ['Apa itu PPID?', 'PPID adalah Pejabat Pengelola Informasi dan Dokumentasi, yaitu pejabat yang bertanggung jawab menyimpan, mendokumentasikan, menyediakan, dan melayani permintaan informasi publik pada badan publik.'],
  ['Informasi apa saja yang dapat saya mohonkan?', 'Seluruh informasi publik yang berada di bawah penguasaan badan publik dan tidak termasuk informasi yang dikecualikan berdasarkan hasil uji konsekuensi.'],
  ['Apakah permohonan informasi dipungut biaya?', 'Tidak. Layanan informasi publik tidak dipungut biaya. Bila diperlukan penggandaan atau perekaman berkas, biaya yang timbul mengikuti ketentuan tarif yang berlaku dan diberitahukan terlebih dahulu.'],
  ['Berapa lama permohonan informasi diproses?', 'Jawaban tertulis diberikan paling lambat sepuluh hari kerja sejak permohonan diterima, dan dapat diperpanjang tujuh hari kerja dengan pemberitahuan tertulis kepada pemohon.'],
  ['Bagaimana cara mengetahui status permohonan saya?', 'Gunakan menu Lacak Permohonan, lalu masukkan nomor tiket dan alamat surel yang digunakan saat pengajuan.'],
  ['Apakah saya bisa mengajukan permohonan atas nama lembaga?', 'Bisa. Pilih jenis pemohon badan hukum atau kelompok masyarakat, lalu lengkapi identitas lembaga beserta akta pendirian atau surat keterangan yang relevan.'],
  ['Apa yang harus dilakukan jika permohonan saya ditolak?', 'Anda dapat mengajukan keberatan kepada Atasan PPID paling lambat tiga puluh hari kerja sejak ditemukan alasan keberatan, melalui menu Pengajuan Keberatan.'],
  ['Apakah informasi yang dikecualikan bisa dibuka suatu saat?', 'Dapat. Pengecualian berlaku selama dasar pengecualiannya masih relevan dan ditinjau kembali melalui uji konsekuensi secara berkala.'],
  ['Bagaimana cara mengadukan pelayanan yang kurang baik?', 'Gunakan formulir kontak, kanal surel, atau telepon layanan yang tercantum pada halaman Kontak. Setiap pengaduan dicatat dan ditindaklanjuti oleh petugas.'],
];

const SLIDER = [
  ['Informasi Publik, Hak Anda', 'Telusuri Daftar Informasi Publik atau ajukan permohonan secara daring.', '/daftar-informasi-publik', 'slide-1'],
  ['Ajukan Permohonan, Pantau Statusnya', 'Setiap permohonan memperoleh nomor tiket yang dapat dilacak kapan saja.', '/permohonan-informasi', 'slide-2'],
  ['Layanan Tanpa Biaya, Tanpa Diskriminasi', 'Kanal layanan terbuka bagi seluruh lapisan masyarakat.', '/mekanisme', 'slide-3'],
  ['Keberatan? Kami Sediakan Jalurnya', 'Prosedur keberatan hingga penyelesaian sengketa informasi.', '/pengajuan-keberatan', 'slide-4'],
];

function seed({ force = false } = {}) {
  if (adaData() && !force) {
    console.log('[seed] Basis data sudah berisi data — lewati. Gunakan "npm run seed" dengan --force untuk mengisi ulang.');
    return false;
  }
  if (force) {
    console.log('[seed] Membersihkan data lama...');
    q.tx(() => {
      ['riwayat_permohonan', 'keberatan', 'permohonan', 'survei', 'pesan_kontak', 'dip', 'kategori_dip', 'opd',
       'halaman', 'berita', 'regulasi', 'video', 'infografis', 'slider', 'faq', 'audit_log', 'statistik_kunjungan',
       'sessions', 'users', 'settings'].forEach((t) => q.run(`DELETE FROM ${t}`));
      ['riwayat_permohonan', 'keberatan', 'permohonan', 'survei', 'pesan_kontak', 'dip', 'kategori_dip', 'opd',
       'halaman', 'berita', 'regulasi', 'video', 'infografis', 'slider', 'faq', 'audit_log', 'statistik_kunjungan',
       'sessions', 'users'].forEach((t) => q.run(`DELETE FROM sqlite_sequence WHERE name = ?`, [t]));
    });
  }

  q.tx(() => {
    // Pengaturan situs
    setSetting('site_name', 'PPID Kota Surakarta');
    setSetting('site_subtitle', 'Pejabat Pengelola Informasi dan Dokumentasi');
    setSetting('brand_suffix', 'CloneForBackup');
    setSetting('alamat_klon', 'https://ppid.surakarta.go.id/CloneForBackup');
    setSetting('alamat_asli', 'https://ppid.surakarta.go.id');
    setSetting('telepon', '(0271) 2941667');
    setSetting('email', 'ppid@surakarta.go.id');
    setSetting('alamat_kantor', 'Dinas Komunikasi, Informatika, Statistik dan Persandian — Kompleks Balaikota, Surakarta, Jawa Tengah');
    setSetting('jam_layanan', 'Senin–Kamis 08.00–16.00 WIB · Jumat 08.00–14.30 WIB · Sabtu–Minggu & hari libur: tutup');
    setSetting('instagram', 'https://instagram.com/ppidsolo');
    setSetting('whatsapp', 'https://wa.me/6281200000000');
    setSetting('youtube', '#');
    setSetting('facebook', '#');
    setSetting('tema_default', 'negative');
    setSetting('watermark_teks', 'CloneForBackup');
    setSetting('watermark_aktif', '1');

    // Pengguna
    q.run('INSERT INTO users(username,password,nama,email,role) VALUES(?,?,?,?,?)', ['admin', hashPassword('admin123'), 'Administrator PPID', 'admin@ppid-clone.local', 'admin']);
    q.run('INSERT INTO users(username,password,nama,email,role) VALUES(?,?,?,?,?)', ['petugas', hashPassword('petugas123'), 'Petugas Layanan Informasi', 'petugas@ppid-clone.local', 'petugas']);

    // Kategori & OPD
    KATEGORI.forEach((k) =>
      q.run('INSERT INTO kategori_dip(slug,nama,deskripsi,ikon,urutan) VALUES(?,?,?,?,?)', [k.slug, k.nama, k.deskripsi, k.ikon, k.urutan])
    );
    OPD.forEach((o, i) => {
      const id = q.insert(
        'INSERT INTO opd(nama,singkatan,jenis,alamat,telepon,email,website,nama_ppid,jabatan_ppid) VALUES(?,?,?,?,?,?,?,?,?)',
        [o[0], o[1], o[2], o[3], o[4], o[5], o[6], `Petugas PPID ${o[1]}`, 'Pejabat Pengelola Informasi dan Dokumentasi Pelaksana']
      );
      if (i === 0) setSetting('opd_utama_id', String(id));
    });

    // DIP
    const katMap = {};
    q.all('SELECT id,slug FROM kategori_dip').forEach((r) => (katMap[r.slug] = r.id));
    const opdIds = q.all('SELECT id FROM opd').map((r) => r.id);

    DIP_DATA.forEach((d, i) => {
      const opdId = opdIds[i % opdIds.length];
      q.insert(
        `INSERT INTO dip(kategori_id,opd_id,ringkas_informasi,rincian,jenis,format,sarana,tahun,jangka_waktu,periode_penerbitan,berkas,ukuran,unduhan,dilihat)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          katMap[d[0]], opdId, d[1], d[7], d[2], d[3], d[4], d[5], d[6],
          d[0] === 'informasi-serta-merta' ? 'Serta merta — tanpa penundaan' : d[6],
          d[3] === 'Tertutup' ? null : `berkas/${d[0]}-${slugify(d[1]).slice(0, 40)}.${(d[3] || 'pdf').toLowerCase()}`,
          d[3] === 'Tertutup' ? null : `${(200 + ((i * 137) % 1800))} KB`,
          (i * 7) % 43, (i * 23) % 311,
        ]
      );
    });

    // Halaman statis
    HALAMAN.forEach((h) =>
      q.run('INSERT INTO halaman(slug,judul,subjudul,isi,ikon,kelompok,urutan) VALUES(?,?,?,?,?,?,?)',
        [h.slug, h.judul, h.subjudul, h.isi, h.ikon, h.kelompok, h.urutan])
    );

    // Berita (tanggal terbit dibuat berjarak agar terlihat alami)
    BERITA.forEach((b, i) => {
      const tgl = new Date(Date.now() - i * 6 * 864e5).toISOString().slice(0, 19).replace('T', ' ');
      q.run(
        'INSERT INTO berita(slug,judul,ringkasan,isi,penulis,kategori,sampul,dilihat,dibuat) VALUES(?,?,?,?,?,?,?,?,?)',
        [uniqueSlug(q, 'berita', b.judul), b.judul, b.ringkasan, b.isi, 'Admin PPID', b.kategori, `news-${i + 1}`, 40 - i * 5, tgl]
      );
    });

    // Regulasi
    REGULASI.forEach((r, i) =>
      q.run('INSERT INTO regulasi(judul,nomor,jenis,tahun,penerbit,berkas,ukuran,unduhan) VALUES(?,?,?,?,?,?,?,?)',
        [r[0], r[1], r[2], r[3], r[4], `regulasi/${slugify(r[1])}.pdf`, `${(300 + i * 111) % 2400 + 100} KB`, 12 + i * 9])
    );

    // Video
    VIDEO.forEach((v, i) =>
      q.run('INSERT INTO video(judul,keterangan,kelompok,tautan,durasi,dilihat) VALUES(?,?,?,?,?,?)',
        [v[0], v[1], v[2], '#', v[3], 120 + i * 37])
    );

    // Infografis
    [
      ['Ringkasan Alur Permohonan Informasi Publik', 'Visualisasi tujuh langkah layanan permohonan.', 'Infografis', 2026],
      ['Kategori Informasi Publik', 'Peta empat kategori informasi beserta contohnya.', 'Infografis', 2026],
      ['Rekapitulasi Permohonan Informasi per Semester', 'Grafik jumlah permohonan dan rata-rata waktu penyelesaian.', 'Statistik', 2026],
      ['Hak dan Kewajiban Pemohon Informasi', 'Ringkasan hak pemohon dan kewajiban badan publik.', 'Infografis', 2025],
      ['Prosedur Keberatan hingga Sengketa Informasi', 'Tahapan keberatan, tanggapan atasan, dan jalur Komisi Informasi.', 'Infografis', 2025],
      ['Standar Waktu Pelayanan Informasi Publik', 'Batas waktu tiap tahapan layanan.', 'Infografis', 2026],
    ].forEach((g, i) =>
      q.run('INSERT INTO infografis(judul,keterangan,berkas,kategori,tahun,unduhan) VALUES(?,?,?,?,?,?)',
        [g[0], g[1], `infografis/infografis-${i + 1}`, g[2], g[3], 8 + i * 6])
    );

    // Slider
    SLIDER.forEach((s, i) =>
      q.run('INSERT INTO slider(judul,subjudul,tautan,berkas,urutan,aktif) VALUES(?,?,?,?,?,1)', [s[0], s[1], s[2], s[3], i + 1])
    );

    // FAQ
    FAQ.forEach((f, i) => q.run('INSERT INTO faq(pertanyaan,jawaban,kelompok,urutan) VALUES(?,?,?,?)', [f[0], f[1], 'Umum', i + 1]));

    // Contoh permohonan (untuk statistik & demo pelacakan)
    const contoh = [
      ['Rina Kusumawati', 'rina.contoh@email.com', '081200000001', 'Perorangan', 'Informasi Setiap Saat', 'Meminta salinan standar operasional prosedur pelayanan perizinan di tingkat kecamatan.', 'Meneliti prosedur layanan', 'Selesai'],
      ['Bagus Prasetyo', 'bagus.contoh@email.com', '081200000002', 'Perorangan', 'Informasi Berkala', 'Meminta data realisasi anggaran bidang pendidikan tahun anggaran berjalan.', 'Keperluan penulisan artikel', 'Sedang Diproses'],
      ['PT Maju Bersama', 'legal@majubersama.contoh', '081200000003', 'Badan Hukum', 'Informasi Setiap Saat', 'Meminta daftar perjanjian kerja sama yang berkaitan dengan pengelolaan parkir tepi jalan umum.', 'Studi kelayakan kerja sama', 'Diverifikasi'],
      ['Lembaga Kajian Kota', 'sekretariat@kajankota.contoh', '081200000004', 'Kelompok Masyarakat', 'Informasi Berkala', 'Meminta rekapitulasi data statistik sektoral bidang kesehatan tiga tahun terakhir.', 'Kajian kebijakan publik', 'Selesai'],
      ['Siti Nurhaliza', 'siti.contoh@email.com', '081200000005', 'Perorangan', 'Informasi Dikecualikan', 'Meminta hasil pemeriksaan internal atas salah satu perangkat daerah.', 'Keperluan pribadi', 'Ditolak'],
      ['Ahmad Fauzi', 'ahmad.contoh@email.com', '081200000006', 'Peneliti/Mahasiswa', 'Informasi Setiap Saat', 'Meminta dokumen rencana induk transportasi kota beserta lampirannya.', 'Penyusunan tugas akhir', 'Selesai'],
      ['Dewi Anggraini', 'dewi.contoh@email.com', '081200000007', 'Perorangan', 'Informasi Serta Merta', 'Meminta penjelasan mengenai status kewaspadaan banjir di wilayah tempat tinggal.', 'Keselamatan keluarga', 'Selesai'],
      ['Komunitas Peduli Sungai', 'humas@pedulisungai.contoh', '081200000008', 'Kelompok Masyarakat', 'Informasi Berkala', 'Meminta data kualitas air sungai pada titik pantau kota.', 'Pemantauan lingkungan', 'Perlu Kelengkapan'],
      ['Yusuf Hidayat', 'yusuf.contoh@email.com', '081200000009', 'Perorangan', 'Informasi Setiap Saat', 'Meminta daftar aset daerah berupa tanah dan bangunan yang dimanfaatkan pihak ketiga.', 'Transparansi anggaran', 'Menunggu Verifikasi'],
      ['Maya Lestari', 'maya.contoh@email.com', '081200000010', 'Perorangan', 'Informasi Berkala', 'Meminta ringkasan program dan kegiatan perangkat daerah bidang kebudayaan.', 'Keperluan media', 'Selesai'],
      ['Hendra Wijaya', 'hendra.contoh@email.com', '081200000011', 'Badan Hukum', 'Informasi Setiap Saat', 'Meminta data perizinan usaha yang diterbitkan pada kuartal berjalan.', 'Riset pasar', 'Sedang Diproses'],
      ['Nadia Puspita', 'nadia.contoh@email.com', '081200000012', 'Perorangan', 'Informasi Setiap Saat', 'Meminta salinan keputusan penetapan tarif layanan retribusi daerah.', 'Keperluan usaha', 'Menunggu Verifikasi'],
    ];

    contoh.forEach((c, i) => {
      const dibuat = new Date(Date.now() - (i * 9 + 3) * 864e5).toISOString().slice(0, 19).replace('T', ' ');
      const id = q.insert(
        `INSERT INTO permohonan(nomor_tiket,nama,email,telepon,jenis_pemohon,kategori_info,rincian_info,tujuan,status,
          alamat,pekerjaan,cara_peroleh,cara_kirim,dibuat,diverifikasi,dijawab,diselesaikan,petugas_id,puas)
         VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          nomorTiketSeed(i), c[0], c[1], c[2], c[3], c[4], c[5], c[6], c[7],
          'Surakarta, Jawa Tengah', c[3] === 'Badan Hukum' ? 'Kuasa Hukum' : 'Wiraswasta',
          'Surat Elektronik (Email)', 'Email', dibuat,
          ['Diverifikasi', 'Sedang Diproses', 'Selesai', 'Ditolak', 'Perlu Kelengkapan'].includes(c[7]) ? dibuat : null,
          c[7] === 'Selesai' || c[7] === 'Ditolak' ? dibuat : null,
          c[7] === 'Selesai' ? dibuat : null,
          1 + (i % 2),
          c[7] === 'Selesai' ? 4 + (i % 2) : null,
        ]
      );
      q.run('INSERT INTO riwayat_permohonan(permohonan_id,status,keterangan,aktor,waktu) VALUES(?,?,?,?,?)',
        [id, 'Menunggu Verifikasi', 'Permohonan diterima dan dicatat oleh sistem.', 'sistem', dibuat]);
      if (!['Menunggu Verifikasi'].includes(c[7])) {
        q.run('INSERT INTO riwayat_permohonan(permohonan_id,status,keterangan,aktor,waktu) VALUES(?,?,?,?,?)',
          [id, 'Diverifikasi', 'Identitas dan kelengkapan permohonan telah diverifikasi.', 'petugas', dibuat]);
      }
      if (['Selesai', 'Ditolak'].includes(c[7])) {
        q.run('INSERT INTO riwayat_permohonan(permohonan_id,status,keterangan,aktor,waktu) VALUES(?,?,?,?,?)',
          [id, c[7], c[7] === 'Selesai' ? 'Informasi disampaikan melalui surel pemohon.' : 'Permohonan ditolak karena termasuk informasi yang dikecualikan.', 'petugas', dibuat]);
      }
    });

    // Contoh keberatan
    q.run(
      `INSERT INTO keberatan(nomor_tiket,nama,email,telepon,alamat,alasan,uraian,status,tanggapan,dibuat,dijawab)
       VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [
        'KBR-2026-00001', 'Siti Nurhaliza', 'siti.contoh@email.com', '081200000005', 'Surakarta, Jawa Tengah',
        'Penolakan atas permohonan informasi',
        'Pemohon menilai alasan penolakan kurang menjelaskan dasar pengecualian informasi yang dimohonkan.',
        'Ditanggapi',
        'Keberatan telah ditelaah. Penjelasan tambahan mengenai dasar pengecualian disampaikan melalui surel pemohon.',
        new Date(Date.now() - 12 * 864e5).toISOString().slice(0, 19).replace('T', ' '),
        new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 19).replace('T', ' '),
      ]
    );

    // Contoh survei
    for (let i = 0; i < 26; i++) {
      q.run('INSERT INTO survei(nama,email,layanan,mutu,kecepatan,kemudahan,tanggapan,saran,dibuat) VALUES(?,?,?,?,?,?,?,?,?)', [
        i % 3 === 0 ? `Pemohon ${i + 1}` : null,
        null,
        ['Permohonan Informasi', 'Pelacakan Status', 'Unduhan Dokumen', 'Layanan Konsultasi'][i % 4],
        3 + ((i * 7) % 3),
        3 + ((i * 5) % 3),
        4 + ((i * 3) % 2),
        'Pelayanan cukup membantu dan mudah dipahami.',
        i % 4 === 0 ? 'Mohon tambahkan panduan pengisian formulir yang lebih rinci.' : null,
        new Date(Date.now() - i * 2 * 864e5).toISOString().slice(0, 19).replace('T', ' '),
      ]);
    }

    // Kunjungan 30 hari terakhir (agar grafik statistik terisi)
    for (let i = 29; i >= 0; i--) {
      const tgl = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      const base = 60 + ((i * 37) % 90);
      q.run('INSERT INTO statistik_kunjungan(tanggal,halaman,pemohon) VALUES(?,?,?)', [tgl, base, Math.floor(base / 12)]);
    }

    q.run("INSERT INTO audit_log(aktor,aksi,target) VALUES('sistem','seed','Pengisian data awal selesai')");
  });

  console.log('[seed] Selesai. Akun admin: admin / admin123 · petugas: petugas / petugas123');
  return true;
}

function nomorTiketSeed(i) {
  const tahun = new Date().getFullYear();
  return `PPID-${tahun}-${String(i + 1).padStart(5, '0')}`;
}

if (require.main === module) {
  seed({ force: process.argv.includes('--force') });
}

module.exports = { seed };
