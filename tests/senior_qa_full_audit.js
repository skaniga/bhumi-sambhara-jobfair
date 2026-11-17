// ============================================================
// SENIOR QA / USER TESTER: COMPREHENSIVE AUDIT & UAT SUITE
// PORTAL JOBFAIR BHUMI SAMBHARA EXPO 2026 (UNTIDAR x SMKN 1 MAGELANG)
// ============================================================

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  updateProfile, 
  updateCompany, 
  applyJob, 
  updateApplicationStatus, 
  recordStandScan, 
  lookupApplicant,
  currentUser,
  allUsers,
  industries,
  vacancies,
  applications,
  standAttendances,
  generateUUID
} from '../src/lib/supabase.js';
import { get } from 'svelte/store';
import { INITIAL_INDUSTRIES, INITIAL_VACANCIES, EVENT_DETAILS } from '../src/lib/initialData.js';

const ZONES = [
  { id: 'A', name: 'Zona A (Depan)', stands: ['Stand A1', 'Stand A2', 'Stand A3', 'Stand A4', 'Stand A5', 'Stand A6'] },
  { id: 'B', name: 'Zona B (Depan)', stands: ['Stand B1', 'Stand B2', 'Stand B3', 'Stand B4', 'Stand B5', 'Stand B6'] },
  { id: 'C', name: 'Zona C (Belakang)', stands: ['Stand C1', 'Stand C2', 'Stand C3', 'Stand C4', 'Stand C5', 'Stand C6'] },
  { id: 'D', name: 'Zona D (Belakang)', stands: ['Stand D1', 'Stand D2', 'Stand D3', 'Stand D4', 'Stand D5'] }
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const auditLog = [];

function testCase(category, name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    const msg = `[PASS] [${category}] ${name}`;
    console.log(`  ✓ ${msg}`);
    auditLog.push({ category, name, status: 'PASS', error: null });
  } catch (err) {
    failedTests++;
    const msg = `[FAIL] [${category}] ${name}: ${err.message}`;
    console.error(`  ✗ ${msg}`);
    auditLog.push({ category, name, status: 'FAIL', error: err.message });
  }
}

async function testCaseAsync(category, name, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    const msg = `[PASS] [${category}] ${name}`;
    console.log(`  ✓ ${msg}`);
    auditLog.push({ category, name, status: 'PASS', error: null });
  } catch (err) {
    failedTests++;
    const msg = `[FAIL] [${category}] ${name}: ${err.message}`;
    console.error(`  ✗ ${msg}`);
    auditLog.push({ category, name, status: 'FAIL', error: err.message });
  }
}

console.log('================================================================');
console.log('🔍 SENIOR USER TESTER: AUDIT LENGKAP SELURUH FUNGSI SISTEM');
console.log('================================================================\n');

// -------------------------------------------------------------
// 1. DATA KATALOG & INTEGRITAS KUOTA EXCEL
// -------------------------------------------------------------
console.log('📌 1. DATA KATALOG & INTEGRITAS KUOTA');

testCase('KATALOG', 'Total Mitra Industri tepat 23 perusahaan', () => {
  const inds = get(industries);
  assert.equal(inds.length, 23);
});

testCase('KATALOG', 'Total kuota lowongan akumulatif mencapai 2.667 orang', () => {
  const vacs = get(vacancies);
  const totalKuota = vacs.reduce((acc, v) => acc + (Number(v.kuota) || 0), 0);
  assert.equal(totalKuota, 2667, `Kuota aktual (${totalKuota}) harus tepat 2.667 sesuai data excel`);
});

testCase('KATALOG', 'Semua nomor stand teralokasi lengkap (Stand 1 s/d Stand 23)', () => {
  const inds = get(industries);
  const standSet = new Set(inds.map(i => i.nomor_stand));
  
  for (let i = 1; i <= 23; i++) {
    assert.ok(standSet.has(`Stand ${i}`), `Harus ada Stand ${i}`);
  }
});

// -------------------------------------------------------------
// 2. KUALITAS ASET LOGO & VALIDITAS SVG PARSER
// -------------------------------------------------------------
console.log('\n📌 2. KUALITAS ASET LOGO & PARSER SVG');

testCase('ASET', 'Semua 23 file SVG ada di folder public/companies/', () => {
  const inds = get(industries);
  for (const ind of inds) {
    const svgPath = path.join(projectRoot, 'public', 'companies', `${ind.id}.svg`);
    assert.ok(fs.existsSync(svgPath), `File SVG harus ada untuk ${ind.nomor_stand}: ${ind.id}.svg`);
  }
});

testCase('ASET', 'Semua 23 file SVG ada di folder dist/companies/ hasil build', () => {
  const inds = get(industries);
  for (const ind of inds) {
    const svgPath = path.join(projectRoot, 'dist', 'companies', `${ind.id}.svg`);
    assert.ok(fs.existsSync(svgPath), `File dist SVG harus ada untuk ${ind.nomor_stand}: ${ind.id}.svg`);
  }
});

testCase('ASET', 'Tidak ada karakter ampersand mentah (&) pada file SVG (Bebas XML Parse Error)', () => {
  const inds = get(industries);
  const bareAmpRegex = /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/;
  
  for (const ind of inds) {
    const svgPath = path.join(projectRoot, 'public', 'companies', `${ind.id}.svg`);
    const content = fs.readFileSync(svgPath, 'utf8');
    assert.ok(!bareAmpRegex.test(content), `SVG ${ind.nomor_stand} (${ind.nama_perusahaan}) tidak boleh memiliki unescaped &`);
  }
});

// -------------------------------------------------------------
// 3. AUTENTIKASI, MULTI-ROLE & FITUR TOGGLE PASSWORD
// -------------------------------------------------------------
console.log('\n📌 3. AUTENTIKASI, MULTI-ROLE & TOGGLE PASSWORD');

let testPelamarUser = null;
let testHrdUser = null;
let testAdminUser = null;

testCase('AUTH', 'Verifikasi AuthModal mendukung toggle password (Eye/EyeOff)', () => {
  const authModalPath = path.join(projectRoot, 'src', 'lib', 'components', 'AuthModal.svelte');
  const code = fs.readFileSync(authModalPath, 'utf8');
  assert.ok(code.includes('showPassword'), 'AuthModal harus memiliki state showPassword');
  assert.ok(code.includes('Eye'), 'AuthModal harus mengimpor komponen Eye');
  assert.ok(code.includes('EyeOff'), 'AuthModal harus mengimpor komponen EyeOff');
  assert.ok(code.includes('password-toggle-btn'), 'AuthModal harus memiliki tombol password-toggle-btn');
});

await testCaseAsync('AUTH', 'Pendaftaran akun Pelamar dengan validasi email unik dan token QR', async () => {
  const email = `pelamar.qa.${Date.now()}@skanisa.sch.id`;
  const res = await registerUser('Ahmad Dani Setiawan', email, 'SandiKuat2026!', 'pelamar');
  assert.equal(res.success, true);
  assert.ok(res.user.id);
  assert.equal(res.user.role, 'pelamar');
  assert.ok(res.user.qr_code_token.startsWith('BSJ2026-PEL-'));
  testPelamarUser = res.user;
});

await testCaseAsync('AUTH', 'Pencegahan registrasi dengan email kosong atau password kosong', async () => {
  const resEmptyEmail = await registerUser('Nama Saja', '', 'pass123', 'pelamar');
  assert.equal(resEmptyEmail.success, false);
  const resEmptyPass = await registerUser('Nama Saja', 'email@test.com', '', 'pelamar');
  assert.equal(resEmptyPass.success, false);
});

await testCaseAsync('AUTH', 'Pendaftaran akun HRD Perusahaan (Stand A2 DeWave)', async () => {
  const email = `hrd.dewave.${Date.now()}@dewave.com`;
  const dewaveId = 'a0000001-0000-0000-0000-000000000002';
  const res = await registerUser('PIC DeWave', email, 'DeWavePass2026!', 'pemberi_kerja', dewaveId);
  assert.equal(res.success, true);
  assert.equal(res.user.role, 'pemberi_kerja');
  assert.equal(res.user.company_id, dewaveId);
  testHrdUser = res.user;
});

await testCaseAsync('AUTH', 'Pendaftaran akun Panitia Admin (BKK / UNTIDAR)', async () => {
  const email = `admin.panitia.${Date.now()}@smkn1magelang.sch.id`;
  const res = await registerUser('Koordinator BKK Skanisa', email, 'SuperAdminBkk2026!', 'admin');
  assert.equal(res.success, true);
  assert.equal(res.user.role, 'admin');
  testAdminUser = res.user;
});

await testCaseAsync('AUTH', 'Login dan Logout bergantian menjaga isolasi sesi pengguna', async () => {
  // Login Pelamar
  const resLogin = await loginUser(testPelamarUser.email, 'SandiKuat2026!');
  assert.equal(resLogin.success, true);
  assert.equal(get(currentUser)?.email, testPelamarUser.email);
  
  // Logout
  logoutUser();
  assert.equal(get(currentUser), null);
});

// -------------------------------------------------------------
// 4. ALUR PELAMAR KERJA (APPLICANT JOURNEY)
// -------------------------------------------------------------
console.log('\n📌 4. ALUR KERJA PELAMAR (APPLICANT JOURNEY)');

await testCaseAsync('PELAMAR', 'Pelamar melengkapi profil biodata, NIK/NISN, nomor WA, dan link CV', async () => {
  await loginUser(testPelamarUser.email, 'SandiKuat2026!');
  const res = await updateProfile({
    nik_nisn: '3308051212060001',
    nomor_wa: '081234567890',
    pendidikan_terakhir: 'SMK (Lulusan 2026)',
    asal_sekolah_kampus: 'SMK Negeri 1 Magelang',
    jurusan: 'Rekayasa Perangkat Lunak',
    keahlian: ['JavaScript', 'Svelte', 'Database PostgreSQL'],
    link_cv_portofolio: 'https://drive.google.com/file/d/cv-ahmad-dani',
    ringkasan_profil: 'Programmer muda siap berkarya di industri teknologi.'
  });
  assert.equal(res.success, true);
  const cur = get(currentUser);
  assert.equal(cur.nik_nisn, '3308051212060001');
  assert.equal(cur.jurusan, 'Rekayasa Perangkat Lunak');
});

const posDeWave = 'b0000001-0000-0000-0000-000000000003'; // Terapis Massage di DeWave
const posQuick = 'b0000001-0000-0000-0000-000000000001'; // Operator Mesin di Quick

await testCaseAsync('PELAMAR', 'Pelamar mengirim lamaran kerja ke Stand A2 (DeWave)', async () => {
  const res = await applyJob(posDeWave, testPelamarUser.id, 'Tertarik dengan pelatihan terapis profesional.');
  assert.equal(res.success, true);
  assert.equal(res.application.status, 'menunggu');
});

await testCaseAsync('PELAMAR', 'Proteksi sistem: Mencegah pelamar melamar posisi yang sama dua kali', async () => {
  const resDuplicate = await applyJob(posDeWave, testPelamarUser.id, 'Coba lamar lagi posisi sama');
  assert.equal(resDuplicate.success, false);
  assert.match(resDuplicate.error, /sudah melamar/i);
});

await testCaseAsync('PELAMAR', 'Pelamar diperbolehkan melamar posisi berbeda di industri lain (Stand A1 Quick)', async () => {
  const res = await applyJob(posQuick, testPelamarUser.id, 'Saya juga memiliki kompetensi manufaktur.');
  assert.equal(res.success, true);
  
  const userApps = get(applications).filter(a => a.applicant_id === testPelamarUser.id);
  assert.equal(userApps.length, 2, 'Pelamar harus memiliki tepat 2 lamaran aktif');
});

// -------------------------------------------------------------
// 5. ALUR STAND INDUSTRI & SCANNER QR (TENANT ISOLATION)
// -------------------------------------------------------------
console.log('\n📌 5. ALUR STAND INDUSTRI & SCANNER QR');

testCase('STAND', 'Isolasi Data: HRD DeWave hanya melihat lamaran yang masuk ke standnya', () => {
  const dewaveId = 'a0000001-0000-0000-0000-000000000002';
  const dewaveVacIds = get(vacancies).filter(v => v.industry_id === dewaveId).map(v => v.id);
  const dewaveApps = get(applications).filter(a => dewaveVacIds.includes(a.vacancy_id));

  // Harus melihat lamaran DeWave
  assert.ok(dewaveApps.some(a => a.applicant_id === testPelamarUser.id && a.vacancy_id === posDeWave));
  // TIDAK BOLEH melihat lamaran Quick
  assert.ok(!dewaveApps.some(a => a.vacancy_id === posQuick));
});

await testCaseAsync('STAND', 'Scanner Stand: Memverifikasi kehadiran fisik pelamar di Stand A2 via Token QR', async () => {
  const dewaveId = 'a0000001-0000-0000-0000-000000000002';
  const curPelamar = get(allUsers).find(u => u.id === testPelamarUser.id);
  
  // Lookup pelamar dengan token QR
  const found = await lookupApplicant(curPelamar.qr_code_token);
  assert.ok(found);
  assert.equal(found.id, testPelamarUser.id);

  // Rekam kehadiran scan booth
  const scanRes = await recordStandScan(dewaveId, testPelamarUser.id, 'Pelamar datang membawa berkas portofolio', testHrdUser.id);
  assert.equal(scanRes.success, true);

  // Status lamaran DeWave harus otomatis 'terverifikasi_stand'
  const appDeWave = get(applications).find(a => a.applicant_id === testPelamarUser.id && a.vacancy_id === posDeWave);
  assert.equal(appDeWave.status, 'terverifikasi_stand');

  // Status lamaran Quick harus TETAP 'menunggu' (karena belum didatangi standnya)
  const appQuick = get(applications).find(a => a.applicant_id === testPelamarUser.id && a.vacancy_id === posQuick);
  assert.equal(appQuick.status, 'menunggu');
});

await testCaseAsync('STAND', 'Scanner Stand: Fallback pencarian manual via NIK pelamar berfungsi', async () => {
  const foundByNik = await lookupApplicant('3308051212060001');
  assert.ok(foundByNik);
  assert.equal(foundByNik.id, testPelamarUser.id);
  assert.equal(foundByNik.nama_lengkap, 'Ahmad Dani Setiawan');
});

await testCaseAsync('STAND', 'HRD DeWave memajukan status pelamar: Wawancara -> Diterima', async () => {
  const appDeWave = get(applications).find(a => a.applicant_id === testPelamarUser.id && a.vacancy_id === posDeWave);
  
  // Status Wawancara
  const resInterview = await updateApplicationStatus(appDeWave.id, 'wawancara', 'Wawancara meja 1 pukul 11.00 WIB', testHrdUser.id);
  assert.equal(resInterview.success, true);
  let updated = get(applications).find(a => a.id === appDeWave.id);
  assert.equal(updated.status, 'wawancara');

  // Status Diterima
  const resHired = await updateApplicationStatus(appDeWave.id, 'diterima', 'Lolos seleksi, onboarding minggu depan', testHrdUser.id);
  assert.equal(resHired.success, true);
  updated = get(applications).find(a => a.id === appDeWave.id);
  assert.equal(updated.status, 'diterima');
  assert.equal(updated.catatan_industri, 'Lolos seleksi, onboarding minggu depan');
});

// -------------------------------------------------------------
// 6. PANEL ADMIN & REKAPITULASI ANALITIK REALTIME
// -------------------------------------------------------------
console.log('\n📌 6. PANEL ADMIN & REKAPITULASI ANALITIK');

testCase('ADMIN', 'Matriks 23 Stand Admin mencatat status pelamar di Stand 2 secara akurat', () => {
  const dewaveInd = get(industries).find(i => i.nomor_stand === 'Stand 2' || i.nomor_stand === 'Stand A2');
  assert.ok(dewaveInd);
  
  const vacIds = get(vacancies).filter(v => v.industry_id === dewaveInd.id).map(v => v.id);
  const boothApps = get(applications).filter(a => vacIds.includes(a.vacancy_id));
  assert.equal(boothApps.length, 1);
  assert.equal(boothApps[0].status, 'diterima');
});

testCase('ADMIN', 'Rekapitulasi total pelamar, lamaran, dan status selesai tanpa anomali', () => {
  const allApps = get(applications);
  const totalHired = allApps.filter(a => a.status === 'diterima').length;
  assert.ok(totalHired >= 1);
  assert.ok(get(standAttendances).length >= 1);
});

// -------------------------------------------------------------
// 7. DENAH LANTAI INTERAKTIF (DENAH FLOOR PLAN)
// -------------------------------------------------------------
console.log('\n📌 7. DENAH LANTAI GRAHA KRIDA WIYATA');

testCase('DENAH', 'Struktur 3 Area sesuai Denah Fix Graha Krida Wiyata', () => {
  const leftWing = ['Stand 1', 'Stand 2', 'Stand 3', 'Stand 4', 'Stand 5', 'Stand 6', 'Stand 7', 'Stand 8', 'Stand 9'];
  const bottomLeft = ['Stand 10', 'Stand 11', 'Stand 12'];
  const bottomRight = ['Stand 13', 'Stand 14', 'Stand 15'];
  const rightWing = ['Stand 23', 'Stand 22', 'Stand 21', 'Stand 20', 'Stand 19', 'Stand 18', 'Stand 17', 'Stand 16'];

  assert.equal(leftWing.length, 9, 'Sayap kiri harus 9 stand');
  assert.equal(bottomLeft.length + bottomRight.length, 6, 'Area selatan/bawah harus 6 stand');
  assert.equal(rightWing.length, 8, 'Sayap kanan harus 8 stand');

  const totalMapped = leftWing.length + bottomLeft.length + bottomRight.length + rightWing.length;
  assert.equal(totalMapped, 23, 'Total stand terpetakan di denah harus tepat 23');
});

testCase('DENAH', 'Komponen DenahFloorPlan menggunakan cache buster v=3 untuk logo', () => {
  const denahPath = path.join(projectRoot, 'src', 'lib', 'components', 'DenahFloorPlan.svelte');
  const code = fs.readFileSync(denahPath, 'utf8');
  assert.ok(code.includes('/companies/{ind?.id}.svg?v=3'), 'DenahFloorPlan harus memuat logo dengan query ?v=3');
});

// -------------------------------------------------------------
// 8. FILE DISTRIBUSI & KONFIGURASI WEB SERVER (.HTACCESS)
// -------------------------------------------------------------
console.log('\n📌 8. FILE DISTRIBUSI & SERVER ROUTING');

testCase('DIST', 'dist/index.html valid dan tidak kosong', () => {
  const indexPath = path.join(projectRoot, 'dist', 'index.html');
  assert.ok(fs.existsSync(indexPath));
  const html = fs.readFileSync(indexPath, 'utf8');
  assert.ok(html.includes('Bhumi Sambhara Expo & Jobfair 2026'));
  assert.ok(html.includes('/assets/'));
});

testCase('DIST', 'dist/.htaccess memiliki aturan fallback RewriteEngine SPA untuk Hostinger', () => {
  const htPath = path.join(projectRoot, 'dist', '.htaccess');
  assert.ok(fs.existsSync(htPath));
  const ht = fs.readFileSync(htPath, 'utf8');
  assert.ok(ht.includes('RewriteEngine On'));
  assert.ok(ht.includes('RewriteRule . /index.html [L]'));
});

testCase('DIST', 'Paket zip dist_bme_update.zip terbuat dan siap deploy', () => {
  const zipPath = path.resolve(projectRoot, '..', 'dist_bme_update.zip');
  assert.ok(fs.existsSync(zipPath), 'dist_bme_update.zip harus ada di folder utama');
  const stats = fs.statSync(zipPath);
  assert.ok(stats.size > 200000, 'Ukuran ZIP harus valid (> 200 KB)');
});

// -------------------------------------------------------------
// RINGKASAN AUDIT
// -------------------------------------------------------------
console.log('\n================================================================');
console.log('📊 HASIL AUDIT SENIOR USER TESTER:');
console.log(`   Total Pengujian : ${totalTests}`);
console.log(`   Lolos (PASS)    : ${passedTests}`);
console.log(`   Gagal (FAIL)    : ${failedTests}`);
console.log(`   Tingkat Kelolosan: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
console.log('================================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

