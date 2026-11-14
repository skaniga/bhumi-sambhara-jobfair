-- ============================================================
-- SEED DATA RESMI: BHUMI SAMBHARA EXPO & JOBFAIR 2026
-- Penyelenggara: K1 Pariwisata 2024 UNTIDAR x SMK Negeri 1 Magelang
-- Lokasi: Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang
-- Tanggal: Kamis, 19 November 2026
-- Total: 20 Stand Industri Partner Resmi & Lowongan Kerja
-- ============================================================

-- Bersihkan data lama jika diperlukan (opsional)
-- TRUNCATE TABLE public.stand_attendances CASCADE;
-- TRUNCATE TABLE public.job_applications CASCADE;
-- TRUNCATE TABLE public.job_vacancies CASCADE;
-- TRUNCATE TABLE public.industries CASCADE;

-- 1. SEED 20 STAND INDUSTRI RESMI
INSERT INTO public.industries (id, nama_perusahaan, bidang_industri, nomor_stand, deskripsi, alamat_kantor, kontak_pic, email_resmi, website)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'CV Karya Hidup Sentosa (Quick)', 'Manufaktur & Mesin Pertanian', 'Stand A1', 'Pabrikan alat dan mesin pertanian modern merk Quick Traktor dengan jangkauan distribusi nasional dan ekspor.', 'Jl. Magelang No. 144, Yogyakarta', '081223344550', 'rekrutmen@quick.co.id', 'https://quick.co.id'),
  ('a0000001-0000-0000-0000-000000000002', 'Armada Daihatsu (PT Astra Daihatsu)', 'Otomotif & Layanan Purna Jual', 'Stand A2', 'Dealer resmi penjualan kendaraan Daihatsu, bengkel perawatan berkala, dan penyedia suku cadang resmi area Kedu.', 'Jl. Jenderal Sudirman No. 120, Magelang', '081223344551', 'hrd@armada-daihatsu.com', 'https://armadadaihatsu.co.id'),
  ('a0000001-0000-0000-0000-000000000003', 'Indomaret Group (PT Indomarco Prismatama)', 'Ritel Modern & Distribusi Logistik', 'Stand A3', 'Jaringan waralaba minimarket dan pusat pergudangan logistik terbesar di Indonesia.', 'Kawasan Industri Candi Blok A No. 5, Semarang', '081223344552', 'karir@indomaret.co.id', 'https://indomaret.co.id'),
  ('a0000001-0000-0000-0000-000000000004', 'PT Shelter Indonesia', 'Facility Services & Manpower Solutions', 'Stand A4', 'Penyedia tenaga kerja profesional, pengelolaan fasilitas gedung perkantoran, dan pengamanan terlatih.', 'Jl. Kaliurang KM 7, Sleman, Yogyakarta', '081223344553', 'recruitment@shelter.co.id', 'https://shelterindonesia.com'),
  ('a0000001-0000-0000-0000-000000000005', 'PT Sumber Alfaria Trijaya Tbk (Alfamart)', 'Ritel Modern & Consumer Goods', 'Stand A5', 'Perusahaan ritel terkemuka pengelola puluhan ribu gerai minimarket Alfamart di seluruh Indonesia.', 'Jl. Soekarno Hatta KM 25, Bergas, Kab. Semarang', '081223344554', 'karir@alfamartku.com', 'https://alfamart.co.id'),
  ('a0000001-0000-0000-0000-000000000006', 'Grand Artos Hotel & Convention', 'Hospitality & Pariwisata', 'Stand B1', 'Hotel bintang 4 dan convention center bertaraf internasional terintegrasi dengan pusat belanja terbesar Magelang.', 'Jl. Mayjen Bambang Soegeng No. 1, Magelang', '081223344555', 'hrm@grandartoshotel.com', 'https://grandartoshotel.com'),
  ('a0000001-0000-0000-0000-000000000007', 'PT Bintang Toedjoe (Kalbe Group)', 'Farmasi & Consumer Health', 'Stand B2', 'Produsen produk farmasi, jamu modern, dan suplemen kesehatan ternama di bawah naungan Kalbe Group.', 'Kawasan Industri Pulogadung, Jakarta Timur', '081223344556', 'career@bintang7.com', 'https://bintang7.com'),
  ('a0000001-0000-0000-0000-000000000008', 'PT Bank Central Asia Tbk (BCA)', 'Perbankan & Keuangan', 'Stand B3', 'Bank swasta terbesar di Indonesia penyedia layanan transaksi keuangan dan perbankan digital terdepan.', 'KCU Magelang, Jl. Pemuda No. 40, Magelang', '081223344557', 'recruitment@bca.co.id', 'https://karir.bca.co.id'),
  ('a0000001-0000-0000-0000-000000000009', 'PT Pharos Indonesia', 'Farmasi & Industri Kesehatan', 'Stand B4', 'Perusahaan farmasi terkemuka penghasil produk obat resep, suplemen kesehatan, dan nutrisi berkualitas tinggi.', 'Jl. Limo No. 40, Permata Hijau, Jakarta', '081223344558', 'recruitment@pharos.co.id', 'https://pharos.co.id'),
  ('a0000001-0000-0000-0000-000000000010', 'PT Sukses Mandiri Utama', 'Logistik & Penempatan Tenaga Kerja', 'Stand B5', 'Mitra penyedia tenaga kerja manufaktur, teknik mesin presisi, dan operasional rantai pasok industri.', 'Jl. Gajah Mada No. 88, Semarang', '081223344559', 'info@suksesmandiri.co.id', 'https://suksesmandiri.co.id'),
  ('a0000001-0000-0000-0000-000000000011', 'PT Midi Utama Indonesia Tbk (Alfamidi)', 'Ritel Modern & Fresh Market', 'Stand C1', 'Jaringan supermarket ukuran menengah penyedia produk pangan segar, sayuran, dan kebutuhan sehari-hari.', 'Boyolali DC, Jl. Raya Boyolali-Semarang', '081223344560', 'karir@alfamidiku.com', 'https://alfamidi.id'),
  ('a0000001-0000-0000-0000-000000000012', 'Hotel Atria Magelang (Parador Hotels)', 'Hospitality & Kuliner Pariwisata', 'Stand C2', 'Hotel bintang 4 berkonsep perpaduan tradisi budaya dan kenyamanan modern dengan fasilitas banquet terkemuka.', 'Jl. Jenderal Sudirman No. 35, Magelang', '081223344561', 'hrd@atriahotelmagelang.com', 'https://parador-hotels.com'),
  ('a0000001-0000-0000-0000-000000000013', 'PT Mataram Sakti (Dealer Yamaha)', 'Otomotif & Sepeda Motor', 'Stand C3', 'Main dealer resmi penjualan, perbaikan teknis bengkel, dan suku cadang sepeda motor Yamaha wilayah Jateng & DIY.', 'Jl. Magelang - Purworejo KM 4, Magelang', '081223344562', 'hr@mataramsakti.co.id', 'https://mataramsakti.co.id'),
  ('a0000001-0000-0000-0000-000000000014', 'PT Nasmoco Magelang (Dealer Toyota)', 'Otomotif & Bengkel Resmi', 'Stand C4', 'Dealer resmi kendaraan Toyota dengan fasilitas bengkel body repair dan servis berkala terstandarisasi Jepang.', 'Jl. Urip Sumoharjo No. 18, Magelang', '081223344563', 'recruitment@nasmoco.co.id', 'https://nasmoco.co.id'),
  ('a0000001-0000-0000-0000-000000000015', 'PT Ungaran Sari Garments', 'Tekstil, Garmen & Ekspor Fashion', 'Stand C5', 'Eksportir pakaian jadi terkemuka di Asia Tenggara bermitra dengan merk busana ternama dunia.', 'Jl. Pangeran Diponegoro No. 235, Ungaran', '081223344564', 'hrd@usg.co.id', 'https://ungaransari.com'),
  ('a0000001-0000-0000-0000-000000000016', 'PT Taman Wisata Candi Borobudur', 'Pariwisata, Kebudayaan & Event', 'Stand D1', 'BUMN pengelola kawasan destinasi pariwisata warisan dunia Candi Borobudur, Prambanan, dan Ratu Boko.', 'Kompleks Taman Wisata Candi Borobudur, Magelang', '081223344565', 'sdm@borobudurpark.co.id', 'https://borobudurpark.com'),
  ('a0000001-0000-0000-0000-000000000017', 'PT BFI Finance Indonesia Tbk', 'Lembaga Pembiayaan & Multi-finance', 'Stand D2', 'Perusahaan pembiayaan terlama dan terpercaya penyedia fasilitas dana tunai, modal kerja, dan multiguna.', 'Jl. Tidar No. 56, Magelang', '081223344566', 'recruitment@bfi.co.id', 'https://bfi.co.id'),
  ('a0000001-0000-0000-0000-000000000018', 'Plataran Borobudur Resort & Spa', 'Luxury Hospitality & Eco-Tourism', 'Stand D3', 'Resor mewah berkelas internasional berwawasan kearifan lokal dengan pemandangan langsung Candi Borobudur.', 'Dusun Tanjungan, Borobudur, Magelang', '081223344567', 'career@plataran.com', 'https://plataran.com'),
  ('a0000001-0000-0000-0000-000000000019', 'PT Triputra Agro Persada', 'Agribisnis & Pengolahan Hasil Alam', 'Stand D4', 'Kelompok usaha agribisnis perkebunan kelapa sawit dan karet berkelanjutan dengan tata kelola lingkungan terdepan.', 'The East Tower Lt. 23, Kuningan, Jakarta', '081223344568', 'recruitment@tap-agri.com', 'https://tap-agri.com'),
  ('a0000001-0000-0000-0000-000000000020', 'PT Prima Multi Sarana', 'Teknik Mesin, Fabrikasi & Konstruksi', 'Stand D5', 'Spesialis rekayasa mekanikal industri, fabrikasi baja presisi, dan pemeliharaan instalasi pabrik modern.', 'Kawasan Industri Wijayakusuma, Semarang', '081223344569', 'karir@primamultisarana.com', 'https://primamultisarana.com')
ON CONFLICT (id) DO UPDATE SET
  nama_perusahaan = EXCLUDED.nama_perusahaan,
  bidang_industri = EXCLUDED.bidang_industri,
  nomor_stand = EXCLUDED.nomor_stand,
  deskripsi = EXCLUDED.deskripsi,
  alamat_kantor = EXCLUDED.alamat_kantor,
  kontak_pic = EXCLUDED.kontak_pic,
  email_resmi = EXCLUDED.email_resmi,
  website = EXCLUDED.website;

-- 2. SEED LOWONGAN KERJA RESMI 20 INDUSTRI
INSERT INTO public.job_vacancies (id, industry_id, judul_posisi, tipe_pekerjaan, kuota_penerimaan, gaji_estimasi, kualifikasi, persyaratan, lokasi_penempatan)
VALUES
  -- Quick (Stand A1)
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Operator Perakitan Mesin Traktor', 'Penuh Waktu', 35, 'Rp 2.450.000 - Rp 3.200.000', 'Laki-laki/Perempuan, usia maksimal 23 tahun, mampu membaca gambar teknik dan memakai alat ukur jangka sorong.', ARRAY['Fotokopi Ijazah / SKL SMK Mesin/Otomotif', 'CV & Pas Foto 4x6', 'Surat Keterangan Sehat Dokter'], 'Pabrik Yogyakarta & Tuksono Kulon Progo'),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Teknisi Pengelasan (Welder GMAW/SMAW)', 'Penuh Waktu', 20, 'Rp 2.600.000 - Rp 3.500.000', 'Menguasai teknik las busur listrik SMAW atau MIG/GMAW, teliti, tidak buta warna, dan disiplin tinggi.', ARRAY['Sertifikat Uji Kompetensi Las', 'Fotokopi KTP & SKCK Aktif', 'Portofolio Hasil Sambungan Las'], 'Pabrik Yogyakarta'),

  -- Daihatsu (Stand A2)
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000002', 'Mekanik Teknisi Bengkel Kendaraan Ringan', 'Penuh Waktu', 15, 'Rp 2.400.000 - Rp 3.100.000', 'Paham overhaul mesin mobil, sistem kelistrikan bodi, dan tune-up injeksi modern EFI.', ARRAY['Surat Lamaran Kerja & CV', 'Transkrip Nilai / Rapor Terakhir', 'SIM A atau SIM C Aktif'], 'Bengkel Resmi Armada Daihatsu Magelang'),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002', 'Service Advisor Apprentice', 'Penuh Waktu', 8, 'Rp 2.500.000 - Rp 3.400.000', 'Komunikatif, berpenampilan rapi, ramah melayani keluhan pelanggan, dan menguasai dasar komputer perkantoran.', ARRAY['Surat Lamaran Kerja', 'Foto Full Body 4R', 'Fotokopi Ijazah SMK/Diploma'], 'Outlet Armada Daihatsu Magelang'),

  -- Indomaret (Stand A3)
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000003', 'Pramuniaga & Kasir Toko Retail', 'Penuh Waktu', 150, 'Sesuai UMK Penempatan + Insentif', 'Usia maksimal 24 tahun, tinggi badan min. 160 cm (Pria) / 155 cm (Wanita), berpenampilan menarik dan jujur.', ARRAY['CV Lengkap & Pas Foto', 'Fotokopi Kartu Keluarga', 'Surat Keterangan Bebas Narkoba'], 'Gerai Indomaret Area Magelang & Temanggung'),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000003', 'Staff Gudang Logistik (Helper DC)', 'Penuh Waktu', 60, 'Sesuai UMK + Uang Makan & Lembur', 'Fisik sehat bugar, siap bekerja dalam sistem shift, teliti menghitung stok fisik barang pergudangan.', ARRAY['Surat Lamaran', 'Fotokopi KTP', 'Surat Keterangan Dokter'], 'Distribution Center Indomaret Candi Semarang'),

  -- Shelter (Stand A4)
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000004', 'Staff Layanan Fasilitas & Office Support', 'Penuh Waktu', 45, 'Rp 2.300.000 - Rp 2.900.000', 'Disiplin tinggi, bertanggung jawab menjaga kebersihan, kerapian, dan kenyamanan fasilitas gedung perkantoran mitra.', ARRAY['Fotokopi KTP & KK', 'Ijazah Terakhir SMK/SMA', 'SKCK Aktif Kepolisian'], 'Penempatan Wilayah DIY & Jawa Tengah'),

  -- Alfamart (Stand A5)
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000005', 'Crew Store (Kasir / Pramuniaga Gerai)', 'Penuh Waktu', 120, 'Sesuai UMK + Fasilitas BPJS', 'Siap bekerja dalam sistem pergantian shift, mampu melayani transaksi pembeli dengan senyum dan ramah.', ARRAY['Daftar Riwayat Hidup', 'Fotokopi Ijazah / SKL', 'Surat Keterangan Belum Menikah'], 'Jaringan Gerai Alfamart Magelang Raya'),

  -- Grand Artos (Stand B1)
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000006', 'Front Desk Agent / Resepsionis Hotel', 'Penuh Waktu', 6, 'Rp 2.600.000 - Rp 3.600.000 + Service Charge', 'Ramah, kemampuan bahasa Inggris aktif, memahami sistem reservasi hotel, dan berpenampilan bersih menarik.', ARRAY['CV Berbahasa Indonesia/Inggris', 'Foto Formal 4x6 & Foto Full Body', 'Sertifikat Praktik Kerja Lapangan Hotel'], 'Grand Artos Hotel & Convention Magelang'),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000006', 'Cook Helper & Pastry Commis Kitchen', 'Penuh Waktu', 10, 'Rp 2.400.000 - Rp 3.200.000 + Service Charge', 'Menguasai dasar kebersihan dapur (kitchen hygiene), food prep, dan siap bekerja dalam tim dapur hotel berbintang.', ARRAY['CV Lengkap', 'Sertifikat Keahlian Tata Boga/Kuliner', 'Surat Keterangan Sehat'], 'Main Kitchen Grand Artos Hotel Magelang'),

  -- Bintang Toedjoe (Stand B2)
  ('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000007', 'Operator Produksi Industri Farmasi', 'Penuh Waktu', 30, 'Rp 3.100.000 - Rp 4.200.000', 'Paham prinsip CPOB (Cara Pembuatan Obat yang Baik), teliti, tidak berkacamata tebal, dan bebas buta warna.', ARRAY['Ijazah & Transkrip SMK Farmasi/Kimia', 'Surat Bebas Buta Warna', 'SKCK Aktif'], 'Fasilitas Manufaktur Kalbe Cikarang & Jakarta'),

  -- BCA (Stand B3)
  ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000008', 'Program Magang Bakti Customer Service & Teller', 'Kontrak Pelatihan 1 Tahun', 25, 'Uang Saku Bulanan + Tunjangan Akhir & Sertifikasi', 'Usia 18-24 tahun, penampilan profesional, integritas teruji, belum menikah, dan nilai rata-rata min 7.5.', ARRAY['KTP & Kartu Keluarga', 'Ijazah & Transkrip Nilai', 'Foto Berwarna 4x6'], 'Kantor Cabang Utama Magelang & Sekitarnya'),

  -- Pharos (Stand B4)
  ('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000009', 'Petugas Farmasi & Asisten Apoteker', 'Penuh Waktu', 40, 'Rp 2.800.000 - Rp 3.700.000', 'Mengenal golongan obat resep & OTC, teliti membaca resep dokter, dan siap bekerja dalam shift apotek.', ARRAY['Surat Keterangan Lulus SMK/D3 Farmasi', 'CV & Pas Foto', 'STRTTK (jika ada)'], 'Jaringan Apotek Mitra Wilayah Jawa Tengah'),

  -- Sukses Mandiri Utama (Stand B5)
  ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000010', 'Operator Mesin CNC Milling & Bubut Logam', 'Penuh Waktu', 25, 'Rp 2.700.000 - Rp 3.600.000', 'Mampu membaca instruksi kerja gambar teknik dan mengoperasikan mesin perkakas presisi.', ARRAY['CV & Surat Lamaran', 'Sertifikat Praktik Mesin', 'Fotokopi KTP'], 'Kawasan Industri Kendal & Semarang'),

  -- Alfamidi (Stand C1)
  ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000011', 'Store Crew Fresh Produce (Buah & Sayur)', 'Penuh Waktu', 35, 'Sesuai UMK + Tunjangan Fresh Market', 'Cermat memeriksa kualitas kesegaran sayur dan buah, mampu menata display etalase produk dengan rapi.', ARRAY['CV Lengkap', 'KTP & Kartu Keluarga', 'Pas Foto 3x4'], 'Gerai Alfamidi Jawa Tengah'),

  -- Hotel Atria (Stand C2)
  ('b0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000012', 'Food & Beverage Banquet Service Attendant', 'Penuh Waktu / Kasual Expo', 18, 'Rp 2.350.000 - Rp 3.000.000 + Insentif Event', 'Disiplin tinggi, standar grooming rapi, ramah, mampu membawa baki hidangan jamuan banquet elegan.', ARRAY['CV & Foto Diri Rapi', 'Surat Keterangan Magang Perhotelan', 'Fotokopi KTP'], 'Hotel Atria Magelang'),
  ('b0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000012', 'Housekeeping & Public Area Attendant', 'Penuh Waktu', 12, 'Rp 2.300.000 - Rp 2.900.000', 'Teliti membersihkan kamar tamu dan area fasilitas publik sesuai standar kebersihan bintang 4.', ARRAY['CV Lengkap', 'SKCK Aktif', 'Fotokopi KTP'], 'Hotel Atria Magelang'),

  -- Mataram Sakti (Stand C3)
  ('b0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000013', 'Teknisi Sepeda Motor Yamaha (TBSM)', 'Penuh Waktu', 20, 'Rp 2.400.000 - Rp 3.300.000 + Insentif Unit', 'Menguasai diagnostic tools Yamaha (YDT), sistem injeksi bahan bakar, dan pemeliharaan kelistrikan motor.', ARRAY['Surat Lamaran & CV', 'Fotokopi Ijazah SMK TBSM', 'SIM C Aktif'], 'Bengkel Resmi Yamaha Mataram Sakti Magelang'),

  -- Nasmoco (Stand C4)
  ('b0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000014', 'Mekanik Servis Mobil Toyota & Body Repair', 'Penuh Waktu', 16, 'Rp 2.600.000 - Rp 3.700.000 + Bonus Produktivitas', 'Memahami servis berkala mesin Toyota, sistem rem ABS, dan pemindaian alat scanner diagnostik OBD.', ARRAY['CV Lengkap', 'Fotokopi KTP & Ijazah SMK TKR', 'Sertifikat Praktik Otomotif'], 'Nasmoco Magelang'),

  -- Ungaran Sari Garment (Stand C5)
  ('b0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000015', 'Operator Jahit Garmen (Sewing Machine)', 'Penuh Waktu', 100, 'Sesuai UMK Ungaran + Uang Premi Jahit & Lembur', 'Mampu mengoperasikan mesin jahit jarum 1 atau jarum 2, sabar, teliti dengan kerapian jahitan ekspor.', ARRAY['KTP & Kartu Keluarga', 'Pas Foto 3x4 (2 lembar)', 'Fotokopi Ijazah SMK Tata Busana/Semua Jurusan'], 'Pabrik Garmen Ungaran & Pringapus'),

  -- Borobudur (Stand D1)
  ('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000016', 'Pemandu Wisata Edukasi & Visitor Support', 'Penuh Waktu', 15, 'Rp 2.600.000 - Rp 3.800.000', 'Wawasan sejarah cagar budaya baik, mampu berbahasa Indonesia santun dan bahasa Inggris dasar.', ARRAY['Curriculum Vitae', 'Sertifikat Pemandu / Bahasa (jika ada)', 'Surat Bebas Narkoba'], 'Kawasan Taman Wisata Candi Borobudur'),

  -- BFI Finance (Stand D2)
  ('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000017', 'Marketing Officer & Surveyor Pembiayaan', 'Penuh Waktu', 14, 'Gaji Pokok UMK + Insentif Closing Tidak Terbatas', 'Memiliki motor pribadi dan SIM C, menyukai komunikasi lapangan, dan memiliki kemampuan negosiasi prima.', ARRAY['CV & Surat Lamaran', 'Fotokopi SIM C & STNK Motor', 'KTP & KK'], 'Kantor Cabang BFI Magelang & Temanggung'),

  -- Plataran Borobudur (Stand D3)
  ('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000018', 'Resort Guest Relations & Hospitality Attendant', 'Penuh Waktu', 8, 'Rp 2.900.000 - Rp 4.100.000 + Service Charge', 'Memahami standar hospitality bintang 5, berpenampilan rapi elegan, dan berkomunikasi bahasa Inggris aktif.', ARRAY['CV Lengkap', 'Foto Berwarna 4R', 'Sertifikat Pengalaman Hospitality/Pariwisata'], 'Plataran Borobudur Resort & Spa'),

  -- Triputra Agro (Stand D4)
  ('b0000001-0000-0000-0000-000000000024', 'a0000001-0000-0000-0000-000000000019', 'Agronomy Assistant Trainee Perkebunan', 'Penuh Waktu', 20, 'Rp 3.500.000 - Rp 4.800.000 + Akomodasi', 'Fisik prima, menyukai pekerjaan lapangan pertanian/perkebunan, dan berjiwa kepemimpinan.', ARRAY['Ijazah & Transkrip SMK Pertanian/Agribisnis', 'SKCK Aktif', 'Surat Izin Orang Tua'], 'Operasional Perkebunan Nasional'),

  -- Prima Multi Sarana (Stand D5)
  ('b0000001-0000-0000-0000-000000000025', 'a0000001-0000-0000-0000-000000000020', 'Drafter Desain Teknik CAD & Manufaktur', 'Penuh Waktu', 6, 'Rp 2.700.000 - Rp 3.700.000', 'Terampil mengoperasikan software AutoCAD atau SolidWorks serta membaca gambar kerja fabrikasi baja.', ARRAY['CV & Portofolio Gambar Kerja CAD', 'Fotokopi Ijazah SMK DPIB/Mesin', 'KTP'], 'Kantor Engineering Semarang')
ON CONFLICT (id) DO UPDATE SET
  judul_posisi = EXCLUDED.judul_posisi,
  tipe_pekerjaan = EXCLUDED.tipe_pekerjaan,
  kuota_penerimaan = EXCLUDED.kuota_penerimaan,
  gaji_estimasi = EXCLUDED.gaji_estimasi,
  kualifikasi = EXCLUDED.kualifikasi,
  persyaratan = EXCLUDED.persyaratan,
  lokasi_penempatan = EXCLUDED.lokasi_penempatan;

-- 3. SEED AKUN RESMI: PANITIA BKK, UNTIDAR & STAND INDUSTRI
INSERT INTO public.profiles (email, nama_lengkap, role, nomor_wa, company_id, qr_code_token)
VALUES
  ('bkk@skanisa.sch.id', 'BKK SMK Negeri 1 Magelang', 'admin', '0858-6873-3378', NULL, 'BSJ2026-ADM-BKK01'),
  ('untidar@jobfair.id', 'K1 Pariwisata 2024 UNTIDAR', 'admin', '0812-3456-7890', NULL, 'BSJ2026-ADM-UNTIDAR01'),
  ('hrd@quick.co.id', 'HRD CV Karya Hidup Sentosa (Quick)', 'pemberi_kerja', '0812-2334-4550', 'a0000001-0000-0000-0000-000000000001', 'BSJ2026-IND-QUICK01'),
  ('hrd@armada-daihatsu.com', 'HRD Armada Daihatsu Magelang', 'pemberi_kerja', '0812-2334-4551', 'a0000001-0000-0000-0000-000000000002', 'BSJ2026-IND-DAIHATSU01'),
  ('karir@indomaret.co.id', 'HRD PT Indomarco Prismatama', 'pemberi_kerja', '0812-2334-4552', 'a0000001-0000-0000-0000-000000000003', 'BSJ2026-IND-INDOMARET01'),
  ('hrm@grandartoshotel.com', 'HRD Grand Artos Hotel & Convention', 'pemberi_kerja', '0812-2334-4555', 'a0000001-0000-0000-0000-000000000006', 'BSJ2026-IND-ARTOS01'),
  ('recruitment@bca.co.id', 'Recruitment KCU BCA Magelang', 'pemberi_kerja', '0812-2334-4557', 'a0000001-0000-0000-0000-000000000008', 'BSJ2026-IND-BCA01'),
  ('sdm@borobudurpark.co.id', 'SDM PT Taman Wisata Candi Borobudur', 'pemberi_kerja', '0812-2334-4565', 'a0000001-0000-0000-0000-000000000016', 'BSJ2026-IND-BOROBUDUR01')
ON CONFLICT (email) DO UPDATE SET
  nama_lengkap = EXCLUDED.nama_lengkap,
  role = EXCLUDED.role,
  nomor_wa = EXCLUDED.nomor_wa,
  company_id = EXCLUDED.company_id,
  qr_code_token = EXCLUDED.qr_code_token;
