-- ============================================================
-- SCHEMA SUPABASE: PORTAL JOBFAIR BHUMI SAMBHARA 2026
-- Penyelenggara: K1 Pariwisata 2024 UNTIDAR x SMK Negeri 1 Magelang
-- Tanggal Acara: 19 November 2026 @ Indoor Graha Krida Wiyata
-- ============================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TIPE DATA
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'pelamar', 'pemberi_kerja');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE app_status AS ENUM ('menunggu', 'terverifikasi_stand', 'wawancara', 'diterima', 'ditolak');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. TABEL PROFILES (Pelamar, Pemberi Kerja, Admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE,
  email TEXT NOT NULL UNIQUE,
  nama_lengkap TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'pelamar',
  nomor_wa TEXT,
  nik_nisn TEXT,
  pendidikan_terakhir TEXT,
  asal_sekolah_kampus TEXT,
  jurusan TEXT,
  keahlian TEXT[],
  link_cv_portofolio TEXT,
  ringkasan_profil TEXT,
  company_id UUID,
  qr_code_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL INDUSTRIES (20 Partner Industri Expo)
CREATE TABLE IF NOT EXISTS public.industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_perusahaan TEXT NOT NULL UNIQUE,
  bidang_industri TEXT NOT NULL,
  nomor_stand TEXT NOT NULL,
  deskripsi TEXT,
  alamat_kantor TEXT,
  kontak_pic TEXT,
  email_resmi TEXT,
  website TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL JOB_VACANCIES (Lowongan Kerja)
CREATE TABLE IF NOT EXISTS public.job_vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  judul_posisi TEXT NOT NULL,
  tipe_pekerjaan TEXT NOT NULL DEFAULT 'Penuh Waktu',
  kuota_penerimaan INTEGER DEFAULT 10,
  gaji_estimasi TEXT,
  kualifikasi TEXT NOT NULL,
  persyaratan TEXT[],
  lokasi_penempatan TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABEL JOB_APPLICATIONS (Lamaran Masuk)
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vacancy_id UUID NOT NULL REFERENCES public.job_vacancies(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status app_status NOT NULL DEFAULT 'menunggu',
  catatan_industri TEXT,
  waktu_melamar TIMESTAMPTZ DEFAULT NOW(),
  waktu_verifikasi TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  UNIQUE (vacancy_id, applicant_id)
);

-- 7. TABEL STAND_ATTENDANCES (Log Scan Barcode di Booth)
CREATE TABLE IF NOT EXISTS public.stand_attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_by UUID REFERENCES public.profiles(id),
  catatan_petugas TEXT,
  UNIQUE (industry_id, applicant_id)
);

-- 8. INDEX UNTUK KECEPATAN QUERY
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_qr_token ON public.profiles(qr_code_token);
CREATE INDEX IF NOT EXISTS idx_vacancies_industry ON public.job_vacancies(industry_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.job_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_vacancy ON public.job_applications(vacancy_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_stand_attendances_industry ON public.stand_attendances(industry_id);

-- 9. SEED DATA 20 INDUSTRI RESMI
INSERT INTO public.industries (nama_perusahaan, bidang_industri, nomor_stand, deskripsi, alamat_kantor, kontak_pic, email_resmi)
VALUES 
  ('CV Karya Hidup Sentosa (Quick)', 'Manufaktur & Alat Mesin Pertanian', 'Stand A1', 'Pabrikan alat dan mesin pertanian terkemuka di Indonesia merk Quick Traktor.', 'Jl. Magelang No. 144, Yogyakarta', '081223344550', 'rekrutmen@quick.co.id'),
  ('Armada Daihatsu (PT Astra Daihatsu Motor)', 'Otomotif & Layanan Purna Jual', 'Stand A2', 'Jaringan dealer resmi penjualan, perbaikan, dan suku cadang kendaraan Daihatsu.', 'Jl. Jenderal Sudirman No. 120, Magelang', '081223344551', 'hrd@armada-daihatsu.com'),
  ('Indomaret Group (PT Indomarco Prismatama)', 'Ritel Modern & Distribusi Logistik', 'Stand A3', 'Jaringan waralaba minimarket terluas di Indonesia penyedia kebutuhan pokok masyarakat.', 'Kawasan Industri Candi, Semarang', '081223344552', 'karir@indomaret.co.id'),
  ('PT Shelter Indonesia', 'Facility Services & Manpower Solutions', 'Stand A4', 'Penyedia solusi ketenagakerjaan profesional, pengamanan, kebersihan, dan manajemen fasilitas.', 'Jl. Kaliurang KM 7, Sleman, Yogyakarta', '081223344553', 'recruitment@shelter.co.id'),
  ('PT Sumber Alfaria Trijaya Tbk (Alfamart)', 'Ritel Modern & Consumer Goods', 'Stand A5', 'Salah satu perusahaan ritel minimarket terdepan di Indonesia.', 'Jl. Soekarno Hatta KM 25, Bergas, Kab. Semarang', '081223344554', 'karir@alfamartku.com'),
  ('Grand Artos Hotel & Convention', 'Hospitality & Pariwisata', 'Stand B1', 'Hotel bintang 4 dan pusat konvensi modern terintegrasi dengan pusat perbelanjaan terbesar Magelang.', 'Jl. Mayjen Bambang Soegeng No. 1, Magelang', '081223344555', 'hrm@grandartoshotel.com'),
  ('PT Bintang Toedjoe (Kalbe Group)', 'Farmasi & Consumer Health', 'Stand B2', 'Bagian dari Kalbe Group yang memproduksi produk kesehatan dan suplemen ternama.', 'Kawasan Industri Pulogadung, Jakarta Timur', '081223344556', 'career@bintang7.com'),
  ('PT Bank Central Asia Tbk (BCA)', 'Perbankan & Keuangan', 'Stand B3', 'Bank swasta terbesar di Indonesia yang menyediakan layanan transaksi perbankan komprehensif.', 'KCU Magelang, Jl. Pemuda No. 40, Magelang', '081223344557', 'recruitment@bca.co.id'),
  ('PT Pharos Indonesia', 'Farmasi & Industri Kesehatan', 'Stand B4', 'Perusahaan farmasi nasional terkemuka yang memproduksi obat dan produk perawatan tubuh.', 'Jl. Limo No. 40, Permata Hijau, Jakarta', '081223344558', 'recruitment@pharos.co.id'),
  ('PT Sukses Mandiri Utama', 'Logistik, Transportasi & Penempatan Kerja', 'Stand B5', 'Mitra ketenagakerjaan terpercaya untuk sektor industri dan rantai pasok.', 'Jl. Gajah Mada No. 88, Semarang', '081223344559', 'info@suksesmandiri.co.id'),
  ('PT Midi Utama Indonesia Tbk (Alfamidi)', 'Ritel Modern & Supermarket Kecil', 'Stand C1', 'Jaringan gerai ritel modern yang menawarkan produk segar dan kebutuhan sehari-hari.', 'Boyolali Distribution Center, Boyolali', '081223344560', 'karir@alfamidiku.com'),
  ('Hotel Atria Magelang (Parador Hotels)', 'Hospitality & Kuliner Pariwisata', 'Stand C2', 'Hotel bintang 4 berstandar internasional dengan fasilitas akomodasi dan kuliner istimewa.', 'Jl. Jenderal Sudirman No. 35, Magelang', '081223344561', 'hrd@atriahotelmagelang.com'),
  ('PT Mataram Sakti (Dealer Yamaha)', 'Otomotif & Layanan Sepeda Motor', 'Stand C3', 'Jaringan dealer resmi sepeda motor Yamaha terbesar di Jawa Tengah dan DIY.', 'Jl. Magelang - Purworejo KM 4, Magelang', '081223344562', 'hr@mataramsakti.co.id'),
  ('PT Nasmoco Magelang (Dealer Toyota)', 'Otomotif & Bengkel Resmi', 'Stand C4', 'Dealer resmi Toyota melayani penjualan, bengkel resmi, dan suku cadang di area Kedu.', 'Jl. Urip Sumoharjo No. 18, Magelang', '081223344563', 'recruitment@nasmoco.co.id'),
  ('PT Ungaran Sari Garments', 'Tekstil, Garmen & Ekspor Fashion', 'Stand C5', 'Perusahaan manufaktur busana ekspor kelas dunia dengan puluhan ribu tenaga kerja terampil.', 'Jl. Pangeran Diponegoro No. 235, Ungaran', '081223344564', 'hrd@usg.co.id'),
  ('PT Taman Wisata Candi Borobudur, Prambanan & Ratu Boko', 'Pariwisata, Kebudayaan & Event Management', 'Stand D1', 'BUMN pengelola destinasi cagar budaya warisan dunia Candi Borobudur dan Prambanan.', 'Borobudur, Magelang, Jawa Tengah', '081223344565', 'sdm@borobudurpark.co.id'),
  ('PT BFI Finance Indonesia Tbk', 'Lembaga Pembiayaan & Multi-finance', 'Stand D2', 'Perusahaan pembiayaan terlama dan terpercaya di Indonesia dengan jaringan cabang nasional.', 'Jl. Tidar No. 56, Magelang', '081223344566', 'recruitment@bfi.co.id'),
  ('Plataran Borobudur Resort & Spa', 'Luxury Hospitality & Eco-Tourism', 'Stand D3', 'Resor eksklusif internasional berwawasan alam dan kearifan lokal di kawasan Borobudur.', 'Dusun Tanjungan, Borobudur, Magelang', '081223344567', 'career@plataran.com'),
  ('PT Triputra Agro Persada', 'Agribisnis & Pengolahan Hasil Alam', 'Stand D4', 'Kelompok usaha agribisnis berkelanjutan berskala nasional.', 'The East Tower Lantai 23, Kuningan, Jakarta', '081223344568', 'recruitment@tap-agri.com'),
  ('PT Prima Multi Sarana', 'Teknik Mesin, Elektrikal & Konstruksi', 'Stand D5', 'Penyedia jasa rekayasa industri, pemeliharaan mesin, dan instalasi fasilitas produksi.', 'Kawasan Industri Wijayakusuma, Semarang', '081223344569', 'karir@primamultisarana.com')
ON CONFLICT (nama_perusahaan) DO NOTHING;
