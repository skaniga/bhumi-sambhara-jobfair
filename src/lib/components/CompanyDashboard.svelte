<script>
  import { currentUser, industries, vacancies, applications, allUsers, updateApplicationStatus, updateCompany } from '../supabase.js';
  import { Building2, ScanLine, CheckCircle, Clock, UserCheck, XCircle, Search, Edit, Save } from '@lucide/svelte';

  export let onOpenScanner = () => {};

  let editMode = false;
  let filterStatus = 'all';
  let searchQuery = '';

  // Current company
  $: currentCompanyId = $currentUser?.company_id || 'ind-01';
  $: company = $industries.find(i => i.id === currentCompanyId) || $industries[0];

  // Editable fields
  let editNama = '';
  let editStand = '';
  let editDeskripsi = '';
  let editPic = '';
  let editEmail = '';
  let editAlamat = '';

  $: if (company && !editMode) {
    editNama = company.nama_perusahaan;
    editStand = company.nomor_stand;
    editDeskripsi = company.deskripsi;
    editPic = company.kontak_pic;
    editEmail = company.email;
    editAlamat = company.alamat;
  }

  // Company vacancies
  $: compVacancies = $vacancies.filter(v => v.industry_id === company?.id);
  $: compVacancyIds = compVacancies.map(v => v.id);

  // Applications to this company
  $: compApplications = $applications.filter(a => compVacancyIds.includes(a.vacancy_id));

  // Filtered applications
  $: filteredApplications = compApplications.filter(app => {
    const applicant = $allUsers.find(u => u.id === app.applicant_id);
    const vac = $vacancies.find(v => v.id === app.vacancy_id);

    const matchesSearch = !searchQuery || 
      (applicant && applicant.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (vac && vac.judul_posisi.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // KPIs
  $: totalPendaftar = compApplications.length;
  $: totalTerverifikasi = compApplications.filter(a => a.status === 'terverifikasi_stand').length;
  $: totalWawancara = compApplications.filter(a => a.status === 'wawancara').length;
  $: totalDiterima = compApplications.filter(a => a.status === 'diterima').length;

  function getApplicant(id) {
    return $allUsers.find(u => u.id === id);
  }

  function getVacancy(id) {
    return $vacancies.find(v => v.id === id);
  }

  async function handleStatusChange(appId, newStatus) {
    await updateApplicationStatus(appId, newStatus, '', $currentUser?.id);
  }

  async function handleSaveCompanyProfile() {
    await updateCompany(company.id, {
      nama_perusahaan: editNama,
      nomor_stand: editStand,
      deskripsi: editDeskripsi,
      kontak_pic: editPic,
      email: editEmail,
      alamat: editAlamat
    });
    editMode = false;
  }
</script>

<div class="company-dashboard-layout container">
  <!-- Stand & Company Header -->
  <div class="card stand-hero-card">
    <div class="stand-hero-content">
      <div class="stand-badge-box">
        <span class="badge badge-stand text-sm">{company?.nomor_stand}</span>
        <span class="text-xs text-muted">Booth Resmi Expo</span>
      </div>

      <div class="stand-main-info">
        <h2 class="heading-lg company-title">{company?.nama_perusahaan}</h2>
        <p class="text-xs text-muted">{company?.bidang_industri} • PIC: {company?.kontak_pic} ({company?.email})</p>
        <p class="text-sm ind-desc mt-1">{company?.deskripsi}</p>
      </div>

      <div class="stand-actions">
        <button class="btn btn-amber" on:click={onOpenScanner}>
          <ScanLine size={18} />
          <span>Scan Barcode Pelamar</span>
        </button>

        <button class="btn btn-secondary btn-sm" on:click={() => editMode = !editMode}>
          <Edit size={14} />
          <span>{editMode ? 'Tutup Edit' : 'Edit Profil Stand'}</span>
        </button>
      </div>
    </div>

    {#if editMode}
      <div class="edit-company-form">
        <div class="grid-3">
          <div class="input-group">
            <label class="input-label" for="editNamaPerusahaan">Nama Perusahaan</label>
            <input id="editNamaPerusahaan" type="text" class="input-field" bind:value={editNama} />
          </div>
          <div class="input-group">
            <label class="input-label" for="editNomorStand">Nomor Stand / Booth</label>
            <input id="editNomorStand" type="text" class="input-field" bind:value={editStand} />
          </div>
          <div class="input-group">
            <label class="input-label" for="editKontakPic">Kontak WhatsApp PIC</label>
            <input id="editKontakPic" type="text" class="input-field tabular-nums" bind:value={editPic} />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label" for="editDeskripsiPerusahaan">Deskripsi Singkat Profil Perusahaan</label>
          <textarea id="editDeskripsiPerusahaan" class="input-field" rows="2" bind:value={editDeskripsi}></textarea>
        </div>

        <div class="form-save-row">
          <button class="btn btn-primary btn-sm" on:click={handleSaveCompanyProfile}>
            <Save size={14} /> Simpan Data Stand
          </button>
        </div>
      </div>
    {/if}
  </div>

  <!-- KPI Metrics Grid -->
  <div class="grid-4 metrics-row">
    <div class="card metric-card">
      <span class="metric-label">Total Lamaran Masuk</span>
      <span class="metric-val tabular-nums">{totalPendaftar}</span>
      <span class="text-xs text-muted">Pelamar di stand Anda</span>
    </div>

    <div class="card metric-card">
      <span class="metric-label">Terverifikasi di Stand</span>
      <span class="metric-val tabular-nums text-success">{totalTerverifikasi}</span>
      <span class="text-xs text-muted">Hadir fisik di booth</span>
    </div>

    <div class="card metric-card">
      <span class="metric-label">Panggilan Wawancara</span>
      <span class="metric-val tabular-nums text-info">{totalWawancara}</span>
      <span class="text-xs text-muted">Tahap interview langsung</span>
    </div>

    <div class="card metric-card">
      <span class="metric-label">Lowongan Aktif</span>
      <span class="metric-val tabular-nums">{compVacancies.length}</span>
      <span class="text-xs text-muted">Posisi rekrutmen dibuka</span>
    </div>
  </div>

  <!-- Table of Applicants -->
  <div class="card applicants-table-card">
    <div class="table-header-row">
      <div>
        <h3 class="heading-md">Daftar Pelamar di Stand {company?.nomor_stand}</h3>
        <p class="text-xs text-muted">Verifikasi kehadiran dan proses seleksi berkas pelamar secara langsung di tempat.</p>
      </div>

      <div class="table-controls">
        <div class="search-mini">
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Cari nama pelamar..." 
            bind:value={searchQuery}
            class="mini-search-input"
          />
        </div>

        <select class="input-field select-filter" bind:value={filterStatus}>
          <option value="all">Semua Status ({compApplications.length})</option>
          <option value="menunggu">Menunggu</option>
          <option value="terverifikasi_stand">Terverifikasi Stand</option>
          <option value="wawancara">Wawancara</option>
          <option value="diterima">Diterima</option>
          <option value="ditolak">Ditolak</option>
        </select>
      </div>
    </div>

    {#if filteredApplications.length === 0}
      <div class="empty-table">
        <p class="text-muted text-sm">Belum ada pelamar yang sesuai dengan filter atau kriteria pencarian.</p>
      </div>
    {:else}
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Pelamar</th>
              <th>Posisi Dilamar</th>
              <th>Pendidikan / Asal Sekolah</th>
              <th>Status Verifikasi</th>
              <th>Aksi Seleksi di Stand</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredApplications as app}
              {@const applicant = getApplicant(app.applicant_id)}
              {@const vac = getVacancy(app.vacancy_id)}
              <tr>
                <td>
                  <div class="applicant-cell">
                    <span class="applicant-name">{applicant?.nama_lengkap || 'Pelamar'}</span>
                    <span class="text-xs text-muted tabular-nums">WA: {applicant?.nomor_wa || '-'}</span>
                    <span class="text-xs text-light tabular-nums">Token: {applicant?.qr_code_token}</span>
                  </div>
                </td>
                <td>
                  <span class="job-title-cell">{vac?.judul_posisi}</span>
                </td>
                <td>
                  <div class="edu-cell">
                    <span>{applicant?.pendidikan_terakhir || '-'}</span>
                    <span class="text-xs text-muted">{applicant?.asal_sekolah_kampus} ({applicant?.jurusan})</span>
                  </div>
                </td>
                <td>
                  <span class="badge badge-{app.status}">
                    {app.status === 'menunggu' ? 'Menunggu di Stand' :
                     app.status === 'terverifikasi_stand' ? 'Hadir & Terverifikasi' :
                     app.status === 'wawancara' ? 'Wawancara' :
                     app.status === 'diterima' ? 'Diterima' : 'Ditolak'}
                  </span>
                </td>
                <td>
                  <div class="action-buttons-cell">
                    <button 
                      class="btn btn-sm btn-secondary" 
                      title="Tandai Hadir di Stand"
                      on:click={() => handleStatusChange(app.id, 'terverifikasi_stand')}
                    >
                      <UserCheck size={14} /> Hadir
                    </button>
                    <button 
                      class="btn btn-sm btn-amber" 
                      title="Panggil Wawancara"
                      on:click={() => handleStatusChange(app.id, 'wawancara')}
                    >
                      Wawancara
                    </button>
                    <button 
                      class="btn btn-sm btn-primary" 
                      title="Terima Lamaran"
                      on:click={() => handleStatusChange(app.id, 'diterima')}
                    >
                      Terima
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style>
  .company-dashboard-layout {
    padding: 32px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .stand-hero-card {
    background-color: #FFFFFF;
  }

  .stand-hero-content {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;
  }

  .stand-badge-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
  }

  .stand-main-info {
    flex-grow: 1;
  }

  .company-title {
    color: var(--color-primary);
    line-height: 1.2;
    margin-bottom: 2px;
  }

  .ind-desc {
    color: var(--color-text-muted);
    max-width: 600px;
  }

  .stand-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  .edit-company-form {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .form-save-row {
    display: flex;
    justify-content: flex-end;
  }

  .metric-card {
    display: flex;
    flex-direction: column;
    padding: 18px;
  }

  .metric-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .metric-val {
    font-size: 1.875rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.2;
    margin: 4px 0 2px;
  }

  .text-success { color: var(--color-success); }
  .text-info { color: var(--color-info); }

  .applicants-table-card {
    padding: 24px;
  }

  .table-header-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .table-controls {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .search-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 6px 12px;
  }

  .mini-search-input {
    border: none;
    outline: none;
    background: transparent;
    font-size: 0.8125rem;
    color: var(--color-text-main);
  }

  .select-filter {
    padding: 6px 12px;
    font-size: 0.8125rem;
    width: auto;
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

  .applicant-cell {
    display: flex;
    flex-direction: column;
  }

  .applicant-name {
    font-weight: 700;
    color: var(--color-primary);
  }

  .job-title-cell {
    font-weight: 600;
    color: var(--color-text-main);
  }

  .edu-cell {
    display: flex;
    flex-direction: column;
  }

  .action-buttons-cell {
    display: flex;
    gap: 6px;
  }

  .empty-table {
    text-align: center;
    padding: 40px;
  }

  .mt-1 { margin-top: 4px; }

  @media (max-width: 768px) {
    .stand-actions {
      align-items: flex-start;
      width: 100%;
    }
  }
</style>
