<script>
  import { currentUser, logoutUser } from '../supabase.js';
  import { Briefcase, QrCode, Shield, User, LogOut, LogIn, Building2, ScanLine, Compass, Grid, MapPin } from '@lucide/svelte';

  export let activeTab = 'portal';
  export let onOpenAuth = () => {};
  export let onOpenScanner = () => {};
  export let onOpenQrCard = () => {};
</script>

<header class="navbar">
  <div class="container nav-container">
    <div class="brand" on:click={() => activeTab = 'portal'} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && (activeTab = 'portal')}>
      <img src="/logo-bhumi-sambhara-icon.svg" alt="Logo Bhumi Sambhara 2026" class="brand-logo-img" />
      <div class="brand-text">
        <span class="brand-title">BHUMI SAMBHARA</span>
        <span class="brand-subtitle">EXPO & JOBFAIR 2026</span>
      </div>
    </div>

    <!-- Desktop Navigation Links -->
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
        23 Mitra Industri
      </button>

      <button 
        class="nav-item {activeTab === 'denah' ? 'active' : ''}" 
        on:click={() => activeTab = 'denah'}
      >
        Denah Stand
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

    <!-- Header Actions -->
    <div class="nav-actions">
      {#if $currentUser}
        {#if $currentUser.role === 'pelamar'}
          <button class="btn btn-secondary btn-sm" on:click={onOpenQrCard} title="Buka Kartu Peserta & QR Code">
            <QrCode size={16} />
            <span class="action-btn-label">Kartu QR</span>
          </button>
        {:else}
          <button class="btn btn-amber btn-sm" on:click={onOpenScanner} title="Buka Kamera Scanner Barcode Stand">
            <ScanLine size={16} />
            <span class="action-btn-label">Scan Pelamar</span>
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

        <button class="btn-logout" on:click={() => { logoutUser(); activeTab = 'portal'; }} title="Keluar Akun">
          <LogOut size={16} />
        </button>
      {:else}
        <button class="btn btn-primary btn-sm" on:click={onOpenAuth}>
          <LogIn size={16} />
          <span>Masuk / Daftar</span>
        </button>
      {/if}
    </div>
  </div>
</header>

<!-- Mobile Bottom Navigation Bar (Thumb Friendly Ergonomics) -->
<nav class="mobile-bottom-nav">
  <button 
    class="bottom-nav-item {activeTab === 'portal' ? 'active' : ''}"
    on:click={() => activeTab = 'portal'}
  >
    <Compass size={20} />
    <span>Portal</span>
  </button>

  <button 
    class="bottom-nav-item {activeTab === 'lowongan' ? 'active' : ''}"
    on:click={() => activeTab = 'lowongan'}
  >
    <Grid size={20} />
    <span>23 Stand</span>
  </button>

  <button 
    class="bottom-nav-item {activeTab === 'denah' ? 'active' : ''}"
    on:click={() => activeTab = 'denah'}
  >
    <MapPin size={20} />
    <span>Denah</span>
  </button>

  {#if $currentUser}
    {#if $currentUser.role === 'pelamar'}
      <button 
        class="bottom-nav-item bottom-nav-accent"
        on:click={onOpenQrCard}
      >
        <div class="center-fab">
          <QrCode size={20} color="#FFFFFF" />
        </div>
        <span>Kartu QR</span>
      </button>

      <button 
        class="bottom-nav-item {activeTab === 'profil_pelamar' ? 'active' : ''}"
        on:click={() => activeTab = 'profil_pelamar'}
      >
        <User size={20} />
        <span>Profil</span>
      </button>
    {:else if $currentUser.role === 'pemberi_kerja'}
      <button 
        class="bottom-nav-item bottom-nav-accent"
        on:click={onOpenScanner}
      >
        <div class="center-fab fab-amber">
          <ScanLine size={20} color="#FFFFFF" />
        </div>
        <span>Scan</span>
      </button>

      <button 
        class="bottom-nav-item {activeTab === 'dashboard_perusahaan' ? 'active' : ''}"
        on:click={() => activeTab = 'dashboard_perusahaan'}
      >
        <Briefcase size={20} />
        <span>Stand</span>
      </button>
    {:else if $currentUser.role === 'admin'}
      <button 
        class="bottom-nav-item bottom-nav-accent"
        on:click={onOpenScanner}
      >
        <div class="center-fab fab-amber">
          <ScanLine size={20} color="#FFFFFF" />
        </div>
        <span>Scan</span>
      </button>

      <button 
        class="bottom-nav-item {activeTab === 'admin' ? 'active' : ''}"
        on:click={() => activeTab = 'admin'}
      >
        <Shield size={20} />
        <span>Monitoring</span>
      </button>
    {/if}
  {:else}
    <button 
      class="bottom-nav-item bottom-nav-accent"
      on:click={onOpenAuth}
    >
      <div class="center-fab">
        <LogIn size={20} color="#FFFFFF" />
      </div>
      <span>Masuk</span>
    </button>
  {/if}
</nav>

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
    gap: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .logo-box {
    width: 36px;
    height: 36px;
    background-color: var(--color-primary);
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand-logo-img {
    height: 38px;
    width: auto;
    object-fit: contain;
    border-radius: var(--radius-sm);
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
    gap: 4px;
  }

  .nav-item {
    padding: 7px 12px;
    font-size: 0.8125rem;
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
    gap: 8px;
    position: relative;
    flex-shrink: 0;
  }

  .user-badge-wrap {
    display: flex;
    align-items: center;
  }

  .role-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background-color: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    color: var(--color-text-main);
    max-width: 180px;
  }

  .role-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .role-dot.pelamar { background-color: var(--color-info); }
  .role-dot.pemberi_kerja { background-color: var(--color-amber-accent); }
  .role-dot.admin { background-color: var(--color-success); }

  .role-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .badge-role-text {
    flex-shrink: 0;
  }

  .btn-logout {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 7px;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
    transition: all 0.15s ease;
  }

  .btn-logout:hover {
    color: var(--color-danger);
    background-color: var(--color-danger-bg);
  }

  /* Mobile Bottom Navigation (Visible only on screens <= 820px) */
  .mobile-bottom-nav {
    display: none;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #FFFFFF;
    border-top: 1px solid var(--color-border);
    z-index: 990;
    justify-content: space-around;
    align-items: center;
    padding: 0 10px;
    box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.05);
  }

  .bottom-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    color: var(--color-text-muted);
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 4px 8px;
    transition: color 0.15s ease;
  }

  .bottom-nav-item:hover, .bottom-nav-item.active {
    color: var(--color-primary);
  }

  .center-fab {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background-color: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -14px;
    box-shadow: var(--shadow-md);
  }

  .fab-amber {
    background-color: var(--color-amber-accent);
  }

  @media (max-width: 820px) {
    .nav-links {
      display: none;
    }
    .user-badge-wrap {
      display: none;
    }
    .mobile-bottom-nav {
      display: flex;
    }
  }

  @media (max-width: 480px) {
    .action-btn-label {
      display: none;
    }
  }
</style>
