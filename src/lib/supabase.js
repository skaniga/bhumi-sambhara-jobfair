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
      industries.set(indData);
    }

    // 2. Fetch live vacancies
    const { data: vacData, error: vacErr } = await supabase
      .from('job_vacancies')
      .select('*')
      .order('created_at', { ascending: true });
    if (!vacErr && vacData && vacData.length > 0) {
      vacancies.set(vacData);
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

// ── Authentication Actions (Supabase + Local Sync) ──
export async function loginUser(email, password) {
  const cleanEmail = email.trim().toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (!error && data?.user) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (prof) {
          currentUser.set(prof);
          return { success: true, user: prof };
        }
      }
    } catch (err) {
      console.warn('Supabase direct login notice:', err);
    }
  }

  // Check local users list
  const usersList = get(allUsers);
  const found = usersList.find(u => u.email.toLowerCase() === cleanEmail);
  if (found) {
    currentUser.set(found);
    return { success: true, user: found };
  }

  return { 
    success: false, 
    error: 'Akun dengan email ini belum terdaftar. Silakan lakukan pendaftaran baru terlebih dahulu.' 
  };
}

export async function registerUser(nama, email, password, role = 'pelamar', companyId = null) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanNama = nama.trim();
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
