<script>
  import { onMount } from 'svelte';
  import { currentUser, industries, vacancies, syncFromSupabase, supabase } from './lib/supabase.js';
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
  import { Building2, Calendar, MapPin, QrCode, Shield, CheckCircle } from '@lucide/svelte';

  let activeTab = 'portal';
  let searchQuery = '';

  let isAuthOpen = false;
  let authInitialMode = 'login';
  let isScannerOpen = false;
  let isQrCardOpen = false;

  let activeVacancy = null;
  let activeIndustry = null;

  onMount(() => {
    syncFromSupabase();

    // Deteksi jika pengguna membuka tautan pemulihan kata sandi dari email
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('type=recovery')) {
        authInitialMode = 'new_password';
        isAuthOpen = true;
      }
    }

    if (supabase) {
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          authInitialMode = 'new_password';
          isAuthOpen = true;
        }
      });
    }
  });

  // Jika user logout ($currentUser menjadi null), otomatis arahkan kembali ke halaman awal web (portal)
  $: if (!$currentUser) {
    activeTab = 'portal';
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
      <ApplicantProfile 
        onOpenQrCard={() => isQrCardOpen = true}
      />
    {:else if activeTab === 'dashboard_perusahaan'}
      <CompanyDashboard 
        onOpenScanner={() => isScannerOpen = true}
      />
    {:else if activeTab === 'admin'}
      <AdminDashboard 
        onOpenScanner={() => isScannerOpen = true}
      />
    {/if}
  </main>

  <!-- Modals -->
  {#if activeVacancy}
    <JobDetailModal 
      vacancy={activeVacancy} 
      industry={activeIndustry}
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

  <footer class="app-footer">
    <div class="container footer-content">
      <div class="footer-left">
        <div class="footer-brand">
          <Building2 size={20} class="footer-icon" />
          <span class="footer-brand-title">BHUMI SAMBHARA EXPO & JOBFAIR 2026</span>
        </div>
        <p class="text-xs text-muted footer-sub">
          Kolaborasi Resmi: K1 Pariwisata 2024 UNTIDAR $\times$ SMK Negeri 1 Magelang
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
        <p class="text-xs text-muted text-right">
          Dikembangkan untuk Seleksi Karir Terbuka Pelajar & Umum
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
  }

  .main-body {
    flex-grow: 1;
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

  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      align-items: flex-start;
    }
    .footer-right {
      align-items: flex-start;
    }
    .text-right {
      text-align: left;
    }
  }
</style>
