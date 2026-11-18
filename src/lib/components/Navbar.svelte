<script>
  import { currentUser, logoutUser } from '../supabase.js';
  import {
    applicantNotifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    browserNotifPermission,
    requestBrowserNotificationPermission
  } from '../notifications.js';
  import { Briefcase, QrCode, Shield, User, LogOut, LogIn, Building2, ScanLine, Compass, Grid, MapPin, Bell, CheckCheck, X } from '@lucide/svelte';

  export let activeTab = 'portal';
  export let onOpenAuth = () => {};
  export let onOpenScanner = () => {};
  export let onOpenQrCard = () => {};

  let isNotifOpen = false;

  function toggleNotifPanel() {
    isNotifOpen = !isNotifOpen;
  }

  function handleSelectNotification(notif) {
    markNotificationRead(notif.key);
    isNotifOpen = false;
    activeTab = 'profil_pelamar';
  }

  function formatNotifTime(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }
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
          <div class="notif-wrap">
            <button
              type="button"
              class="btn-notif-bell {$unreadNotificationCount > 0 ? 'has-unread' : ''}"
              on:click={toggleNotifPanel}
              title="Notifikasi Panggilan Wawancara & Status Lamaran"
              aria-label="Notifikasi Pelamar"
            >
              <Bell size={18} />
              {#if $unreadNotificationCount > 0}
                <span class="notif-badge tabular-nums">{$unreadNotificationCount > 9 ? '9+' : $unreadNotificationCount}</span>
              {/if}
            </button>

            {#if isNotifOpen}
              <div class="notif-backdrop" on:click={() => isNotifOpen = false} role="button" tabindex="-1" aria-label="Tutup panel notifikasi" on:keydown={(e) => e.key === 'Escape' && (isNotifOpen = false)}></div>
              <div class="notif-dropdown" role="dialog" aria-label="Daftar Notifikasi Pelamar">
                <div class="notif-dropdown-header">
                  <div>
                    <span class="notif-header-title">Notifikasi Pelamar</span>
                    <span class="text-xs text-muted">Panggilan wawancara & status lamaran</span>
                  </div>
                  <div class="notif-header-actions">
                    {#if $unreadNotificationCount > 0}
                      <button type="button" class="notif-mark-all" on:click={markAllNotificationsRead} title="Tandai semua dibaca">
                        <CheckCheck size={14} />
                        <span>Baca semua</span>
                      </button>
                    {/if}
                    <button type="button" class="notif-close-btn" on:click={() => isNotifOpen = false} aria-label="Tutup">
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {#if $browserNotifPermission === 'default'}
                  <div class="notif-perm-bar">
                    <span class="text-xs">Aktifkan notifikasi perangkat agar tidak terlewat panggilan wawancara.</span>
                    <button type="button" class="btn btn-amber btn-sm" on:click={requestBrowserNotificationPermission}>
                      Aktifkan
                    </button>
                  </div>
                {/if}

                <div class="notif-list">
                  {#if $applicantNotifications.length === 0}
                    <div class="notif-empty">
                      <Bell size={24} class="text-muted" />
                      <p class="text-xs text-muted">Belum ada notifikasi panggilan wawancara atau verifikasi stand.</p>
                    </div>
                  {:else}
                    {#each $applicantNotifications as notif}
                      <button
                        type="button"
                        class="notif-item {notif.isRead ? '' : 'unread'} notif-status-{notif.status}"
                        on:click={() => handleSelectNotification(notif)}
                      >
                        <div class="notif-item-top">
                          <span class="notif-item-title">{notif.title}</span>
                          {#if !notif.isRead}
                            <span class="notif-unread-dot"></span>
                          {/if}
                        </div>
                        <p class="notif-item-msg">{notif.message}</p>
                        {#if notif.note}
                          <p class="notif-item-note">Catatan HRD: {notif.note}</p>
                        {/if}
                        <span class="notif-item-time">{formatNotifTime(notif.timestamp)}</span>
                      </button>
                    {/each}
                  {/if}
                </div>
              </div>
            {/if}
          </div>

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

        <button class="btn-logout" on:click={() => { isNotifOpen = false; logoutUser(); activeTab = 'portal'; }} title="Keluar Akun">
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
        <span class="bottom-nav-icon-wrap">
          <User size={20} />
          {#if $unreadNotificationCount > 0}
            <span class="bottom-nav-dot"></span>
          {/if}
        </span>
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

  .notif-wrap {
    position: relative;
  }

  .btn-notif-bell {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
    background-color: #FFFFFF;
    color: var(--color-text-main);
    transition: all 0.15s ease;
  }

  .btn-notif-bell:hover {
    background-color: var(--color-surface-muted);
    border-color: var(--color-border-strong);
  }

  .btn-notif-bell.has-unread {
    border-color: #FBBF24;
    background-color: #FFFBEB;
    color: #B45309;
  }

  .notif-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 999px;
    background-color: #DC2626;
    color: #FFFFFF;
    font-size: 0.625rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #FFFFFF;
  }

  .notif-backdrop {
    position: fixed;
    inset: 0;
    z-index: 998;
    background: transparent;
  }

  .notif-dropdown {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: min(360px, calc(100vw - 24px));
    max-height: 72vh;
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.16);
    z-index: 999;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .notif-dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 8px;
    padding: 12px 14px;
    border-bottom: 1px solid var(--color-border);
    background-color: var(--color-surface-subtle);
  }

  .notif-header-title {
    display: block;
    font-size: 0.875rem;
    font-weight: 800;
    color: var(--color-primary);
  }

  .notif-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .notif-mark-all {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--color-info);
    padding: 4px 6px;
    border-radius: var(--radius-sm);
  }

  .notif-mark-all:hover {
    background-color: #DBEAFE;
  }

  .notif-close-btn {
    padding: 4px;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
  }

  .notif-perm-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 14px;
    background-color: #FFFBEB;
    border-bottom: 1px solid #FDE68A;
    color: #92400E;
  }

  .notif-list {
    overflow-y: auto;
    max-height: 54vh;
    display: flex;
    flex-direction: column;
  }

  .notif-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 8px;
    padding: 28px 16px;
  }

  .notif-item {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background-color 0.15s ease;
    width: 100%;
  }

  .notif-item:hover {
    background-color: var(--color-surface-subtle);
  }

  .notif-item.unread {
    background-color: #EFF6FF;
  }

  .notif-item.unread.notif-status-wawancara {
    background-color: #FFFBEB;
  }

  .notif-item.unread.notif-status-diterima {
    background-color: #F0FDF4;
  }

  .notif-item-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }

  .notif-item-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .notif-unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #DC2626;
    flex-shrink: 0;
  }

  .notif-item-msg {
    font-size: 0.75rem;
    color: var(--color-text-main);
    line-height: 1.4;
  }

  .notif-item-note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-style: italic;
  }

  .notif-item-time {
    font-size: 0.6875rem;
    color: var(--color-text-light);
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

  .bottom-nav-icon-wrap {
    position: relative;
    display: inline-flex;
  }

  .bottom-nav-dot {
    position: absolute;
    top: -2px;
    right: -4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #DC2626;
    border: 1.5px solid #FFFFFF;
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

  @media (max-width: 640px) {
    .notif-dropdown {
      position: fixed;
      top: 68px;
      left: 12px;
      right: 12px;
      width: auto;
    }
  }

  @media (max-width: 480px) {
    .nav-container {
      gap: 8px;
    }
    .brand {
      min-width: 0;
      gap: 6px;
    }
    .brand-logo-img {
      height: 32px;
    }
    .brand-title {
      font-size: 0.8125rem;
    }
    .brand-subtitle {
      font-size: 0.625rem;
    }
    .action-btn-label {
      display: none;
    }
  }
</style>
