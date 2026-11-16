import { createClient } from '@supabase/supabase-js';
import { writable, get } from 'svelte/store';
import { INITIAL_INDUSTRIES, INITIAL_VACANCIES } from './initialData.js';

// ── Supabase Client Initialization ──
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ── Local Storage Cache (Zero Dummy Data) ──
const STORAGE_PREFIX = 'bhumi_sambhara_jobfair_';

function loadStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('Storage read error:', e);
    return fallback;
  }
}

function saveStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage write error:', e);
  }
}

// ── RFC4122 v4 UUID Generator (Guarantees Valid Postgres UUID) ──
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ── Svelte Reactive Stores ──
// Clean state: no dummy mock applicants or dummy applications
export const currentUser = writable(loadStorage('current_user', null));
export const allUsers = writable(loadStorage('users', []));
export const industries = writable(loadStorage('industries', INITIAL_INDUSTRIES));
export const vacancies = writable(loadStorage('vacancies', INITIAL_VACANCIES));
export const applications = writable(loadStorage('applications', []));
export const standAttendances = writable(loadStorage('stand_attendances', []));

// Auto-save active state to local storage
currentUser.subscribe(v => saveStorage('current_user', v));
allUsers.subscribe(v => saveStorage('users', v));
industries.subscribe(v => saveStorage('industries', v));
vacancies.subscribe(v => saveStorage('vacancies', v));
applications.subscribe(v => saveStorage('applications', v));
standAttendances.subscribe(v => saveStorage('stand_attendances', v));

// ── Synchronize with Remote Supabase Tables on Mount ──
export async function syncFromSupabase() {
  if (!supabase) return;

  try {
    // 1. Fetch live industries
    const { data: indData, error: indErr } = await supabase
      .from('industries')
      .select('*')
      .order('nomor_stand', { ascending: true });
    if (!indErr && indData && indData.length > 0) {
      const mergedInds = INITIAL_INDUSTRIES.map(init => {
        const remote = indData.find(d => d.id === init.id || d.nomor_stand === init.nomor_stand);
        return remote ? { ...init, ...remote } : init;
      });
      for (const r of indData) {
        if (!mergedInds.some(m => m.id === r.id)) {
          mergedInds.push(r);
        }
      }
      industries.set(mergedInds);
    } else {
      industries.set(INITIAL_INDUSTRIES);
    }

    // 2. Fetch live vacancies
    const { data: vacData, error: vacErr } = await supabase
      .from('job_vacancies')
      .select('*')
      .order('created_at', { ascending: true });
    if (!vacErr && vacData && vacData.length > 0) {
      const mergedVacs = [...INITIAL_VACANCIES];
      for (const v of vacData) {
        const idx = mergedVacs.findIndex(mv => mv.id === v.id);
        if (idx >= 0) {
          mergedVacs[idx] = { ...mergedVacs[idx], ...v };
        } else {
          mergedVacs.push(v);
        }
      }
      vacancies.set(mergedVacs);
    } else {
      vacancies.set(INITIAL_VACANCIES);
    }

    // 3. Fetch applications
    const { data: appData, error: appErr } = await supabase
      .from('job_applications')
      .select('*')
      .order('waktu_melamar', { ascending: false });
    if (!appErr && appData) {
      applications.set(appData);
    }

    // 4. Fetch stand attendances
    const { data: attData, error: attErr } = await supabase
      .from('stand_attendances')
      .select('*')
      .order('scanned_at', { ascending: false });
    if (!attErr && attData) {
      standAttendances.set(attData);
    }

    // 5. Fetch profiles
    const { data: profData, error: profErr } = await supabase
      .from('profiles')
      .select('*');
    if (!profErr && profData) {
      allUsers.set(profData);
    }
  } catch (err) {
    console.warn('Supabase fetch sync notice:', err);
  }
}

// ── Official Stand & Admin Credentials Directory ──
export const OFFICIAL_STAND_CREDENTIALS = [
  { stand: 'Stand A1', aliases: ['quickstanda1', 'stand a1', 'standa1', 'a1', 'quick'], email: 'hrd@quick.co.id', password: 'QuickStandA1!', company_id: 'a0000001-0000-0000-0000-000000000001', name: 'HRD CV Karya Hidup Sentosa (Quick)', wa: '0811 2701 3215' },
  { stand: 'Stand A2', aliases: ['dewavestanda2', 'stand a2', 'standa2', 'a2', 'dewave'], email: 'karir@dewavespa.com', password: 'DewaveStandA2!', company_id: 'a0000001-0000-0000-0000-000000000002', name: 'HRD DEWAVE FAMILY MASSAGE & BEAUTY SALON', wa: '0821 3502 4190' },
  { stand: 'Stand A3', aliases: ['hkgoldstanda3', 'stand a3', 'standa3', 'a3', 'hkgold'], email: 'hrd@hkgold.co.id', password: 'HkGoldStandA3!', company_id: 'a0000001-0000-0000-0000-000000000003', name: 'HRD HK GOLD', wa: '0813 4287 8303' },
  { stand: 'Stand A4', aliases: ['atarastanda4', 'stand a4', 'standa4', 'a4', 'atara'], email: 'info@lpkatara.com', password: 'AtaraStandA4!', company_id: 'a0000001-0000-0000-0000-000000000004', name: 'HRD LPK ATARA', wa: '0821 3054 9549' },
  { stand: 'Stand A5', aliases: ['captainsclubstanda5', 'stand a5', 'standa5', 'a5', 'captainsclub'], email: 'career@captainsclubjogja.com', password: 'CaptainsClubStandA5!', company_id: 'a0000001-0000-0000-0000-000000000005', name: 'HRD LPK CAPTAIN\'S CLUB YOGYAKARTA', wa: '0813 2557 8171' },
  { stand: 'Stand A6', aliases: ['platinumstanda6', 'stand a6', 'standa6', 'a6', 'platinum'], email: 'info@lpkplatinum.com', password: 'PlatinumStandA6!', company_id: 'a0000001-0000-0000-0000-000000000006', name: 'HRD LPK PLATINUM MAGELANG', wa: '0819 1767 1025' },
  { stand: 'Stand B1', aliases: ['terataistandb1', 'stand b1', 'standb1', 'b1', 'teratai'], email: 'info@terataigogakuin.com', password: 'TerataiStandB1!', company_id: 'a0000001-0000-0000-0000-000000000007', name: 'HRD LPK TERATAI GOGAKUIN', wa: '0823 2361 0036' },
  { stand: 'Stand B2', aliases: ['anugerahabadistandb2', 'stand b2', 'standb2', 'b2', 'anugerahabadi'], email: 'hrd@anugerahabadi.co.id', password: 'AnugerahAbadiStandB2!', company_id: 'a0000001-0000-0000-0000-000000000008', name: 'HRD PT ANUGERAH ABADI MAGELANG', wa: '0857 1625 7630' },
  { stand: 'Stand B3', aliases: ['xlsmartstandb3', 'stand b3', 'standb3', 'b3', 'xlsmart'], email: 'karir@ksaxlsmart.com', password: 'XlSmartStandB3!', company_id: 'a0000001-0000-0000-0000-000000000009', name: 'HRD PT KSA XL SMART', wa: '0858 0137 8742' },
  { stand: 'Stand B4', aliases: ['pnmstandb4', 'stand b4', 'standb4', 'b4', 'pnm'], email: 'rekrutmen@pnm.co.id', password: 'PnmStandB4!', company_id: 'a0000001-0000-0000-0000-000000000010', name: 'HRD PT PERMODALAN NASIONAL MADANI (PNM)', wa: '0811 8111 2362' },
  { stand: 'Stand B5', aliases: ['gisarastandb5', 'stand b5', 'standb5', 'b5', 'gisara'], email: 'hrd@gisaratantra.co.id', password: 'GisaraStandB5!', company_id: 'a0000001-0000-0000-0000-000000000011', name: 'HRD PT GISARA TANTRA BERKARYA', wa: '0852 6153 9626' },
  { stand: 'Stand B6', aliases: ['alfamidistandb6', 'stand b6', 'standb6', 'b6', 'alfamidi'], email: 'karir@alfamidiku.com', password: 'AlfamidiStandB6!', company_id: 'a0000001-0000-0000-0000-000000000012', name: 'HRD PT MIDI UTAMA INDONESIA (ALFAMIDI)', wa: '0853 3407 0511' },
  { stand: 'Stand C1', aliases: ['shelterstandc1', 'stand c1', 'standc1', 'c1', 'shelter'], email: 'recruitment@shelter.co.id', password: 'ShelterStandC1!', company_id: 'a0000001-0000-0000-0000-000000000013', name: 'HRD PT SHETLER INDONESIA', wa: '0877 6780 1991' },
  { stand: 'Stand C2', aliases: ['clayjayastandc2', 'stand c2', 'standc2', 'c2', 'clayjaya'], email: 'karir@clayjayabersama.com', password: 'ClayJayaStandC2!', company_id: 'a0000001-0000-0000-0000-000000000014', name: 'HRD PT CLAY JAYA BERSAMA (BIG)', wa: '0896 8800 9591' },
  { stand: 'Stand C3', aliases: ['armadajayastandc3', 'stand c3', 'standc3', 'c3', 'armadajaya', 'newarmada'], email: 'hrd@mekararmadajaya.com', password: 'ArmadaJayaStandC3!', company_id: 'a0000001-0000-0000-0000-000000000015', name: 'HRD PT MEKAR ARMADA JAYA', wa: '0853 8562 5000' },
  { stand: 'Stand C4', aliases: ['sindorostandc4', 'stand c4', 'standc4', 'c4', 'sindoro', 'shc'], email: 'info@sindorohotelcollege.com', password: 'SindoroStandC4!', company_id: 'a0000001-0000-0000-0000-000000000016', name: 'HRD SINDORO HOTEL COLLEGE MAGELANG', wa: '0895 4058 27080' },
  { stand: 'Stand C5', aliases: ['uniloastandc5', 'stand c5', 'standc5', 'c5', 'uniloa'], email: 'hrd@uniloa.com', password: 'UniloaStandC5!', company_id: 'a0000001-0000-0000-0000-000000000017', name: 'HRD PT UNILOA ARDIYANTO INVESTAMA', wa: '0813 3756 3335' },
  { stand: 'Stand C6', aliases: ['bmcstandc6', 'stand c6', 'standc6', 'c6', 'bmc'], email: 'info@bmcdharmaditna.com', password: 'BmcStandC6!', company_id: 'a0000001-0000-0000-0000-000000000018', name: 'HRD BMC DHARMADITNA YOGYAKARTA', wa: '0821 4616 0214' },
  { stand: 'Stand D1', aliases: ['indomaretstandd1', 'stand d1', 'standd1', 'd1', 'indomaret'], email: 'karir@indomaret.co.id', password: 'IndomaretStandD1!', company_id: 'a0000001-0000-0000-0000-000000000019', name: 'HRD PT. INDOMARCO PRISMATAMA (INDOMARET)', wa: '0899 9172 359' },
  { stand: 'Stand D2', aliases: ['lidahbuayastandd2', 'stand d2', 'standd2', 'd2', 'lidahbuaya'], email: 'hrd@lidahbuayagroup.com', password: 'LidahBuayaStandD2!', company_id: 'a0000001-0000-0000-0000-000000000020', name: 'HRD LIDAH BUAYA GROUP', wa: '0811 2510 1138' },
  { stand: 'Stand D3', aliases: ['putrateknikstandd3', 'stand d3', 'standd3', 'd3', 'putrateknik'], email: 'karir@putrateknikac.com', password: 'PutraTeknikStandD3!', company_id: 'a0000001-0000-0000-0000-000000000021', name: 'HRD PUTRA TEKNIK AC', wa: '0852 9112 35232' },
  { stand: 'Stand D4', aliases: ['staffincstandd4', 'stand d4', 'standd4', 'd4', 'staffinc'], email: 'careers@staffinc.co', password: 'StaffincStandD4!', company_id: 'a0000001-0000-0000-0000-000000000022', name: 'HRD STAFFINC', wa: '0857 1580 1723' },
  { stand: 'Stand D5', aliases: ['candibangunstandd5', 'stand d5', 'standd5', 'd5', 'candibangun'], email: 'hrd@candibangunpersada.com', password: 'CandiBangunStandD5!', company_id: 'a0000001-0000-0000-0000-000000000023', name: 'HRD PT. CANDI BANGUN PERSADA', wa: '0857 0002 5566' }
];

// ── Authentication Actions (Supabase + Local Sync) ──
export async function loginUser(emailOrUsername, password) {
  const cleanInput = (emailOrUsername || '').trim();
  const cleanLower = cleanInput.toLowerCase();

  // 1. Check Official Stand Credentials (supports username, stand code, or email)
  const standCred = OFFICIAL_STAND_CREDENTIALS.find(sc => 
    sc.email.toLowerCase() === cleanLower ||
    sc.stand.toLowerCase() === cleanLower ||
    sc.aliases.includes(cleanLower)
  );

  if (standCred) {
    if (standCred.password !== password.trim()) {
      return { success: false, error: 'Kata sandi stand tidak cocok.' };
    }

    // Try finding existing profile or build designated stand profile
    const usersList = get(allUsers);
    const existing = usersList.find(u => u.email.toLowerCase() === standCred.email.toLowerCase() || u.company_id === standCred.company_id);
    
    const standUser = existing || {
      id: generateUUID(),
      email: standCred.email,
      nama_lengkap: standCred.name,
      role: 'pemberi_kerja',
      company_id: standCred.company_id,
      qr_code_token: 'BSJ2026-IND-' + standCred.stand.replace(/\s+/g, ''),
      nomor_wa: standCred.wa,
      created_at: new Date().toISOString()
    };

    currentUser.set(standUser);
    return { success: true, user: standUser };
  }

  // 2. Check Admin Official Account
  if (cleanLower === 'admin' || cleanLower === 'bkk@skanisa.sch.id' || cleanLower === 'admin@smkn1magelang.sch.id') {
    if (password === 'SuperAdminBkk2026!' || password === 'AdminPass2026!') {
      const adminUser = {
        id: generateUUID(),
        email: 'bkk@skanisa.sch.id',
        nama_lengkap: 'Panitia Pelaksana BKK & UNTIDAR',
        role: 'admin',
        qr_code_token: 'BSJ2026-ADM-PANITIA',
        nomor_wa: '0812 3456 7890'
      };
      currentUser.set(adminUser);
      return { success: true, user: adminUser };
    } else {
      return { success: false, error: 'Kata sandi akun Admin tidak cocok.' };
    }
  }

  // 3. Authenticate Registered Applicants via Supabase Auth
  if (supabase && cleanLower.includes('@')) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanLower,
        password: password
      });

      if (!error && data?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanLower)
          .single();

        if (prof) {
          currentUser.set(prof);
          return { success: true, user: prof };
        }
      } else if (error) {
        const errMsg = error.message === 'Invalid login credentials'
          ? 'Email atau kata sandi tidak cocok. Jika Anda belum membuat akun, silakan klik "Daftar di sini".'
          : (error.message || 'Gagal masuk akun.');
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.warn('Supabase direct login notice:', err);
    }
  }

  // 4. Check local users list (for applicants registered locally)
  const usersList = get(allUsers);
  const found = usersList.find(u => u.email.toLowerCase() === cleanLower);
  if (found) {
    currentUser.set(found);
    return { success: true, user: found };
  }

  return { 
    success: false, 
    error: 'Akun tidak ditemukan. Masukkan email terdaftar atau kode stand resmi (contoh: HkGoldStandA3).' 
  };
}

export async function registerUser(nama, email, password, role = 'pelamar', companyId = null) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanNama = (nama || '').trim();

  if (!cleanEmail || !password) {
    return { success: false, error: 'Alamat email dan kata sandi wajib diisi.' };
  }

  const usersList = get(allUsers);

  const exists = usersList.find(u => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: 'Alamat email ini sudah terdaftar sebelumnya.' };
  }

  const qrToken = 'BSJ2026-' + (role === 'pelamar' ? 'PEL' : 'IND') + '-' + Math.floor(10000 + Math.random() * 90000);

  const newUser = {
    id: generateUUID(),
    email: cleanEmail,
    nama_lengkap: cleanNama,
    role: role || 'pelamar',
    nomor_wa: '',
    nik_nisn: '',
    pendidikan_terakhir: '',
    asal_sekolah_kampus: '',
    jurusan: '',
    keahlian: [],
    link_cv_portofolio: '',
    ringkasan_profil: '',
    company_id: companyId,
    qr_code_token: qrToken,
    created_at: new Date().toISOString()
  };

  // If Supabase Auth is active
  if (supabase) {
    try {
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            nama_lengkap: cleanNama,
            role: role
          }
        }
      });

      if (!authErr && authData?.user) {
        newUser.user_id = authData.user.id;
        await supabase.from('profiles').insert([newUser]);
      }
    } catch (e) {
      console.warn('Supabase register sync notice:', e);
    }
  }

  allUsers.update(list => [...list, newUser]);
  currentUser.set(newUser);

  return { success: true, user: newUser };
}

export function logoutUser() {
  currentUser.set(null);
  // Clear persistent local user cache immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'current_user');
    } catch (e) {}
  }
  if (supabase) {
    supabase.auth.signOut().catch(() => {});
  }
}

// ── Profile Updates ──
export async function updateProfile(updatedData) {
  const user = get(currentUser);
  if (!user) return { success: false, error: 'User tidak aktif' };

  const merged = { ...user, ...updatedData, updated_at: new Date().toISOString() };
  currentUser.set(merged);
  allUsers.update(list => list.map(u => u.id === merged.id ? merged : u));

  if (supabase) {
    try {
      await supabase.from('profiles').update(updatedData).eq('id', user.id);
    } catch (e) {
      console.warn('Supabase updateProfile notice:', e);
    }
  }
  return { success: true };
}

// ── Company Profile Updates ──
export async function updateCompany(companyId, companyData) {
  industries.update(list => list.map(ind => ind.id === companyId ? { ...ind, ...companyData } : ind));
  if (supabase) {
    try {
      await supabase.from('industries').update(companyData).eq('id', companyId);
    } catch (e) {
      console.warn('Supabase updateCompany notice:', e);
    }
  }
  return { success: true };
}

// ── Job Applications ──
export async function applyJob(vacancyId, applicantId, coverNote = '') {
  const currentApps = get(applications);
  const already = currentApps.find(a => a.vacancy_id === vacancyId && a.applicant_id === applicantId);
  if (already) {
    return { success: false, error: 'Anda sudah melamar posisi ini sebelumnya.' };
  }

  const newApp = {
    id: generateUUID(),
    vacancy_id: vacancyId,
    applicant_id: applicantId,
    status: 'menunggu',
    catatan_industri: coverNote ? `Catatan Pelamar: ${coverNote}` : '',
    waktu_melamar: new Date().toISOString(),
    waktu_verifikasi: null,
    verified_by: null
  };

  applications.update(list => [newApp, ...list]);

  if (supabase) {
    try {
      await supabase.from('job_applications').insert([newApp]);
    } catch (e) {
      console.warn('Supabase applyJob notice:', e);
    }
  }
  return { success: true, application: newApp };
}

export async function updateApplicationStatus(applicationId, newStatus, notes = '', verifiedBy = null) {
  applications.update(list => list.map(app => {
    if (app.id === applicationId) {
      return {
        ...app,
        status: newStatus,
        catatan_industri: notes || app.catatan_industri,
        waktu_verifikasi: new Date().toISOString(),
        verified_by: verifiedBy || app.verified_by
      };
    }
    return app;
  }));

  if (supabase) {
    try {
      await supabase.from('job_applications').update({
        status: newStatus,
        catatan_industri: notes,
        waktu_verifikasi: new Date().toISOString(),
        verified_by: verifiedBy
      }).eq('id', applicationId);
    } catch (e) {
      console.warn('Supabase updateApplicationStatus notice:', e);
    }
  }
  return { success: true };
}

// ── Stand Barcode Attendance Verification ──
export async function recordStandScan(industryId, applicantId, notes = '', scannedBy = null) {
  const attendances = get(standAttendances);
  const existing = attendances.find(a => a.industry_id === industryId && a.applicant_id === applicantId);

  const newRecord = {
    id: existing ? existing.id : generateUUID(),
    industry_id: industryId,
    applicant_id: applicantId,
    scanned_at: new Date().toISOString(),
    scanned_by: scannedBy,
    catatan_petugas: notes || 'Hadir dan diverifikasi fisik di stand booth.'
  };

  if (existing) {
    standAttendances.update(list => list.map(a => a.id === existing.id ? newRecord : a));
  } else {
    standAttendances.update(list => [newRecord, ...list]);
  }

  if (supabase) {
    try {
      await supabase.from('stand_attendances').upsert([newRecord]);
    } catch (e) {
      console.warn('Supabase recordStandScan notice:', e);
    }
  }

  // Find existing applications for this industry
  const currentVacancies = get(vacancies).filter(v => v.industry_id === industryId);
  const vacIds = currentVacancies.map(v => v.id);
  const existingApps = get(applications).filter(a => a.applicant_id === applicantId && vacIds.includes(a.vacancy_id));

  if (existingApps.length > 0) {
    for (const app of existingApps) {
      const nextStatus = app.status === 'menunggu' ? 'terverifikasi_stand' : app.status;
      await updateApplicationStatus(
        app.id,
        nextStatus,
        notes || 'Telah scan barcode dan diverifikasi langsung di stand booth.',
        scannedBy
      );
    }
  } else if (currentVacancies.length > 0) {
    // Walk-in candidate: automatically register application for primary vacancy of this stand
    const primaryVac = currentVacancies[0];
    const walkInApp = {
      id: generateUUID(),
      vacancy_id: primaryVac.id,
      applicant_id: applicantId,
      status: 'terverifikasi_stand',
      catatan_industri: notes || 'Pendaftaran & Verifikasi On-the-spot di Stand ' + (primaryVac.lokasi || ''),
      waktu_melamar: new Date().toISOString(),
      waktu_verifikasi: new Date().toISOString(),
      verified_by: scannedBy
    };
    applications.update(list => [walkInApp, ...list]);
    if (supabase) {
      try {
        await supabase.from('job_applications').insert([walkInApp]);
      } catch (e) {
        console.warn('Supabase walk-in app notice:', e);
      }
    }
  }

  return { success: true, record: newRecord };
}

// ── Live Applicant Lookup (Local + Supabase Cloud Fallback) ──
export async function lookupApplicant(tokenOrId) {
  const query = tokenOrId.trim();
  const localList = get(allUsers);
  let found = localList.find(u => 
    u.qr_code_token === query || 
    u.nik_nisn === query || 
    u.id === query ||
    u.email.toLowerCase() === query.toLowerCase()
  );

  if (found) return found;

  // Query Supabase directly
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`qr_code_token.eq.${query},nik_nisn.eq.${query},id.eq.${query},email.eq.${query}`)
        .limit(1);

      if (!error && data && data.length > 0) {
        const remoteUser = data[0];
        allUsers.update(list => {
          if (!list.some(u => u.id === remoteUser.id)) {
            return [...list, remoteUser];
          }
          return list;
        });
        return remoteUser;
      }
    } catch (e) {
      console.warn('Supabase lookup applicant notice:', e);
    }
  }

  return null;
}
