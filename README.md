# Bhumi Sambhara Career Portal & Jobfair 2026

Portal seleksi kerja dan bursa karir resmi acara **Bhumi Sambhara Expo & Jobfair 2026**, hasil kolaborasi antara **K1 Pariwisata 2024 Universitas Tidar (UNTIDAR)** $\times$ **SMK Negeri 1 Magelang (SKANISA)**.

Pelaksanaan Acara:
- **Tanggal**: Kamis, 19 November 2026
- **Waktu**: 09.00 - 15.10 WIB
- **Lokasi**: Gedung Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang
- **Skala**: 20 Stand Perusahaan Industri Terkemuka & 2.000+ Lapangan Pekerjaan

---

## Akun Demo & Akses Resmi (Seed Credentials)

Berikut daftar akun resmi yang telah di-seed langsung ke sistem database Supabase Auth & PostgreSQL:

### 1. Akun Panitia Penyelenggara (Role: Admin)

| Afiliasi / Lembaga | Alamat Email | Kata Sandi | Peran | Token QR Master |
| :--- | :--- | :--- | :--- | :--- |
| **BKK SMK Negeri 1 Magelang** | `bkk@skanisa.sch.id` | `BkkSkanisa2026!` | `admin` | `BSJ2026-ADM-BKK01` |
| **K1 Pariwisata 2024 UNTIDAR** | `untidar@jobfair.id` | `UntidarExpo2026!` | `admin` | `BSJ2026-ADM-UNTIDAR01` |

*Hak Akses Admin*:
- Mengakses **Panel Kendali & Monitoring Expo**.
- Memantau telemetri live (total pelamar, total lamaran, total verifikasi fisik di stand).
- Memantau matriks 20 stand (Stand A1 s/d Stand D5) dan Peta Denah 4 Zona Hall Graha Krida Wiyata.
- Menjalankan **Scanner Master Panitia** untuk presensi pintu masuk/gate.
- Mengunduh rekapitulasi data lengkap dalam format CSV/Excel.

---

### 2. Akun Perwakilan Stand Industri (Role: Pemberi Kerja)

| Stand Booth | Nama Industri / Perusahaan | Alamat Email | Kata Sandi | Peran |
| :--- | :--- | :--- | :--- | :--- |
| **Stand A1** | CV Karya Hidup Sentosa (Quick) | `hrd@quick.co.id` | `QuickStandA1!` | `pemberi_kerja` |
| **Stand A2** | Armada Daihatsu Magelang | `hrd@armada-daihatsu.com` | `DaihatsuStandA2!` | `pemberi_kerja` |
| **Stand A3** | Indomaret Group (PT Indomarco) | `karir@indomaret.co.id` | `IndomaretStandA3!` | `pemberi_kerja` |
| **Stand B1** | Grand Artos Hotel & Convention | `hrm@grandartoshotel.com` | `GrandArtosStandB1!` | `pemberi_kerja` |
| **Stand B3** | PT Bank Central Asia Tbk (BCA) | `recruitment@bca.co.id` | `BcaStandB3!` | `pemberi_kerja` |
| **Stand D1** | PT Taman Wisata Candi Borobudur | `sdm@borobudurpark.co.id` | `BorobudurStandD1!` | `pemberi_kerja` |

*Hak Akses Pemberi Kerja*:
- Mengelola profil stand, nomor booth, kontak PIC, dan deskripsi perusahaan.
- Melihat daftar pelamar yang melamar khusus ke lowongan perusahaannya.
- Membuka **Kamera Barcode Scanner Stand** untuk scan QR ID pelamar yang datang ke booth.
- Melakukan verifikasi on-the-spot: *Verifikasi Hadir di Stand*, *Panggilan Wawancara*, *Terima Lamaran*, atau *Tolak*.

---

### 3. Akun Pelamar (Role: Pelamar)
Pencari kerja (siswa, alumni, atau umum) dapat mendaftar mandiri secara instan melalui tombol **Masuk / Daftar Akun** di web.
- Mendapatkan **Kartu Peserta Resmi Jobfair** dengan QR code unik untuk verifikasi di booth.
- Melamar ke 20 perusahaan partner dan memantau status lamaran real-time.

---

## Fitur Utama Sistem

1. **Scan Barcode & Kamera QR Scanner Terpadu**
   - Menggunakan pemindai HTML5 QR Code kamera berkecepatan tinggi yang mendukung kamera belakang smartphone maupun webcam laptop.
   - Dilengkapi fallback input manual token/NIK bila perangkat tidak memiliki akses kamera.
   - Status presensi dan verifikasi berkas ter-update otomatis secara real-time.

2. **Logo Vektor Tematik Resmi & Visual 20 Industri**
   - Logo vektor tematik **Bhumi Sambhara Stupa & Golden Career Spire** (`/logo-bhumi-sambhara.svg`).
   - Setiap dari 20 perusahaan dilengkapi banner visual merek di katalog dan dashboard.
   - Dilengkapi **Galeri Pamflet Resmi Acara** interaktif dengan fitur perbesar dan unduh gambar flyer.

3. **Denah 4 Zona Hall Expo (Graha Krida Wiyata)**
   - **Zona A**: Manufaktur, Ritel Modern & Manpower (Stand A1 s/d A5).
   - **Zona B**: Hospitality, Farmasi, Perbankan & Logistik (Stand B1 s/d B5).
   - **Zona C**: Ritel Pangan, Otomotif & Garmen (Stand C1 s/d C5).
   - **Zona D**: Pariwisata Budaya, Keuangan & Agribisnis (Stand D1 s/d D5).

4. **Navigasi Mobile Ergonomis (Bottom Bar)**
   - Akses navigasi jempol bawah untuk pengunjung expo di smartphone dengan tombol tengah mengambang (*Center Floating Action Button*).

---

## Konfigurasi Environment & Deployment

Proyek ini telah dikonfigurasi dengan `vercel.json` dan siap di-deploy langsung ke Vercel:

### 1. Environment Variables di Vercel
Tambahkan di **Project Settings $\rightarrow$ Environment Variables**:

| Variable Key | Value | Keterangan |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | `https://rnlonstoexvlxjjhmtsy.supabase.co` | URL Endpoint Supabase |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_ZDEgwnyhBUnNBrZ1XUMNEQ_TI0VKemV` | Supabase Publishable Key |

### 2. Skema & Seed Database Supabase
- Jalankan file `supabase_schema.sql` di SQL Editor Supabase untuk struktur tabel dan policy RLS.
- Jalankan file `supabase_seed.sql` di SQL Editor Supabase untuk 20 industri, 25 lowongan, dan 8 akun resmi di atas.

---

## Menjalankan di Lokal

```bash
# Clone repository (Akses Private)
git clone https://github.com/skaniga/bhumi-sambhara-jobfair.git
cd bhumi-sambhara-jobfair

# Install dependensi
npm install

# Jalankan pengujian otomatis (22 skenario UAT)
npm test

# Jalankan server development
npm run dev

# Kompilasi produksi
npm run build
```
