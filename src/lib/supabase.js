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

// ── Local Storage Cache (Versioned to bust stale data) ──
const STORAGE_VERSION = 'v6';
const STORAGE_PREFIX = `bhumi_sambhara_jobfair_${STORAGE_VERSION}_`;

// Auto-clean obsolete pre-v4 cache keys
if (typeof window !== 'undefined') {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('bhumi_sambhara_jobfair_') && !k.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // Ignore storage cleanup issues
  }
}

function loadStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);

    // If stored array is smaller than the official initial catalog, prefer the official full catalog!
    if (key === 'industries' && Array.isArray(parsed) && parsed.length < INITIAL_INDUSTRIES.length) {
      return fallback;
    }
    if (key === 'vacancies' && Array.isArray(parsed) && parsed.length < INITIAL_VACANCIES.length) {
      return fallback;
    }

    return parsed;
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
    const parseStandNum = (s) => {
      const match = (s || '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 999;
    };

    // 1. Fetch live industries
    const { data: indData, error: indErr } = await supabase
      .from('industries')
      .select('*');
    if (!indErr && indData && indData.length > 0) {
      const mergedInds = INITIAL_INDUSTRIES.map(init => {
        const remote = indData.find(d => d.id === init.id);
        if (!remote) return init;
        // Map Supabase column names → frontend field names
        return {
          ...init,
          ...remote,
          alamat:  remote.alamat_kantor  ?? init.alamat,
          email:   remote.email_resmi    ?? init.email,
          logo_url: remote.logo_url      ?? null
        };
      });
      for (const r of indData) {
        if (!mergedInds.some(m => m.id === r.id)) {
          mergedInds.push({
            ...r,
            alamat: r.alamat_kantor ?? '',
            email:  r.email_resmi   ?? ''
          });
        }
      }
      mergedInds.sort((a, b) => parseStandNum(a.nomor_stand) - parseStandNum(b.nomor_stand));
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
      // Which industries already have at least one vacancy in Supabase?
      const indIdsInDb = new Set(vacData.map(v => v.industry_id));

      // Start from INITIAL_VACANCIES only for industries NOT yet in Supabase
      const mergedVacs = INITIAL_VACANCIES.filter(iv => !indIdsInDb.has(iv.industry_id));

      for (const v of vacData) {
        const initMatch = INITIAL_VACANCIES.find(iv => iv.id === v.id);
        mergedVacs.push({
          ...(initMatch || {}),
          ...v,
          gaji:      v.gaji      || v.gaji_estimasi      || (initMatch?.gaji)  || 'Ditanyakan pada saat wawancara',
          kuota:     v.kuota     || v.kuota_penerimaan   || (initMatch?.kuota) || 1,
          lokasi:    v.lokasi    || v.lokasi_penempatan   || (initMatch?.lokasi)|| 'Magelang',
          pendidikan: v.pendidikan || (initMatch?.pendidikan) || 'Umum'
        });
      }
      vacancies.set(mergedVacs);
    } else {
      vacancies.set(INITIAL_VACANCIES);
    }

    // 3. Fetch applications (Scoped by role for high-concurrency efficiency & privacy)
    const curUser = get(currentUser);
    if (curUser) {
      // Verify registered pelamar profile still exists (handles remote deletion by Admin BKK)
      if (curUser.role === 'pelamar') {
        const { data: selfProf, error: selfErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', curUser.id)
          .maybeSingle();

        if (!selfErr && !selfProf) {
          logoutUser();
          return;
        }
      }

      let appQuery = supabase.from('job_applications').select('*');
      if (curUser.role === 'pelamar') {
        appQuery = appQuery.eq('applicant_id', curUser.id);
      }
      const { data: appData, error: appErr } = await appQuery.order('waktu_melamar', { ascending: false });
      if (!appErr && appData) {
        if (curUser.role === 'pelamar') {
          applications.update(list => {
            const others = list.filter(a => a.applicant_id !== curUser.id);
            return [...appData, ...others];
          });
        } else {
          applications.set(appData);
        }
      }

      // 4. Fetch stand attendances
      let attQuery = supabase.from('stand_attendances').select('*');
      if (curUser.role === 'pelamar') {
        attQuery = attQuery.eq('applicant_id', curUser.id);
      } else if (curUser.role === 'pemberi_kerja' && curUser.company_id) {
        attQuery = attQuery.eq('industry_id', curUser.company_id);
      }
      const { data: attData, error: attErr } = await attQuery.order('scanned_at', { ascending: false });
      if (!attErr && attData) {
        standAttendances.set(attData);
      }

      // 5. Fetch profiles (Only admin & stand operators need the full profile directory)
      if (curUser.role === 'admin' || curUser.role === 'pemberi_kerja') {
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('*');
        if (!profErr && profData) {
          allUsers.set(profData);
        }
      }
    }
  } catch (err) {
    console.warn('Supabase fetch sync notice:', err);
  }
}

// ── Official Stand & Admin Credentials Directory ──
export const OFFICIAL_STAND_CREDENTIALS = [
  { stand: 'Stand 1', legacyStand: 'Stand D2', aliases: ['lidahbuayastand1', 'stand 1', 'stand1', '1', 'lidahbuaya', 'lidah buaya', 'pt lidah buaya', 'lidah buaya group', 'lidahbuayagroup', 'stand d2', 'standd2', 'd2', 'lidahbuayastandd2'], email: 'hrd@lidahbuayagroup.com', password: 'LidahBuayaStand1!', passwords: ['LidahBuayaStand1!', 'LidahBuayaStandD2!'], company_id: 'a0000001-0000-0000-0000-000000000020', name: 'HRD LIDAH BUAYA GROUP', wa: '0811 2510 1138' },
  { stand: 'Stand 2', legacyStand: 'Stand A2', aliases: ['dewavestand2', 'stand 2', 'stand2', '2', 'dewave', 'dewave spa', 'de wave', 'stand a2', 'standa2', 'a2', 'dewavestanda2'], email: 'karir@dewavespa.com', password: 'DewaveStand2!', passwords: ['DewaveStand2!', 'DewaveStandA2!'], company_id: 'a0000001-0000-0000-0000-000000000002', name: 'HRD DEWAVE FAMILY MASSAGE & BEAUTY SALON', wa: '0821 3502 4190' },
  { stand: 'Stand 3', legacyStand: 'Stand B1', aliases: ['terataistand3', 'stand 3', 'stand3', '3', 'teratai', 'lpk teratai', 'teratai gogakuin', 'lpk teratai gogakuin', 'stand b1', 'standb1', 'b1', 'terataistandb1'], email: 'info@terataigogakuin.com', password: 'TerataiStand3!', passwords: ['TerataiStand3!', 'TerataiStandB1!'], company_id: 'a0000001-0000-0000-0000-000000000007', name: 'HRD LPK TERATAI GOGAKUIN', wa: '0823 2361 0036' },
  { stand: 'Stand 4', legacyStand: 'Stand A3', aliases: ['hkgoldstand4', 'stand 4', 'stand4', '4', 'hkgold', 'hk gold', 'toko emas hk', 'stand a3', 'standa3', 'a3', 'hkgoldstanda3'], email: 'hrd@hkgold.co.id', password: 'HkGoldStand4!', passwords: ['HkGoldStand4!', 'HkGoldStandA3!'], company_id: 'a0000001-0000-0000-0000-000000000003', name: 'HRD HK GOLD', wa: '0813 4287 8303' },
  { stand: 'Stand 5', legacyStand: 'Stand B6', aliases: ['alfamidistand5', 'stand 5', 'stand5', '5', 'alfamidi', 'pt alfamidi', 'ptalfamidi', 'pt midi utama', 'pt midi utama indonesia', 'alfamidiku', 'stand b6', 'standb6', 'b6', 'alfamidistandb6'], email: 'karir@alfamidiku.com', password: 'AlfamidiStand5!', passwords: ['AlfamidiStand5!', 'AlfamidiStandB6!'], company_id: 'a0000001-0000-0000-0000-000000000012', name: 'HRD PT MIDI UTAMA INDONESIA (ALFAMIDI)', wa: '0853 3407 0511' },
  { stand: 'Stand 6', legacyStand: 'Stand C2', aliases: ['clayjayastand6', 'stand 6', 'stand6', '6', 'clayjaya', 'clay jaya', 'pt clay jaya', 'pt clay jaya bersama', 'big', 'stand c2', 'standc2', 'c2', 'clayjayastandc2'], email: 'karir@clayjayabersama.com', password: 'ClayJayaStand6!', passwords: ['ClayJayaStand6!', 'ClayJayaStandC2!'], company_id: 'a0000001-0000-0000-0000-000000000014', name: 'HRD PT CLAY JAYA BERSAMA (BIG)', wa: '0896 8800 9591' },
  { stand: 'Stand 7', legacyStand: 'Stand B5', aliases: ['gisarastand7', 'stand 7', 'stand7', '7', 'gisara', 'pt gisara', 'gisara tantra', 'stand b5', 'standb5', 'b5', 'gisarastandb5'], email: 'hrd@gisaratantra.co.id', password: 'GisaraStand7!', passwords: ['GisaraStand7!', 'GisaraStandB5!'], company_id: 'a0000001-0000-0000-0000-000000000011', name: 'HRD PT GISARA TANTRA BERKARYA', wa: '0852 6153 9626' },
  { stand: 'Stand 8', legacyStand: 'Stand B2', aliases: ['anugerahabadistand8', 'stand 8', 'stand8', '8', 'anugerahabadi', 'anugerah abadi', 'pt anugerah abadi', 'stand b2', 'standb2', 'b2', 'anugerahabadistandb2'], email: 'hrd@anugerahabadi.co.id', password: 'AnugerahAbadiStand8!', passwords: ['AnugerahAbadiStand8!', 'AnugerahAbadiStandB2!'], company_id: 'a0000001-0000-0000-0000-000000000008', name: 'HRD PT ANUGERAH ABADI MAGELANG', wa: '0857 1625 7630' },
  { stand: 'Stand 9', legacyStand: 'Stand A4', aliases: ['atarastand9', 'stand 9', 'stand9', '9', 'atara', 'akatara', 'lpk atara', 'lpk akatara', 'lpkatara', 'lpkakatara', 'stand a4', 'standa4', 'a4', 'atarastanda4'], email: 'info@lpkatara.com', password: 'AtaraStand9!', passwords: ['AtaraStand9!', 'AtaraStandA4!'], company_id: 'a0000001-0000-0000-0000-000000000004', name: 'HRD LPK ATARA', wa: '0821 3054 9549' },
  { stand: 'Stand 10', legacyStand: 'Stand B3', aliases: ['xlsmartstand10', 'stand 10', 'stand10', '10', 'xlsmart', 'xl smart', 'pt ksa', 'pt ksa xl smart', 'stand b3', 'standb3', 'b3', 'xlsmartstandb3'], email: 'karir@ksaxlsmart.com', password: 'XlSmartStand10!', passwords: ['XlSmartStand10!', 'XlSmartStandB3!'], company_id: 'a0000001-0000-0000-0000-000000000009', name: 'HRD PT KSA XL SMART', wa: '0858 0137 8742' },
  { stand: 'Stand 11', legacyStand: 'Stand D4', aliases: ['staffincstand11', 'stand 11', 'stand11', '11', 'staffinc', 'pt staffinc', 'stand d4', 'standd4', 'd4', 'staffincstandd4'], email: 'careers@staffinc.co', password: 'StaffincStand11!', passwords: ['StaffincStand11!', 'StaffincStandD4!'], company_id: 'a0000001-0000-0000-0000-000000000022', name: 'HRD STAFFINC', wa: '0857 1580 1723' },
  { stand: 'Stand 12', legacyStand: 'Stand C1', aliases: ['shelterstand12', 'stand 12', 'stand12', '12', 'shelter', 'shetler', 'pt shelter', 'pt shetler', 'stand c1', 'standc1', 'c1', 'shelterstandc1'], email: 'recruitment@shelter.co.id', password: 'ShelterStand12!', passwords: ['ShelterStand12!', 'ShelterStandC1!'], company_id: 'a0000001-0000-0000-0000-000000000013', name: 'HRD PT SHETLER INDONESIA', wa: '0877 6780 1991' },
  { stand: 'Stand 13', legacyStand: 'Stand C3', aliases: ['armadajayastand13', 'stand 13', 'stand13', '13', 'armadajaya', 'armada jaya', 'mekar armada jaya', 'new armada', 'stand c3', 'standc3', 'c3', 'armadajayastandc3'], email: 'hrd@mekararmadajaya.com', password: 'ArmadaJayaStand13!', passwords: ['ArmadaJayaStand13!', 'ArmadaJayaStandC3!'], company_id: 'a0000001-0000-0000-0000-000000000015', name: 'HRD PT MEKAR ARMADA JAYA', wa: '0853 8562 5000' },
  { stand: 'Stand 14', legacyStand: 'Stand C6', aliases: ['bmcstand14', 'stand 14', 'stand14', '14', 'bmc', 'bmc dharmaditna', 'stand c6', 'standc6', 'c6', 'bmcstandc6'], email: 'info@bmcdharmaditna.com', password: 'BmcStand14!', passwords: ['BmcStand14!', 'BmcStandC6!'], company_id: 'a0000001-0000-0000-0000-000000000018', name: 'HRD BMC DHARMADITNA YOGYAKARTA', wa: '0821 4616 0214' },
  { stand: 'Stand 15', legacyStand: 'Stand A6', aliases: ['platinumstand15', 'stand 15', 'stand15', '15', 'platinum', 'lpk platinum', 'stand a6', 'standa6', 'a6', 'platinumstanda6'], email: 'info@lpkplatinum.com', password: 'PlatinumStand15!', passwords: ['PlatinumStand15!', 'PlatinumStandA6!'], company_id: 'a0000001-0000-0000-0000-000000000006', name: 'HRD LPK PLATINUM MAGELANG', wa: '0819 1767 1025' },
  { stand: 'Stand 16', legacyStand: 'Stand D3', aliases: ['putrateknikstand16', 'stand 16', 'stand16', '16', 'putrateknik', 'putra teknik', 'putra teknik ac', 'stand d3', 'standd3', 'd3', 'putrateknikstandd3'], email: 'karir@putrateknikac.com', password: 'PutraTeknikStand16!', passwords: ['PutraTeknikStand16!', 'PutraTeknikStandD3!'], company_id: 'a0000001-0000-0000-0000-000000000021', name: 'HRD PUTRA TEKNIK AC', wa: '0852 9112 35232' },
  { stand: 'Stand 17', legacyStand: 'Stand C5', aliases: ['uniloastand17', 'stand 17', 'stand17', '17', 'uniloa', 'pt uniloa', 'stand c5', 'standc5', 'c5', 'uniloastandc5'], email: 'hrd@uniloa.com', password: 'UniloaStand17!', passwords: ['UniloaStand17!', 'UniloaStandC5!'], company_id: 'a0000001-0000-0000-0000-000000000017', name: 'HRD PT UNILOA ARDIYANTO INVESTAMA', wa: '0813 3756 3335' },
  { stand: 'Stand 18', legacyStand: 'Stand C4', aliases: ['sindorostand18', 'stand 18', 'stand18', '18', 'sindoro', 'shc', 'sindoro hotel college', 'stand c4', 'standc4', 'c4', 'sindorostandc4'], email: 'info@sindorohotelcollege.com', password: 'SindoroStand18!', passwords: ['SindoroStand18!', 'SindoroStandC4!'], company_id: 'a0000001-0000-0000-0000-000000000016', name: 'HRD SINDORO HOTEL COLLEGE MAGELANG', wa: '0895 4058 27080' },
  { stand: 'Stand 19', legacyStand: 'Stand B4', aliases: ['pnmstand19', 'stand 19', 'stand19', '19', 'pnm', 'pt pnm', 'permodalan nasional madani', 'stand b4', 'standb4', 'b4', 'pnmstandb4'], email: 'rekrutmen@pnm.co.id', password: 'PnmStand19!', passwords: ['PnmStand19!', 'PnmStandB4!'], company_id: 'a0000001-0000-0000-0000-000000000010', name: 'HRD PT PERMODALAN NASIONAL MADANI (PNM)', wa: '0811 8111 2362' },
  { stand: 'Stand 20', legacyStand: 'Stand A1', aliases: ['quickstand20', 'stand 20', 'stand20', '20', 'quick', 'cv quick', 'karya hidup sentosa', 'stand a1', 'standa1', 'a1', 'quickstanda1'], email: 'hrd@quick.co.id', password: 'QuickStand20!', passwords: ['QuickStand20!', 'QuickStandA1!'], company_id: 'a0000001-0000-0000-0000-000000000001', name: 'HRD CV Karya Hidup Sentosa (Quick)', wa: '0811 2701 3215' },
  { stand: 'Stand 21', legacyStand: 'Stand A5', aliases: ['captainsclubstand21', 'stand 21', 'stand21', '21', 'captainsclub', 'captains club', 'lpk captains club', 'stand a5', 'standa5', 'a5', 'captainsclubstanda5'], email: 'career@captainsclubjogja.com', password: 'CaptainsClubStand21!', passwords: ['CaptainsClubStand21!', 'CaptainsClubStandA5!'], company_id: 'a0000001-0000-0000-0000-000000000005', name: 'HRD LPK CAPTAIN\'S CLUB YOGYAKARTA', wa: '0813 2557 8171' },
  { stand: 'Stand 22', legacyStand: 'Stand D1', aliases: ['indomaretstand22', 'stand 22', 'stand22', '22', 'indomaret', 'pt indomarco prismatama', 'stand d1', 'standd1', 'd1', 'indomaretstandd1'], email: 'karir@indomaret.co.id', password: 'IndomaretStand22!', passwords: ['IndomaretStand22!', 'IndomaretStandD1!'], company_id: 'a0000001-0000-0000-0000-000000000019', name: 'HRD PT. INDOMARCO PRISMATAMA (INDOMARET)', wa: '0899 9172 359' },
  { stand: 'Stand 23', legacyStand: 'Stand D5', aliases: ['candibangunstand23', 'stand 23', 'stand23', '23', 'candibangun', 'candi bangun', 'pt candi bangun persada', 'stand d5', 'standd5', 'd5', 'candibangunstandd5'], email: 'hrd@candibangunpersada.com', password: 'CandiBangunStand23!', passwords: ['CandiBangunStand23!', 'CandiBangunStandD5!'], company_id: 'a0000001-0000-0000-0000-000000000023', name: 'HRD PT. CANDI BANGUN PERSADA', wa: '0857 0002 5566' }
];

// ── Authentication Actions (Supabase + Local Sync) ──
export async function loginUser(emailOrUsername, password) {
  const cleanInput = (emailOrUsername || '').trim();
  const cleanLower = cleanInput.toLowerCase();
  const cleanAlphaNum = cleanLower.replace(/[^a-z0-9]/g, '');

  // 1. Check Official Stand Credentials (supports username, stand code, email, with/without spaces/dashes)
  const standCred = OFFICIAL_STAND_CREDENTIALS.find(sc => 
    sc.email.toLowerCase() === cleanLower ||
    sc.stand.toLowerCase() === cleanLower ||
    sc.stand.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlphaNum ||
    sc.aliases.some(a => a.toLowerCase() === cleanLower || a.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlphaNum)
  );

  if (standCred) {
    const isPassMatch = standCred.password === password.trim() || 
      (standCred.passwords && standCred.passwords.includes(password.trim()));
    if (!isPassMatch) {
      return { success: false, error: 'Kata sandi stand tidak cocok.' };
    }

    // Try finding existing stand profile or build designated stand profile
    const usersList = get(allUsers);
    const existing = usersList.find(u =>
      u.role === 'pemberi_kerja' &&
      ((u.email || '').toLowerCase() === standCred.email.toLowerCase() || u.company_id === standCred.company_id)
    );
    
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
    // Sync fresh data (applications, profiles) now that user is authenticated
    syncFromSupabase().catch(() => {});
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
      syncFromSupabase().catch(() => {});
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
          syncFromSupabase().catch(() => {});
          return { success: true, user: prof };
        }
        // Auth user exists, but profile was removed by Admin BKK
        supabase.auth.signOut().catch(() => {});
        return {
          success: false,
          error: 'Akun ini telah dihapus oleh panitia atau profilnya belum tersedia. Silakan daftar ulang atau hubungi panitia.'
        };
      } else if (error) {
        // If error is "Email not confirmed", Supabase ALREADY confirmed the password is valid!
        // We log the applicant in using their profile so on-site applicants are never locked out at the event.
        const isEmailNotConfirmed = 
          (error.message && error.message.toLowerCase().includes('email not confirmed')) ||
          error.code === 'email_not_confirmed';

        if (isEmailNotConfirmed) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', cleanLower)
            .single();

          if (prof) {
            currentUser.set(prof);
            syncFromSupabase().catch(() => {});
            return { success: true, user: prof };
          }
          return {
            success: false,
            error: 'Akun ini telah dihapus oleh panitia atau profilnya belum tersedia. Silakan daftar ulang atau hubungi panitia.'
          };
        }

        const errMsg = error.message === 'Invalid login credentials'
          ? 'Email atau kata sandi tidak cocok. Jika Anda belum membuat akun, silakan klik "Daftar di sini".'
          : (error.message || 'Gagal masuk akun.');
        return { success: false, error: errMsg };
      }
    } catch (err) {
      console.warn('Supabase direct login notice:', err);
      return { success: false, error: 'Gagal menghubungi server login. Periksa koneksi internet Anda.' };
    }
  }

  // 4. Local offline/test fallback ONLY when Supabase is not configured
  if (!supabase) {
    const usersList = get(allUsers);
    const found = usersList.find(u => (u.email || '').toLowerCase() === cleanLower);
    if (found) {
      currentUser.set(found);
      return { success: true, user: found };
    }
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Format alamat email tidak valid. Contoh: nama@gmail.com' };
  }

  if (password.length < 6) {
    return { success: false, error: 'Kata sandi minimal 6 karakter.' };
  }

  const usersList = get(allUsers);

  const exists = usersList.find(u => (u.email || '').toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: 'Alamat email ini sudah terdaftar sebelumnya.' };
  }

  const makeQrToken = () =>
    'BSJ2026-' + (role === 'pelamar' ? 'PEL' : 'IND') + '-' +
    Math.random().toString(36).slice(2, 8).toUpperCase();

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
    qr_code_token: makeQrToken(),
    created_at: new Date().toISOString()
  };

  async function insertProfileWithRetry(userObj) {
    let { error: profErr } = await supabase.from('profiles').insert([userObj]);
    if (profErr && profErr.code === '23505' && (profErr.message || '').includes('qr_code_token')) {
      userObj.qr_code_token = makeQrToken();
      ({ error: profErr } = await supabase.from('profiles').insert([userObj]));
    }
    return profErr;
  }

  // If Supabase Auth is active
  if (supabase) {
    try {
      const redirectOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bme.smknegeri1magelang.sch.id';
      const { data: authData, error: authErr } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectOrigin,
          data: {
            nama_lengkap: cleanNama,
            role: role
          }
        }
      });

      if (!authErr && authData?.user) {
        newUser.user_id = authData.user.id;
        const profErr = await insertProfileWithRetry(newUser);
        if (profErr) {
          if (profErr.code === '23505' && (profErr.message || '').includes('email')) {
            return { success: false, error: 'Alamat email ini sudah terdaftar sebelumnya. Silakan langsung masuk.' };
          }
          return { success: false, error: `Gagal menyimpan profil pendaftaran: ${profErr.message}` };
        }
      } else if (authErr) {
        const msg = (authErr.message || '').toLowerCase();
        if (msg.includes('already registered') || msg.includes('already exists')) {
          const { data: existingProf } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', cleanEmail)
            .maybeSingle();

          if (existingProf) {
            return { success: false, error: 'Alamat email ini sudah terdaftar sebelumnya. Silakan langsung masuk.' };
          }

          // Profile was previously deleted by Admin BKK; allow re-creation if password matches auth.users
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });
          if (!signInErr && signInData?.user) {
            newUser.user_id = signInData.user.id;
            const profErr = await insertProfileWithRetry(newUser);
            if (profErr) {
              return { success: false, error: `Gagal membuat ulang profil: ${profErr.message}` };
            }
          } else {
            return {
              success: false,
              error: 'Email ini pernah terdaftar sebelumnya. Gunakan kata sandi lama Anda untuk mendaftar ulang atau gunakan alamat email lain.'
            };
          }
        } else if (msg.includes('rate limit')) {
          return {
            success: false,
            error: 'Terlalu banyak permintaan pendaftaran dari jaringan ini. Silakan tunggu 1 menit lalu coba lagi.'
          };
        } else {
          return {
            success: false,
            error: authErr.message || 'Gagal mendaftarkan akun. Periksa data dan koneksi internet Anda.'
          };
        }
      } else {
        return { success: false, error: 'Gagal membuat akun di server autentikasi. Silakan coba lagi.' };
      }
    } catch (e) {
      console.warn('Supabase register sync notice:', e);
      return { success: false, error: e.message || 'Koneksi ke server pendaftaran gagal. Coba lagi.' };
    }
  }

  allUsers.update(list => [...list, newUser]);
  currentUser.set(newUser);

  return { success: true, user: newUser };
}

export function logoutUser() {
  currentUser.set(null);
  // Clear persistent local user cache & saved tab state immediately
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_PREFIX + 'current_user');
      sessionStorage.removeItem('bhumi_active_tab');
      sessionStorage.removeItem('bhumi_company_subtab');
      sessionStorage.removeItem('bhumi_admin_subtab');
    } catch (e) {}
  }
  if (supabase) {
    // Wipe cached PII on shared booth devices when logging out in production
    allUsers.set([]);
    applications.set([]);
    standAttendances.set([]);
    supabase.auth.signOut().catch(() => {});
  }
}

export async function resetUserPassword(emailOrUsername) {
  const cleanInput = (emailOrUsername || '').trim();
  const cleanLower = cleanInput.toLowerCase();
  const cleanAlphaNum = cleanLower.replace(/[^a-z0-9]/g, '');

  if (!cleanInput) {
    return { success: false, error: 'Mohon masukkan email atau username akun Anda.' };
  }

  // 1. Check if it's an official Stand Account
  const isStand = OFFICIAL_STAND_CREDENTIALS.some(sc => 
    sc.email.toLowerCase() === cleanLower ||
    sc.stand.toLowerCase() === cleanLower ||
    sc.stand.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlphaNum ||
    sc.aliases.some(a => a.toLowerCase() === cleanLower || a.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlphaNum)
  );

  if (isStand) {
    return {
      success: true,
      message: 'Akun Stand Booth resmi terhubung ke sistem panitia. Kata sandi stand tercantum pada Buku Panduan Pemberi Kerja. Anda juga dapat menghubungi Panitia BKK / UNTIDAR di meja sekretariat.'
    };
  }

  // 2. Check if it's admin
  if (cleanLower === 'admin' || cleanLower.includes('bkk@skanisa')) {
    return {
      success: true,
      message: 'Akun Administrator Panitia. Silakan hubungi tim koordinator BKK Skanisa / UNTIDAR untuk pemulihan akses pengawas.'
    };
  }

  // 3. For registered jobseeker email, invoke Supabase Auth reset
  if (supabase && cleanLower.includes('@')) {
    try {
      const redirectTarget = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
        ? window.location.origin
        : 'https://bme.smknegeri1magelang.sch.id';

      const { data, error } = await supabase.auth.resetPasswordForEmail(cleanLower, {
        redirectTo: redirectTarget
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { 
        success: true, 
        message: 'Tautan pemulihan kata sandi telah dikirim ke email Anda. Silakan periksa kotak masuk atau folder spam.' 
      };
    } catch (e) {
      console.warn('Supabase resetPassword error:', e);
    }
  }

  return {
    success: true,
    message: 'Permintaan pemulihan telah dicatat. Silakan cek email Anda atau lakukan pendaftaran baru jika belum memiliki akun terverifikasi.'
  };
}

export async function updateUserPassword(newPassword) {
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
  }
  if (!supabase) {
    return { success: true };
  }
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message || 'Gagal memperbarui kata sandi.' };
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

// ── Admin: Delete Registered User Account ──
export async function deleteUserAccount(userId) {
  const actor = get(currentUser);
  if (!actor || actor.role !== 'admin') {
    return { success: false, error: 'Hanya akun Admin / Panitia BKK yang dapat menghapus akun.' };
  }
  if (!userId) {
    return { success: false, error: 'ID akun tidak valid.' };
  }
  const targetUser = get(allUsers).find(u => u.id === userId);
  const isSameEmail = Boolean(
    actor.email && targetUser?.email && actor.email.toLowerCase() === targetUser.email.toLowerCase()
  );
  if (actor.id === userId || isSameEmail) {
    return { success: false, error: 'Tidak dapat menghapus akun Admin yang sedang aktif digunakan.' };
  }

  if (supabase) {
    try {
      // Check whether profile currently exists in Supabase
      const { data: existingRow } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // Clear verifier/scanner references first to avoid FK constraint errors on HRD/Admin accounts
      await supabase.from('job_applications').update({ verified_by: null }).eq('verified_by', userId);
      await supabase.from('stand_attendances').update({ scanned_by: null }).eq('scanned_by', userId);

      // Clean up dependent applicant records defensively before deleting profile
      await supabase.from('job_applications').delete().eq('applicant_id', userId);
      await supabase.from('stand_attendances').delete().eq('applicant_id', userId);

      const { data: deletedRows, error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)
        .select('id');

      if (error) {
        console.warn('Supabase deleteUserAccount error:', error.message);
        return { success: false, error: `Gagal menghapus akun di server: ${error.message}` };
      }

      if (existingRow && (!deletedRows || deletedRows.length === 0)) {
        return {
          success: false,
          error: 'Penghapusan akun ditolak oleh kebijakan RLS Supabase pada tabel profiles. Jalankan policy DELETE "Allow profile deletes" di Supabase SQL Editor.'
        };
      }
    } catch (e) {
      console.warn('Supabase deleteUserAccount notice:', e);
      return { success: false, error: e.message || 'Gagal menghapus akun dari server.' };
    }
  }

  // Update local reactive stores & localStorage cache
  allUsers.update(list => list.filter(u => u.id !== userId));
  applications.update(list => list.filter(a => a.applicant_id !== userId));
  standAttendances.update(list => list.filter(s => s.applicant_id !== userId));

  return { success: true };
}

// ── Lightweight Sync for Applicant Live Notifications ──
export async function syncApplicantApplications(applicantId) {
  if (!supabase || !applicantId) return [];
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('applicant_id', applicantId)
      .order('waktu_melamar', { ascending: false });

    if (!error && data) {
      applications.update(list => {
        const others = list.filter(a => a.applicant_id !== applicantId);
        return [...data, ...others];
      });
      return data;
    }
  } catch (e) {
    console.warn('syncApplicantApplications notice:', e);
  }
  return [];
}

// ── Company Profile Updates ──
export async function updateCompany(companyId, companyData) {
  const normalizedData = { ...companyData };
  if (companyData.alamat_kantor !== undefined && companyData.alamat === undefined) {
    normalizedData.alamat = companyData.alamat_kantor;
  } else if (companyData.alamat !== undefined && companyData.alamat_kantor === undefined) {
    normalizedData.alamat_kantor = companyData.alamat;
  }
  if (companyData.email_resmi !== undefined && companyData.email === undefined) {
    normalizedData.email = companyData.email_resmi;
  } else if (companyData.email !== undefined && companyData.email_resmi === undefined) {
    normalizedData.email_resmi = companyData.email;
  }

  // Update local store immediately (optimistic)
  industries.update(list => list.map(ind => ind.id === companyId ? { ...ind, ...normalizedData } : ind));

  if (supabase) {
    try {
      // Build a safe payload with correct Supabase column names
      const payload = {};
      if (companyData.nama_perusahaan  !== undefined) payload.nama_perusahaan  = companyData.nama_perusahaan;
      if (companyData.bidang_industri  !== undefined) payload.bidang_industri  = companyData.bidang_industri;
      if (companyData.nomor_stand      !== undefined) payload.nomor_stand      = companyData.nomor_stand;
      if (companyData.deskripsi        !== undefined) payload.deskripsi        = companyData.deskripsi;
      if (companyData.kontak_pic       !== undefined) payload.kontak_pic       = companyData.kontak_pic;
      if (companyData.website          !== undefined) payload.website          = companyData.website;
      // logo_url: allow explicit null to clear logo
      if ('logo_url' in companyData)                 payload.logo_url         = companyData.logo_url;
      // Map frontend aliases → actual Supabase column names
      if (companyData.alamat_kantor    !== undefined) payload.alamat_kantor    = companyData.alamat_kantor;
      else if (companyData.alamat      !== undefined) payload.alamat_kantor    = companyData.alamat;
      if (companyData.email_resmi      !== undefined) payload.email_resmi      = companyData.email_resmi;
      else if (companyData.email       !== undefined) payload.email_resmi      = companyData.email;

      const { error } = await supabase.from('industries').update(payload).eq('id', companyId);
      if (error) {
        console.warn('Supabase updateCompany error:', error.message);
        return { success: false, error: error.message };
      }
    } catch (e) {
      console.warn('Supabase updateCompany notice:', e);
      return { success: false, error: e.message || 'Gagal menyinkronkan data perusahaan.' };
    }
  }
  return { success: true };
}

// ── Active Job Vacancies Management ──
export async function updateVacancy(vacancyId, vacancyData) {
  vacancies.update(list => list.map(v => v.id === vacancyId ? { ...v, ...vacancyData } : v));
  if (supabase) {
    try {
      const payload = { ...vacancyData };
      if ('gaji' in payload) {
        payload.gaji_estimasi = payload.gaji;
        delete payload.gaji;
      }
      if ('kuota' in payload) {
        payload.kuota_penerimaan = payload.kuota;
        delete payload.kuota;
      }
      if ('lokasi' in payload) {
        payload.lokasi_penempatan = payload.lokasi;
        delete payload.lokasi;
      }
      delete payload.pendidikan;
      await supabase.from('job_vacancies').update(payload).eq('id', vacancyId);
    } catch (e) {
      console.warn('Supabase updateVacancy notice:', e);
    }
  }
  return { success: true };
}

export async function createVacancy(companyId, vacancyData) {
  const newVac = {
    id: generateUUID(),
    industry_id: companyId,
    judul_posisi: vacancyData.judul_posisi || 'Posisi Baru',
    tipe_pekerjaan: vacancyData.tipe_pekerjaan || 'Penuh Waktu',
    kuota: Number(vacancyData.kuota) || 1,
    gaji: vacancyData.gaji || 'Ditanyakan pada saat wawancara',
    pendidikan: vacancyData.pendidikan || 'Umum',
    lokasi: vacancyData.lokasi || 'Magelang / Jawa Tengah',
    kualifikasi: vacancyData.kualifikasi || 'Terbuka untuk umum seluruh jurusan.',
    persyaratan: Array.isArray(vacancyData.persyaratan) 
      ? vacancyData.persyaratan 
      : (vacancyData.persyaratan ? vacancyData.persyaratan.split('\n').map(s => s.trim()).filter(Boolean) : ['CV & Portofolio', 'Fotokopi Ijazah / SKL'])
  };

  vacancies.update(list => [newVac, ...list]);
  if (supabase) {
    try {
      const payload = {
        id: newVac.id,
        industry_id: newVac.industry_id,
        judul_posisi: newVac.judul_posisi,
        tipe_pekerjaan: newVac.tipe_pekerjaan,
        kuota_penerimaan: newVac.kuota,
        gaji_estimasi: newVac.gaji,
        lokasi_penempatan: newVac.lokasi,
        kualifikasi: newVac.kualifikasi,
        persyaratan: newVac.persyaratan,
        is_active: true
      };
      await supabase.from('job_vacancies').insert([payload]);
    } catch (e) {
      console.warn('Supabase createVacancy notice:', e);
    }
  }
  return { success: true, vacancy: newVac };
}

export async function deleteVacancy(vacancyId) {
  vacancies.update(list => list.filter(v => v.id !== vacancyId));
  if (supabase) {
    try {
      await supabase.from('job_vacancies').delete().eq('id', vacancyId);
    } catch (e) {
      console.warn('Supabase deleteVacancy notice:', e);
    }
  }
  return { success: true };
}

// ── Job Applications ──
export async function applyJob(vacancyId, applicantId, coverNote = '') {
  const currentApps = get(applications);
  const currentVacs = get(vacancies);

  // Find this vacancy to get its industry_id
  const targetVac = currentVacs.find(v => v.id === vacancyId);

  // Block duplicate: same vacancy + same applicant
  const alreadySameVac = currentApps.find(a => a.vacancy_id === vacancyId && a.applicant_id === applicantId);
  if (alreadySameVac) {
    return { success: false, error: 'Anda sudah melamar ke posisi ini di stand ini.' };
  }

  // Also block if applicant already applied to ANY vacancy at the same company
  if (targetVac?.industry_id) {
    const sameCompanyVacIds = currentVacs
      .filter(v => v.industry_id === targetVac.industry_id)
      .map(v => v.id);
    const alreadySameCompany = currentApps.find(
      a => sameCompanyVacIds.includes(a.vacancy_id) && a.applicant_id === applicantId
    );
    if (alreadySameCompany) {
      return { success: false, error: 'Anda sudah mengirimkan lamaran ke perusahaan ini. Silakan datangi booth stand untuk proses selanjutnya.' };
    }
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
      const { error } = await supabase.from('job_applications').insert([newApp]);
      if (error) {
        // Roll back optimistic entry when remote insert fails
        applications.update(list => list.filter(a => a.id !== newApp.id));
        if (error.code === '23505') {
          syncApplicantApplications(applicantId).catch(() => {});
          return { success: false, error: 'Anda sudah melamar ke posisi ini sebelumnya.' };
        }
        console.warn('Supabase applyJob error:', error.message);
        return { success: false, error: 'Gagal mengirim lamaran ke server. Periksa koneksi Anda lalu coba lagi.' };
      }
    } catch (e) {
      applications.update(list => list.filter(a => a.id !== newApp.id));
      console.warn('Supabase applyJob notice:', e);
      return { success: false, error: 'Koneksi ke server terputus saat mengirim lamaran. Silakan coba lagi.' };
    }
  }
  return { success: true, application: newApp };
}

export async function updateApplicationStatus(applicationId, newStatus, notes = '', verifiedBy = null) {
  const verifiedAt = new Date().toISOString();
  const existingApp = get(applications).find(a => a.id === applicationId);
  const finalNotes = notes || existingApp?.catatan_industri || '';

  applications.update(list => list.map(app => {
    if (app.id === applicationId) {
      return {
        ...app,
        status: newStatus,
        catatan_industri: finalNotes,
        waktu_verifikasi: verifiedAt,
        verified_by: verifiedBy || app.verified_by
      };
    }
    return app;
  }));

  if (supabase) {
    try {
      // Official stand/admin logins may use an ephemeral UUID not present in public.profiles.
      // Only send verified_by if that profile exists, and retry with null on FK error (23503).
      const safeVerifiedBy = verifiedBy && get(allUsers).some(u => u.id === verifiedBy) ? verifiedBy : null;
      const payload = {
        status: newStatus,
        catatan_industri: finalNotes,
        waktu_verifikasi: verifiedAt,
        verified_by: safeVerifiedBy
      };

      let { error } = await supabase.from('job_applications').update(payload).eq('id', applicationId);
      if (error && (error.code === '23503' || (error.message || '').includes('verified_by'))) {
        ({ error } = await supabase.from('job_applications').update({ ...payload, verified_by: null }).eq('id', applicationId));
      }
      if (error) {
        console.warn('Supabase updateApplicationStatus error:', error.message);
        return { success: false, error: error.message };
      }
    } catch (e) {
      console.warn('Supabase updateApplicationStatus notice:', e);
      return { success: false, error: e.message || 'Gagal memperbarui status lamaran.' };
    }
  }
  return { success: true };
}

// ── Stand Barcode Attendance Verification ──
export async function recordStandScan(industryId, applicantId, notes = '', scannedBy = null, targetStatus = 'terverifikasi_stand') {
  const attendances = get(standAttendances);
  const existing = attendances.find(a => a.industry_id === industryId && a.applicant_id === applicantId);
  const safeScannedBy = scannedBy && get(allUsers).some(u => u.id === scannedBy) ? scannedBy : null;

  const newRecord = {
    id: existing ? existing.id : generateUUID(),
    industry_id: industryId,
    applicant_id: applicantId,
    scanned_at: new Date().toISOString(),
    scanned_by: safeScannedBy,
    catatan_petugas: notes || 'Hadir dan diverifikasi fisik di stand booth.'
  };

  if (existing) {
    standAttendances.update(list => list.map(a => a.id === existing.id ? newRecord : a));
  } else {
    standAttendances.update(list => [newRecord, ...list]);
  }

  if (supabase) {
    try {
      let { error } = await supabase
        .from('stand_attendances')
        .upsert([newRecord], { onConflict: 'industry_id,applicant_id' });
      if (error && (error.code === '23503' || (error.message || '').includes('scanned_by'))) {
        ({ error } = await supabase
          .from('stand_attendances')
          .upsert([{ ...newRecord, scanned_by: null }], { onConflict: 'industry_id,applicant_id' }));
      }
      if (error) console.warn('Supabase recordStandScan error:', error.message);
    } catch (e) {
      console.warn('Supabase recordStandScan notice:', e);
    }
  }

  // Find existing applications for this industry (check local store + live Supabase so recent online applications are never duplicated)
  const currentVacancies = get(vacancies).filter(v => v.industry_id === industryId);
  const vacIds = currentVacancies.map(v => v.id);
  let existingApps = get(applications).filter(a => a.applicant_id === applicantId && vacIds.includes(a.vacancy_id));

  if (supabase && vacIds.length > 0 && existingApps.length === 0) {
    try {
      const { data: remoteApps, error: remoteErr } = await supabase
        .from('job_applications')
        .select('*')
        .eq('applicant_id', applicantId)
        .in('vacancy_id', vacIds);

      if (!remoteErr && remoteApps && remoteApps.length > 0) {
        existingApps = remoteApps;
        applications.update(list => {
          const existingIds = new Set(list.map(a => a.id));
          const toAdd = remoteApps.filter(a => !existingIds.has(a.id));
          return [...toAdd, ...list];
        });
      }
    } catch (e) {
      console.warn('Supabase fetch existing apps during scan notice:', e);
    }
  }

  if (existingApps.length > 0) {
    for (const app of existingApps) {
      const nextStatus =
        targetStatus === 'wawancara'
          ? 'wawancara'
          : (app.status === 'menunggu' ? 'terverifikasi_stand' : app.status);
      await updateApplicationStatus(
        app.id,
        nextStatus,
        notes || 'Telah scan barcode dan diverifikasi langsung di stand booth.',
        safeScannedBy
      );
    }
  } else if (currentVacancies.length > 0) {
    // Walk-in candidate: automatically register application for primary vacancy of this stand
    const primaryVac = currentVacancies[0];
    const nowIso = new Date().toISOString();
    const walkInApp = {
      id: generateUUID(),
      vacancy_id: primaryVac.id,
      applicant_id: applicantId,
      status: targetStatus === 'wawancara' ? 'wawancara' : 'terverifikasi_stand',
      catatan_industri: notes || 'Pendaftaran & Verifikasi On-the-spot di Stand ' + (primaryVac.lokasi || ''),
      waktu_melamar: nowIso,
      waktu_verifikasi: nowIso,
      verified_by: safeScannedBy
    };
    applications.update(list => [walkInApp, ...list]);
    if (supabase) {
      try {
        let { error } = await supabase.from('job_applications').insert([walkInApp]);
        if (error && (error.code === '23503' || (error.message || '').includes('verified_by'))) {
          ({ error } = await supabase.from('job_applications').insert([{ ...walkInApp, verified_by: null }]));
        }
        if (error) console.warn('Supabase walk-in app error:', error.message);
      } catch (e) {
        console.warn('Supabase walk-in app notice:', e);
      }
    }
  }

  return { success: true, record: newRecord };
}

// ── Live Applicant Lookup (Local + Supabase Cloud Fallback) ──
export async function lookupApplicant(tokenOrId) {
  const query = (tokenOrId || '').trim();
  if (!query) return null;

  const queryLower = query.toLowerCase();
  const localList = get(allUsers);
  let found = localList.find(u => 
    (u.qr_code_token || '').toLowerCase() === queryLower || 
    (u.nik_nisn || '') === query || 
    u.id === query ||
    (u.email || '').toLowerCase() === queryLower
  );

  if (found) return found;

  // Query Supabase directly (ONLY match UUID column `id` when query is a valid UUID to avoid PostgreSQL 22P02 error)
  if (supabase) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
      const safeQ = query.replace(/[,()]/g, '');
      const orClauses = [
        `qr_code_token.ilike.${safeQ}`,
        `nik_nisn.eq.${safeQ}`,
        `email.ilike.${safeQ}`
      ];
      if (isUuid) {
        orClauses.push(`id.eq.${safeQ}`);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(orClauses.join(','))
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
