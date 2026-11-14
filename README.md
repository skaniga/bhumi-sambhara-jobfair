# Bhumi Sambhara Career Portal & Jobfair 2026

Portal seleksi kerja dan bursa karir resmi acara **Bhumi Sambhara Expo & Jobfair 2026**, hasil kolaborasi antara **K1 Pariwisata 2024 Universitas Tidar (UNTIDAR)** $\times$ **SMK Negeri 1 Magelang (SKANISA)**.

Pelaksanaan Acara:
- **Tanggal**: Kamis, 19 November 2026
- **Waktu**: 09.00 - 15.10 WIB
- **Lokasi**: Gedung Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang
- **Skala**: 20 Stand Perusahaan Industri Terkemuka & 2.000+ Lapangan Pekerjaan

---

## Fitur Utama Sistem

1. **Scan Barcode & Kamera QR Scanner Terpadu**
   - Setiap pelamar memiliki Kartu Peserta Digital beresolusi tinggi dengan QR Code unik (berisi token validasi peserta).
   - Petugas stand industri dan panitia admin dapat menggunakan pemindai kamera (HTML5 QR Scanner) untuk scan pelamar langsung di lokasi stand booth.
   - Presensi dan verifikasi kehadiran fisik tercatat otomatis ke database.

2. **Multi-Role Terpadu (Admin, Pelamar, Pemberi Kerja)**
   - **Pelamar**: Mendaftar akun, melengkapi biodata & tautan portofolio/CV, memilih lowongan dari 20 industri, memantau status lamaran, dan mencetak Kartu Peserta QR.
   - **Pemberi Kerja (Stand Industri)**: Mengelola profil perusahaan & stand booth, melihat pelamar masuk, scan barcode pelamar yang mendatangi stand, dan melakukan verifikasi seleksi berkas (Terverifikasi Stand, Panggilan Wawancara, Diterima, Ditolak).
   - **Admin (Panitia BKK & UNTIDAR)**: Monitoring telemetri expo, matriks rekapitulasi 20 stand (Stand A1 s/d Stand D5), dan tombol ekspor data rekapitulasi ke CSV/Excel.

3. **20 Industri Partner Terverifikasi Sesuai Pamflet Acara**:
   - Stand A1: CV Karya Hidup Sentosa (Quick Traktor)
   - Stand A2: Armada Daihatsu (PT Astra Daihatsu Motor)
   - Stand A3: Indomaret Group (PT Indomarco Prismatama)
   - Stand A4: PT Shelter Indonesia
   - Stand A5: PT Sumber Alfaria Trijaya (Alfamart)
   - Stand B1: Grand Artos Hotel & Convention
   - Stand B2: PT Bintang Toedjoe (Kalbe Group)
   - Stand B3: PT Bank Central Asia Tbk (BCA)
   - Stand B4: PT Pharos Indonesia
   - Stand B5: PT Sukses Mandiri Utama
   - Stand C1: PT Midi Utama Indonesia Tbk (Alfamidi)
   - Stand C2: Hotel Atria Magelang (Parador Hotels)
   - Stand C3: PT Mataram Sakti (Dealer Yamaha)
   - Stand C4: PT Nasmoco Magelang (Dealer Toyota)
   - Stand C5: PT Ungaran Sari Garments
   - Stand D1: PT Taman Wisata Candi Borobudur, Prambanan & Ratu Boko
   - Stand D2: PT BFI Finance Indonesia Tbk
   - Stand D3: Plataran Borobudur Resort & Spa
   - Stand D4: PT Triputra Agro Persada
   - Stand D5: PT Prima Multi Sarana

4. **Desain Anti-Slop (Standar antislop.ai.id)**:
   - Palet institusional: Deep Slate (`#0F172A`), Surface Pure White (`#FFFFFF`), Stone Muted (`#F8FAFC`), dan Borobudur Amber (`#B45309`).
   - Angka metrik menggunakan tipografi `tabular-nums`.
   - Bebas dari elemen neon, glow berlebihan, atau teks buzzword kosong.

---

## Panduan Deploy ke Vercel

Proyek ini telah dikonfigurasi dengan `vercel.json` dan siap di-deploy secara instan ke Vercel:

### 1. Hubungkan Repository GitHub ke Vercel
1. Buka [vercel.com](https://vercel.com) dan klik **Add New Project**.
2. Pilih repository GitHub hasil push ini (`bhumi-sambhara-jobfair`).
3. Vercel akan otomatis mengenali konfigurasi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Environment Variables (Opsional untuk Supabase Live)
Jika ingin menghubungkan langsung ke project Supabase Anda, tambahkan di menu **Environment Variables** Vercel:
- `VITE_SUPABASE_URL`: URL project Supabase Anda (contoh: `https://xyzcompany.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Anon Public Key Supabase Anda

*Catatan*: Bila environment variables belum diisi, aplikasi tetap berjalan 100% fungsional dengan in-memory / LocalStorage state store reaktif untuk presentasi dan demonstrasi.

### 3. Setup Skema Database Supabase
Jalankan isi file `supabase_schema.sql` di SQL Editor dashboard Supabase Anda untuk membuat seluruh tabel: `profiles`, `industries`, `job_vacancies`, `job_applications`, dan `stand_attendances`.

---

## Menjalankan di Lokal / Development

```bash
# Masuk ke direktori
cd bhumi-sambhara-jobfair

# Install dependensi
npm install

# Jalankan server development
npm run dev

# Build untuk produksi
npm run build
```
