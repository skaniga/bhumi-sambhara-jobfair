# Bhumi Sambhara Career Portal & Jobfair 2026

Portal seleksi kerja dan bursa karir resmi acara **Bhumi Sambhara Expo & Jobfair 2026**, hasil kolaborasi antara **K1 Pariwisata 2024 Universitas Tidar (UNTIDAR)** × **SMK Negeri 1 Magelang (SKANISA)**.

🌐 **Portal Resmi Live**: [https://bme.smknegeri1magelang.sch.id](https://bme.smknegeri1magelang.sch.id)  
⚡ **Deployment**: Vercel Serverless & Global Edge CDN (Otomatis ter-deploy dari GitHub `origin/main`)  
🗄️ **Database Online**: Supabase PostgreSQL & GoTrue Auth (`rnlonstoexvlxjjhmtsy.supabase.co`)

### Pelaksanaan Acara:
- **Tanggal**: Kamis, 19 November 2026
- **Waktu**: 09.00 - 15.10 WIB
- **Lokasi**: Gedung Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang
- **Skala**: 23 Mitra Industri Resmi & 2.667 Total Kuota Lowongan Kerja

---

## 📚 Dokumentasi Panduan Pengguna per Peran

Panduan terperinci untuk masing-masing peran pengguna telah disediakan pada folder `docs/`:
- 📘 **[Panduan Pengguna: Role Pelamar](docs/PANDUAN_PELAMAR.md)** — Registrasi akun mandiri, pengisian CV digital, pembuatan Kartu QR Peserta, pelamaran kerja, pemulihan lupa kata sandi, dan verifikasi fisik di booth.
- 🏢 **[Panduan Pengguna: Role Pemberi Kerja (Stand Industri)](docs/PANDUAN_PEMBERI_KERJA.md)** — Akses multi-format login 23 stand booth, manajemen & edit lowongan aktif on-the-spot, scan barcode pelamar di booth, dan seleksi kandidat langsung.
- 🛡️ **[Panduan Pengguna: Role Admin Panitia (BKK & UNTIDAR)](docs/PANDUAN_ADMIN_PANITIA.md)** — Monitoring telemetri live, pemantauan denah 4 zona hall, scanner master pintu masuk, dan ekspor laporan CSV/Excel.
- 📋 **[Catatan Lengkap Riwayat Perbaikan & Changelog](docs/CATATAN_PERBAIKAN.md)** — Dokumentasi menyeluruh seluruh riwayat perbaikan bug, fitur baru, kalibrasi data 23 industri, dan optimasi infrastruktur.

---

## 🔑 Kredensial Login & Akses Resmi (Seed Credentials)

Sistem login mendukung fleksibilitas **Multi-Format Input**: Pengguna stand dapat masuk menggunakan **Username Stand** (contoh: `HkGoldStandA3`), **Kode Stand** (`Stand A3` atau `A3`), maupun **Alamat Email**. Tersedia pula **tombol mata (*Eye icon*)** pada kolom kata sandi untuk kenyamanan pengetikan.

### 1. Akun Panitia Penyelenggara (Role: Admin)

| Afiliasi / Lembaga | Username / Email | Kata Sandi | Peran | Token QR Master |
| :--- | :--- | :--- | :--- | :--- |
| **BKK SMK Negeri 1 Magelang** | `admin` atau `bkk@skanisa.sch.id` | `AdminPass2026!` / `SuperAdminBkk2026!` | `admin` | `BSJ2026-ADM-BKK01` |
| **K1 Pariwisata 2024 UNTIDAR** | `untidar@jobfair.id` | `UntidarExpo2026!` | `admin` | `BSJ2026-ADM-UNTIDAR01` |

*Hak Akses Admin*:
- Mengakses **Panel Kendali & Monitoring Expo**.
- Memantau telemetri live (total pelamar, total lamaran, total verifikasi fisik di stand).
- Memantau matriks 23 stand (Stand A1 s/d Stand D5) dan Peta Denah 4 Zona Hall Graha Krida Wiyata.
- Menjalankan **Scanner Master Panitia** untuk presensi pintu masuk/gate.
- Mengunduh rekapitulasi data lengkap dalam format CSV/Excel.

---

### 2. Akun 23 Stand Industri Resmi (Role: Pemberi Kerja)

Berdasarkan data resmi `Draft Industri Jobfair Fix.xlsx`:

| Stand Booth | Nama Industri / Perusahaan | Username Stand | Alamat Email | Kata Sandi | Kontak WhatsApp |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stand A1** | CV Karya Hidup Sentosa (Quick) | `QuickStandA1` | `hrd@quick.co.id` | `QuickStandA1!` | 0811 2701 3215 |
| **Stand A2** | DEWAVE FAMILY MASSAGE & BEAUTY SALON | `DewaveStandA2` | `karir@dewavespa.com` | `DewaveStandA2!` | 0821 3502 4190 |
| **Stand A3** | HK GOLD | `HkGoldStandA3` | `hrd@hkgold.co.id` | `HkGoldStandA3!` | 0813 4287 8303 |
| **Stand A4** | LPK ATARA | `AtaraStandA4` | `info@lpkatara.com` | `AtaraStandA4!` | 0821 3054 9549 |
| **Stand A5** | LPK CAPTAIN'S CLUB YOGYAKARTA | `CaptainsClubStandA5` | `career@captainsclubjogja.com` | `CaptainsClubStandA5!` | 0813 2557 8171 |
| **Stand A6** | LPK PLATINUM MAGELANG | `PlatinumStandA6` | `info@lpkplatinum.com` | `PlatinumStandA6!` | 0819 1767 1025 |
| **Stand B1** | LPK TERATAI GOGAKUIN | `TerataiStandB1` | `info@terataigogakuin.com` | `TerataiStandB1!` | 0823 2361 0036 |
| **Stand B2** | PT ANUGERAH ABADI MAGELANG | `AnugerahAbadiStandB2` | `hrd@anugerahabadi.co.id` | `AnugerahAbadiStandB2!` | 0857 1625 7630 |
| **Stand B3** | PT KSA XL SMART | `XlSmartStandB3` | `karir@ksaxlsmart.com` | `XlSmartStandB3!` | 0858 0137 8742 |
| **Stand B4** | PT PERMODALAN NASIONAL MADANI (PNM) | `PnmStandB4` | `rekrutmen@pnm.co.id` | `PnmStandB4!` | 0811 8111 2362 |
| **Stand B5** | PT GISARA TANTRA BERKARYA | `GisaraStandB5` | `hrd@gisaratantra.co.id` | `GisaraStandB5!` | 0852 6153 9626 |
| **Stand B6** | PT MIDI UTAMA INDONESIA (ALFAMIDI) | `AlfamidiStandB6` | `karir@alfamidiku.com` | `AlfamidiStandB6!` | 0853 3407 0511 |
| **Stand C1** | PT SHETLER INDONESIA | `ShelterStandC1` | `recruitment@shelter.co.id` | `ShelterStandC1!` | 0877 6780 1991 |
| **Stand C2** | PT CLAY JAYA BERSAMA (BIG) | `ClayJayaStandC2` | `karir@clayjayabersama.com` | `ClayJayaStandC2!` | 0896 8800 9591 |
| **Stand C3** | PT MEKAR ARMADA JAYA | `ArmadaJayaStandC3` | `hrd@mekararmadajaya.com` | `ArmadaJayaStandC3!` | 0853 8562 5000 |
| **Stand C4** | SINDORO HOTEL COLLEGE MAGELANG | `SindoroStandC4` | `info@sindorohotelcollege.com` | `SindoroStandC4!` | 0895 4058 27080 |
| **Stand C5** | PT UNILOA ARDIYANTO INVESTAMA | `UniloaStandC5` | `hrd@uniloa.com` | `UniloaStandC5!` | 0813 3756 3335 |
| **Stand C6** | BMC DHARMADITNA YOGYAKARTA | `BmcStandC6` | `info@bmcdharmaditna.com` | `BmcStandC6!` | 0821 4616 0214 |
| **Stand D1** | PT. INDOMARCO PRISMATAMA (INDOMARET) | `IndomaretStandD1` | `karir@indomaret.co.id` | `IndomaretStandD1!` | 0899 9172 359 |
| **Stand D2** | LIDAH BUAYA GROUP | `LidahBuayaStandD2` | `hrd@lidahbuayagroup.com` | `LidahBuayaStandD2!` | 0811 2510 1138 |
| **Stand D3** | PUTRA TEKNIK AC | `PutraTeknikStandD3` | `karir@putrateknikac.com` | `PutraTeknikStandD3!` | 0852 9112 35232 |
| **Stand D4** | STAFFINC | `StaffincStandD4` | `careers@staffinc.co` | `StaffincStandD4!` | 0857 1580 1723 |
| **Stand D5** | PT. CANDI BANGUN PERSADA | `CandiBangunStandD5` | `hrd@candibangunpersada.com` | `CandiBangunStandD5!` | 0857 0002 5566 |

*Hak Akses Pemberi Kerja*:
- Mengelola profil stand, nomor booth, kontak PIC, dan deskripsi perusahaan.
- Melihat daftar pelamar yang melamar khusus ke lowongan perusahaannya (isolasi data antar stand).
- Membuka **Kamera Barcode Scanner Stand** untuk scan QR ID pelamar yang datang ke booth.
- Melakukan seleksi kandidat on-the-spot: *Verifikasi Hadir di Stand*, *Panggilan Wawancara*, *Terima Lamaran*, atau *Tolak*.

---

### 3. Akun Pelamar (Role: Pelamar)
Pencari kerja (siswa, alumni, atau umum) dapat mendaftar mandiri secara instan melalui tombol **Masuk / Daftar Akun** di web.
- Mendapatkan **Kartu Peserta Resmi Jobfair** dengan QR code unik untuk verifikasi di booth.
- Melamar ke 23 perusahaan partner dan memantau status lamaran real-time.

---

## 🚀 Fitur Utama Sistem

1. **Scan Barcode & Kamera QR Scanner Terpadu**
   - Menggunakan pemindai HTML5 QR Code kamera berkecepatan tinggi yang mendukung kamera belakang smartphone maupun webcam laptop.
   - Dilengkapi fallback input manual token/NIK bila perangkat tidak memiliki akses kamera.
   - Status presensi dan verifikasi berkas ter-update otomatis secara real-time.

2. **Logo Asli Perusahaan (Authentic Brand Identity)**
   - Setiap dari 23 perusahaan dilengkapi logo asli dari portal dan web resmi masing-masing perusahaan (Quick Traktor, DeWave, HK Gold, Captain's Club, Teratai Gogakuin, XL Axiata, PNM, Alfamidi, Shelter Indonesia, New Armada, Indomaret, Lidah Buaya Group, Staffinc, dsb.).
   - Logo dienkapsulasi ke dalam SVG mandiri sehingga bebas kendala CORS, memuat instan, dan tajam di layar beresolusi tinggi.

3. **Denah 4 Zona Hall Expo (Graha Krida Wiyata)**
   - **Zona A**: Manufaktur, Jasa & Pelatihan Vokasi (Stand A1 s/d A6).
   - **Zona B**: Penyalur Global, Garmen, Telekomunikasi, Keuangan & Ritel (Stand B1 s/d B6).
   - **Zona C**: Alih Daya/BPO, Bahan Bangunan, Karoseri, Perhotelan, Properti & Alat Berat (Stand C1 s/d C6).
   - **Zona D**: Ritel Modern, Manufaktur Toiletries, Layanan HVACR & Solusi SDM (Stand D1 s/d D5).

4. **Navigasi Mobile Ergonomis (Bottom Bar)**
   - Akses navigasi jempol bawah untuk pengunjung expo di smartphone dengan tombol tengah mengambang (*Center Floating Action Button*).

5. **Uji Mutu Senior QA (Automated Test Suite)**
   - 27 skenario pengujian komprehensif lolos **100% PASS** mencakup integritas kuota, validitas parser SVG, keamanan multi-role, isolasi data stand, dan pipeline seleksi kandidat.

---

## 🛠️ Stack Teknologi

- **Frontend**: Svelte 5 + Vite 8
- **Icons**: Lucide Svelte (termasuk Eye & EyeOff toggle kata sandi)
- **Database & Auth**: Supabase PostgreSQL & GoTrue
- **QR Code Engine**: HTML5-QRCode & QRCode.js
- **Hosting & CI/CD**: Vercel (Auto-deploy dari commit GitHub)
