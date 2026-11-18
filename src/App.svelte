<script>
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { currentUser, industries, vacancies, syncFromSupabase, supabase } from './lib/supabase.js';
  import {
    activeToast,
    dismissToast,
    markNotificationRead,
    startApplicantNotificationWatcher
  } from './lib/notifications.js';
  import Navbar from './lib/components/Navbar.svelte';
  import Hero from './lib/components/Hero.svelte';
  import IndustryDirectory from './lib/components/IndustryDirectory.svelte';
  import JobDetailModal from './lib/components/JobDetailModal.svelte';
  import ApplicantQrCard from './lib/components/ApplicantQrCard.svelte';
  import QrScannerModal from './lib/components/QrScannerModal.svelte';
  import ApplicantProfile from './lib/components/ApplicantProfile.svelte';
  import CompanyDashboard from './lib/components/CompanyDashboard.svelte';
  import AdminDashboard from './lib/components/AdminDashboard.svelte';
  import DenahFloorPlan from './lib/components/DenahFloorPlan.svelte';
  import AuthModal from './lib/components/AuthModal.svelte';
  import { Building2, Bell, X, ArrowRight } from '@lucide/svelte';

  const VALID_TABS = ['portal', 'lowongan', 'denah', 'profil_pelamar', 'dashboard_perusahaan', 'admin'];

  function resolveInitialTab() {
    if (typeof window === 'undefined') return 'portal';
    try {
      const rawHash = (window.location.hash || '').replace(/^#/, '');
      let candidate = '';
      if (rawHash && !rawHash.includes('=') && VALID_TABS.includes(rawHash)) {
        candidate = rawHash;
      } else {
        const saved = sessionStorage.getItem('bhumi_active_tab') || '';
        if (VALID_TABS.includes(saved)) {
          candidate = saved;
        }
      }
      if (!candidate) return 'portal';

      const user = get(currentUser);
      if (candidate === 'admin' && user?.role !== 'admin') return 'portal';
      if (candidate === 'dashboard_perusahaan' && user?.role !== 'pemberi_kerja' && user?.role !== 'admin') return 'portal';
      if (candidate === 'profil_pelamar' && !user) return 'portal';
      return candidate;
    } catch {
      return 'portal';
    }
  }

  let activeTab = resolveInitialTab();
  let searchQuery = '';

  let isAuthOpen = false;
  let authInitialMode = 'login';
  let isScannerOpen = false;
  let isQrCardOpen = false;

  let activeVacancy = null;
  let activeIndustry = null;

  onMount(() => {
    syncFromSupabase();
    const stopNotifWatcher = startApplicantNotificationWatcher();

    // Deteksi jika pengguna membuka tautan pemulihan kata sandi dari email
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        authInitialMode = 'new_password';
        isAuthOpen = true;
      }
    }

    const handleHashChange = () => {
      if (typeof window === 'undefined') return;
      const rawHash = (window.location.hash || '').replace(/^#/, '');
      if (rawHash && !rawHash.includes('=') && VALID_TABS.includes(rawHash) && rawHash !== activeTab) {
        activeTab = rawHash;
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
    }

    let authSub = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          authInitialMode = 'new_password';
          isAuthOpen = true;
        }
      });
      authSub = data?.subscription;
    }

    return () => {
      stopNotifWatcher();
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', handleHashChange);
      }
      if (authSub) authSub.unsubscribe();
    };
  });

  // Strict Role & Route Guards (Defense-in-Depth)
  $: if (activeTab === 'admin' && $currentUser?.role !== 'admin') {
    activeTab = 'portal';
  }
  $: if (activeTab === 'dashboard_perusahaan' && $currentUser?.role !== 'pemberi_kerja' && $currentUser?.role !== 'admin') {
    activeTab = 'portal';
  }
  $: if (activeTab === 'profil_pelamar' && !$currentUser) {
    activeTab = 'portal';
  }

  // Persist current active page across browser refresh
  $: if (typeof window !== 'undefined' && VALID_TABS.includes(activeTab)) {
    try {
      sessionStorage.setItem('bhumi_active_tab', activeTab);
      const curHash = window.location.hash || '';
      if (!curHash.includes('type=recovery') && !curHash.includes('access_token=')) {
        const targetHash = `#${activeTab}`;
        if (curHash !== targetHash) {
          window.history.replaceState(null, '', targetHash);
        }
      }
    } catch {
      // ignore storage/history restrictions
    }
  }

  function handleOpenToastNotification(notif) {
    if (notif?.key) markNotificationRead(notif.key);
    dismissToast();
    activeTab = 'profil_pelamar';
  }

  function handleSelectVacancy(vac, ind) {
    activeVacancy = vac;
    activeIndustry = ind;
  }

  function handleCloseVacancyModal() {
    activeVacancy = null;
    activeIndustry = null;
  }
</script>

<div class="app-layout">
  <Navbar 
    bind:activeTab 
    onOpenAuth={() => isAuthOpen = true}
    onOpenScanner={() => isScannerOpen = true}
    onOpenQrCard={() => isQrCardOpen = true}
  />

  <main class="main-body">
    {#if activeTab === 'portal'}
      <Hero 
        bind:searchQuery 
        onSelectTab={(tab) => activeTab = tab}
        onOpenAuth={() => isAuthOpen = true}
        onOpenQrCard={() => isQrCardOpen = true}
      />
      
      <!-- Interactive Floor Plan directly on Portal Homepage -->
      <div class="portal-denah-preview">
        <DenahFloorPlan 
          onSelectBooth={(ind) => {
            searchQuery = ind.nomor_stand;
            activeTab = 'lowongan';
          }}
        />
      </div>

      <div class="container">
        <IndustryDirectory 
          {searchQuery} 
          onSelectVacancy={handleSelectVacancy} 
        />
      </div>
    {:else if activeTab === 'lowongan'}
      <div class="container">
        <IndustryDirectory 
          {searchQuery} 
          onSelectVacancy={handleSelectVacancy} 
        />
      </div>
    {:else if activeTab === 'denah'}
      <DenahFloorPlan 
        onSelectBooth={(ind) => {
          searchQuery = ind.nomor_stand;
          activeTab = 'lowongan';
        }}
      />
    {:else if activeTab === 'profil_pelamar'}
      {#if $currentUser}
        <ApplicantProfile 
          onOpenQrCard={() => isQrCardOpen = true}
        />
      {:else}
        <div class="container" style="padding: 60px 16px; text-align: center;">
          <h3 class="heading-md">Silakan Masuk Akun</h3>
          <p class="text-sm text-muted" style="margin: 12px 0 20px;">Halaman profil pelamar hanya dapat diakses setelah mendaftar atau masuk akun.</p>
          <button class="btn btn-primary" on:click={() => isAuthOpen = true}>Masuk / Daftar Akun</button>
        </div>
      {/if}
    {:else if activeTab === 'dashboard_perusahaan'}
      {#if $currentUser?.role === 'pemberi_kerja' || $currentUser?.role === 'admin'}
        <CompanyDashboard 
          onOpenScanner={() => isScannerOpen = true}
        />
      {:else}
        <div class="container" style="padding: 60px 16px; text-align: center;">
          <h3 class="heading-md">Akses Khusus Mitra Industri</h3>
          <p class="text-sm text-muted" style="margin: 12px 0 20px;">Halaman ini hanya dapat diakses oleh akun resmi HRD Stand Industri.</p>
          <button class="btn btn-secondary" on:click={() => activeTab = 'portal'}>Kembali ke Beranda</button>
        </div>
      {/if}
    {:else if activeTab === 'admin'}
      {#if $currentUser?.role === 'admin'}
        <AdminDashboard 
          onOpenScanner={() => isScannerOpen = true}
        />
      {:else}
        <div class="container" style="padding: 60px 16px; text-align: center;">
          <h3 class="heading-md">Akses Terbatas Panitia</h3>
          <p class="text-sm text-muted" style="margin: 12px 0 20px;">Panel kendali dan rekapitulasi data hanya dapat diakses oleh Panitia Resmi.</p>
          <button class="btn btn-secondary" on:click={() => activeTab = 'portal'}>Kembali ke Beranda</button>
        </div>
      {/if}
    {/if}
  </main>

  <!-- Modals -->
  {#if activeVacancy}
    <JobDetailModal 
      vacancy={activeVacancy} 
      industry={$industries.find(i => i.id === activeIndustry?.id) || activeIndustry}
      onClose={handleCloseVacancyModal}
      onRequireAuth={() => { activeVacancy = null; isAuthOpen = true; }}
    />
  {/if}

  {#if isQrCardOpen}
    <ApplicantQrCard 
      onClose={() => isQrCardOpen = false} 
    />
  {/if}

  {#if isScannerOpen}
    <QrScannerModal 
      currentIndustry={$currentUser?.role === 'pemberi_kerja' ? $industries.find(i => i.id === $currentUser.company_id) : null}
      onClose={() => isScannerOpen = false} 
    />
  {/if}

  {#if isAuthOpen}
    <AuthModal 
      initialMode={authInitialMode}
      onClose={() => { isAuthOpen = false; authInitialMode = 'login'; }}
      onSuccess={(user) => {
        authInitialMode = 'login';
        if (user.role === 'pemberi_kerja') activeTab = 'dashboard_perusahaan';
        else if (user.role === 'admin') activeTab = 'admin';
        else activeTab = 'profil_pelamar';
      }}
    />
  {/if}

  <!-- Live Applicant Notification Toast -->
  {#if $activeToast && $currentUser?.role === 'pelamar'}
    <div class="live-notif-toast live-notif-{$activeToast.status}" role="status" aria-live="polite">
      <div class="live-notif-icon">
        <Bell size={18} />
      </div>
      <div class="live-notif-body">
        <span class="live-notif-title">{$activeToast.title}</span>
        <p class="live-notif-msg">{$activeToast.message}</p>
        {#if $activeToast.note}
          <p class="live-notif-note">Catatan: {$activeToast.note}</p>
        {/if}
        <button type="button" class="live-notif-cta" on:click={() => handleOpenToastNotification($activeToast)}>
          <span>Lihat Detail Lamaran</span>
          <ArrowRight size={13} />
        </button>
      </div>
      <button type="button" class="live-notif-close" on:click={dismissToast} aria-label="Tutup notifikasi">
        <X size={16} />
      </button>
    </div>
  {/if}

  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-left">
        <div class="footer-brand">
          <Building2 size={20} class="footer-icon" />
          <span class="footer-brand-title">BHUMI SAMBHARA EXPO & JOBFAIR 2026</span>
        </div>
        <p class="text-xs text-muted footer-sub">
          Kolaborasi Resmi: K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang
        </p>
        <p class="text-xs text-muted">
          Pelaksanaan: Kamis, 19 November 2026 • 09.00 - 15.10 WIB @ Indoor Graha Krida Wiyata, SMKN 1 Magelang
        </p>
      </div>

      <div class="footer-right">
        <div class="footer-meta">
          <span class="badge badge-stand">23 Mitra Industri Terverifikasi</span>
          <span class="badge badge-terverifikasi">Sistem Scan Barcode QR Terpadu</span>
        </div>
        <p class="text-xs text-muted text-right dev-credit-row">
          Dikembangkan oleh <a href="https://www.nineteendev.xyz/" target="_blank" rel="noopener noreferrer" class="footer-dev-link">NineteenDev</a>
        </p>
      </div>
    </div>
  </footer>
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface-subtle);
    overflow-x: hidden;
    max-width: 100%;
  }

  .main-body {
    flex-grow: 1;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }

  .live-notif-toast {
    position: fixed;
    top: 76px;
    right: 16px;
    z-index: 1050;
    width: min(400px, calc(100vw - 24px));
    background-color: #FFFFFF;
    border: 1.5px solid #93C5FD;
    border-left: 5px solid #1D4ED8;
    border-radius: var(--radius-lg);
    box-shadow: 0 14px 30px rgba(15, 23, 42, 0.18);
    padding: 14px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: fadeIn 0.25s ease forwards;
  }

  .live-notif-toast.live-notif-wawancara {
    border-color: #FCD34D;
    border-left-color: #D97706;
    background-color: #FFFBEB;
  }

  .live-notif-toast.live-notif-diterima {
    border-color: #86EFAC;
    border-left-color: #15803D;
    background-color: #F0FDF4;
  }

  .live-notif-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background-color: var(--color-primary);
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .live-notif-wawancara .live-notif-icon {
    background-color: #D97706;
  }

  .live-notif-diterima .live-notif-icon {
    background-color: #15803D;
  }

  .live-notif-body {
    flex: 1;
    min-width: 0;
  }

  .live-notif-title {
    display: block;
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.25;
  }

  .live-notif-msg {
    font-size: 0.75rem;
    color: var(--color-text-main);
    margin-top: 3px;
    line-height: 1.4;
  }

  .live-notif-note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin-top: 4px;
    font-style: italic;
  }

  .live-notif-cta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-info);
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .live-notif-close {
    color: var(--color-text-muted);
    padding: 4px;
    flex-shrink: 0;
    border-radius: var(--radius-sm);
  }

  .live-notif-close:hover {
    color: var(--color-primary);
    background-color: rgba(15, 23, 42, 0.06);
  }

  @media (max-width: 640px) {
    .live-notif-toast {
      top: 70px;
      left: 12px;
      right: 12px;
      width: auto;
    }
  }

  .portal-denah-preview {
    margin-top: -10px;
    margin-bottom: 20px;
  }

  .app-footer {
    background-color: #FFFFFF;
    border-top: 1px solid var(--color-border);
    padding: 32px 0 28px;
    margin-top: auto;
  }

  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  :global(.footer-icon) {
    color: var(--color-primary);
  }

  .footer-brand-title {
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--color-primary);
    letter-spacing: -0.01em;
  }

  .footer-sub {
    margin-bottom: 2px;
  }

  .footer-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }

  .footer-meta {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .text-right {
    text-align: right;
  }

  .dev-credit-row {
    font-size: 0.8125rem;
    color: #475569;
    margin-top: 4px;
    font-weight: 500;
  }

  .footer-dev-link {
    color: #1D4ED8;
    font-weight: 800;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.15s ease;
  }

  .footer-dev-link:hover {
    color: #1E40AF;
  }

  @media (max-width: 820px) {
    .app-footer {
      padding-top: 24px;
      padding-bottom: calc(96px + env(safe-area-inset-bottom, 0px));
    }
    .footer-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
    .footer-right {
      align-items: flex-start;
      width: 100%;
      gap: 8px;
    }
    .footer-meta {
      width: 100%;
    }
    .text-right {
      text-align: left;
    }
  }
</style>
