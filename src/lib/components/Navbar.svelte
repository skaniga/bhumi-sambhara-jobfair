<script>
  import { currentUser, logoutUser } from '../supabase.js';
  import { Briefcase, QrCode, Shield, User, LogOut, LogIn, Building2, ScanLine } from '@lucide/svelte';

  export let activeTab = 'portal';
  export let onOpenAuth = () => {};
  export let onOpenScanner = () => {};
  export let onOpenQrCard = () => {};
</script>

<header class="navbar">
  <div class="container nav-container">
    <div class="brand" on:click={() => activeTab = 'portal'} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && (activeTab = 'portal')}>
      <div class="logo-box">
        <Building2 size={22} color="#FFFFFF" />
      </div>
      <div class="brand-text">
        <span class="brand-title">BHUMI SAMBHARA</span>
        <span class="brand-subtitle">EXPO & JOBFAIR 2026</span>
      </div>
    </div>

    <nav class="nav-links">
      <button 
        class="nav-item {activeTab === 'portal' ? 'active' : ''}" 
        on:click={() => activeTab = 'portal'}
      >
        Portal Expo
      </button>

      <button 
        class="nav-item {activeTab === 'lowongan' ? 'active' : ''}" 
        on:click={() => activeTab = 'lowongan'}
      >
        20 Industri Partner
      </button>

      {#if $currentUser}
        {#if $currentUser.role === 'pelamar'}
          <button 
            class="nav-item {activeTab === 'profil_pelamar' ? 'active' : ''}" 
            on:click={() => activeTab = 'profil_pelamar'}
          >
            Profil & Lamaran
          </button>
        {:else if $currentUser.role === 'pemberi_kerja'}
          <button 
            class="nav-item {activeTab === 'dashboard_perusahaan' ? 'active' : ''}" 
            on:click={() => activeTab = 'dashboard_perusahaan'}
          >
            Stand & Verifikasi
          </button>
        {:else if $currentUser.role === 'admin'}
          <button 
            class="nav-item {activeTab === 'admin' ? 'active' : ''}" 
            on:click={() => activeTab = 'admin'}
          >
            Panel Monitoring
          </button>
        {/if}
      {/if}
    </nav>

    <div class="nav-actions">
      {#if $currentUser}
        {#if $currentUser.role === 'pelamar'}
          <button class="btn btn-secondary btn-sm" on:click={onOpenQrCard} title="Buka Kartu Peserta & QR Code">
            <QrCode size={16} />
            <span>Kartu QR Peserta</span>
          </button>
        {:else}
          <button class="btn btn-amber btn-sm" on:click={onOpenScanner} title="Buka Kamera Scanner Barcode Stand">
            <ScanLine size={16} />
            <span>Scan QR Pelamar</span>
          </button>
        {/if}

        <div class="user-badge-wrap">
          <span class="role-pill">
            <span class="role-dot {$currentUser.role}"></span>
            <span class="role-name font-semibold">{$currentUser.nama_lengkap}</span>
            <span class="badge-role-text text-xs text-muted">
              ({$currentUser.role === 'pelamar' ? 'Pelamar' : $currentUser.role === 'pemberi_kerja' ? 'Industri' : 'Admin'})
            </span>
          </span>
        </div>

        <button class="btn-logout" on:click={logoutUser} title="Keluar Akun">
          <LogOut size={16} />
        </button>
      {:else}
        <button class="btn btn-primary btn-sm" on:click={onOpenAuth}>
          <LogIn size={16} />
          <span>Masuk / Daftar Akun</span>
        </button>
      {/if}
    </div>
  </div>
</header>

<style>
  .navbar {
    background-color: #FFFFFF;
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    gap: 16px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .logo-box {
    width: 38px;
    height: 38px;
    background-color: var(--color-primary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-text {
    display: flex;
    flex-direction: column;
  }

  .brand-title {
    font-size: 0.9375rem;
    font-weight: 800;
    letter-spacing: -0.01em;
    color: var(--color-primary);
    line-height: 1.15;
  }

  .brand-subtitle {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-amber-accent);
    letter-spacing: 0.04em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .nav-item {
    padding: 8px 14px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    border-radius: var(--radius-md);
    transition: all 0.15s ease;
  }

  .nav-item:hover {
    color: var(--color-primary);
    background-color: var(--color-surface-subtle);
  }

  .nav-item.active {
    color: var(--color-primary);
    background-color: var(--color-surface-muted);
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
  }

  .role-selector-wrap {
    position: relative;
  }

  .role-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background-color: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  .role-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  .role-dot.pelamar { background-color: var(--color-info); }
  .role-dot.pemberi_kerja { background-color: var(--color-amber-accent); }
  .role-dot.admin { background-color: var(--color-success); }

  .role-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    width: 230px;
    padding: 6px 0;
    z-index: 200;
  }

  .dropdown-header {
    padding: 6px 12px;
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--color-text-light);
    letter-spacing: 0.05em;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 8px 12px;
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--color-text-main);
    text-align: left;
    transition: background-color 0.1s ease;
  }

  .dropdown-item:hover {
    background-color: var(--color-surface-muted);
    color: var(--color-primary);
  }

  .btn-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
  }

  .btn-logout:hover {
    color: var(--color-danger);
    background-color: var(--color-danger-bg);
  }

  @media (max-width: 820px) {
    .nav-links {
      display: none;
    }
  }
</style>
