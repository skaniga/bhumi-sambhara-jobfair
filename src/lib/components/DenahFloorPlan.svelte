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
    <!-- PANGGUNG UTAMA & VIP SEATS (TOP) -->
    <div class="stage-section">
      <div class="kipas-box left-fan">
        <span>🌀 Kipas Angin</span>
      </div>

      <div class="panggung-utama">
        <span class="stage-tag">BHUMI SAMBHARA EXPO &amp; JOBFAIR 2026</span>
        <h3 class="stage-title">PANGGUNG UTAMA &amp; SCREEN RESMI</h3>
        <span class="text-xs stage-loc">Graha Krida Wiyata SMK Negeri 1 Magelang</span>
      </div>

      <div class="kipas-box right-fan">
        <span>🌀 Kipas Angin</span>
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

    <!-- BOTTOM SECTION: STAND 10-12, ENTRANCE & REGISTRATION, STAND 13-15, EXIT -->
    {#if activeZone === 'all' || activeZone === 'bottom'}
      <div class="bottom-arena-wrap">
        <div class="bottom-header">
          <span class="wing-title">AREA SELATAN (BAWAH) • PINTU MASUK, REGISTRASI &amp; BOOTH 10 s/d 15</span>
        </div>

        <div class="bottom-three-col">
          <!-- Stand 10, 11, 12 + Trash Can -->
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
            <div class="trash-indicator">
              <span>🗑️ Tempat Sampah</span>
            </div>
          </div>

          <!-- Center: KWU, Registration Desk, Entrance -->
          <div class="bottom-center-cluster">
            <div class="kwu-row">
              <div class="kwu-stand">
                <span class="kwu-tag">STAND KWU</span>
                <span class="kwu-desc">Kewirausahaan Siswa</span>
              </div>
              <div class="kwu-stand">
                <span class="kwu-tag">STAND KWU</span>
                <span class="kwu-desc">Kewirausahaan Siswa</span>
              </div>
            </div>

            <!-- Meja Registrasi -->
            <div class="registration-desk">
              <CheckCircle size={18} class="reg-icon" />
              <div class="reg-text">
                <span class="reg-title">MEJA REGISTRASI &amp; SCANNER QR</span>
                <span class="reg-sub">Panitia BKK &amp; Mahasiswa UNTIDAR</span>
              </div>
            </div>

            <!-- Pintu Masuk -->
            <div class="entrance-gate">
              <ArrowDown size={18} class="gate-icon in" />
              <div class="gate-info">
                <span class="gate-title">PINTU MASUK PESERTA</span>
                <span class="gate-sub">Jalur Masuk Expo Graha Krida Wiyata</span>
              </div>
              <ArrowDown size={18} class="gate-icon in" />
            </div>
          </div>

          <!-- Stand 13, 14, 15 + Exit Gate + Trash Can -->
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

            <!-- Pintu Keluar & Trash -->
            <div class="exit-gate-wrap">
              <div class="exit-gate">
                <ArrowDown size={18} class="gate-icon out" />
                <div class="gate-info">
                  <span class="gate-title out-title">PINTU KELUAR</span>
                  <span class="gate-sub">Jalur Keluar Peserta</span>
                </div>
              </div>
              <div class="trash-indicator">
                <span>🗑️ Tempat Sampah</span>
              </div>
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

  /* Stage Section */
  .stage-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .kipas-box {
    background-color: #E2E8F0;
    color: #475569;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 8px 14px;
    border-radius: var(--radius-md);
    border: 1px dashed #94A3B8;
  }

  .panggung-utama {
    flex: 1;
    background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    color: #FFFFFF;
    text-align: center;
    padding: 16px 20px;
    border-radius: var(--radius-md);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    border-bottom: 4px solid #D97706;
  }

  .stage-tag {
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #F59E0B;
  }

  .stage-title {
    font-size: 1.125rem;
    font-weight: 800;
    margin: 4px 0;
  }

  .stage-loc {
    color: #94A3B8;
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

  .bottom-three-col {
    display: grid;
    grid-template-columns: 1.1fr 1fr 1.1fr;
    gap: 16px;
    align-items: stretch;
  }

  .bottom-cluster {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .cluster-sub-title {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #64748B;
    text-align: center;
    background-color: #F8FAFC;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #E2E8F0;
  }

  .booth-row-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .trash-indicator {
    text-align: center;
    font-size: 0.6875rem;
    font-weight: 700;
    color: #166534;
    background-color: #DCFCE7;
    border: 1px solid #86EFAC;
    padding: 4px 8px;
    border-radius: 4px;
  }

  /* Center Bottom: KWU, Registration, Entrance */
  .bottom-center-cluster {
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: space-between;
  }

  .kwu-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .kwu-stand {
    background-color: #FFFBEB;
    border: 1px dashed #D97706;
    padding: 8px 6px;
    border-radius: 4px;
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .kwu-tag {
    font-size: 0.6875rem;
    font-weight: 800;
    color: #B45309;
  }

  .kwu-desc {
    font-size: 0.625rem;
    color: #78350F;
  }

  .registration-desk {
    background-color: #EFF6FF;
    border: 2px solid #3B82F6;
    border-radius: var(--radius-sm);
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
  }

  :global(.reg-icon) {
    color: #2563EB;
    flex-shrink: 0;
  }

  .reg-text {
    display: flex;
    flex-direction: column;
  }

  .reg-title {
    font-size: 0.75rem;
    font-weight: 800;
    color: #1E40AF;
  }

  .reg-sub {
    font-size: 0.6875rem;
    color: #3B82F6;
  }

  .entrance-gate {
    background-color: #ECFDF5;
    border: 2px solid #10B981;
    border-radius: var(--radius-sm);
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  :global(.gate-icon.in) {
    color: #059669;
  }

  .gate-info {
    text-align: center;
    display: flex;
    flex-direction: column;
  }

  .gate-title {
    font-size: 0.8125rem;
    font-weight: 800;
    color: #065F46;
    letter-spacing: 0.05em;
  }

  .gate-sub {
    font-size: 0.6875rem;
    color: #059669;
  }

  /* Exit Gate */
  .exit-gate-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .exit-gate {
    background-color: #FEF2F2;
    border: 2px solid #EF4444;
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  :global(.gate-icon.out) {
    color: #DC2626;
  }

  .out-title {
    color: #991B1B;
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
    .bottom-three-col {
      grid-template-columns: 1fr;
    }
    .vip-zone {
      grid-template-columns: 1fr;
    }
    .vip-corridor {
      display: none;
    }
    .stage-section {
      flex-direction: column;
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
