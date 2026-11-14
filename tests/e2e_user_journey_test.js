// ============================================================
// SENIOR USER TESTER: END-TO-END AUTOMATED VERIFICATION SUITE
// PORTAL JOBFAIR BHUMI SAMBHARA EXPO 2026
// ============================================================

import assert from 'node:assert/strict';
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

let testPassCount = 0;
let testFailCount = 0;

function it(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    testPassCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testFailCount++;
  }
}

async function itAsync(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    testPassCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testFailCount++;
  }
}

console.log('====================================================');
console.log('🧪 RUNNING SENIOR USER TESTER AUDIT & UAT SUITE');
console.log('====================================================\n');

// ── Test Suite 1: Event Identity & Directory Catalog ──
console.log('▶ TEST SUITE 1: Verifikasi Identitas Acara & Katalog 20 Industri');

it('Memastikan metadata acara Bhumi Sambhara Expo 2026 otentik', () => {
  assert.equal(EVENT_DETAILS.title, 'BHUMI SAMBHARA EXPO & JOBFAIR 2026');
  assert.ok(EVENT_DETAILS.collaborators.includes('UNTIDAR'));
  assert.ok(EVENT_DETAILS.collaborators.includes('SMK Negeri 1 Magelang'));
  assert.equal(EVENT_DETAILS.venue, 'Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang');
});

it('Memastikan 20 Stand Industri Partner Resmi terdaftar lengkap (Stand A1 s/d D5)', () => {
  const inds = get(industries);
  assert.equal(inds.length, 20, 'Harus tepat 20 industri partner resmi');
  
  const standNumbers = inds.map(i => i.nomor_stand);
  assert.ok(standNumbers.includes('Stand A1'), 'Quick Traktor harus Stand A1');
  assert.ok(standNumbers.includes('Stand A2'), 'Daihatsu harus Stand A2');
  assert.ok(standNumbers.includes('Stand A3'), 'Indomaret harus Stand A3');
  assert.ok(standNumbers.includes('Stand B1'), 'Grand Artos harus Stand B1');
  assert.ok(standNumbers.includes('Stand B3'), 'BCA harus Stand B3');
  assert.ok(standNumbers.includes('Stand C3'), 'Yamaha harus Stand C3');
  assert.ok(standNumbers.includes('Stand C4'), 'Toyota Nasmoco harus Stand C4');
  assert.ok(standNumbers.includes('Stand D1'), 'Borobudur harus Stand D1');
  assert.ok(standNumbers.includes('Stand D5'), 'Prima Multi Sarana harus Stand D5');
});

it('Memastikan seluruh ID industri dan lowongan bertipe UUID yang valid', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const inds = get(industries);
  for (const ind of inds) {
    assert.match(ind.id, uuidRegex, `ID Industri ${ind.nama_perusahaan} harus UUID valid`);
  }

  const vacs = get(vacancies);
  assert.ok(vacs.length >= 20, 'Harus memiliki minimal 20 posisi lowongan');
  for (const vac of vacs) {
    assert.match(vac.id, uuidRegex, `ID Lowongan ${vac.judul_posisi} harus UUID valid`);
    assert.match(vac.industry_id, uuidRegex, `Industry ID foreign key harus UUID valid`);
  }
});

// ── Test Suite 2: Pendaftaran & Autentikasi Multi-Role ──
console.log('\n▶ TEST SUITE 2: Pendaftaran & Autentikasi Multi-Role');

let applicantUser = null;
let companyUser = null;
let adminUser = null;

await itAsync('Pelamar mendaftar akun baru dengan Nama, Email, dan Password', async () => {
  const email = `pelamar.test.${Date.now()}@skanisa.sch.id`;
  const res = await registerUser('Budi Santoso', email, 'Password123!', 'pelamar');
  assert.equal(res.success, true);
  assert.ok(res.user);
  assert.equal(res.user.nama_lengkap, 'Budi Santoso');
  assert.equal(res.user.role, 'pelamar');
  assert.ok(res.user.qr_code_token.startsWith('BSJ2026-PEL-'));
  applicantUser = res.user;
});

await itAsync('Sistem mencegah pendaftaran email duplikat', async () => {
  const res = await registerUser('Budi Duplikat', applicantUser.email, 'Password123!', 'pelamar');
  assert.equal(res.success, false);
  assert.match(res.error, /sudah terdaftar/i);
});

await itAsync('Pemberi kerja (Industri Quick) mendaftar akun stand booth', async () => {
  const email = `hrd.quick.${Date.now()}@quick.co.id`;
  const quickIndId = 'a0000001-0000-0000-0000-000000000001';
  const res = await registerUser('Bambang HRD Quick', email, 'Password123!', 'pemberi_kerja', quickIndId);
  assert.equal(res.success, true);
  assert.equal(res.user.role, 'pemberi_kerja');
  assert.equal(res.user.company_id, quickIndId);
  companyUser = res.user;
});

await itAsync('Panitia Admin mendaftar akun pengawas expo', async () => {
  const email = `bkk.admin.${Date.now()}@skanisa.sch.id`;
  const res = await registerUser('Panitia BKK & UNTIDAR', email, 'AdminPass2026!', 'admin');
  assert.equal(res.success, true);
  assert.equal(res.user.role, 'admin');
  adminUser = res.user;
});

await itAsync('Pelamar login ulang dan memvalidasi sesi aktif', async () => {
  logoutUser();
  assert.equal(get(currentUser), null);

  const res = await loginUser(applicantUser.email, 'Password123!');
  assert.equal(res.success, true);
  assert.equal(get(currentUser).email, applicantUser.email);
});

// ── Test Suite 3: Pengelolaan Profil Pelamar & Pembuatan Kartu QR ──
console.log('\n▶ TEST SUITE 3: Pengelolaan Profil Pelamar & Kartu QR Digital');

await itAsync('Pelamar memperbarui biodata, NIK/NISN, keahlian, dan tautan CV', async () => {
  const updateData = {
    nik_nisn: '3308011904060005',
    nomor_wa: '0858-1234-5678',
    pendidikan_terakhir: 'SMK (Lulusan 2026)',
    asal_sekolah_kampus: 'SMK Negeri 1 Magelang',
    jurusan: 'Teknik Pemesinan',
    keahlian: ['Operasional Mesin Bubut', 'Gambar Teknik CAD', 'Toleransi Presisi'],
    link_cv_portofolio: 'https://drive.google.com/file/d/cv-budi-skanisa',
    ringkasan_profil: 'Siswa kelas XII Teknik Pemesinan SMK Negeri 1 Magelang dengan nilai prakerin memuaskan.'
  };

  const res = await updateProfile(updateData);
  assert.equal(res.success, true);

  const current = get(currentUser);
  assert.equal(current.nik_nisn, updateData.nik_nisn);
  assert.equal(current.jurusan, 'Teknik Pemesinan');
  assert.deepEqual(current.keahlian, updateData.keahlian);
});

it('Token QR Pelamar unik dan scannable', () => {
  const current = get(currentUser);
  assert.ok(current.qr_code_token);
  assert.ok(current.qr_code_token.length >= 10);
});

// ── Test Suite 4: Pelamaran Kerja ke Stand Industri ──
console.log('\n▶ TEST SUITE 4: Pelamaran Kerja ke 20 Industri Partner');

const quickVacId = 'b0000001-0000-0000-0000-000000000001'; // Operator Perakitan Mesin Traktor
const daihatsuVacId = 'b0000001-0000-0000-0000-000000000003'; // Mekanik Kendaraan Ringan

await itAsync('Pelamar berhasil melamar lowongan di Stand A1 (Quick)', async () => {
  const res = await applyJob(quickVacId, applicantUser.id, 'Saya siap ditempatkan di pabrik perakitan traktor.');
  assert.equal(res.success, true);
  assert.ok(res.application);
  assert.equal(res.application.vacancy_id, quickVacId);
  assert.equal(res.application.applicant_id, applicantUser.id);
  assert.equal(res.application.status, 'menunggu');
});

await itAsync('Pelamar dicegah melamar posisi yang sama dua kali', async () => {
  const res = await applyJob(quickVacId, applicantUser.id, 'Coba lamar lagi');
  assert.equal(res.success, false);
  assert.match(res.error, /sudah melamar/i);
});

await itAsync('Pelamar berhasil melamar lowongan kedua di Stand A2 (Daihatsu)', async () => {
  const res = await applyJob(daihatsuVacId, applicantUser.id, 'Pernah servis transmisi saat PKL.');
  assert.equal(res.success, true);
});

it('Daftar lamaran pelamar bertambah sesuai lowongan yang diajukan', () => {
  const myApps = get(applications).filter(a => a.applicant_id === applicantUser.id);
  assert.equal(myApps.length, 2);
  const vacIds = myApps.map(a => a.vacancy_id);
  assert.ok(vacIds.includes(quickVacId));
  assert.ok(vacIds.includes(daihatsuVacId));
});

// ── Test Suite 5: Stand Industri Dashboard & Verifikasi Kehadiran Barcode ──
console.log('\n▶ TEST SUITE 5: Dashboard Stand Industri & Verifikasi Barcode');

it('HRD Quick hanya melihat pelamar yang melamar ke lowongannya', () => {
  const compVacIds = get(vacancies).filter(v => v.industry_id === 'a0000001-0000-0000-0000-000000000001').map(v => v.id);
  const compApps = get(applications).filter(a => compVacIds.includes(a.vacancy_id));
  
  assert.ok(compApps.some(a => a.applicant_id === applicantUser.id && a.vacancy_id === quickVacId));
  // Pastikan lamaran Daihatsu tidak bercampur ke Quick
  assert.ok(!compApps.some(a => a.vacancy_id === daihatsuVacId));
});

await itAsync('Scanner Stand mengenali token QR pelamar saat datang fisik ke booth', async () => {
  const found = await lookupApplicant(applicantUser.qr_code_token);
  assert.ok(found, 'Pelamar harus ditemukan melalui token QR');
  assert.equal(found.id, applicantUser.id);
  assert.equal(found.nama_lengkap, 'Budi Santoso');
  assert.equal(found.nik_nisn, '3308011904060005');
});

await itAsync('Scanner Stand mengenali pelamar jika diinput melalui NIK manual', async () => {
  const found = await lookupApplicant('3308011904060005');
  assert.ok(found, 'Pelamar harus ditemukan melalui NIK');
  assert.equal(found.id, applicantUser.id);
});

await itAsync('HRD Quick scan QR barcode pelamar di Stand A1: Status otomatis menjadi "terverifikasi_stand"', async () => {
  const res = await recordStandScan('a0000001-0000-0000-0000-000000000001', applicantUser.id, 'Hadir di Stand A1 jam 09.30 WIB', companyUser.id);
  assert.equal(res.success, true);

  // Periksa lamaran Quick
  const appQuick = get(applications).find(a => a.applicant_id === applicantUser.id && a.vacancy_id === quickVacId);
  assert.equal(appQuick.status, 'terverifikasi_stand');
  assert.ok(appQuick.waktu_verifikasi);

  // Pastikan lamaran Daihatsu tetap menunggu (karena belum didatangi fisiknya)
  const appDaihatsu = get(applications).find(a => a.applicant_id === applicantUser.id && a.vacancy_id === daihatsuVacId);
  assert.equal(appDaihatsu.status, 'menunggu');
});

await itAsync('HRD Quick memanggil pelamar untuk wawancara di booth', async () => {
  const appQuick = get(applications).find(a => a.applicant_id === applicantUser.id && a.vacancy_id === quickVacId);
  const res = await updateApplicationStatus(appQuick.id, 'wawancara', 'Wawancara teknis di meja booth A1', companyUser.id);
  assert.equal(res.success, true);

  const updated = get(applications).find(a => a.id === appQuick.id);
  assert.equal(updated.status, 'wawancara');
  assert.equal(updated.catatan_industri, 'Wawancara teknis di meja booth A1');
});

await itAsync('HRD Quick menerima pelamar setelah tes wawancara lolos', async () => {
  const appQuick = get(applications).find(a => a.applicant_id === applicantUser.id && a.vacancy_id === quickVacId);
  const res = await updateApplicationStatus(appQuick.id, 'diterima', 'Lolos verifikasi & diterima kerja', companyUser.id);
  assert.equal(res.success, true);

  const updated = get(applications).find(a => a.id === appQuick.id);
  assert.equal(updated.status, 'diterima');
});

// ── Test Suite 6: Panel Kendali Admin & Output Analitik ──
console.log('\n▶ TEST SUITE 6: Panel Kendali Admin & Output Analitik');

it('Admin mendapatkan total rekapitulasi pendaftar, lamaran, dan status verifikasi', () => {
  const totalPelamar = get(allUsers).filter(u => u.role === 'pelamar').length;
  const totalApps = get(applications).length;
  const totalStandHadir = get(standAttendances).length;
  const totalAccepted = get(applications).filter(a => a.status === 'diterima').length;

  assert.ok(totalPelamar >= 1, 'Minimal ada 1 pelamar terdaftar');
  assert.ok(totalApps >= 2, 'Minimal ada 2 lamaran masuk');
  assert.ok(totalStandHadir >= 1, 'Minimal ada 1 presensi scan stand');
  assert.equal(totalAccepted, 1, 'Tepat 1 pelamar diterima di Stand A1');
});

it('Admin matriks 20 stand memetakan data dengan akurat tanpa duplikasi', () => {
  const inds = get(industries);
  assert.equal(inds.length, 20);

  const quickRow = inds.find(i => i.nomor_stand === 'Stand A1');
  assert.ok(quickRow);
  assert.equal(quickRow.nama_perusahaan, 'CV Karya Hidup Sentosa (Quick)');

  const quickVacIds = get(vacancies).filter(v => v.industry_id === quickRow.id).map(v => v.id);
  const quickApps = get(applications).filter(a => quickVacIds.includes(a.vacancy_id));
  assert.equal(quickApps.length, 1);
  assert.equal(quickApps[0].status, 'diterima');
});

console.log('\n====================================================');
console.log(`🏁 HASIL AKHIR AUDIT PENGUJIAN USER TESTER:`);
console.log(`   Total Lolos (PASS) : ${testPassCount}`);
console.log(`   Total Gagal (FAIL) : ${testFailCount}`);
console.log('====================================================');

if (testFailCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
