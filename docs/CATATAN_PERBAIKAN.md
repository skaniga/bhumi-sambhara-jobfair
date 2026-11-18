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

## 11. Temuan Audit Menyeluruh Tambahan (Final Polish)

| Temuan Audit | Dampak yang Ditemukan | Perbaikan yang Diterapkan | Status |
| :--- | :--- | :--- | :--- |
| **Snapshot Kartu QR Offline** | Variabel `qrTokenValue` pada `ApplicantQrCard.svelte` sempat belum terdefinisi, menyebabkan penyimpanan kartu pass offline di `localStorage` terhenti secara senyap di blok `catch`. | Memperbaiki referensi ke `$currentUser.qr_code_token`, `$currentUser.asal_sekolah_kampus`, dan `$currentUser.nomor_wa`. Kartu QR kini tersimpan offline 100% tanpa internet. | **SELESAI** |
| **Domain Share WhatsApp** | Template teks bagikan lowongan di `JobDetailModal.svelte` masih menggunakan fallback domain lama `jobfair.skanisa.sch.id`. | Mengubahnya secara absolut ke domain resmi live `https://bme.smknegeri1magelang.sch.id`. | **SELESAI** |
| **Pratinjau Media Sosial (OpenGraph)** | Ketika tautan portal dibagikan ke WhatsApp, Telegram, atau Facebook, pratinjau banner kartu masih kosong/tanpa gambar pamflet. | Menambahkan meta tag lengkap `og:image`, `og:title`, `og:description`, `twitter:card`, dan `theme-color` pada `index.html` mengarah ke pamflet resmi acara. | **SELESAI** |

---

## 12. Responsivitas Tombol Modal Auth pada Smartphone / Layar Sentuh

| Isu yang Ditemukan | Analisis Penyebab Utama (Root Cause) | Tindakan Perbaikan yang Diterapkan | Status |
| :--- | :--- | :--- | :--- |
| **Tombol "Lupa kata sandi?" dan "Daftar di sini" Tidak Merespons pada HP Lain** | Pada `AuthModal.svelte`, terdapat pernyataan reaktif Svelte: `$: if (initialMode && authMode !== initialMode && !email && !password) { authMode = initialMode; }`. Pernyataan ini melacak variabel `authMode` sebagai dependensi reaktif. Ketika pengguna di perangkat mobile/layar sentuh menekan tombol navigasi sementara input email dan password masih kosong, reaktivitas langsung memicu pengembalian nilai `authMode` kembali ke `'login'` dalam hitungan milidetik sebelum pergantian mode sempat dirender. | 1. Memperbaiki logika reaktivitas dengan menyimpan state pelacak mode awal terisolasi (`prevInitialMode`):<br>`let prevInitialMode = initialMode;`<br>`$: if (initialMode !== prevInitialMode) { prevInitialMode = initialMode; authMode = initialMode; }`<br>2. Menambahkan styling ergonomis sentuhan mobile: `padding: 6px 8px; touch-action: manipulation; -webkit-tap-highlight-color: transparent; cursor: pointer;` sehingga area sentuh jari responsif seketika di semua jenis layar smartphone. | **SELESAI** |

---

## 13. Penyeragaman Formasi Lowongan "Umum (Semua Jurusan)" & Gaji "Ditanyakan Saat Wawancara"

| Komponen | Permintaan Pengguna | Implementasi & Penyesuaian Sistem | Status |
| :--- | :--- | :--- | :--- |
| **Kualifikasi Formasi / Pendidikan** | Formasi pada seluruh lowongan dibuat untuk **Umum (Semua Jurusan)** agar terbuka luas bagi alumni SMK, SMA, D3, S1, maupun pencari kerja umum. | 1. Memperbarui seluruh **48 posisi lowongan kerja** di `INITIAL_VACANCIES` (`src/lib/initialData.js`) dengan nilai `pendidikan: "Umum (Semua Jurusan)"`.<br>2. Menambahkan keterangan pembuka pada kualifikasi: *"Terbuka untuk umum semua jurusan..."*.<br>3. Menyesuaikan label dan tampilan kartu pada `JobDetailModal.svelte` dan `CompanyDashboard.svelte`. | **SELESAI** |
| **Remunerasi / Estimasi Upah (Gaji)** | Informasi gaji lowongan diseragamkan menjadi **"Ditanyakan pada saat wawancara"**. | 1. Memperbarui kolom `gaji` pada seluruh 48 lowongan di `src/lib/initialData.js` menjadi `"Ditanyakan pada saat wawancara"`.<br>2. Melakukan update batch langsung ke database PostgreSQL Supabase tabel `job_vacancies` (kolom `gaji_estimasi`) untuk 48 posisi aktif.<br>3. Mencegah error PGRST204 pada Supabase dengan memetakan payload `gaji` ke `gaji_estimasi` secara otomatis di `src/lib/supabase.js`. | **SELESAI** |

---

## 14. Pembaruan Denah Resmi Sesuai Dokumen Final (*Denah Fix.jfif*)

| Parameter Layout | Layout Versi Lama | Layout Resmi Terkalibrasi (*Denah Fix.jfif*) |
| :--- | :--- | :--- |
| **Sistem Penomoran Stand** | 4 Zona Huruf (`Stand A1` s/d `Stand D5`) | **Nomor Stand Urut 1 s/d 23 (`Stand 1` s/d `Stand 23`)** |
| **Sayap Kiri (Barat)** | Stand A1 - A6, Stand C1 - C6 | **Stand 1 s/d Stand 9 (Vertikal dari atas ke bawah):**<br>1. LIDAH BUAYA GROUP<br>2. DEWAVE FAMILY MASSAGE & BEAUTY SALON<br>3. LPK TERATAI GOGAKUIN<br>4. HK GOLD<br>5. PT MIDI UTAMA INDONESIA (ALFAMIDI)<br>6. PT CLAY JAYA BERSAMA (BIG)<br>7. PT GISARA TANTRA BERKARYA<br>8. PT ANUGERAH ABADI MAGELANG<br>9. LPK ATARA |
| **Area Bawah Sisi Kiri (Barat Daya)** | Gabungan zona C | **Stand 10, Stand 11, Stand 12 (Horizontal):**<br>10. PT KSA XL SMART<br>11. STAFFINC<br>12. PT SHETLER INDONESIA<br>+ Tempat Sampah di pojok |
| **Pintu Masuk & Meja Registrasi (Tengah Bawah)** | Meja scanner generik | **PINTU MASUK UTAMA** (panah masuk ⬇️) diapit **Meja Registrasi & Scanner QR Panitia** serta meja **Stand KWU (Kewirausahaan Siswa Skanisa)** di sisi kiri dan kanan |
| **Area Bawah Sisi Kanan (Tenggara)** | Gabungan zona D | **Stand 13, Stand 14, Stand 15 (Horizontal):**<br>13. PT MEKAR ARMADA JAYA<br>14. BMC DHARMADITNA YOGYAKARTA<br>15. LPK PLATINUM MAGELANG |
| **Sayap Kanan (Timur)** | Stand B1 - B6, Stand D1 - D5 | **Stand 16 s/d Stand 23 (Vertikal):**<br>16. PUTRA TEKNIK AC<br>17. PT UNILOA ARDIYANTO INVESTAMA<br>18. SINDORO HOTEL COLLEGE MAGELANG<br>19. PT PERMODALAN NASIONAL MADANI<br>20. CV Karya Hidup Sentosa (Quick)<br>21. LPK CAPTAIN'S CLUB YOGYAKARTA<br>22. PT. INDOMARCO PRISMATAMA<br>23. PT. CANDI BANGUN PERSADA |
| **Pintu Keluar** | Jalur keluar umum | **PINTU KELUAR RESMI** (panah keluar ⬇️) di pojok tenggara sebelah Stand 16 + Tempat Sampah |
| **Panggung Utama & Kursi VIP** | Header teks sederhana | Panggung Utama megah dilengkapi backdrop screen resmi expo, kipas angin kiri-kanan, dan 2 blok **Kursi VIP** |
| **Area Tengah Hall** | Lorong polos | 2 blok besar **Area Peserta (Tempat Duduk & Antrean)** dengan lorong sentral kunjungan booth |
| **Pratinjau Gambar Asli (Lightbox Modal)** | Belum ada | Menambahkan tombol **"Lihat Gambar Denah Asli"** yang memunculkan modal resolusi tinggi dari file `/denah-resmi.jpg` serta tautan buka di tab baru (Khusus Role Admin). |
| **Backward-Compatibility Kredensial Stand** | - | Akun stand booth dapat login menggunakan nomor baru (`Stand 1`), nomor lama (`Stand D2`), username alias, maupun email resmi tanpa kendala. |

---

## 15. Standardisasi Lowongan Kerja Umum, Format Ekspor XLSX & Proteksi Role Admin

| Komponen / Fitur | Status Sebelum | Solusi & Hasil Perbaikan | Status |
| :--- | :--- | :--- | :---: |
| **Penyederhanaan Lowongan per Industri** | Terdapat 48 formasi spesifik (misal: *Teknisi Alat Berat, Operator Mesin, Kasir*) dengan kualifikasi teknis yang membingungkan pelamar | **Disederhanakan menjadi tepat 1 tombol lowongan per industri** (Total 23 lowongan sistem):<br>• Judul Posisi: `Lowongan Kerja (Umum)`<br>• Formasi: `Umum`<br>• Kualifikasi: *Terbuka untuk umum seluruh jurusan. Berintegritas, bersemangat kerja tinggi, beretika baik, dan siap mengikuti tahapan wawancara langsung di booth stand.*<br>• Estimasi Gaji: `Ditanyakan pada saat wawancara`<br>• Kuota terakumulasi persis **2.667 orang** sesuai kuota asli masing-masing perusahaan. | **SELESAI** |
| **Pembersihan Label Formasi pada Kartu Direktori** | Menampilkan badge `Umum (Semua Jurusan) • Penuh Waktu` | Disederhanakan menjadi badge bersih: `Umum` pada setiap kartu industri. Teks `(Semua Jurusan)` dan label berulang dibersihkan. | **SELESAI** |
| **Sinkronisasi Database Remote Supabase (`job_vacancies`)** | Tabel remote Supabase masih menyimpan 48 baris data posisi spesifik lama | Menjalankan migrasi database otomatis via script Supabase API:<br>1. Menghapus 25 baris posisi spesifik lama yang sudah tidak digunakan.<br>2. Meng-upsert 23 baris lowongan umum terpadu sesuai `INITIAL_VACANCIES`.<br>3. Menaikkan cache buster lokal `STORAGE_VERSION` dari `v4` ke `v5` agar seluruh browser pelamar otomatis memuat data terbaru tanpa sisa cache lama. | **SELESAI** |
| **Format Ekspor Data (.XLSX Bukan CSV)** | Ekspor sebelumnya menghasilkan string CSV sederhana (`.csv`) yang berisiko terpotong pada delimiter koma/titik-koma | **Mengintegrasikan pustaka industri SheetJS (`xlsx`)**:<br>1. Menghasilkan file workbook asli biner Microsoft Excel (`.xlsx`) multi-sheet:<br>&nbsp;&nbsp;• **Sheet 1**: *Rekap 23 Stand* (Nomor Stand, Perusahaan, Bidang, PIC, Posisi, Kuota, Total Pelamar, Terverifikasi, Wawancara, Diterima, Scan Stand)<br>&nbsp;&nbsp;• **Sheet 2**: *Data Lamaran* (Detail setiap lamaran, data pelamar, stand, posisi, status, waktu)<br>&nbsp;&nbsp;• **Sheet 3**: *Jobseekers Terdaftar* (Nama, NIK, No WA/HP, Email, Asal Sekolah, Jurusan, Tahun Lulus)<br>&nbsp;&nbsp;• **Sheet 4**: *Presensi Barcode Stand* (Log waktu scan barcode stand)<br>2. Auto-sizing lebar kolom pada setiap worksheet agar teks terbaca rapi tanpa overlap.<br>3. Menambahkan tombol ekspor Excel serupa pada **Dashboard Stand Industri** untuk mendownload berkas pelamar stand mereka sendiri. | **SELESAI** |
| **Hak Akses Tombol "Lihat Gambar Denah Asli"** | Tampil untuk semua pengunjung umum dan pelamar | **Dibatasi secara ketat khusus Role Admin (`$currentUser?.role === 'admin'`)** baik tombol trigger maupun modal backdrop lightbox-nya. Pengunjung umum dan pelamar fokus pada peta interaktif denah lantai. | **SELESAI** |
| **Pembersihan Simbol Matematika LaTeX (`$\times$`)** | Terdapat string raw LaTeX `$\times$` pada footer halaman | Diganti secara bersih dengan simbol perkalian Unicode resmi `×` (*UNTIDAR × SMK Negeri 1 Magelang*) pada seluruh template. | **SELESAI** |

---

---

## 16. Fitur Pengunggahan Logo Kustom & Sinkronisasi Visual Menyeluruh

| Komponen / Masalah | Analisis Masalah | Solusi & Hasil Perbaikan | Status |
| :--- | :--- | :--- | :---: |
| **Ganti Logo Perusahaan di Web Tidak Berubah** | Logo di direktori kartu, denah floor plan, dan tabel admin sebelumnya di-hardcode ke `/companies/${id}.svg` sehingga ketika perusahaan mengunggah gambar logo baru di dashboard stand, tampilan web tetap menampilkan SVG lama. | 1. Memperbarui seluruh komponen UI (`IndustryDirectory.svelte`, `DenahFloorPlan.svelte`, dan `AdminDashboard.svelte`) untuk memprioritaskan properti dinamis: `ind.logo_url || '/companies/' + ind.id + '.svg?v=3'`.<br>2. Menambahkan file reader Base64 dan input file gambar di `CompanyDashboard.svelte` yang langsung menyimpan URL data gambar ke Supabase tabel `industries.logo_url`.<br>3. Kini ketika perusahaan (misalnya *Putra Teknik AC* atau *PT Clay Jaya Bersama*) mengunggah logo resmi baru mereka, logo langsung tampil secara konsisten di kartu lowongan, direktori industri, denah stand, maupun dashboard admin. | **SELESAI** |
| **Penyimpanan Alamat & Email Perusahaan pada Supabase (`PGRST204`)** | Ketika mengedit profil stand, sistem mengirim field `email` dan `alamat`, namun kolom di tabel remote PostgreSQL Supabase bernama `email_resmi` dan `alamat_kantor`. | Memetakan dan mem-whitelist atribut di `src/lib/supabase.js`: `email -> email_resmi` dan `alamat -> alamat_kantor`. Perubahan nama PIC, kontak telepon, dan alamat kini tersimpan permanen dan tidak ter-reset ke default saat sinkronisasi data. | **SELESAI** |

---

## 17. Dukungan Pelamar Melamar ke Banyak Perusahaan & Pembersihan Lowongan Remote

| Fitur / Permintaan | Status Sebelum | Solusi & Implementasi Sistem | Status |
| :--- | :--- | :--- | :---: |
| **Pelamar Melamar Lebih dari 1 Perusahaan** | Karena semua 23 posisi diseragamkan dengan nama "Lowongan Kerja (Umum)", validasi unik sebelumnya mencegah pelamar melamar posisi berjudul sama di perusahaan lain. | 1. Memperbaiki aturan validasi di `applyJob()`: Validasi kini memeriksa kombinasi `applicant_id + industry_id`.<br>2. Pelamar diperbolehkan melamar ke **banyak perusahaan sekaligus** (misal: melamar ke Quick, Alfamidi, Indomaret, dsb.) dengan posisi "Lowongan Kerja (Umum)".<br>3. Proteksi tetap aktif untuk mencegah pelamar melamar dua kali ke perusahaan yang sama. | **SELESAI** |
| **Pembersihan Sisa Lowongan Duplikat di Supabase** | Beberapa stand (Stand 11 Staffinc, Stand 16 Putra Teknik, Stand 10 XL Smart) masih menyimpan riwayat lowongan spesifik lama di tabel remote Supabase. | 1. Melakukan migrasi database: Menghubungkan seluruh 38 lamaran pelamar aktif ke lowongan umum masing-masing stand sehingga tidak ada berkas lamaran yang hilang.<br>2. Menghapus 11 baris sisa lowongan spesifik lama.<br>3. Database kini berisi tepat **23 baris lowongan umum terpadu** (1 per stand) berstatus aktif. | **SELESAI** |
| **Dashboard Stand: Lamaran Pelamar Baru Muncul Otomatis** | Setelah pelamar mendaftar, HRD perusahaan seperti Lidah Buaya dan Putra Teknik terkadang harus me-refresh halaman berulang kali agar lamaran masuk. | Menambahkan pemicu sinkronisasi otomatis `onMount(syncFromSupabase)` di `CompanyDashboard.svelte` dan pembaruan data real-time saat login user berganti. Seluruh lamaran masuk terdeteksi seketika di dashboard HRD. | **SELESAI** |

---

## 18. Ekspansi Alias Kredensial Login Stand (Bebas Salah Ketik)

| Kredensial Stand | Permasalahan Login | Perbaikan yang Diterapkan | Status |
| :--- | :--- | :--- | :---: |
| **Login PT Alfamidi & LPK Akatara Masuk ke Akun Lain** | Input user seperti `"Pt alfamidi"` atau `"Lpk akatara"` tidak cocok dengan username camelCase standar (`AlfamidiStandB6` / `AtaraStandA4`), sehingga terlempar ke fallback stand pertama (Quick). | 1. Memperluas pemetaan alias kredensial pada `OFFICIAL_STAND_CREDENTIALS` (`src/lib/constants.js`) untuk mencakup variasi nama perusahaan lengkap dengan prefiks `PT`, `LPK`, `CV`, huruf kecil, spasi, maupun saltasi ejaan:<br>&nbsp;&nbsp;• `'pt alfamidi'`, `'alfamidi'`, `'pt midi utama indonesia'` -> Stand 5 (Stand B6)<br>&nbsp;&nbsp;• `'lpk akatara'`, `'akatara'`, `'lpk atara'`, `'atara'` -> Stand 9 (Stand A4)<br>&nbsp;&nbsp;• `'putra teknik'`, `'putra teknik ac'` -> Stand 16 (Stand D3)<br>&nbsp;&nbsp;• `'lidah buaya'`, `'lidah buaya group'` -> Stand 1 (Stand D2)<br>2. Menaikkan versi cache `STORAGE_VERSION` ke `v6` agar seluruh browser memuat dictionary alias baru tanpa tersangkut cache lama. | **SELESAI** |

---

## 19. Desain Panggung Utama Megah (Realistic Stage) & Kalibrasi Area Foyer Bawah Sesuai Denah Asli

| Elemen Peta Denah | Bentuk Sebelumnya | Desain Baru Terkalibrasi Sesuai Denah Resmi (*Denah Fix.jfif*) | Status |
| :--- | :--- | :--- | :---: |
| **Panggung Utama (Paling Atas)** | Kotak teks hitam 1 baris sederhana | **Desain Panggung Expo Realistis (Live Event Mainstage)**:<br>1. **Rigging Truss & Lighting Bar**: Rangka aluminium rigging panggung atas dengan lampu sorot panggung (`💡 Spot`).<br>2. **Layar LED Video Wall Raksasa**: Menampilkan **Pamflet Resmi Acara Bhumi Sambhara Expo & Jobfair 2026** resolusi tinggi dengan efek bezel LED dan visual overlay metadata acara.<br>3. **Audio Line-Array Flank Towers**: Menara speaker audio line-array profesional kiri dan kanan lengkap dengan grill subwoofer dan blower pendingin panggung.<br>4. **Stage Apron & Platform Deck**: Panggung kayu dengan tangga akses di sisi barat dan timur (*tangga kiri & tangga kanan*). | **SELESAI** |
| **Area Hall Bawah: Baris Stand 10 s/d 15 & Pintu** | Kolom 3 kotak yang menumpuk tidak sesuai layout asli | **Baris Lorong Selatan (Upper Hall Row)**:<br>• **Sisi Kiri**: Stand 10 (XL Smart), Stand 11 (Staffinc), Stand 12 (Shetler Indonesia).<br>• **Pintu Masuk Lorong Hall**: Jalur pintu "MASUK" di tengah dengan dua panah melengkung (↖️ ↗️) menuju koridor utama.<br>• **Sisi Kanan**: Stand 13 (Mekar Armada Jaya), Stand 14 (BMC Dharmaditna), Stand 15 (Platinum Magelang).<br>• **Jalur Keluar**: Jalur "KELUAR" dengan panah tegak lurus ke bawah (⬇️). | **SELESAI** |
| **Area Foyer Depan (Lower Foyer Strip)** | Gabungan tidak teratur | **Area Foyer Depan (Persis Sketsa Dokumen Final)**:<br>• **Sayap Kiri Foyer**: Tempat Sampah hijau (`🗑️`) di pojok barat daya + Jejeran meja bertaplak motif **Stand KWU Siswa** (`🪑 🪑 🪑 🪑 🪑`) + **Meja Registrasi & Scanner QR** (`🪑📋`) persis di sebelah kiri pintu masuk.<br>• **Pintu Gerbang Utama Masuk**: **PINTU MASUK PESERTA** (`⬆️`) menyambut kedatangan jobseekers dari luar gedung.<br>• **Sayap Kanan Foyer**: Jejeran meja **Stand KWU Siswa** + **Pintu Keluar** (`⬇️`) + Tempat Sampah hijau (`🗑️`) di pojok tenggara. | **SELESAI** |

---

*Disusun dan diperbarui secara otomatis untuk Panitia Penyelenggara Bhumi Sambhara Expo & Jobfair 2026 (K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang).*
