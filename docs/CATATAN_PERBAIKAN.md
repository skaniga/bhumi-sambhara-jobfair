# 📋 Catatan Lengkap Perbaikan & Pengembangan Sistem
## Portal Resmi Bhumi Sambhara Expo & Jobfair 2026
**Kolaborasi Resmi: K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang**  
**Alamat Live Production:** [https://bme.smknegeri1magelang.sch.id](https://bme.smknegeri1magelang.sch.id)  
**Dokumen ini mencatat seluruh riwayat perbaikan bug, pengembangan fitur baru, kalibrasi data, dan optimasi infrastruktur.**

---

## 📑 Daftar Isi
1. [Infrastruktur Server, Domain & DNS](#1-infrastruktur-server-domain--dns)
2. [Autentikasi, Keamanan & Akses Akun](#2-autentikasi-keamanan--akses-akun)
3. [Manajemen Lowongan & Fitur Pemberi Kerja](#3-manajemen-lowongan--fitur-pemberi-kerja)
4. [Integritas Data 23 Industri & Kuota Lowongan](#4-integritas-data-23-industri--kuota-lowongan)
5. [Pembersihan Cache Browser & Filter Kategori](#5-pembersihan-cache-browser--filter-kategori)
6. [Aset Visual, Logo Asli & Bebas XML Error](#6-aset-visual-logo-asli--bebas-xml-error)
7. [Alur Pelamar & Kartu QR Peserta](#7-alur-pelamar--kartu-qr-peserta)
8. [Dashboard Stand & Scanner Barcode](#8-dashboard-stand--scanner-barcode)
9. [Panel Admin & Rekapitulasi Ekspor](#9-panel-admin--rekapitulasi-ekspor)
10. [Rangkuman Hasil Uji Mutu (QA & UAT)](#10-rangkuman-hasil-uji-mutu-qa--uat)

---

## 1. Infrastruktur Server, Domain & DNS

| Komponen | Masalah / Kebutuhan Awal | Solusi & Perbaikan yang Diterapkan | Status |
| :--- | :--- | :--- | :--- |
| **Penyambungan Domain** | Subdomain `bme.smknegeri1magelang.sch.id` gagal terhubung ke Vercel karena konflik DNS Hostinger (`A` record bawaan bentrok dengan `CNAME`). | Menghapus record `A` lama dari Subdomain Manager Hostinger, lalu menambahkan CNAME `bme` yang diarahkan ke target Vercel `7fa1a5178cbbf444.vercel-dns-017.com`. | **SELESAI** |
| **Verifikasi Kepemilikan Domain** | Vercel meminta verifikasi TXT record karena domain pernah didaftarkan pada akun berbeda. | Menambahkan TXT Record `_vercel` dengan nilai verifikasi `vc-domain-verify=bme.smknegeri1magelang.sch.id,ad14251433c1f3662da1`. Verifikasi tervalidasi 100%. | **SELESAI** |
| **Sertifikat SSL / HTTPS** | Pengunjung membutuhkan enkripsi aman SSL saat mengakses portal bursa kerja. | Vercel Edge menerbitkan sertifikat Let's Encrypt SSL otomatis dengan status *Active* dan protokol *HTTP/2 + Strict-Transport-Security*. | **SELESAI** |
| **Routing SPA (Single Page App)** | Antisipasi jika aplikasi dideploy ke server berbasis Apache / LiteSpeed (Hostinger cPanel). | Membuat file konfigurasi `dist/.htaccess` dengan aturan `RewriteEngine On` fallback ke `index.html` untuk mencegah error 404 saat refresh halaman. | **SELESAI** |

---

## 2. Autentikasi, Keamanan & Akses Akun

| Fitur / Isu | Masalah yang Terjadi | Tindakan Perbaikan |
| :--- | :--- | :--- |
| **Universal Multi-Format Login Stand** | Petugas booth sering salah format saat login (mengetik `HkGoldStandA3` atau `Stand A3` ke kolom email, menyebabkan error Supabase `400 Bad Request`). | Menambahkan normalizer pintar `loginUser()` di `src/lib/supabase.js`. Petugas stand kini bisa login menggunakan **Username Stand** (`HkGoldStandA3`), **Kode Stand** (`Stand A3` atau `A3`), maupun **Email Resmi** (`hrd@hkgold.co.id`). |
| **Toggle Password (Ikon Mata)** | Pengguna tidak bisa memastikan ketepatan pengetikan kata sandi saat mendaftar atau login. | Menambahkan tombol toggle mata (*Eye / EyeOff* dari `@lucide/svelte`) pada seluruh input kata sandi di modal login dan pendaftaran. |
| **Tautan Email Masih ke Localhost** | Supabase Auth mengirimkan email konfirmasi akun dan email pemulihan sandi yang mengarah ke `http://localhost:3000`. | Menambahkan parameter `emailRedirectTo` dan `redirectTo` pada pemanggilan `signUp()` dan `resetPasswordForEmail()` yang secara absolut mengarah ke `https://bme.smknegeri1magelang.sch.id`. |
| **Akun Terkunci karena Email Unconfirmed** | Pelamar baru yang mendaftar di lokasi acara tidak bisa login kembali karena email belum dikonfirmasi (`Email not confirmed`). | Menerapkan *fail-safe verification* di `loginUser()`: Jika Supabase merespons `Email not confirmed`, sistem mengetahui bahwa password yang diketik sudah 100% valid, sehingga langsung meloloskan sesi pelamar menggunakan data profil terdaftarnya. Peserta di lokasi tidak terkunci. |
| **Alur & Halaman Lupa Kata Sandi** | Belum ada mekanisme reset password bagi pelamar yang lupa kata sandi. | 1. Menambahkan tautan **Lupa kata sandi?** di `AuthModal.svelte`.<br>2. Integrasi pengiriman email reset via Supabase Auth untuk pelamar.<br>3. Konfirmasi otomatis bagi akun stand booth yang mengarahkan ke Buku Panduan resmi.<br>4. Menambahkan modal **"Atur Ulang Kata Sandi Baru"** yang otomatis terbuka saat pelamar mengklik tautan dari email. |

---

## 3. Manajemen Lowongan & Fitur Pemberi Kerja

| Fitur Baru | Deskripsi Implementasi |
| :--- | :--- |
| **Tab Navigasi Dashboard Stand** | Pada `CompanyDashboard.svelte`, ditambahkan sistem tab untuk beralih antara **Daftar Pelamar Stand** dan **Kelola Lowongan Aktif**. |
| **Pengubahan Lowongan (Edit Vacancy)** | Perwakilan HRD booth dapat mengklik tombol **Edit Lowongan** untuk mengubah judul posisi, tipe kerja, kuota penerimaan, estimasi upah/gaji, kualifikasi, dan daftar berkas persyaratan secara langsung. |
| **Penambahan Lowongan Baru (Create Vacancy)** | Tersedia tombol **+ Tambah Lowongan Baru** yang memunculkan formulir modal untuk membuka posisi rekrutmen tambahan bagi para pencari kerja. |
| **Penutupan Lowongan (Delete/Close Vacancy)** | Tersedia tombol **Hapus / Tutup** dengan konfirmasi keamanan untuk menutup lowongan yang kuotanya sudah terpenuhi. |
| **Sinkronisasi Dua Arah** | Setiap penambahan atau perubahan lowongan secara instan memperbarui Svelte store lokal dan disinkronkan ke tabel database Supabase `job_vacancies`. |

---

## 4. Integritas Data 23 Industri & Kuota Lowongan

| Parameter | Data Awal (Draf Template) | Data Resmi Terkalibrasi (*Draft Industri Jobfair Fix.xlsx*) |
| :--- | :--- | :--- |
| **Jumlah Mitra Industri** | 20 Perusahaan | **Tepat 23 Perusahaan Resmi** (Stand A1 s/d Stand D5) |
| **Total Posisi Lowongan** | 25 Posisi | **48 Posisi Lowongan Kerja Aktif** |
| **Akumulasi Kuota Rekrutmen** | 2.000 Orang | **Tepat 2.667 Orang Pelamar** |
| **Penambahan 3 Industri Baru** | Belum terdaftar | 1. **Stand D3**: PUTRA TEKNIK AC<br>2. **Stand D4**: STAFFINC<br>3. **Stand D5**: PT. CANDI BANGUN PERSADA |
| **Resolusi Konflik Email Unik** | Email bentrok di Stand A1 | Memperbarui email Stand A1 menjadi `hrd@quick.co.id` pada database seeder agar lolos constraint unik PostgreSQL. |

---

## 5. Pembersihan Cache Browser & Filter Kategori

| Isu yang Terjadi | Analisis Penyebab | Solusi & Kode yang Diperbarui |
| :--- | :--- | :--- |
| **Pengguna Hanya Melihat 20 Perusahaan** | Browser menyimpan data template lama di `localStorage` dengan kunci `bhumi_sambhara_jobfair_industries` (berisi 20 perusahaan). Saat 3 perusahaan baru ditambahkan, browser pengguna lama tetap membaca cache lama tersebut. | 1. Menambahkan **Versi Cache** `STORAGE_VERSION = 'v3'` (`bhumi_sambhara_jobfair_v3_`).<br>2. Menambahkan fungsi auto-clean yang otomatis menghapus kunci cache versi sebelumnya di latar belakang.<br>3. Menambahkan proteksi: jika jumlah industri di cache lokal kurang dari 23, sistem otomatis membuang cache dan memuat 23 industri resmi. |
| **Kategori Filter Belum Mencakup Semua Industri** | Sebagian industri memiliki nama bidang spesifik yang tidak cocok dengan kata kunci filter lama. | Memperbarui pemetaan 10 kategori industri di `IndustryDirectory.svelte` sehingga seluruh 23 perusahaan memiliki kategori yang tepat (*Manufaktur & Garmen, Retail & Perhiasan, Pendidikan & Vokasi, Perhotelan & Pariwisata, Otomotif & Alat Berat, Tata Udara/HVAC, Keuangan & BUMN, Telekomunikasi & SDM, Jasa & Relaksasi*). |

---

## 6. Aset Visual, Logo Asli & Bebas XML Error

| Aset / Elemen | Masalah Awal | Perbaikan yang Dilakukan |
| :--- | :--- | :--- |
| **XML Parse Error pada File SVG** | File SVG di `public/companies/` memuat karakter ampersand mentah (`&` alih-alih `&amp;`), menyebabkan browser Chrome menampilkan pesan *This page contains the following errors: error on line X at column Y: xmlParseEntityRef: no name*. | Mensanitasi seluruh 23 berkas SVG dengan Python XML parser (`xml.etree.ElementTree`) dan memastikan seluruh entitas bertaraf XML valid 100%. |
| **Logo Otentik Perusahaan** | Logo draf awal menggunakan grafis generik/placeholder. | Mengunduh dan menanamkan logo resmi langsung dari website korporat masing-masing mitra (Quick Traktor, DeWave Salon, HK Gold, LPK Atara, Captain's Club, Teratai Gogakuin, XL Axiata, PNM, Alfamidi, Shelter Indonesia, New Armada, Indomaret, Lidah Buaya Group, Staffinc, dll). |
| **Cache-Busting Aset** | Browser cenderung menyimpan gambar SVG logo lama dalam cache memori. | Menambahkan parameter query string `?v=3` pada seluruh pemanggilan logo di `IndustryDirectory.svelte`, `CompanyDashboard.svelte`, dan `DenahFloorPlan.svelte`. |
| **Pamflet Resmi Acara** | Viewer pamflet membutuhkan tampilan resolusi tinggi. | Memperbarui file `public/pamflet-jobfair-2026.jpg` dengan pamflet resmi panitia resolusi tinggi serta menyediakan tombol unduh berkas. |

---

## 7. Alur Pelamar & Kartu QR Peserta

| Fitur | Uraian Perbaikan |
| :--- | :--- |
| **Kartu Peserta Digital (Lanyard Pass)** | Menampilkan kartu QR dinamis dengan identitas resmi pelamar, nomor NIK/NISN, asal sekolah, dan token terenkripsi `BSJ2026-PEL-XXXXX`. |
| **Pencegahan Lamaran Duplikat** | Sistem memvalidasi agar pelamar tidak dapat melamar posisi yang sama dua kali, namun tetap bebas melamar posisi lain di stand berbeda. |
| **Pengisian CV & Portofolio** | Pelamar dapat melengkapi ringkasan diri, keahlian utama, dan tautan dokumen Google Drive / LinkedIn yang langsung dapat ditinjau oleh HRD stand. |
| **Berbagi Lowongan ke WhatsApp** | Menambahkan tombol share ke WhatsApp pada modal detail lowongan dengan pesan otomatis terformat rapi. |

---

## 8. Dashboard Stand & Scanner Barcode

| Fitur | Uraian Perbaikan |
| :--- | :--- |
| **Scanner QR Stand** | Dilengkapi aktivasi kamera instan, panduan visual garis bidik (*crosshair*), audio beep saat barcode terbaca, dan getar haptic pada perangkat mobile. |
| **Input Manual NIK / Token** | Menyediakan kolom input manual jika kamera perangkat stand bermasalah atau barcode pada layar HP pelamar retak/buram. |
| **Visual Walk-in Pipeline** | Menampilkan progres tahapan pelamar secara visual: **1. Check-in Stand** ➔ **2. Wawancara Booth** ➔ **3. Lolos Seleksi**. |
| **Isolasi Data Antar Stand** | Memastikan HRD suatu perusahaan hanya dapat melihat dan memproses pelamar yang melamar ke lowongan perusahaannya sendiri. |

---

## 9. Panel Admin & Rekapitulasi Ekspor

| Fitur | Uraian Perbaikan |
| :--- | :--- |
| **Monitoring Telemetri Real-Time** | Menampilkan metrik akumulatif: Total Pendaftar, Total Lamaran Masuk, Terverifikasi di Stand, dan Panggilan Wawancara. |
| **Matriks 23 Stand Industri** | Tabel komprehensif yang memetakan persebaran data dari Stand A1 hingga Stand D5 tanpa ada data ganda. |
| **Ekspor Laporan CSV/Excel** | Tombol ekspor satu-klik untuk mengunduh seluruh rekapitulasi data pendaftar dan presensi per stand ke format CSV yang siap diolah di Microsoft Excel / Google Sheets. |
| **Denah Zona Interaktif** | Visualisasi 4 zona hall Graha Krida Wiyata (Zona A, B, C, D) yang memudahkan panitia memantau tata letak fisik gedung. |

---

## 10. Rangkuman Hasil Uji Mutu (QA & UAT)

### A. Pengujian Otomatis Senior QA (27 Pengujian)
```text
================================================================
🔍 HASIL AUDIT SENIOR USER TESTER (senior_qa_full_audit.js):
   Total Pengujian : 27
   Lolos (PASS)    : 27
   Gagal (FAIL)    : 0
   Tingkat Kelolosan: 100.0%
================================================================
```
* **Katalog & Integritas Kuota**: Lolos (23 industri, 2.667 kuota).
* **Parser XML SVG**: Lolos (23 file bebas ampersand mentah).
* **Autentikasi Multi-Role**: Lolos (Pelamar, Pemberi Kerja, Admin).
* **Alur Pelamar**: Lolos (Biodata, pelamaran, proteksi duplikat).
* **Dashboard Stand & Scanner**: Lolos (Isolasi data, verifikasi token, status seleksi).
* **Panel Admin & Rekapitulasi**: Lolos (Matriks 23 stand akurat).
* **Denah & File Distribusi**: Lolos (4 zona denah, routing SPA valid).

### B. Pengujian End-to-End User Journey (22 Pengujian)
```text
====================================================
🏁 HASIL AKHIR AUDIT PENGUJIAN USER TESTER (e2e_user_journey_test.js):
   Total Lolos (PASS) : 22
   Total Gagal (FAIL) : 0
   Tingkat Kelolosan: 100.0%
====================================================
```

---

*Disusun dan diperbarui secara otomatis untuk Panitia Penyelenggara Bhumi Sambhara Expo & Jobfair 2026 (K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang).*
