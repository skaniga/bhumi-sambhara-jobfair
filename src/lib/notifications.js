import { writable, derived, get } from 'svelte/store';
import {
  supabase,
  currentUser,
  applications,
  vacancies,
  industries,
  syncApplicantApplications
} from './supabase.js';

const READ_STORAGE_KEY = 'bhumi_sambhara_read_notifs_v1';

function loadReadKeys() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveReadKeys(keys) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(keys));
  } catch {
    // ignore storage quota errors
  }
}

const readKeysStore = writable(loadReadKeys());
readKeysStore.subscribe(saveReadKeys);

export const activeToast = writable(null);

export const browserNotifPermission = writable(
  typeof window !== 'undefined' && 'Notification' in window
    ? Notification.permission
    : 'unsupported'
);

const NOTIFIABLE_STATUSES = ['wawancara', 'diterima', 'terverifikasi_stand', 'ditolak'];

function buildNotificationMeta(status, standName, companyName, position) {
  switch (status) {
    case 'wawancara':
      return {
        title: `Panggilan Wawancara — ${standName}`,
        message: `${companyName} memanggil Anda untuk wawancara posisi ${position}. Segera datangi meja booth stand!`,
        priority: 'high'
      };
    case 'diterima':
      return {
        title: `Selamat! Lolos Seleksi — ${standName}`,
        message: `Lamaran Anda untuk posisi ${position} di ${companyName} dinyatakan DITERIMA.`,
        priority: 'high'
      };
    case 'terverifikasi_stand':
      return {
        title: `Kehadiran Terverifikasi — ${standName}`,
        message: `Presensi & berkas Anda telah diverifikasi langsung di booth ${companyName}.`,
        priority: 'normal'
      };
    case 'ditolak':
      return {
        title: `Pembaruan Status Lamaran — ${standName}`,
        message: `Status lamaran Anda di ${companyName} telah diperbarui. Tetap semangat, Anda masih dapat melamar ke stand lainnya.`,
        priority: 'normal'
      };
    default:
      return {
        title: `Pembaruan Lamaran — ${standName}`,
        message: `Ada pembaruan pada lamaran Anda di ${companyName}.`,
        priority: 'normal'
      };
  }
}

export const applicantNotifications = derived(
  [currentUser, applications, vacancies, industries, readKeysStore],
  ([$user, $apps, $vacs, $inds, $readKeys]) => {
    if (!$user || $user.role !== 'pelamar') return [];

    const readSet = new Set($readKeys);
    const items = [];

    for (const app of $apps) {
      if (app.applicant_id !== $user.id) continue;
      if (!NOTIFIABLE_STATUSES.includes(app.status)) continue;

      const vac = $vacs.find(v => v.id === app.vacancy_id);
      const ind = vac ? $inds.find(i => i.id === vac.industry_id) : null;
      const standName = ind?.nomor_stand || 'Stand Industri';
      const companyName = ind?.nama_perusahaan || 'Mitra Industri';
      const position = vac?.judul_posisi || 'Lowongan Kerja';
      const key = `${app.id}:${app.status}`;
      const meta = buildNotificationMeta(app.status, standName, companyName, position);

      items.push({
        key,
        appId: app.id,
        status: app.status,
        stand: standName,
        companyName,
        position,
        title: meta.title,
        message: meta.message,
        priority: meta.priority,
        note: app.catatan_industri || '',
        timestamp: app.waktu_verifikasi || app.waktu_melamar || new Date().toISOString(),
        isRead: readSet.has(key)
      });
    }

    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items;
  }
);

export const unreadNotificationCount = derived(
  applicantNotifications,
  ($list) => $list.filter(n => !n.isRead).length
);

export function markNotificationRead(key) {
  if (!key) return;
  readKeysStore.update(keys => (keys.includes(key) ? keys : [...keys, key]));
}

export function markAllNotificationsRead() {
  const current = get(applicantNotifications);
  const allKeys = current.map(n => n.key);
  readKeysStore.update(keys => Array.from(new Set([...keys, ...allKeys])));
}

export function dismissToast() {
  activeToast.set(null);
}

export async function requestBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    browserNotifPermission.set('unsupported');
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    browserNotifPermission.set(result);
    return result;
  } catch {
    return Notification.permission;
  }
}

function playNotificationChime() {
  if (typeof window === 'undefined') return;
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([120, 60, 120]);
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [660, 880].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.12, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.18);
    });
  } catch {
    // Audio playback may be blocked prior to user gesture; ignore safely
  }
}

function showBrowserSystemNotification(notif) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(notif.title, {
      body: notif.note ? `${notif.message} (${notif.note})` : notif.message,
      icon: '/logo-bhumi-sambhara-icon.svg',
      tag: notif.key
    });
  } catch {
    // Ignore on browsers requiring service worker for Notification constructor
  }
}

// ── Live Watcher (Realtime + Polling Fallback) ──
export function startApplicantNotificationWatcher() {
  let realtimeChannel = null;
  let pollTimer = null;
  let watchedApplicantId = null;
  let announcedKeys = new Set();
  let toastTimeout = null;

  function triggerLiveAlert(notif) {
    activeToast.set(notif);
    playNotificationChime();
    showBrowserSystemNotification(notif);

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      activeToast.update(cur => (cur && cur.key === notif.key ? null : cur));
    }, 9000);
  }

  function cleanupRemote() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
    if (realtimeChannel && supabase) {
      try {
        supabase.removeChannel(realtimeChannel);
      } catch {
        // ignore channel cleanup error
      }
      realtimeChannel = null;
    }
  }

  function setupRemoteForApplicant(applicantId) {
    cleanupRemote();
    watchedApplicantId = applicantId;

    if (!applicantId) return;

    // Immediate sync so applicant gets latest interview calls right away
    syncApplicantApplications(applicantId).catch(() => {});

    // Periodic fallback sync every 20 seconds (works even if Supabase Realtime isn't enabled on the table)
    pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      syncApplicantApplications(applicantId).catch(() => {});
    }, 20000);

    // Supabase Realtime subscription for instant push notifications
    if (supabase && typeof supabase.channel === 'function') {
      try {
        realtimeChannel = supabase
          .channel(`applicant-notifs-${applicantId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'job_applications',
              filter: `applicant_id=eq.${applicantId}`
            },
            () => {
              syncApplicantApplications(applicantId).catch(() => {});
            }
          )
          .subscribe();
      } catch (e) {
        console.warn('Realtime subscription notice:', e);
      }
    }
  }

  const unsubUser = currentUser.subscribe($user => {
    const nextId = $user && $user.role === 'pelamar' ? $user.id : null;
    if (nextId !== watchedApplicantId) {
      announcedKeys = new Set();
      activeToast.set(null);
      setupRemoteForApplicant(nextId);
    }
  });

  const unsubNotifs = applicantNotifications.subscribe($list => {
    if (!$list || $list.length === 0) return;

    // Find newest unread high-priority (or newly arrived) notification not yet announced in this session
    const unreadFresh = $list.find(n => !n.isRead && !announcedKeys.has(n.key));
    if (unreadFresh) {
      for (const n of $list) {
        if (!n.isRead) announcedKeys.add(n.key);
      }
      triggerLiveAlert(unreadFresh);
    }
  });

  return () => {
    if (toastTimeout) clearTimeout(toastTimeout);
    cleanupRemote();
    unsubUser();
    unsubNotifs();
  };
}

// ── WhatsApp Interview Call Helper for HRD ──
export function formatWhatsAppNumber(rawWa) {
  const digits = String(rawWa || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('8')) return '62' + digits;
  return digits;
}

export function buildWhatsAppInterviewUrl(applicant, industry, vacancy, customNote = '') {
  const phone = formatWhatsAppNumber(applicant?.nomor_wa);
  if (!phone) return '';
  const nama = applicant?.nama_lengkap || 'Pelamar';
  const perusahaan = industry?.nama_perusahaan || 'Mitra Industri';
  const stand = industry?.nomor_stand || 'Stand Industri';
  const posisi = vacancy?.judul_posisi || 'Lowongan Kerja';
  const notePart = customNote ? `\nCatatan HRD: ${customNote}` : '';
  const text =
    `Halo ${nama}, kami dari HRD *${perusahaan}* (${stand}) di Bhumi Sambhara Expo & Jobfair 2026.\n` +
    `Anda mendapatkan *PANGGILAN WAWANCARA* untuk posisi *${posisi}*.${notePart}\n\n` +
    `Silakan segera menuju booth *${stand}* dengan membawa Kartu QR & berkas lamaran Anda. Terima kasih!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
