<script>
  import { EVENT_DETAILS } from '../initialData.js';
  import { Calendar, MapPin, Building, Users, Search, QrCode, X, Image as ImageIcon, Download, Eye, Compass, Grid } from '@lucide/svelte';

  export let searchQuery = '';
  export let onSelectTab = (tab) => {};

  let isPamfletModalOpen = false;

  // Real-time Event Status & Countdown
  let eventStatusText = '';
  let eventStatusBadgeClass = 'badge-stand';

  function updateEventStatus() {
    // Event date: Thursday, 19 November 2026 09:00 WIB (UTC+7)
    // 2026-11-19T02:00:00Z
    const eventStart = new Date('2026-11-19T02:00:00Z').getTime();
    const eventEnd = new Date('2026-11-19T08:10:00Z').getTime(); // 15:10 WIB
    const now = new Date().getTime();

    if (now < eventStart) {
      const diffDays = Math.ceil((eventStart - now) / (1000 * 60 * 60 * 24));
      eventStatusText = diffDays > 1 ? `H-${diffDays} Menuju Pelaksanaan Expo` : 'Besok Pelaksanaan Expo';
      eventStatusBadgeClass = 'badge-stand';
    } else if (now >= eventStart && now <= eventEnd) {
      eventStatusText = 'SEDANG BERLANGSUNG HARI INI (09.00 - 15.10 WIB)';
      eventStatusBadgeClass = 'badge-terverifikasi';
    } else {
      eventStatusText = 'Pelaksanaan Expo Selesai';
      eventStatusBadgeClass = 'badge-stand';
    }
  }

  updateEventStatus();
</script>

<section class="hero-section">
  <div class="container">
    <div class="hero-brand-strip">
      <img src="/logo-bhumi-sambhara.svg" alt="Logo Resmi Bhumi Sambhara Career Portal 2026" class="hero-brand-svg" />
    </div>

    <div class="hero-grid">
      <div class="hero-content">
        <div class="institution-tag">
          <span>KOLABORASI: K1 PARIWISATA 2024 UNTIDAR × SMK NEGERI 1 MAGELANG</span>
          {#if eventStatusText}
            <span class="badge {eventStatusBadgeClass} event-countdown-pill">{eventStatusText}</span>
          {/if}
        </div>

        <h1 class="heading-xl hero-title">
          {EVENT_DETAILS.title}
        </h1>

        <p class="hero-tagline">
          "{EVENT_DETAILS.tagline}"
        </p>

        <p class="hero-desc">
          Platform terpadu seleksi karir, pendaftaran lamaran digital, dan verifikasi kehadiran stand berbasis scan barcode untuk 23 mitra industri terkemuka.
        </p>

        <div class="meta-row">
          <div class="meta-item">
            <Calendar size={16} class="meta-icon" />
            <span>{EVENT_DETAILS.dateText} | {EVENT_DETAILS.timeText}</span>
          </div>
          <div class="meta-item">
            <MapPin size={16} class="meta-icon" />
            <span>{EVENT_DETAILS.venue}</span>
          </div>
        </div>

        <div class="search-box">
          <Search size={18} class="search-icon" />
          <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Cari lowongan (Mekanik, Perhotelan, Ritel, Kasir, atau nama PT)..." 
            class="search-input"
          />
          {#if searchQuery}
            <button class="btn-clear-search" on:click={() => searchQuery = ''} title="Hapus pencarian">
              <X size={16} />
            </button>
          {/if}
        </div>

        <!-- Quick Access Buttons -->
        <div class="hero-quick-nav">
          <button class="btn-hero-chip" on:click={() => onSelectTab('lowongan')}>
            <Grid size={15} />
            <span>Katalog 23 Industri</span>
          </button>
          <button class="btn-hero-chip highlight-amber" on:click={() => onSelectTab('denah')}>
            <Compass size={15} />
            <span>🗺️ Buka Peta Denah 23 Stand</span>
          </button>
          <button class="btn-hero-chip" on:click={() => isPamfletModalOpen = true}>
            <Eye size={15} />
            <span>Lihat Pamflet Resmi</span>
          </button>
        </div>
      </div>

      <!-- Hero Visual Card: Pamflet Acara & Key Metrics -->
      <div class="hero-pamflet-card">
        <div class="pamflet-preview-wrap" on:click={() => isPamfletModalOpen = true} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && (isPamfletModalOpen = true)}>
          <img src="/pamflet-jobfair-2026.jpg" alt="Pamflet Resmi Bhumi Sambhara Expo 2026" class="pamflet-thumbnail" />
          <div class="pamflet-overlay">
            <div class="overlay-badge">
              <Eye size={16} />
              <span>Lihat Pamflet Resmi</span>
            </div>
          </div>
        </div>

        <div class="pamflet-card-body">
          <div class="pamflet-header-row">
            <div>
              <h4 class="pamflet-card-title">Pamflet Resmi Acara</h4>
              <p class="text-xs text-muted">Indoor Graha Krida Wiyata • 19 Nov 2026</p>
            </div>
            <button class="btn btn-secondary btn-sm" on:click={() => isPamfletModalOpen = true}>
              <Eye size={14} /> Perbesar
            </button>
          </div>

          <div class="stats-mini-grid">
            <div class="mini-stat">
              <span class="mini-num tabular-nums">23</span>
              <span class="mini-lbl">Mitra Industri</span>
            </div>
            <div class="mini-stat">
              <span class="mini-num tabular-nums">2.600+</span>
              <span class="mini-lbl">Lowongan Kerja</span>
            </div>
            <div class="mini-stat">
              <span class="mini-num tabular-nums">Gratis</span>
              <span class="mini-lbl">Terbuka Umum</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Modal Perbesar Pamflet Resmi -->
{#if isPamfletModalOpen}
  <div class="modal-backdrop" on:click={() => isPamfletModalOpen = false} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (isPamfletModalOpen = false)}>
    <div class="modal-content pamflet-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div>
          <h3 class="heading-sm">Pamflet Resmi Bhumi Sambhara Expo 2026</h3>
          <p class="text-xs text-muted">K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang</p>
        </div>
        <button class="btn-close" on:click={() => isPamfletModalOpen = false}>
          <X size={20} />
        </button>
      </div>

      <div class="modal-body pamflet-modal-body">
        <div class="pamflet-full-wrap">
          <img src="/pamflet-jobfair-2026.jpg" alt="Pamflet Lengkap Bhumi Sambhara Expo 2026" class="pamflet-full-img" />
        </div>
      </div>

      <div class="modal-footer">
        <a href="/pamflet-jobfair-2026.jpg" download="Pamflet_Bhumi_Sambhara_Expo_2026.jpg" class="btn btn-primary btn-sm">
          <Download size={15} /> Unduh Berkas Pamflet
        </a>
        <button class="btn btn-secondary btn-sm" on:click={() => isPamfletModalOpen = false}>
          Tutup
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .hero-section {
    background-color: #FFFFFF;
    border-bottom: 1px solid var(--color-border);
    padding: 24px 0 36px;
  }

  .hero-brand-strip {
    margin-bottom: 24px;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--color-border);
  }

  .hero-brand-svg {
    height: auto;
    max-height: 52px;
    width: auto;
    max-width: 100%;
    display: block;
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.35fr 1fr;
    gap: 32px;
    align-items: center;
  }

  .hero-content, .hero-pamflet-card {
    min-width: 0;
    max-width: 100%;
  }

  .institution-tag {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    background-color: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--color-primary);
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .event-countdown-pill {
    font-size: 0.6875rem;
    font-weight: 800;
    padding: 2px 8px;
    letter-spacing: normal;
  }

  .hero-title {
    color: var(--color-primary);
    margin-bottom: 6px;
  }

  .hero-tagline {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--color-amber-accent);
    margin-bottom: 12px;
  }

  .hero-desc {
    font-size: 0.9375rem;
    color: var(--color-text-muted);
    margin-bottom: 20px;
    max-width: 620px;
    line-height: 1.6;
  }

  .meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 24px;
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-main);
    background-color: var(--color-surface-subtle);
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--color-border);
  }

  :global(.meta-icon) {
    color: var(--color-amber-accent);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #FFFFFF;
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-md);
    padding: 8px 14px;
    box-shadow: var(--shadow-sm);
    max-width: 580px;
  }

  :global(.search-icon) {
    color: var(--color-text-muted);
  }

  .search-input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 0.875rem;
    color: var(--color-text-main);
  }

  .hero-quick-nav {
    display: flex;
    gap: 10px;
    margin-top: 14px;
    flex-wrap: wrap;
  }

  .btn-hero-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 700;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    color: var(--color-text-main);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-hero-chip:hover {
    background-color: #FFFFFF;
    border-color: var(--color-border-strong);
    transform: translateY(-1px);
  }

  .btn-hero-chip.highlight-amber {
    background-color: var(--color-amber-light);
    border-color: #FBBF24;
    color: #92400E;
  }

  .btn-hero-chip.highlight-amber:hover {
    background-color: #FDE68A;
  }

  .btn-clear-search {
    padding: 4px;
    color: var(--color-text-muted);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
  }

  .btn-clear-search:hover {
    color: var(--color-primary);
  }

  /* Pamflet Hero Card */
  .hero-pamflet-card {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
  }

  .pamflet-preview-wrap {
    height: 180px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    background-color: #0F172A;
  }

  .pamflet-thumbnail {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .pamflet-preview-wrap:hover .pamflet-thumbnail {
    transform: scale(1.05);
  }

  .pamflet-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, transparent 60%);
    display: flex;
    align-items: flex-end;
    padding: 14px;
  }

  .overlay-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background-color: rgba(255, 255, 255, 0.92);
    color: var(--color-primary);
    padding: 5px 10px;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .pamflet-card-body {
    padding: 16px 20px 20px;
  }

  .pamflet-header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 14px;
  }

  .pamflet-card-title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .stats-mini-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .mini-stat {
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .mini-num {
    font-size: 1.125rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .mini-lbl {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
  }

  /* Modal Pamflet Full View */
  .pamflet-modal {
    max-width: 680px;
  }

  .pamflet-modal-body {
    padding: 16px;
    background-color: #0F172A;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pamflet-full-wrap {
    max-height: 72vh;
    overflow-y: auto;
    border-radius: var(--radius-md);
  }

  .pamflet-full-img {
    width: 100%;
    height: auto;
    display: block;
  }

  .btn-close {
    padding: 6px;
    color: var(--color-text-muted);
  }

  .btn-close:hover {
    color: var(--color-primary);
  }

  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
    .hero-brand-svg {
      max-height: 42px;
    }
  }

  @media (max-width: 480px) {
    .meta-item {
      max-width: 100%;
      white-space: normal;
      word-break: break-word;
    }
    .pamflet-card-body {
      padding: 14px;
    }
    .stats-mini-grid {
      gap: 6px;
    }
    .mini-stat {
      padding: 6px;
      min-width: 0;
    }
    .mini-num {
      font-size: 1rem;
    }
  }
</style>
