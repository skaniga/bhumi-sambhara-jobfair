<script>
  import { industries } from '../supabase.js';
  import { MapPin, Navigation, Info, Users, CheckCircle, Compass, Layers } from '@lucide/svelte';

  export let onSelectBooth = (ind) => {};

  let activeZone = 'all';

  const ZONES = [
    {
      id: 'A',
      name: 'Zona A (Sayap Kiri Depan)',
      badge: 'ZONA A',
      focus: 'Manufaktur, Jasa & LPK Pelatihan',
      color: '#1D4ED8',
      stands: ['Stand A1', 'Stand A2', 'Stand A3', 'Stand A4', 'Stand A5', 'Stand A6']
    },
    {
      id: 'B',
      name: 'Zona B (Sayap Kanan Depan)',
      badge: 'ZONA B',
      focus: 'Penyalur Global, Garmen, Telco, Keuangan & Ritel',
      color: '#B45309',
      stands: ['Stand B1', 'Stand B2', 'Stand B3', 'Stand B4', 'Stand B5', 'Stand B6']
    },
    {
      id: 'C',
      name: 'Zona C (Sayap Kiri Belakang)',
      badge: 'ZONA C',
      focus: 'BPO, Bahan Bangunan, Karoseri, Perhotelan & Alat Berat',
      color: '#DC2626',
      stands: ['Stand C1', 'Stand C2', 'Stand C3', 'Stand C4', 'Stand C5', 'Stand C6']
    },
    {
      id: 'D',
      name: 'Zona D (Sayap Kanan Belakang)',
      badge: 'ZONA D',
      focus: 'Ritel Modern, Toiletries, HVACR & Solusi SDM',
      color: '#047857',
      stands: ['Stand D1', 'Stand D2', 'Stand D3', 'Stand D4', 'Stand D5']
    }
  ];

  function getIndustryByStand(standNum) {
    return $industries.find(i => i.nomor_stand === standNum);
  }
</script>

<div class="denah-container container">
  <!-- Header Denah -->
  <div class="denah-header card">
    <div class="denah-title-row">
      <div class="denah-icon-box">
        <Compass size={28} color="#D97706" />
      </div>
      <div>
        <span class="badge badge-stand font-bold">PETA TATA LETAK RESMI</span>
        <h2 class="heading-lg">Denah 23 Stand Booth Expo</h2>
        <p class="text-xs text-muted">
          Gedung Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang • 19 November 2026
        </p>
      </div>
    </div>

    <!-- Zone Filter Pills -->
    <div class="zone-filter-bar">
      <button 
        class="zone-btn {activeZone === 'all' ? 'active' : ''}" 
        on:click={() => activeZone = 'all'}
      >
        Semua Area (23 Booth)
      </button>
      {#each ZONES as z}
        <button 
          class="zone-btn {activeZone === z.id ? 'active' : ''}" 
          on:click={() => activeZone = z.id}
        >
          {z.badge}
        </button>
      {/each}
    </div>
  </div>

  <!-- Floor Map Visual Stage -->
  <div class="card floor-stage-card">
    <div class="stage-podium">
      <div class="panggung-utama">
        <span class="stage-tag">PANGGUNG UTAMA &amp; SCREEN RESMI EXPO</span>
        <span class="text-xs text-muted">Graha Krida Wiyata</span>
      </div>
    </div>

    <!-- Central Corridor -->
    <div class="hall-layout-grid">
      <!-- Sayap Kiri (Zona A & C) -->
      <div class="hall-wing wing-left">
        <div class="wing-header">
          <span class="wing-title">SAYAP BARAT (KIRI)</span>
        </div>

        {#if activeZone === 'all' || activeZone === 'A'}
          <div class="zone-cluster cluster-a">
            <div class="cluster-label">
              <span class="badge badge-stand font-bold">ZONA A (DEPAN)</span>
              <span class="text-xs text-muted">Manufaktur &amp; Ritel</span>
            </div>
            <div class="booth-grid">
              {#each ZONES[0].stands as st}
                {@const ind = getIndustryByStand(st)}
                <div 
                  class="booth-card booth-a"
                  on:click={() => ind && onSelectBooth(ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                >
                  <div class="booth-tag-top">
                    <span class="badge badge-stand font-bold">{st}</span>
                  </div>
                  <div class="booth-logo-box">
                    <img src="/companies/{ind?.id}.svg?v=2" alt="{ind?.nama_perusahaan}" class="booth-img" />
                  </div>
                  <span class="booth-company-name">{ind?.nama_perusahaan}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if activeZone === 'all' || activeZone === 'C'}
          <div class="zone-cluster cluster-c">
            <div class="cluster-label">
              <span class="badge badge-stand font-bold">ZONA C (BELAKANG)</span>
              <span class="text-xs text-muted">Otomotif &amp; Tekstil</span>
            </div>
            <div class="booth-grid">
              {#each ZONES[2].stands as st}
                {@const ind = getIndustryByStand(st)}
                <div 
                  class="booth-card booth-c"
                  on:click={() => ind && onSelectBooth(ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                >
                  <div class="booth-tag-top">
                    <span class="badge badge-stand font-bold">{st}</span>
                  </div>
                  <div class="booth-logo-box">
                    <img src="/companies/{ind?.id}.svg?v=2" alt="{ind?.nama_perusahaan}" class="booth-img" />
                  </div>
                  <span class="booth-company-name">{ind?.nama_perusahaan}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <!-- Lorong Tengah (Main Walkway) -->
      <div class="hall-aisle">
        <div class="walkway-strip">
          <span class="walkway-text">LORONG SENTRAL KUNJUNGAN PESERTA</span>
        </div>
      </div>

      <!-- Sayap Kanan (Zona B & D) -->
      <div class="hall-wing wing-right">
        <div class="wing-header">
          <span class="wing-title">SAYAP TIMUR (KANAN)</span>
        </div>

        {#if activeZone === 'all' || activeZone === 'B'}
          <div class="zone-cluster cluster-b">
            <div class="cluster-label">
              <span class="badge badge-stand font-bold">ZONA B (DEPAN)</span>
              <span class="text-xs text-muted">Hospitality &amp; Perbankan</span>
            </div>
            <div class="booth-grid">
              {#each ZONES[1].stands as st}
                {@const ind = getIndustryByStand(st)}
                <div 
                  class="booth-card booth-b"
                  on:click={() => ind && onSelectBooth(ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                >
                  <div class="booth-tag-top">
                    <span class="badge badge-stand font-bold">{st}</span>
                  </div>
                  <div class="booth-logo-box">
                    <img src="/companies/{ind?.id}.svg?v=2" alt="{ind?.nama_perusahaan}" class="booth-img" />
                  </div>
                  <span class="booth-company-name">{ind?.nama_perusahaan}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}

        {#if activeZone === 'all' || activeZone === 'D'}
          <div class="zone-cluster cluster-d">
            <div class="cluster-label">
              <span class="badge badge-stand font-bold">ZONA D (BELAKANG)</span>
              <span class="text-xs text-muted">Pariwisata &amp; Agribisnis</span>
            </div>
            <div class="booth-grid">
              {#each ZONES[3].stands as st}
                {@const ind = getIndustryByStand(st)}
                <div 
                  class="booth-card booth-d"
                  on:click={() => ind && onSelectBooth(ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                >
                  <div class="booth-tag-top">
                    <span class="badge badge-stand font-bold">{st}</span>
                  </div>
                  <div class="booth-logo-box">
                    <img src="/companies/{ind?.id}.svg?v=2" alt="{ind?.nama_perusahaan}" class="booth-img" />
                  </div>
                  <span class="booth-company-name">{ind?.nama_perusahaan}</span>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Entrance Door -->
    <div class="hall-entrance">
      <div class="entrance-box">
        <span class="font-bold">PINTU MASUK UTAMA / GATE SCANNER PANITIA</span>
        <span class="text-xs text-muted">Registrasi &amp; Cek QR Peserta Expo</span>
      </div>
    </div>
  </div>
</div>

<style>
  .denah-container {
    padding: 24px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .denah-header {
    background-color: #FFFFFF;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }

  .denah-title-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .denah-icon-box {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background-color: var(--color-amber-light);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .zone-filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .zone-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: var(--radius-sm);
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    transition: all 0.15s ease;
  }

  .zone-btn:hover {
    color: var(--color-primary);
    border-color: var(--color-border-strong);
  }

  .zone-btn.active {
    background-color: var(--color-primary);
    color: #FFFFFF;
    border-color: var(--color-primary);
  }

  .floor-stage-card {
    background-color: #FFFFFF;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .stage-podium {
    display: flex;
    justify-content: center;
  }

  .panggung-utama {
    width: 60%;
    background-color: var(--color-primary);
    color: #FFFFFF;
    text-align: center;
    padding: 10px 16px;
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .stage-tag {
    font-size: 0.8125rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: #F59E0B;
  }

  .hall-layout-grid {
    display: grid;
    grid-template-columns: 1fr 60px 1fr;
    gap: 16px;
    align-items: stretch;
  }

  .hall-wing {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .wing-header {
    text-align: center;
    padding: 6px;
    background-color: var(--color-surface-muted);
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: var(--color-text-muted);
  }

  .zone-cluster {
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-md);
    padding: 12px;
    background-color: var(--color-surface-subtle);
  }

  .cluster-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .booth-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
  }

  .booth-card {
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s ease;
  }

  .booth-card:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 12px -2px rgb(15 23 42 / 0.12);
    border-color: var(--color-amber-accent);
  }

  .booth-card:active {
    transform: translateY(-1px) scale(1.0);
  }

  .booth-tag-top {
    margin-bottom: 6px;
  }

  .booth-logo-box {
    width: 100%;
    height: 48px;
    background-color: #FFFFFF;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    margin-bottom: 6px;
    border: 1px solid var(--color-surface-muted);
  }

  .booth-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .booth-company-name {
    font-size: 0.6875rem;
    font-weight: 700;
    color: var(--color-text-main);
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .hall-aisle {
    display: flex;
    justify-content: center;
    align-items: center;
    background: repeating-linear-gradient(to bottom, var(--color-border) 0, var(--color-border) 10px, transparent 10px, transparent 20px);
    border-radius: var(--radius-sm);
  }

  .walkway-strip {
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--color-text-light);
  }

  .hall-entrance {
    display: flex;
    justify-content: center;
    margin-top: 10px;
  }

  .entrance-box {
    border: 2px solid var(--color-success);
    background-color: var(--color-success-bg);
    color: #166534;
    text-align: center;
    padding: 10px 24px;
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  @media (max-width: 768px) {
    .hall-layout-grid {
      grid-template-columns: 1fr;
    }
    .hall-aisle {
      display: none;
    }
    .panggung-utama {
      width: 100%;
    }
  }
</style>
