# 🛡️ Panduan Pengguna: Role Admin Panitia (BKK & UNTIDAR)
**Portal Bursa Kerja Bhumi Sambhara Expo & Jobfair 2026**  
*Kolaborasi Resmi: K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang*

---

## 🎯 Ringkasan Alur Panitia Penyelenggara
Sebagai panitia admin (BKK SMKN 1 Magelang dan K1 Pariwisata UNTIDAR), Anda memegang kendali penuh monitoring acara:
1. Memantau telemetri live pendaftar (*Jobseekers*), total berkas lamaran, dan tingkat okupansi bursa kerja.
2. Memantau rekapitulasi real-time dari seluruh **23 Stand Industri Partner (Stand A1 s/d Stand D5)**.
3. Memeriksa tata letak fisik melalui **Denah 4 Zona Hall Graha Krida Wiyata**.
4. Mengoperasikan **Scanner Master Panitia** di pintu masuk (*gate*) aula expo untuk validasi tiket/kartu peserta.
5. Mengunduh data rekapitulasi lengkap acara dalam format **CSV / Excel** untuk arsip laporan pertanggungjawaban kegiatan.

---

## 🔑 Kredensial Login Panitia Resmi

| Lembaga Penyelenggara | Alamat Email | Kata Sandi | Peran | Token Master |
| :--- | :--- | :--- | :--- | :--- |
| **BKK SMK Negeri 1 Magelang** | `bkk@skanisa.sch.id` | `BkkSkanisa2026!` | `admin` | `BSJ2026-ADM-BKK01` |
| **K1 Pariwisata 2024 UNTIDAR** | `untidar@jobfair.id` | `UntidarExpo2026!` | `admin` | `BSJ2026-ADM-UNTIDAR01` |

---

## 🚀 Panduan Pengoperasian Panel Kendali

### 1. Masuk ke Panel Monitoring
1. Buka website portal, klik **Masuk / Daftar** di pojok kanan atas.
2. Masukkan email panitia (`bkk@skanisa.sch.id` atau `untidar@jobfair.id`) dan kata sandi di atas.
3. Begitu masuk, Anda akan langsung diarahkan ke tab **Panel Monitoring**.

### 2. Membaca Kartu Indikator Utama (KPI Telemetri)
Pada baris atas dashboard terdapat 4 metrik penting yang ter-update live:
* **Total Pendaftar (Jobseekers)**: Jumlah siswa, alumni, dan masyarakat umum yang telah membuat akun terdaftar.
* **Total Lamaran Masuk**: Akumulasi seluruh berkas lamaran kerja yang diajukan ke 23 stand industri.
* **Terverifikasi di Stand**: Jumlah pelamar yang telah hadir fisik dan dipindai barcode QR-nya di stand booth.
* **Panggilan Wawancara**: Jumlah pelamar yang telah dipanggil interview langsung oleh HRD perusahaan.

### 3. Memantau Denah 4 Zona Stand Expo
Panel kendali menampilkan tata letak fisik hall Graha Krida Wiyata:
* **ZONA A (Sayap Kiri Depan)**: Stand A1 – A6 (Manufaktur, Jasa & Pelatihan Vokasi: Quick Traktor, DeWave Salon, HK Gold, LPK Atara, Captain's Club, LPK Platinum).
* **ZONA B (Sayap Kanan Depan)**: Stand B1 – B6 (Penyalur Global, Garmen, Telco & Keuangan: Teratai Gogakuin, Anugerah Abadi, XL Smart, PNM, Gisara Tantra, Alfamidi).
* **ZONA C (Sayap Kiri Belakang)**: Stand C1 – C6 (BPO, Bahan Bangunan, Karoseri & Properti: Shelter Indonesia, Clay Jaya BIG, Mekar Armada Jaya, Sindoro College, Uniloa, BMC).
* **ZONA D (Sayap Kanan Belakang)**: Stand D1 – D5 (Ritel Modern, Toiletries, HVACR & Solusi SDM: Indomaret, Lidah Buaya Group, Putra Teknik AC, Staffinc, Candi Bangun Persada).

### 4. Mengoperasikan Scanner Master Panitia (Gate Pintu Masuk)
1. Klik tombol amber **"Scanner Master Panitia"** pada header dashboard.
2. Kamera pemindai terbuka untuk memverifikasi peserta yang baru tiba di lokasi expo:
   - Arahkan kamera ke layar ponsel peserta yang menunjukkan Kartu QR.
   - Sistem memverifikasi keaslian kartu dan menampilkan biodata peserta.
   - Klik **Verifikasi Hadir di Stand** untuk mencatat registrasi kehadiran pintu masuk.

### 5. Memantau Matriks Rekapitulasi 23 Stand
Di bagian bawah dashboard, terdapat tabel matriks seluruh 23 stand:
* Menampilkan: Nomor Stand, Nama Perusahaan, Bidang Industri, Jumlah Lowongan Dibuka, Total Pelamar, Jumlah Terverifikasi Hadir, dan Bar Rasio Okupansi Persentase Verifikasi (`0% - 100%`).
* Kolom pencarian: Ketik nama stand atau industri untuk memfilter tabel secara instan.
* Tombol **Perbarui** (ikon putar): Klik untuk menarik sinkronisasi data terkini dari server Supabase secara live.

### 6. Mengekspor Laporan ke CSV / Excel
* Klik tombol **Ekspor Data (CSV)** di bagian atas halaman admin.
* File spreadsheet lengkap akan terunduh otomatis ke komputer panitia dengan format penamaan `Rekapitulasi_Bhumi_Sambhara_Jobfair_2026_<timestamp>.csv`.
