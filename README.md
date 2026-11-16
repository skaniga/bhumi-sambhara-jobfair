# Bhumi Sambhara Career Portal & Jobfair 2026

Portal seleksi kerja dan bursa karir resmi acara **Bhumi Sambhara Expo & Jobfair 2026**, hasil kolaborasi antara **K1 Pariwisata 2024 Universitas Tidar (UNTIDAR)** x **SMK Negeri 1 Magelang (SKANISA)**.

Pelaksanaan Acara:
- **Tanggal**: Kamis, 19 November 2026
- **Waktu**: 09.00 - 15.10 WIB
- **Lokasi**: Gedung Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang
- **Skala**: 23 Mitra Industri & LPK Terkemuka & 2.600+ Lapangan Pekerjaan

---

## Dokumentasi Panduan Pengguna per Peran

Panduan terperinci untuk masing-masing peran pengguna telah disediakan pada folder `docs/`:
- 📘 **[Panduan Pengguna: Role Pelamar](docs/PANDUAN_PELAMAR.md)** — Langkah registrasi akun, pembuatan Kartu QR, pelamaran kerja, dan presensi stand.
- 🏢 **[Panduan Pengguna: Role Pemberi Kerja (Stand Industri)](docs/PANDUAN_PEMBERI_KERJA.md)** — Cara masuk 23 stand industri, scan barcode pelamar di booth, dan verifikasi berkas di tempat.
- 🛡️ **[Panduan Pengguna: Role Admin Panitia (BKK & UNTIDAR)](docs/PANDUAN_ADMIN_PANITIA.md)** — Monitoring telemetri live, denah 4 zona hall, scanner master pintu masuk, dan ekspor laporan CSV/Excel.

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
- Memantau matriks 23 stand (Stand A1 s/d Stand D5) dan Peta Denah 4 Zona Hall Graha Krida Wiyata.
- Menjalankan **Scanner Master Panitia** untuk presensi pintu masuk/gate.
- Mengunduh rekapitulasi data lengkap dalam format CSV/Excel.

---

### 2. Akun 23 Stand Industri Resmi (Role: Pemberi Kerja)

Berdasarkan data resmi `Draft Industri Jobfair Fix.xlsx`:

| Stand Booth | Nama Industri / Perusahaan | Kategori / Bidang Usaha | Kontak WhatsApp | Alamat Email | Kata Sandi |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stand A1** | CV Karya Hidup Sentosa (Quick) | Industri Manufaktur & Perdagangan | 0811 2701 3215 | `hrd@quick.co.id` | `QuickStandA1!` |
| **Stand A2** | DEWAVE FAMILY MASSAGE & BEAUTY SALON | Jasa Relaksasi & Salon Kecantikan | 0821 3502 4190 | `karir@dewavespa.com` | `DewaveStandA2!` |
| **Stand A3** | HK GOLD | Toko Emas & Perhiasan | 0813 4287 8303 | `hrd@hkgold.co.id` | `HkGoldStandA3!` |
| **Stand A4** | LPK ATARA | Pendidikan dan Pelatihan Kerja | 0821 3054 9549 | `info@lpkatara.com` | `AtaraStandA4!` |
| **Stand A5** | LPK CAPTAIN'S CLUB YOGYAKARTA | Diklat Perhotelan & Kapal Pesiar | 0813 2557 8171 | `career@captainsclubjogja.com` | `CaptainsClubStandA5!` |
| **Stand A6** | LPK PLATINUM MAGELANG | Pendidikan Perhotelan & Kapal Pesiar | 0819 1767 1025 | `info@lpkplatinum.com` | `PlatinumStandA6!` |
| **Stand B1** | LPK TERATAI GOGAKUIN | Penyalur Tenaga Kerja ke Jepang | 0823 2361 0036 | `info@terataigogakuin.com` | `TerataiStandB1!` |
| **Stand B2** | PT ANUGERAH ABADI MAGELANG | Garmen & Tekstil Ekspor | 0857 1625 7630 | `hrd@anugerahabadi.co.id` | `AnugerahAbadiStandB2!` |
| **Stand B3** | PT KSA XL SMART | Telekomunikasi & Jaringan | 0858 0137 8742 | `karir@ksaxlsmart.com` | `XlSmartStandB3!` |
| **Stand B4** | PT PERMODALAN NASIONAL MADANI (PNM) | Keuangan & BUMN Pemberdayaan Mikro | 0811 8111 2362 | `rekrutmen@pnm.co.id` | `PnmStandB4!` |
| **Stand B5** | PT GISARA TANTRA BERKARYA | Manufaktur Pengolahan Tembakau | 0852 6153 9626 | `hrd@gisaratantra.co.id` | `GisaraStandB5!` |
| **Stand B6** | PT MIDI UTAMA INDONESIA (ALFAMIDI) | Retail Modern & Supermarket | 0853 3407 0511 | `karir@alfamidiku.com` | `AlfamidiStandB6!` |
| **Stand C1** | PT SHETLER INDONESIA | Alih Daya / Facility Services (BPO) | 0877 6780 1991 | `recruitment@shelter.co.id` | `ShelterStandC1!` |
| **Stand C2** | PT CLAY JAYA BERSAMA (BIG) | Retail Bahan Bangunan Modern | 0896 8800 9591 | `karir@clayjayabersama.com` | `ClayJayaStandC2!` |
| **Stand C3** | PT MEKAR ARMADA JAYA | Manufaktur Karoseri Otomotif | 0853 8562 5000 | `hrd@mekararmadajaya.com` | `ArmadaJayaStandC3!` |
| **Stand C4** | SINDORO HOTEL COLLEGE MAGELANG | Perhotelan dan Kapal Pesiar | 0895 4058 27080 | `info@sindorohotelcollege.com` | `SindoroStandC4!` |
| **Stand C5** | PT UNILOA ARDIYANTO INVESTAMA | Developer Property & Real Estate | 0813 3756 3335 | `hrd@uniloa.com` | `UniloaStandC5!` |
| **Stand C6** | BMC DHARMADITNA YOGYAKARTA | Pelatihan Mekanik Alat Berat | 0821 4616 0214 | `info@bmcdharmaditna.com` | `BmcStandC6!` |
| **Stand D1** | PT. INDOMARCO PRISMATAMA (INDOMARET) | Retail Modern & Distribusi Logistik | 0899 9172 359 | `karir@indomaret.co.id` | `IndomaretStandD1!` |
| **Stand D2** | LIDAH BUAYA GROUP | Manufaktur Toiletries & Kosmetik | 0811 2510 1138 | `hrd@lidahbuayagroup.com` | `LidahBuayaStandD2!` |
| **Stand D3** | PUTRA TEKNIK AC | Layanan Tata Udara & Pendingin (HVACR) | 0852 9112 35232 | `karir@putrateknikac.com` | `PutraTeknikStandD3!` |
| **Stand D4** | STAFFINC | Penyedia Solusi SDM & Teknologi | 0857 1580 1723 | `careers@staffinc.co` | `StaffincStandD4!` |
| **Stand D5** | PT. CANDI BANGUN PERSADA | Dealer Resmi & Pemasangan HVAC | 0857 0002 5566 | `hrd@candibangunpersada.com` | `CandiBangunStandD5!` |

*Hak Akses Pemberi Kerja*:
- Mengelola profil stand, nomor booth, kontak PIC, dan deskripsi perusahaan.
- Melihat daftar pelamar yang melamar khusus ke lowongan perusahaannya.
- Membuka **Kamera Barcode Scanner Stand** untuk scan QR ID pelamar yang datang ke booth.
- Melakukan verifikasi on-the-spot: *Verifikasi Hadir di Stand*, *Panggilan Wawancara*, *Terima Lamaran*, atau *Tolak*.

---

### 3. Akun Pelamar (Role: Pelamar)
Pencari kerja (siswa, alumni, atau umum) dapat mendaftar mandiri secara instan melalui tombol **Masuk / Daftar Akun** di web.
- Mendapatkan **Kartu Peserta Resmi Jobfair** dengan QR code unik untuk verifikasi di booth.
- Melamar ke 23 perusahaan partner dan memantau status lamaran real-time.

---

## Fitur Utama Sistem

1. **Scan Barcode & Kamera QR Scanner Terpadu**
   - Menggunakan pemindai HTML5 QR Code kamera berkecepatan tinggi yang mendukung kamera belakang smartphone maupun webcam laptop.
   - Dilengkapi fallback input manual token/NIK bila perangkat tidak memiliki akses kamera.
   - Status presensi dan verifikasi berkas ter-update otomatis secara real-time.

2. **Logo Vektor Tematik Resmi & Visual 23 Industri**
   - Logo vektor tematik **Bhumi Sambhara Stupa & Golden Career Spire** (`/logo-bhumi-sambhara.svg`).
   - Setiap dari 23 perusahaan dilengkapi banner visual merek SVG di katalog dan dashboard.
   - Dilengkapi **Galeri Pamflet Resmi Acara** interaktif dengan fitur perbesar dan unduh gambar flyer.

3. **Denah 4 Zona Hall Expo (Graha Krida Wiyata)**
   - **Zona A**: Manufaktur, Jasa & Pelatihan Vokasi (Stand A1 s/d A6).
   - **Zona B**: Penyalur Global, Garmen, Telekomunikasi, Keuangan & Ritel (Stand B1 s/d B6).
   - **Zona C**: Alih Daya/BPO, Bahan Bangunan, Karoseri, Perhotelan, Properti & Alat Berat (Stand C1 s/d C6).
   - **Zona D**: Ritel Modern, Manufaktur Toiletries, Layanan HVACR & Solusi SDM (Stand D1 s/d D5).

4. **Navigasi Mobile Ergonomis (Bottom Bar)**
   - Akses navigasi jempol bawah untuk pengunjung expo di smartphone dengan tombol tengah mengambang (*Center Floating Action Button*).

---