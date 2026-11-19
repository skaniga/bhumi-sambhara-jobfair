-- ============================================================
-- SCHEMA DDL SUPABASE: PORTAL JOBFAIR BHUMI SAMBHARA 2026
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

-- 3. TABEL INDUSTRIES (20 Partner Industri Expo)
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

-- 4. TABEL PROFILES (Pelamar, Pemberi Kerja, Admin)
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
  company_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
  qr_code_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL JOB_VACANCIES (Lowongan Kerja)
CREATE TABLE IF NOT EXISTS public.job_vacancies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  judul_posisi TEXT NOT NULL,
  tipe_pekerjaan TEXT NOT NULL DEFAULT 'Penuh Waktu',
  kuota_penerimaan INTEGER DEFAULT 10,
  gaji_estimasi TEXT,
  pendidikan_minimal TEXT DEFAULT 'Umum',
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
  verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  UNIQUE (vacancy_id, applicant_id)
);

-- 7. TABEL STAND_ATTENDANCES (Log Scan Barcode di Booth)
CREATE TABLE IF NOT EXISTS public.stand_attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id UUID NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  scanned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stand_attendances ENABLE ROW LEVEL SECURITY;

-- Industries: Public Read, Insert, Update, Delete
DROP POLICY IF EXISTS "Public can view industries" ON public.industries;
CREATE POLICY "Public can view industries" ON public.industries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow industry inserts" ON public.industries;
CREATE POLICY "Allow industry inserts" ON public.industries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow industry updates" ON public.industries;
CREATE POLICY "Allow industry updates" ON public.industries FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow industry deletes" ON public.industries;
CREATE POLICY "Allow industry deletes" ON public.industries FOR DELETE USING (true);

-- Job Vacancies: Public Read, Insert, Update, Delete
DROP POLICY IF EXISTS "Public can view vacancies" ON public.job_vacancies;
CREATE POLICY "Public can view vacancies" ON public.job_vacancies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow vacancy inserts" ON public.job_vacancies;
CREATE POLICY "Allow vacancy inserts" ON public.job_vacancies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow vacancy updates" ON public.job_vacancies;
CREATE POLICY "Allow vacancy updates" ON public.job_vacancies FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow vacancy deletes" ON public.job_vacancies;
CREATE POLICY "Allow vacancy deletes" ON public.job_vacancies FOR DELETE USING (true);

-- Profiles: Public Read & Insert, Owner Update, Admin Delete
DROP POLICY IF EXISTS "Allow profile inserts" ON public.profiles;
CREATE POLICY "Allow profile inserts" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow profile reads" ON public.profiles;
CREATE POLICY "Allow profile reads" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow profile updates" ON public.profiles;
CREATE POLICY "Allow profile updates" ON public.profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow profile deletes" ON public.profiles;
CREATE POLICY "Allow profile deletes" ON public.profiles FOR DELETE USING (true);

-- Applications: Insert, Read, Update, Delete
DROP POLICY IF EXISTS "Allow application inserts" ON public.job_applications;
CREATE POLICY "Allow application inserts" ON public.job_applications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow application reads" ON public.job_applications;
CREATE POLICY "Allow application reads" ON public.job_applications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow application updates" ON public.job_applications;
CREATE POLICY "Allow application updates" ON public.job_applications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow application deletes" ON public.job_applications;
CREATE POLICY "Allow application deletes" ON public.job_applications FOR DELETE USING (true);

-- Stand Attendances: Insert, Read, Upsert, Delete
DROP POLICY IF EXISTS "Allow attendance inserts" ON public.stand_attendances;
CREATE POLICY "Allow attendance inserts" ON public.stand_attendances FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow attendance reads" ON public.stand_attendances;
CREATE POLICY "Allow attendance reads" ON public.stand_attendances FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow attendance updates" ON public.stand_attendances;
CREATE POLICY "Allow attendance updates" ON public.stand_attendances FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow attendance deletes" ON public.stand_attendances;
CREATE POLICY "Allow attendance deletes" ON public.stand_attendances FOR DELETE USING (true);
