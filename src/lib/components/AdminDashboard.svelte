<script>
  import { industries, vacancies, applications, allUsers, standAttendances, syncFromSupabase } from '../supabase.js';
  import { Shield, Download, ScanLine, Users, CheckCircle, Briefcase, FileSpreadsheet, Search, RefreshCw } from '@lucide/svelte';

  export let onOpenScanner = () => {};

  let filterSearch = '';
  let syncing = false;

  async function handleRefresh() {
    syncing = true;
    await syncFromSupabase();
    setTimeout(() => { syncing = false; }, 600);
  }

  // Calculate Metrics
  $: totalJobseekers = $allUsers.filter(u => u.role === 'pelamar').length;
  $: totalApplications = $applications.length;
  $: totalStandScans = $standAttendances.length;
  $: totalVerifiedApplications = $applications.filter(a => a.status === 'terverifikasi_stand' || a.status === 'wawancara' || a.status === 'diterima').length;
  $: totalInterviews = $applications.filter(a => a.status === 'wawancara').length;
  $: totalAccepted = $applications.filter(a => a.status === 'diterima').length;

  // Build matrix per industry
  $: industryMatrix = $industries.map(ind => {
    const vacs = $vacancies.filter(v => v.industry_id === ind.id);
    const vacIds = vacs.map(v => v.id);
    const indApps = $applications.filter(a => vacIds.includes(a.vacancy_id));
    const verifiedApps = indApps.filter(a => a.status === 'terverifikasi_stand' || a.status === 'wawancara' || a.status === 'diterima');
    const boothScans = $standAttendances.filter(s => s.industry_id === ind.id);

    return {
      id: ind.id,
      stand: ind.nomor_stand,
      perusahaan: ind.nama_perusahaan,
      bidang: ind.bidang_industri,
      pic: ind.kontak_pic,
      totalVacs: vacs.length,
      totalPendaftar: indApps.length,
      totalTerverifikasi: verifiedApps.length,
      totalScanStand: boothScans.length
    };
  }).filter(item => {
    if (!filterSearch) return true;
    return item.stand.toLowerCase().includes(filterSearch.toLowerCase()) ||
           item.perusahaan.toLowerCase().includes(filterSearch.toLowerCase()) ||
           item.bidang.toLowerCase().includes(filterSearch.toLowerCase());
  });

  function exportCsv() {
    const headers = ["Nomor Stand", "Nama Perusahaan", "Bidang Industri", "PIC Kontak", "Jumlah Lowongan", "Total Pelamar", "Terverifikasi Stand"];
    const rows = industryMatrix.map(m => [
      `"${m.stand}"`,
      `"${m.perusahaan}"`,
      `"${m.bidang}"`,
      `"${m.pic}"`,
      m.totalVacs,
      m.totalPendaftar,
      m.totalTerverifikasi
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekapitulasi_Bhumi_Sambhara_Jobfair_2026_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="admin-layout container">
  <!-- Top Overview Card -->
  <div class="card admin-hero-card">
    <div class="admin-hero-row">
      <div class="admin-badge-icon">
        <Shield size={32} />
      </div>

      <div class="admin-titles">
        <div class="tag-row">
          <span class="badge badge-terverifikasi">Panitia Penyelenggara Resmi</span>
          <span class="text-xs text-muted">K1 Pariwisata 2024 UNTIDAR x SMK Negeri 1 Magelang</span>
        </div>
        <h2 class="heading-lg admin-headline">Panel Kendali & Monitoring Expo</h2>
        <p class="text-xs text-muted">
          Pantau okupansi pelamar, kehadiran barcode stand secara real-time, dan ekspor rekapitulasi 23 stand industri.
        </p>
      </div>

      <div class="admin-hero-actions">
        <button class="btn btn-secondary btn-sm" on:click={handleRefresh} disabled={syncing} title="Tarik pembaruan data real-time">
          <RefreshCw size={14} class={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Sinkron...' : 'Perbarui'}</span>
        </button>

        <button class="btn btn-amber" on:click={onOpenScanner}>
          <ScanLine size={16} />
          <span>Scanner Master Panitia</span>
        </button>

        <button class="btn btn-secondary" on:click={exportCsv}>
          <Download size={16} />
          <span>Ekspor Data (CSV)</span>
        </button>
      </div>
    </div>
  </div>

  <!-- KPI Metrics -->
  <div class="grid-4">
    <div class="card kpi-card">
      <span class="kpi-label">Total Pendaftar (Jobseekers)</span>
      <span class="kpi-value tabular-nums">{totalJobseekers}</span>
      <span class="text-xs text-muted">Siswa, Alumni & Umum</span>
    </div>

    <div class="card kpi-card">
      <span class="kpi-label">Total Lamaran Masuk</span>
      <span class="kpi-value tabular-nums">{totalApplications}</span>
      <span class="text-xs text-muted">Lamaran ke 23 stand</span>
    </div>

    <div class="card kpi-card">
      <span class="kpi-label">Terverifikasi di Stand</span>
      <span class="kpi-value tabular-nums text-success">{totalVerifiedApplications}</span>
      <span class="text-xs text-muted">Presensi fisik scan barcode</span>
    </div>

    <div class="card kpi-card">
      <span class="kpi-label">Panggilan Wawancara</span>
      <span class="kpi-value tabular-nums text-info">{totalInterviews}</span>
      <span class="text-xs text-muted">Sesi interview di lokasi</span>
    </div>
  </div>

  <!-- Denah Zona Stand Expo -->
  <div class="card zone-map-card">
    <div class="card-header">
      <h3 class="heading-sm">Denah Zona 23 Stand (Indoor Graha Krida Wiyata)</h3>
      <span class="text-xs text-muted">Tata Letak Penempatan Booth Expo</span>
    </div>
    <div class="zone-grid">
      <div class="zone-box zone-a">
        <span class="badge badge-stand font-bold">ZONA A</span>
        <span class="zone-name">Manufaktur, Jasa & Pelatihan Vokasi</span>
        <p class="text-xs text-muted mt-1">Stand A1 s/d A6 • Quick Traktor, DeWave Salon, HK Gold, LPK Atara, Captain's Club, LPK Platinum</p>
      </div>
      <div class="zone-box zone-b">
        <span class="badge badge-stand font-bold">ZONA B</span>
        <span class="zone-name">Penyalur Global, Garmen, Telco & Keuangan</span>
        <p class="text-xs text-muted mt-1">Stand B1 s/d B6 • Teratai Gogakuin, Anugerah Abadi, XL Smart, PNM, Gisara Tantra, Alfamidi</p>
      </div>
      <div class="zone-box zone-c">
        <span class="badge badge-stand font-bold">ZONA C</span>
        <span class="zone-name">BPO, Bahan Bangunan, Karoseri & Properti</span>
        <p class="text-xs text-muted mt-1">Stand C1 s/d C6 • Shelter Indonesia, Clay Jaya (BIG), Mekar Armada Jaya, Sindoro College, Uniloa, BMC</p>
      </div>
      <div class="zone-box zone-d">
        <span class="badge badge-stand font-bold">ZONA D</span>
        <span class="zone-name">Ritel Modern, Toiletries, HVACR & Solusi SDM</span>
        <p class="text-xs text-muted mt-1">Stand D1 s/d D5 • Indomaret Group, Lidah Buaya Group, Putra Teknik AC, Staffinc, Candi Bangun Persada</p>
      </div>
    </div>
  </div>

  <!-- 20 Stand Matrix Table -->
  <div class="card matrix-card">
    <div class="matrix-header-row">
      <div>
        <h3 class="heading-md">Rekapitulasi 23 Stand Industri Expo</h3>
        <p class="text-xs text-muted">Statistik persebaran pelamar dan kehadiran fisik per booth stand.</p>
      </div>

      <div class="matrix-search">
        <Search size={16} class="text-muted" />
        <input 
          type="text" 
          placeholder="Cari stand atau nama industri..." 
          bind:value={filterSearch}
          class="matrix-input"
        />
      </div>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nomor Stand</th>
            <th>Nama Perusahaan</th>
            <th>Bidang Industri</th>
            <th>Lowongan Dibuka</th>
            <th>Total Pendaftar</th>
            <th>Terverifikasi Hadir</th>
            <th>Rasio Verifikasi</th>
          </tr>
        </thead>
        <tbody>
          {#each industryMatrix as row}
            {@const rasio = row.totalPendaftar > 0 ? Math.round((row.totalTerverifikasi / row.totalPendaftar) * 100) : 0}
            <tr>
              <td>
                <span class="badge badge-stand tabular-nums font-bold">{row.stand}</span>
              </td>
              <td>
                <div class="admin-company-cell">
                  <img src="/companies/{row.id}.svg?v=2" alt="{row.perusahaan}" class="admin-logo-micro" />
                  <span class="perusahaan-cell">{row.perusahaan}</span>
                </div>
              </td>
              <td>
                <span class="text-xs text-muted">{row.bidang}</span>
              </td>
              <td>
                <span class="tabular-nums font-semibold">{row.totalVacs} Posisi</span>
              </td>
              <td>
                <span class="tabular-nums font-bold">{row.totalPendaftar}</span>
              </td>
              <td>
                <span class="tabular-nums font-bold text-success">{row.totalTerverifikasi}</span>
              </td>
              <td>
                <div class="progress-wrap">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: {rasio}%"></div>
                  </div>
                  <span class="text-xs text-muted tabular-nums">{rasio}%</span>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<style>
  .admin-layout {
    padding: 32px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .admin-hero-card {
    background-color: #FFFFFF;
  }

  .admin-hero-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .admin-badge-icon {
    width: 60px;
    height: 60px;
    background-color: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-success);
  }

  .admin-titles {
    flex-grow: 1;
  }

  .tag-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .admin-headline {
    color: var(--color-primary);
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .admin-hero-actions {
    display: flex;
    gap: 10px;
  }

  /* Zone Map Grid */
  .zone-map-card {
    padding: 20px 24px;
  }

  .zone-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
  }

  .zone-box {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .zone-name {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .admin-company-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .admin-logo-micro {
    width: 68px;
    height: 32px;
    object-fit: contain;
    border-radius: var(--radius-sm);
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    flex-shrink: 0;
    padding: 2px;
  }

  .mt-1 { margin-top: 4px; }

  .kpi-card {
    display: flex;
    flex-direction: column;
    padding: 18px;
  }

  .kpi-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .kpi-value {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.2;
    margin: 4px 0 2px;
  }

  .text-success { color: var(--color-success); }
  .text-info { color: var(--color-info); }

  .matrix-card {
    padding: 24px;
  }

  .matrix-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 14px;
  }

  .matrix-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 6px 12px;
  }

  .matrix-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.8125rem;
    width: 200px;
    color: var(--color-text-main);
  }

  .table-responsive {
    overflow-x: auto;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8125rem;
  }

  .data-table th {
    text-align: left;
    padding: 10px 14px;
    background-color: var(--color-surface-subtle);
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text-muted);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .data-table td {
    padding: 12px 14px;
    border-bottom: 1px solid var(--color-border);
    vertical-align: middle;
  }

  .perusahaan-cell {
    font-weight: 700;
    color: var(--color-primary);
  }

  .font-semibold { font-weight: 600; }
  .font-bold { font-weight: 700; }

  .progress-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .progress-bar {
    width: 80px;
    height: 6px;
    background-color: var(--color-surface-muted);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-amber-accent);
  }

  @media (max-width: 800px) {
    .admin-hero-actions {
      width: 100%;
    }
  }
</style>
