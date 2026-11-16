<script>
  import { industries, vacancies } from '../supabase.js';
  import { Building2, Briefcase, MapPin, ChevronRight, Filter } from '@lucide/svelte';

  export let searchQuery = '';
  export let onSelectVacancy = (vac, ind) => {};

  let selectedSector = 'Semua';

  const SECTORS = [
    'Semua',
    'Manufaktur',
    'Retail',
    'Pendidikan',
    'Perhotelan',
    'Otomotif',
    'HVAC',
    'Keuangan',
    'Telekomunikasi',
    'Jasa'
  ];

  $: filteredIndustries = $industries.filter(ind => {
    const matchesSearch = 
      !searchQuery ||
      ind.nama_perusahaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.nomor_stand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.bidang_industri.toLowerCase().includes(searchQuery.toLowerCase()) ||
      $vacancies.some(v => v.industry_id === ind.id && v.judul_posisi.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector = 
      selectedSector === 'Semua' || 
      ind.bidang_industri.toLowerCase().includes(selectedSector.toLowerCase());

    return matchesSearch && matchesSector;
  });

  function getVacanciesForIndustry(indId) {
    return $vacancies.filter(v => v.industry_id === indId);
  }

  function getSectorCount(sec) {
    if (sec === 'Semua') return $industries.length;
    return $industries.filter(i => i.bidang_industri.toLowerCase().includes(sec.toLowerCase())).length;
  }
</script>

<div class="directory-wrap">
  <div class="directory-header">
    <div class="header-left">
      <h2 class="heading-lg">{$industries.length || 23} Mitra Industri & LPK Resmi</h2>
      <p class="text-sm text-muted">
        Daftar seluruh stand perusahaan yang membuka rekrutmen kerja pada Bhumi Sambhara Expo 2026.
      </p>
    </div>

    <div class="filter-pills">
      {#each SECTORS as sec}
        {@const cnt = getSectorCount(sec)}
        {#if cnt > 0 || sec === 'Semua'}
          <button 
            class="filter-pill {selectedSector === sec ? 'active' : ''}"
            on:click={() => selectedSector = sec}
          >
            {sec} <span class="pill-count tabular-nums">({cnt})</span>
          </button>
        {/if}
      {/each}
    </div>
  </div>

  {#if filteredIndustries.length === 0}
    <div class="card empty-state">
      <p class="text-muted">Tidak ditemukan industri atau lowongan yang sesuai dengan kata kunci pencarian.</p>
    </div>
  {:else}
    <div class="industry-grid">
      {#each filteredIndustries as ind}
        {@const vacs = getVacanciesForIndustry(ind.id)}
        <div class="card industry-card">
          <div class="card-top">
            <div class="company-banner-wrap">
              <img src="/companies/{ind.id}.svg?v=2" alt="{ind.nama_perusahaan}" class="company-card-banner" />
            </div>
            <div class="ind-badge-row">
              <span class="badge badge-stand font-bold">{ind.nomor_stand}</span>
              <span class="text-xs text-muted">{ind.bidang_industri}</span>
            </div>
            <h3 class="heading-md ind-name">{ind.nama_perusahaan}</h3>
            <p class="text-xs text-muted ind-desc">{ind.deskripsi}</p>
          </div>

          <div class="card-middle">
            <div class="vac-header">
              <span class="vac-title">Lowongan Dibuka ({vacs.length} Posisi):</span>
            </div>

            <div class="vac-list">
              {#each vacs as vac}
                <div 
                  class="vac-item"
                  on:click={() => onSelectVacancy(vac, ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && onSelectVacancy(vac, ind)}
                >
                  <div class="vac-info">
                    <span class="vac-name">{vac.judul_posisi}</span>
                    <span class="text-xs text-muted">{vac.pendidikan} • {vac.tipe_pekerjaan}</span>
                  </div>
                  <ChevronRight size={16} class="chevron-icon" />
                </div>
              {/each}
            </div>
          </div>

          <div class="card-bottom">
            <div class="loc-text">
              <MapPin size={13} />
              <span>{ind.alamat}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .directory-wrap {
    padding: 32px 0 60px;
  }

  .directory-header {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
  }

  .filter-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .filter-pill {
    padding: 6px 14px;
    font-size: 0.8125rem;
    font-weight: 600;
    border-radius: var(--radius-sm);
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    transition: all 0.15s ease;
  }

  .filter-pill:hover {
    color: var(--color-text-main);
    border-color: var(--color-border-strong);
  }

  .filter-pill.active {
    background-color: var(--color-primary);
    color: #FFFFFF;
    border-color: var(--color-primary);
  }

  .industry-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
  }

  .industry-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: #FFFFFF;
    position: relative;
    overflow: hidden;
  }

  .industry-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-amber-accent) 100%);
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  .industry-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
    border-color: #CBD5E1;
  }

  .industry-card:hover::before {
    opacity: 1;
  }

  .company-banner-wrap {
    margin-bottom: 12px;
  }

  .company-card-banner {
    width: 100%;
    height: 78px;
    object-fit: contain;
    border-radius: var(--radius-sm);
    display: block;
    background-color: #FFFFFF;
    padding: 2px;
  }

  .font-bold {
    font-weight: 700;
  }

  .ind-badge-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .ind-name {
    color: var(--color-primary);
    margin-bottom: 6px;
  }

  .ind-desc {
    line-height: 1.45;
    margin-bottom: 14px;
  }

  .card-middle {
    border-top: 1px dashed var(--color-border);
    padding-top: 12px;
    margin-top: auto;
  }

  .vac-header {
    margin-bottom: 8px;
  }

  .vac-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
  }

  .vac-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .vac-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color 0.15s ease, border-color 0.15s ease;
  }

  .vac-item:hover {
    background-color: #FFFFFF;
    border-color: var(--color-amber-accent);
  }

  .vac-info {
    display: flex;
    flex-direction: column;
  }

  .vac-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  :global(.chevron-icon) {
    color: var(--color-text-light);
  }

  .card-bottom {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid var(--color-border);
  }

  .loc-text {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.6875rem;
    color: var(--color-text-muted);
  }

  .empty-state {
    text-align: center;
    padding: 40px;
  }

  @media (max-width: 640px) {
    .industry-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
