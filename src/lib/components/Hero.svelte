<script>
  import { EVENT_DETAILS } from '../initialData.js';
  import { Calendar, MapPin, Building, Users, Search, QrCode, X } from '@lucide/svelte';

  export let searchQuery = '';
</script>

<section class="hero-section">
  <div class="container">
    <div class="hero-logos-strip">
      <img src="/institutional-logos.png" alt="Logo Resmi UNTIDAR x SMK Negeri 1 Magelang" class="logos-strip-img" />
    </div>

    <div class="hero-grid">
      <div class="hero-content">
        <div class="institution-tag">
          <span>KOLABORASI RESMI: K1 PARIWISATA 2024 UNTIDAR X SMK NEGERI 1 MAGELANG</span>
        </div>

        <h1 class="heading-xl hero-title">
          {EVENT_DETAILS.title}
        </h1>

        <p class="hero-tagline">
          "{EVENT_DETAILS.tagline}"
        </p>

        <p class="hero-desc">
          Platform terpadu seleksi karir, pendaftaran lamaran digital, dan verifikasi kehadiran stand berbasis scan barcode barcode untuk 20 perusahaan terkemuka.
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
      </div>

      <div class="hero-stats-card">
        <div class="stats-header">
          <span class="stats-title">Ringkasan Bursa Kerja</span>
          <span class="badge badge-stand">Terbuka untuk Umum</span>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <span class="stat-number tabular-nums">20</span>
            <span class="stat-label">Stand Industri</span>
          </div>
          <div class="stat-box">
            <span class="stat-number tabular-nums">2.000+</span>
            <span class="stat-label">Peluang Karir</span>
          </div>
          <div class="stat-box">
            <span class="stat-number tabular-nums">Stand A1-D5</span>
            <span class="stat-label">Area Graha Krida</span>
          </div>
          <div class="stat-box">
            <span class="stat-number tabular-nums">Gratis</span>
            <span class="stat-label">Tanpa Biaya</span>
          </div>
        </div>

        <div class="stats-footer">
          <p class="text-xs text-muted">
            Pelamar wajib membawa Kartu QR Digital untuk presensi kehadiran saat mendatangi stand perusahaan di lokasi acara.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .hero-section {
    background-color: #FFFFFF;
    border-bottom: 1px solid var(--color-border);
    padding: 30px 0 36px;
  }

  .hero-logos-strip {
    display: flex;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
  }

  .logos-strip-img {
    height: 48px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 1px 2px rgba(15, 23, 42, 0.05));
  }

  .hero-grid {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 36px;
    align-items: center;
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
    margin-bottom: 14px;
  }

  .hero-title {
    color: var(--color-primary);
    margin-bottom: 8px;
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
    gap: 16px;
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

  .hero-stats-card {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
  }

  .stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
    margin-bottom: 16px;
  }

  .stats-title {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 16px;
  }

  .stat-box {
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 14px;
    display: flex;
    flex-direction: column;
  }

  .stat-number {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    font-weight: 500;
  }

  .stats-footer {
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
  }

  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
