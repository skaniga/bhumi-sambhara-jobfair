<script>
  import { industries, currentUser } from '../supabase.js';
  import { MapPin, Users, Compass, Eye, X, ExternalLink, ArrowDown, ArrowUp, CheckCircle, Info } from '@lucide/svelte';

  export let onSelectBooth = (ind) => {};

  let activeZone = 'all';
  let showImageModal = false;

  // Exact booth groupings based on Denah Fix.jfif
  const LEFT_WING = [
    'Stand 1', 'Stand 2', 'Stand 3', 'Stand 4', 'Stand 5', 'Stand 6', 'Stand 7', 'Stand 8', 'Stand 9'
  ];

  const BOTTOM_LEFT = ['Stand 10', 'Stand 11', 'Stand 12'];
  const BOTTOM_RIGHT = ['Stand 13', 'Stand 14', 'Stand 15'];

  const RIGHT_WING = [
    'Stand 23', 'Stand 22', 'Stand 21', 'Stand 20', 'Stand 19', 'Stand 18', 'Stand 17', 'Stand 16'
  ];

  const ZONES = [
    { id: 'left', name: 'Sayap Kiri (Stand 1 - 9)', badge: 'SAYAP KIRI' },
    { id: 'bottom', name: 'Area Bawah (Stand 10 - 15)', badge: 'AREA SELATAN' },
    { id: 'right', name: 'Sayap Kanan (Stand 16 - 23)', badge: 'SAYAP KANAN' }
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
        <div class="badge-row">
          <span class="badge badge-stand font-bold">PETA TATA LETAK RESMI</span>
          <span class="badge badge-subtle">DENAH FIX</span>
        </div>
        <h2 class="heading-lg">Denah 23 Stand Booth Expo &amp; Jobfair</h2>
        <p class="text-xs text-muted">
          Gedung Indoor Graha Krida Wiyata, SMK Negeri 1 Magelang • Kamis, 19 November 2026
        </p>
      </div>
    </div>

    <!-- Action & Filter Bar -->
    <div class="denah-actions-bar">
      {#if $currentUser?.role === 'admin'}
        <button 
          type="button"
          class="btn-image-modal"
          on:click={() => showImageModal = true}
        >
          <Eye size={16} />
          <span>Lihat Gambar Denah Asli</span>
        </button>
      {/if}

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
  </div>

  <!-- Floor Map Visual Arena -->
  <div class="card floor-stage-card">
    <!-- PANGGUNG UTAMA & VIP SEATS (TOP) - REALISTIC EXPO STAGE -->
    <div class="stage-section stage-realistic">
      <div class="stage-wing-tower left-tower">
        <div class="tower-speaker">
          <span class="speaker-label">🔊 Line Array</span>
          <div class="speaker-grill"></div>
        </div>
        <div class="kipas-box left-fan">
          <span>🌀 Kipas Angin</span>
        </div>
      </div>

      <div class="panggung-utama-real">
        <!-- Stage Rigging Truss with Spotlights -->
        <div class="stage-truss-bar">
          <div class="truss-lights">
            <span class="truss-light">💡 Spot</span>
            <span class="truss-light">💡 Spot</span>
          </div>
          <span class="truss-title">⚡ RIGGING &amp; LIGHTING PANGGUNG EXPO 2026</span>
          <div class="truss-lights">
            <span class="truss-light">💡 Spot</span>
            <span class="truss-light">💡 Spot</span>
          </div>
        </div>

        <!-- Stage LED Screen with Official Event Flyer -->
        <div class="stage-led-screen">
          <img src="/pamflet-jobfair-2026.jpg" alt="Pamflet Resmi Bhumi Sambhara Expo 2026" class="stage-flyer-img" />
          <div class="stage-screen-overlay">
            <div class="screen-badge-top">
              <span class="stage-tag">BHUMI SAMBHARA EXPO &amp; JOBFAIR 2026</span>
            </div>
            <div class="screen-meta-bottom">
              <h3 class="stage-title">PANGGUNG UTAMA &amp; SCREEN RESMI</h3>
              <span class="stage-loc">Graha Krida Wiyata SMK Negeri 1 Magelang • K1 Pariwisata UNTIDAR × SKANISA</span>
            </div>
          </div>
        </div>

        <!-- Stage Platform Deck / Apron -->
        <div class="stage-platform-deck">
          <div class="stage-step left-step"> tangga </div>
          <div class="stage-apron-center">
            <span class="stage-apron-text">🏛️ PANGGUNG UTAMA EXPO • GRAHA KRIDA WIYATA</span>
          </div>
          <div class="stage-step right-step"> tangga </div>
        </div>
      </div>

      <div class="stage-wing-tower right-tower">
        <div class="tower-speaker">
          <span class="speaker-label">🔊 Line Array</span>
          <div class="speaker-grill"></div>
        </div>
        <div class="kipas-box right-fan">
          <span>🌀 Kipas Angin</span>
        </div>
      </div>
    </div>

    <!-- Area Kursi VIP -->
    <div class="vip-zone">
      <div class="vip-block">
        <span class="vip-title">KURSI VIP (KIRI)</span>
        <span class="vip-sub">Tamu Undangan &amp; Pejabat</span>
      </div>
      <div class="vip-corridor">
        <span>AKSES VIP</span>
      </div>
      <div class="vip-block">
        <span class="vip-title">KURSI VIP (KANAN)</span>
        <span class="vip-sub">Kepala Sekolah &amp; UNTIDAR</span>
      </div>
    </div>

    <!-- MAIN HALL (LEFT WING - SEATING - RIGHT WING) -->
    <div class="hall-layout-grid">
      <!-- Sayap Kiri: Stand 1 - Stand 9 -->
      {#if activeZone === 'all' || activeZone === 'left'}
        <div class="hall-wing wing-left">
          <div class="wing-header">
            <span class="wing-title">SAYAP BARAT (KIRI) • STAND 1 s/d 9</span>
          </div>

          <div class="booth-column">
            {#each LEFT_WING as st}
              {@const ind = getIndustryByStand(st)}
              <div 
                class="booth-card booth-left"
                on:click={() => ind && onSelectBooth(ind)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                title="Klik untuk melihat lowongan {ind?.nama_perusahaan || st}"
              >
                <div class="booth-tag-top">
                  <span class="badge badge-stand font-bold">{st}</span>
                </div>
                <div class="booth-logo-box">
                  {#if ind?.id}
                    <img src={ind?.logo_url || `/companies/${ind?.id}.svg?v=3`} alt="{ind?.nama_perusahaan || 'Logo'}" class="booth-img" />
                  {/if}
                </div>
                <span class="booth-company-name">{ind?.nama_perusahaan || 'Mitra Industri'}</span>
                <span class="booth-sector-sub">{ind?.bidang_industri || ''}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Center: Area Peserta & Walkway -->
      {#if activeZone === 'all'}
        <div class="hall-center">
          <div class="peserta-seating-box">
            <div class="peserta-block">
              <Users size={20} class="peserta-icon" />
              <span class="peserta-title">AREA PESERTA (BLOK 1)</span>
              <span class="peserta-sub">Tempat Duduk &amp; Antrean Pelamar</span>
            </div>
            
            <div class="central-walkway">
              <span class="walkway-label">LORONG SENTRAL KUNJUNGAN BOOTH</span>
            </div>

            <div class="peserta-block">
              <Users size={20} class="peserta-icon" />
              <span class="peserta-title">AREA PESERTA (BLOK 2)</span>
              <span class="peserta-sub">Tempat Duduk &amp; Antrean Pelamar</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Sayap Kanan: Stand 23 down to Stand 16 -->
      {#if activeZone === 'all' || activeZone === 'right'}
        <div class="hall-wing wing-right">
          <div class="wing-header">
            <span class="wing-title">SAYAP TIMUR (KANAN) • STAND 23 s/d 16</span>
          </div>

          <div class="booth-column">
            {#each RIGHT_WING as st}
              {@const ind = getIndustryByStand(st)}
              <div 
                class="booth-card booth-right"
                on:click={() => ind && onSelectBooth(ind)}
                role="button"
                tabindex="0"
                on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                title="Klik untuk melihat lowongan {ind?.nama_perusahaan || st}"
              >
                <div class="booth-tag-top">
                  <span class="badge badge-stand font-bold">{st}</span>
                </div>
                <div class="booth-logo-box">
                  {#if ind?.id}
                    <img src={ind?.logo_url || `/companies/${ind?.id}.svg?v=3`} alt="{ind?.nama_perusahaan || 'Logo'}" class="booth-img" />
                  {/if}
                </div>
                <span class="booth-company-name">{ind?.nama_perusahaan || 'Mitra Industri'}</span>
                <span class="booth-sector-sub">{ind?.bidang_industri || ''}</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- BOTTOM SECTION: EXACT LAYOUT ACCORDING TO OFFICIAL DENAH FIX SKETCH -->
    {#if activeZone === 'all' || activeZone === 'bottom'}
      <div class="bottom-arena-wrap">
        <div class="bottom-header">
          <span class="wing-title">AREA SELATAN (BAWAH) • PINTU MASUK, REGISTRASI, STAND KWU &amp; BOOTH 10 s/d 15</span>
        </div>

        <!-- Upper Row: Stand 10-12 | PINTU MASUK ↖️ ↗️ | Stand 13-15 | PINTU KELUAR ⬇️ -->
        <div class="bottom-hall-row">
          <!-- Stand 10, 11, 12 Block (West of Entrance) -->
          <div class="bottom-cluster left-bottom-cluster">
            <div class="cluster-sub-title">SISI BARAT DAYA (STAND 10 - 12)</div>
            <div class="booth-row-grid">
              {#each BOTTOM_LEFT as st}
                {@const ind = getIndustryByStand(st)}
                <div 
                  class="booth-card booth-bottom"
                  on:click={() => ind && onSelectBooth(ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                >
                  <div class="booth-tag-top">
                    <span class="badge badge-stand font-bold">{st}</span>
                  </div>
                  <div class="booth-logo-box">
                    {#if ind?.id}
                      <img src={ind?.logo_url || `/companies/${ind?.id}.svg?v=3`} alt="{ind?.nama_perusahaan || 'Logo'}" class="booth-img" />
                    {/if}
                  </div>
                  <span class="booth-company-name">{ind?.nama_perusahaan || 'Mitra Industri'}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Central Entrance Passageway ("Masuk" with arrows ↖️ ↗️ into Hall) -->
          <div class="center-masuk-portal">
            <div class="masuk-arrows-row">
              <span class="masuk-arrow">↖️</span>
              <span class="masuk-arrow">↗️</span>
            </div>
            <div class="masuk-label-badge">
              <span class="masuk-title">MASUK</span>
              <span class="masuk-sub">Akses Masuk ke Hall</span>
            </div>
          </div>

          <!-- Stand 13, 14, 15 Block (East of Entrance) -->
          <div class="bottom-cluster right-bottom-cluster">
            <div class="cluster-sub-title">SISI TENGGARA (STAND 13 - 15)</div>
            <div class="booth-row-grid">
              {#each BOTTOM_RIGHT as st}
                {@const ind = getIndustryByStand(st)}
                <div 
                  class="booth-card booth-bottom"
                  on:click={() => ind && onSelectBooth(ind)}
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => e.key === 'Enter' && ind && onSelectBooth(ind)}
                >
                  <div class="booth-tag-top">
                    <span class="badge badge-stand font-bold">{st}</span>
                  </div>
                  <div class="booth-logo-box">
                    {#if ind?.id}
                      <img src={ind?.logo_url || `/companies/${ind?.id}.svg?v=3`} alt="{ind?.nama_perusahaan || 'Logo'}" class="booth-img" />
                    {/if}
                  </div>
                  <span class="booth-company-name">{ind?.nama_perusahaan || 'Mitra Industri'}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Exit Passageway ("Keluar" with arrow ⬇️) -->
          <div class="right-keluar-portal">
            <div class="keluar-arrow-row">
              <ArrowDown size={24} class="gate-icon out" />
            </div>
            <div class="keluar-label-badge">
              <span class="keluar-title">KELUAR</span>
              <span class="keluar-sub">Jalur Keluar</span>
            </div>
          </div>
        </div>

        <!-- Lower Row: Foyer Front (Stand KWU, Meja Registrasi, Pintu Masuk, Stand KWU, Pintu Keluar, Tempat Sampah) -->
        <div class="bottom-foyer-strip">
          <!-- Left Section: Trash Can + Stand KWU + Meja Registrasi -->
          <div class="foyer-block-left">
            <div class="trash-box">
              <span class="trash-emoji">🗑️</span>
              <span class="trash-text">Tempat Sampah</span>
            </div>

            <div class="kwu-tables-deck">
              <div class="table-sprites">🪑 🪑 🪑 🪑 🪑</div>
              <span class="kwu-label">Stand KWU</span>
            </div>

            <!-- Meja Registrasi (Immediately Left of Masuk Entrance) -->
            <div class="meja-registrasi-booth">
              <div class="reg-table-graphic">🪑📋</div>
              <div class="reg-info">
                <span class="reg-main-title">Meja Registrasi</span>
                <span class="reg-sub-title">Scanner QR &amp; Presensi</span>
              </div>
            </div>
          </div>

          <!-- Center Entrance Doorway from Outside -->
          <div class="foyer-gate-portal">
            <div class="gate-sign-box">
              <span class="gate-arrow-up">⬆️</span>
              <div class="gate-text-col">
                <span class="gate-headline">PINTU MASUK PESERTA</span>
                <span class="gate-caption">Pintu Gerbang Graha Krida Wiyata</span>
              </div>
              <span class="gate-arrow-up">⬆️</span>
            </div>
          </div>

          <!-- Right Section: Stand KWU + Exit Door + Trash Can -->
          <div class="foyer-block-right">
            <div class="kwu-tables-deck">
              <div class="table-sprites">🪑 🪑 🪑 🪑 🪑</div>
              <span class="kwu-label">Stand KWU</span>
            </div>

            <!-- Pintu Keluar Doorway -->
            <div class="exit-door-box">
              <ArrowDown size={18} class="gate-icon out" />
              <span class="exit-door-label">Pintu Keluar</span>
            </div>

            <div class="trash-box">
              <span class="trash-emoji">🗑️</span>
              <span class="trash-text">Tempat Sampah</span>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<!-- Modal Gambar Denah Asli (Denah Fix.jfif) - Admin Only -->
{#if showImageModal && $currentUser?.role === 'admin'}
  <div 
    class="modal-backdrop" 
    on:click={() => showImageModal = false}
    role="button" 
    tabindex="0" 
    on:keydown={(e) => e.key === 'Escape' && (showImageModal = false)}
  >
    <div 
      class="modal-content denah-image-modal" 
      on:click|stopPropagation 
      on:keydown|stopPropagation 
      role="dialog" 
      aria-modal="true" 
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <span class="badge badge-stand">DOKUMEN RESMI</span>
          <h3 class="heading-md modal-title">Denah Resmi Bhumi Sambhara Expo 2026</h3>
          <p class="text-xs text-muted">Layout Graha Krida Wiyata SMK Negeri 1 Magelang</p>
        </div>
        <button class="btn-close" on:click={() => showImageModal = false} title="Tutup Preview">
          <X size={20} />
        </button>
      </div>

      <div class="modal-body denah-image-body">
        <div class="image-viewer-box">
          <img 
            src="/denah-resmi.jpg" 
            alt="Denah Resmi Bhumi Sambhara Jobfair 2026" 
            class="full-denah-img" 
          />
        </div>
      </div>

      <div class="modal-footer">
        <a 
          href="/denah-resmi.jpg" 
          target="_blank" 
          rel="noopener noreferrer" 
          class="btn btn-primary"
        >
          <ExternalLink size={16} />
          <span>Buka Ukuran Asli di Tab Baru</span>
        </a>
        <button 
          type="button" 
          class="btn btn-outline" 
          on:click={() => showImageModal = false}
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
{/if}

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
    padding: 20px 24px;
  }

  .denah-title-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .badge-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  .badge-subtle {
    background-color: #F1F5F9;
    color: #475569;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .denah-icon-box {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background-color: var(--color-amber-light);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .denah-actions-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .btn-image-modal {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #0F172A;
    color: #FFFFFF;
    font-size: 0.8125rem;
    font-weight: 700;
    border-radius: var(--radius-sm);
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-image-modal:hover {
    background-color: #1E293B;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.15);
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
    cursor: pointer;
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
    background-color: #F8FAFC;
    border: 2px solid #E2E8F0;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-radius: var(--radius-lg);
  }

  /* Realistic Stage Section */
  .stage-section.stage-realistic {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 16px;
  }

  .stage-wing-tower {
    width: 110px;
    background-color: #1E293B;
    border: 2px solid #334155;
    border-radius: var(--radius-md);
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.25);
  }

  .tower-speaker {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .speaker-label {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #F8FAFC;
    letter-spacing: 0.04em;
  }

  .speaker-grill {
    height: 90px;
    width: 100%;
    background: repeating-linear-gradient(0deg, #0F172A, #0F172A 3px, #334155 3px, #334155 6px);
    border-radius: 4px;
    border: 1px solid #475569;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);
  }

  .stage-wing-tower .kipas-box {
    background-color: #0F172A;
    color: #94A3B8;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 6px 4px;
    border-radius: 4px;
    border: 1px dashed #475569;
    text-align: center;
    width: 100%;
  }

  .panggung-utama-real {
    flex: 1;
    max-width: 820px;
    background: #0B1120;
    border: 2px solid #1E293B;
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.35);
  }

  .stage-truss-bar {
    background: linear-gradient(90deg, #1E293B 0%, #334155 50%, #1E293B 100%);
    padding: 6px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #D97706;
    color: #F1F5F9;
  }

  .truss-title {
    font-size: 0.6875rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #FCD34D;
  }

  .truss-lights {
    display: flex;
    gap: 8px;
  }

  .truss-light {
    font-size: 0.625rem;
    font-weight: 700;
    color: #FEF08A;
    background: rgba(245, 158, 11, 0.2);
    border: 1px solid rgba(245, 158, 11, 0.5);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .stage-led-screen {
    position: relative;
    width: 100%;
    height: 240px;
    background-color: #020617;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stage-flyer-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 20%;
    filter: brightness(0.95) contrast(1.05);
    transition: transform 0.3s ease;
  }

  .stage-led-screen:hover .stage-flyer-img {
    transform: scale(1.02);
  }

  .stage-screen-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, transparent 45%, rgba(15, 23, 42, 0.88) 100%);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 12px 16px;
    pointer-events: none;
  }

  .screen-badge-top {
    display: flex;
    justify-content: center;
  }

  .stage-tag {
    font-size: 0.6875rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    color: #FFFFFF;
    background: rgba(217, 119, 6, 0.9);
    padding: 3px 12px;
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }

  .screen-meta-bottom {
    text-align: center;
  }

  .stage-title {
    font-size: 1.125rem;
    font-weight: 900;
    color: #FFFFFF;
    letter-spacing: 0.04em;
    margin: 0 0 2px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.8);
  }

  .stage-loc {
    font-size: 0.75rem;
    font-weight: 600;
    color: #CBD5E1;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  }

  .stage-platform-deck {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(180deg, #78350F 0%, #451A03 100%);
    border-top: 3px solid #D97706;
    padding: 6px 12px;
    color: #FEF3C7;
  }

  .stage-step {
    background: #292524;
    color: #D6D3D1;
    font-size: 0.625rem;
    font-weight: 800;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 2px;
    border: 1px solid #78716C;
    letter-spacing: 0.05em;
  }

  .stage-apron-center {
    flex: 1;
    text-align: center;
  }

  .stage-apron-text {
    font-size: 0.75rem;
    font-weight: 800;
    color: #FDE68A;
    letter-spacing: 0.05em;
  }

  /* VIP Zone */
  .vip-zone {
    display: grid;
    grid-template-columns: 1fr 100px 1fr;
    gap: 14px;
    align-items: center;
  }

  .vip-block {
    background-color: #FEF3C7;
    border: 1px solid #FCD34D;
    color: #92400E;
    text-align: center;
    padding: 10px;
    border-radius: var(--radius-sm);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .vip-title {
    font-size: 0.8125rem;
    font-weight: 800;
    letter-spacing: 0.05em;
  }

  .vip-sub {
    font-size: 0.6875rem;
    color: #B45309;
  }

  .vip-corridor {
    text-align: center;
    font-size: 0.6875rem;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
  }

  /* Hall Layout Grid */
  .hall-layout-grid {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr 1.1fr;
    gap: 16px;
    align-items: stretch;
  }

  .hall-wing {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .wing-header {
    text-align: center;
    padding: 8px;
    background-color: #E2E8F0;
    border-radius: var(--radius-sm);
  }

  .wing-title {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #334155;
  }

  .booth-column {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .booth-card {
    background-color: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-md);
    padding: 10px 12px;
    display: grid;
    grid-template-columns: 80px 48px 1fr;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  }

  .booth-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(0,0,0,0.08);
    border-color: #D97706;
  }

  .booth-left {
    border-left: 4px solid #2563EB;
  }

  .booth-right {
    border-right: 4px solid #059669;
  }

  .booth-bottom {
    display: flex;
    flex-direction: column;
    text-align: center;
    border-top: 3px solid #7C3AED;
    padding: 12px 10px;
    gap: 6px;
  }

  .booth-tag-top {
    flex-shrink: 0;
  }

  .booth-logo-box {
    width: 44px;
    height: 44px;
    background-color: #FFFFFF;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3px;
    border: 1px solid #E2E8F0;
    flex-shrink: 0;
  }

  .booth-bottom .booth-logo-box {
    margin: 0 auto;
    width: 48px;
    height: 48px;
  }

  .booth-img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }

  .booth-company-name {
    font-size: 0.75rem;
    font-weight: 700;
    color: #0F172A;
    line-height: 1.25;
  }

  .booth-sector-sub {
    grid-column: 1 / -1;
    font-size: 0.6875rem;
    color: #64748B;
    border-top: 1px dashed #F1F5F9;
    padding-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Center Seating & Walkway */
  .hall-center {
    display: flex;
    flex-direction: column;
  }

  .peserta-seating-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    justify-content: space-around;
  }

  .peserta-block {
    background-color: #EDE9FE;
    border: 1px dashed #8B5CF6;
    border-radius: var(--radius-md);
    padding: 24px 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  :global(.peserta-icon) {
    color: #6D28D9;
    margin-bottom: 4px;
  }

  .peserta-title {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #5B21B6;
    letter-spacing: 0.05em;
  }

  .peserta-sub {
    font-size: 0.6875rem;
    color: #7C3AED;
  }

  .central-walkway {
    background: repeating-linear-gradient(to bottom, #CBD5E1 0, #CBD5E1 8px, transparent 8px, transparent 16px);
    padding: 16px 8px;
    border-radius: var(--radius-sm);
    text-align: center;
  }

  .walkway-label {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #475569;
    letter-spacing: 0.1em;
    background-color: #FFFFFF;
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #CBD5E1;
  }

  /* Bottom Arena */
  .bottom-arena-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
    background-color: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: var(--radius-md);
    padding: 16px;
  }

  .bottom-header {
    text-align: center;
  }

  /* Bottom Hall Row: 10-12 | Masuk | 13-15 | Keluar */
  .bottom-hall-row {
    display: grid;
    grid-template-columns: 1.1fr 140px 1.1fr 90px;
    gap: 12px;
    align-items: stretch;
    background-color: #F8FAFC;
    border: 1px solid #E2E8F0;
    padding: 12px;
    border-radius: var(--radius-md);
  }

  .bottom-cluster {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cluster-sub-title {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #475569;
    text-align: center;
    background-color: #FFFFFF;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #CBD5E1;
  }

  .booth-row-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .center-masuk-portal {
    background-color: #ECFDF5;
    border: 2px dashed #059669;
    border-radius: var(--radius-sm);
    padding: 10px 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    text-align: center;
  }

  .masuk-arrows-row {
    font-size: 1.25rem;
    display: flex;
    gap: 8px;
  }

  .masuk-title {
    display: block;
    font-size: 0.8125rem;
    font-weight: 900;
    color: #065F46;
    letter-spacing: 0.06em;
  }

  .masuk-sub {
    display: block;
    font-size: 0.625rem;
    color: #059669;
    font-weight: 600;
  }

  .right-keluar-portal {
    background-color: #FEF2F2;
    border: 2px dashed #EF4444;
    border-radius: var(--radius-sm);
    padding: 10px 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    text-align: center;
  }

  .keluar-title {
    display: block;
    font-size: 0.8125rem;
    font-weight: 900;
    color: #991B1B;
    letter-spacing: 0.06em;
  }

  .keluar-sub {
    display: block;
    font-size: 0.625rem;
    color: #DC2626;
    font-weight: 600;
  }

  /* Bottom Foyer Strip: KWU, Meja Registrasi, Pintu Gerbang, Trash */
  .bottom-foyer-strip {
    display: grid;
    grid-template-columns: 1.1fr 200px 1.1fr;
    gap: 12px;
    align-items: center;
    background-color: #F1F5F9;
    border: 1px solid #CBD5E1;
    padding: 12px 14px;
    border-radius: var(--radius-md);
  }

  .foyer-block-left {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .trash-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #DCFCE7;
    border: 1px solid #86EFAC;
    border-radius: 6px;
    padding: 4px 6px;
    flex-shrink: 0;
  }

  .trash-emoji {
    font-size: 1.125rem;
  }

  .trash-text {
    font-size: 0.5625rem;
    font-weight: 800;
    color: #166534;
    white-space: nowrap;
  }

  .kwu-tables-deck {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #FFFBEB;
    border: 1px dashed #D97706;
    border-radius: 6px;
    padding: 6px 8px;
    text-align: center;
  }

  .table-sprites {
    font-size: 0.8125rem;
    letter-spacing: 2px;
  }

  .kwu-label {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #92400E;
    margin-top: 2px;
  }

  .meja-registrasi-booth {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #EFF6FF;
    border: 2px solid #2563EB;
    border-radius: 6px;
    padding: 6px 10px;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.12);
  }

  .reg-table-graphic {
    font-size: 1.25rem;
  }

  .reg-info {
    display: flex;
    flex-direction: column;
  }

  .reg-main-title {
    font-size: 0.75rem;
    font-weight: 800;
    color: #1E40AF;
    white-space: nowrap;
  }

  .reg-sub-title {
    font-size: 0.625rem;
    color: #3B82F6;
    font-weight: 600;
    white-space: nowrap;
  }

  .foyer-gate-portal {
    display: flex;
    justify-content: center;
  }

  .gate-sign-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #059669;
    color: #FFFFFF;
    padding: 8px 14px;
    border-radius: 6px;
    box-shadow: 0 3px 8px rgba(5, 150, 105, 0.25);
  }

  .gate-arrow-up {
    font-size: 1.125rem;
  }

  .gate-text-col {
    display: flex;
    flex-direction: column;
    text-align: center;
  }

  .gate-headline {
    font-size: 0.75rem;
    font-weight: 900;
    letter-spacing: 0.05em;
    white-space: nowrap;
  }

  .gate-caption {
    font-size: 0.5625rem;
    color: #D1FAE5;
    white-space: nowrap;
  }

  .foyer-block-right {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: space-between;
  }

  .exit-door-box {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: #FEF2F2;
    border: 2px solid #EF4444;
    border-radius: 6px;
    padding: 6px 10px;
    flex-shrink: 0;
  }

  .exit-door-label {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #991B1B;
    white-space: nowrap;
  }

  /* Image Modal */
  .denah-image-modal {
    max-width: 900px;
    width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .denah-image-body {
    padding: 16px;
    overflow-y: auto;
    max-height: calc(85vh - 140px);
    background-color: #0F172A;
    display: flex;
    justify-content: center;
  }

  .image-viewer-box {
    max-width: 100%;
    display: flex;
    justify-content: center;
  }

  .full-denah-img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  /* Responsive Adjustments */
  @media (max-width: 992px) {
    .hall-layout-grid {
      grid-template-columns: 1fr;
    }
    .bottom-hall-row {
      grid-template-columns: 1fr;
    }
    .bottom-foyer-strip {
      grid-template-columns: 1fr;
    }
    .foyer-block-left, .foyer-block-right {
      flex-wrap: wrap;
      justify-content: center;
    }
    .vip-zone {
      grid-template-columns: 1fr;
    }
    .vip-corridor {
      display: none;
    }
    .stage-section.stage-realistic {
      flex-direction: column;
    }
    .stage-wing-tower {
      width: 100%;
      flex-direction: row;
    }
    .speaker-grill {
      height: 40px;
    }
    .kipas-box {
      width: 100%;
      text-align: center;
    }
  }

  @media (max-width: 640px) {
    .booth-card {
      grid-template-columns: 70px 40px 1fr;
      padding: 8px 10px;
    }
    .booth-row-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
