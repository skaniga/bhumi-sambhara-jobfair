<script>
  import { 
    currentUser, 
    industries, 
    vacancies, 
    applications, 
    allUsers, 
    standAttendances, 
    syncFromSupabase, 
    updateApplicationStatus, 
    updateCompany,
    updateVacancy,
    createVacancy,
    deleteVacancy
  } from '../supabase.js';
  import { onMount } from 'svelte';
  import { 
    Building2, ScanLine, CheckCircle, Clock, UserCheck, XCircle, Search, Edit, Save, RefreshCw,
    Briefcase, Plus, Trash2, Edit3, MapPin, Banknote, GraduationCap, Users, CheckCircle2, AlertCircle, X,
    FileSpreadsheet
  } from '@lucide/svelte';
  import * as XLSX from 'xlsx';

  export let onOpenScanner = () => {};

  onMount(async () => {
    await syncFromSupabase();
  });

  let editMode = false;
  let activeTab = 'pelamar'; // 'pelamar' | 'lowongan' | 'alamat'
  let filterStatus = 'all';
  let searchQuery = '';
  let syncing = false;

  // Dedicated Edit Alamat state
  let alamatInput = '';
  let alamatCompanyId = '';
  let alamatSaving = false;
  let alamatError = '';
  let alamatSuccess = '';

  // Logo upload state
  let editLogoUrl = '';
  let logoPreview = '';
  let logoUploading = false;

  async function handleRefresh() {
    syncing = true;
    await syncFromSupabase();
    setTimeout(() => { syncing = false; }, 600);
  }

  // Current company
  let selectedCompanyId = '';
  $: effectiveCompanyId = selectedCompanyId || $currentUser?.company_id || ($industries[0] ? $industries[0].id : '');
  $: company = $industries.find(i => i.id === effectiveCompanyId) || $industries[0];

  // Editable stand profile fields
  let editNama = '';
  let editStand = '';
  let editDeskripsi = '';
  let editPic = '';
  let editEmail = '';
  let editAlamat = '';

  $: if (company && !editMode) {
    editNama = company.nama_perusahaan || '';
    editStand = company.nomor_stand || '';
    editDeskripsi = company.deskripsi || '';
    editPic = company.kontak_pic || '';
    editEmail = company.email || '';
    editAlamat = company.alamat || '';
    editLogoUrl = company.logo_url || '';
    logoPreview = company.logo_url || '';
  }

  $: if (company && company.id !== alamatCompanyId) {
    alamatCompanyId = company.id;
    alamatInput = company.alamat || '';
    alamatError = '';
    alamatSuccess = '';
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
  $: compAttendances = $standAttendances.filter(s => s.industry_id === company?.id);
  $: totalStandScans = compAttendances.length;
  $: totalPendaftar = compApplications.length;
  $: totalTerverifikasi = Math.max(compApplications.filter(a => a.status === 'terverifikasi_stand').length, totalStandScans);
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
    const trimmedAlamat = (editAlamat || '').trim();
    const res = await updateCompany(company.id, {
      nama_perusahaan: (editNama || '').trim(),
      nomor_stand: (editStand || '').trim(),
      deskripsi: (editDeskripsi || '').trim(),
      kontak_pic: (editPic || '').trim(),
      email: (editEmail || '').trim(),
      alamat: trimmedAlamat,
      alamat_kantor: trimmedAlamat,
      logo_url: logoPreview || null
    });
    if (res?.success !== false) {
      alamatInput = trimmedAlamat;
      editMode = false;
    }
  }

  function openAddressTab() {
    activeTab = 'alamat';
    alamatInput = company?.alamat || '';
    alamatError = '';
    alamatSuccess = '';
  }

  function handleResetAddress() {
    alamatInput = company?.alamat || '';
    alamatError = '';
    alamatSuccess = '';
  }

  async function handleSaveAddress() {
    alamatError = '';
    alamatSuccess = '';
    const trimmed = (alamatInput || '').trim();

    if (!trimmed) {
      alamatError = 'Mohon masukkan alamat lengkap kantor / perusahaan terlebih dahulu.';
      return;
    }

    if (!company?.id) {
      alamatError = 'Data perusahaan tidak ditemukan.';
      return;
    }

    alamatSaving = true;
    const res = await updateCompany(company.id, {
      alamat: trimmed,
      alamat_kantor: trimmed
    });
    alamatSaving = false;

    if (res?.success) {
      editAlamat = trimmed;
      alamatInput = trimmed;
      alamatSuccess = 'Alamat pemberi kerja berhasil diperbarui dan disinkronkan ke portal!';
      setTimeout(() => {
        alamatSuccess = '';
      }, 4000);
    } else {
      alamatError = res?.error || 'Gagal memperbarui alamat perusahaan. Silakan coba lagi.';
    }
  }

  function handleLogoFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, SVG, WebP)');
      return;
    }
    if (file.size > 500 * 1024) {
      alert('Ukuran file logo maksimal 500 KB. Harap kompres gambar terlebih dahulu.');
      return;
    }
    logoUploading = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview = e.target.result;
      editLogoUrl = e.target.result;
      logoUploading = false;
    };
    reader.onerror = () => {
      alert('Gagal membaca file. Coba lagi.');
      logoUploading = false;
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    logoPreview = '';
    editLogoUrl = '';
  }

  function exportApplicantsExcel() {
    const data = filteredApplications.map((app, idx) => {
      const applicant = getApplicant(app.applicant_id);
      const vac = getVacancy(app.vacancy_id);

      return {
        "No": idx + 1,
        "Nomor QR Pelamar": applicant?.qr_code_token || '-',
        "Nama Lengkap": applicant?.nama_lengkap || 'Pelamar',
        "Nomor WhatsApp": applicant?.nomor_wa || '-',
        "Email": applicant?.email || '-',
        "Asal Sekolah / Kampus": applicant?.asal_sekolah_kampus || '-',
        "Jurusan": applicant?.jurusan || '-',
        "Posisi Dilamar": vac?.judul_posisi || '-',
        "Formasi / Pendidikan": vac?.pendidikan || 'Umum',
        "Status Seleksi": app.status || 'menunggu',
        "Tanggal Melamar": app.created_at ? new Date(app.created_at).toLocaleString('id-ID') : '-'
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Auto fit widths
    const colWidths = [];
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let maxLen = 12;
      for (let R = range.s.r; R <= range.e.r; ++R) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell && cell.v) {
          const str = String(cell.v);
          if (str.length > maxLen) maxLen = Math.min(str.length, 35);
        }
      }
      colWidths.push({ wch: maxLen + 2 });
    }
    ws['!cols'] = colWidths;

    const sheetName = (company?.nomor_stand || 'Pelamar').slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const safeName = (company?.nama_perusahaan || 'Perusahaan').replace(/[^a-zA-Z0-9]/g, '_');
    XLSX.writeFile(wb, `Pelamar_${safeName}_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // ── Vacancy Management State & Handlers ──
  let showVacancyModal = false;
  let vacancyModalMode = 'create'; // 'create' | 'edit'
  let targetVacancyId = '';
  let vacJudul = '';
  let vacTipe = 'Penuh Waktu';
  let vacKuota = 5;
  let vacGaji = 'Ditanyakan pada saat wawancara';
  let vacPendidikan = 'Umum';
  let vacLokasi = 'Kota & Kab. Magelang';
  let vacKualifikasi = '';
  let vacPersyaratan = '';
  let vacModalError = '';
  let vacModalSuccess = '';
  let vacModalLoading = false;

  function openAddVacancy() {
    vacancyModalMode = 'create';
    targetVacancyId = '';
    vacJudul = '';
    vacTipe = 'Penuh Waktu';
    vacKuota = 5;
    vacGaji = 'Ditanyakan pada saat wawancara';
    vacPendidikan = 'Umum';
    vacLokasi = company?.alamat ? company.alamat.split(',')[0] : 'Magelang, Jawa Tengah';
    vacKualifikasi = 'Terbuka untuk umum seluruh jurusan. Berintegritas, bersemangat kerja tinggi, beretika baik, dan siap mengikuti seleksi wawancara di booth stand.';
    vacPersyaratan = 'Curriculum Vitae (CV) & Pas Foto Terbaru\nFotokopi Ijazah / SKL / Transkrip Nilai\nFotokopi KTP / Identitas Diri';
    vacModalError = '';
    vacModalSuccess = '';
    showVacancyModal = true;
  }

  function openEditVacancy(vac) {
    vacancyModalMode = 'edit';
    targetVacancyId = vac.id;
    vacJudul = vac.judul_posisi || '';
    vacTipe = vac.tipe_pekerjaan || 'Penuh Waktu';
    vacKuota = vac.kuota || 1;
    vacGaji = vac.gaji || 'Ditanyakan pada saat wawancara';
    vacPendidikan = vac.pendidikan || 'Umum';
    vacLokasi = vac.lokasi || 'Magelang';
    vacKualifikasi = vac.kualifikasi || '';
    vacPersyaratan = Array.isArray(vac.persyaratan) ? vac.persyaratan.join('\n') : (vac.persyaratan || '');
    vacModalError = '';
    vacModalSuccess = '';
    showVacancyModal = true;
  }

  async function handleSaveVacancy() {
    vacModalError = '';
    vacModalSuccess = '';
    if (!vacJudul.trim()) {
      vacModalError = 'Mohon masukkan judul posisi lowongan pekerjaan.';
      return;
    }
    if (!vacKuota || Number(vacKuota) < 1) {
      vacModalError = 'Kuota lowongan minimal 1 orang.';
      return;
    }

    vacModalLoading = true;
    const reqList = vacPersyaratan
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      judul_posisi: vacJudul.trim(),
      tipe_pekerjaan: vacTipe,
      kuota: Number(vacKuota),
      gaji: vacGaji.trim() || 'Ditanyakan pada saat wawancara',
      pendidikan: vacPendidikan.trim() || 'Umum',
      lokasi: vacLokasi.trim() || 'Magelang',
      kualifikasi: vacKualifikasi.trim(),
      persyaratan: reqList.length > 0 ? reqList : ['CV & Dokumen Pendukung']
    };

    if (vacancyModalMode === 'create') {
      const res = await createVacancy(company.id, payload);
      vacModalLoading = false;
      if (res.success) {
        vacModalSuccess = 'Lowongan berhasil dipublikasikan!';
        setTimeout(() => {
          showVacancyModal = false;
        }, 700);
      } else {
        vacModalError = res.error || 'Gagal menambahkan lowongan.';
      }
    } else {
      const res = await updateVacancy(targetVacancyId, payload);
      vacModalLoading = false;
      if (res.success) {
        vacModalSuccess = 'Data lowongan berhasil diperbarui!';
        setTimeout(() => {
          showVacancyModal = false;
        }, 700);
      } else {
        vacModalError = res.error || 'Gagal memperbarui lowongan.';
      }
    }
  }

  async function handleDeleteVacancy(vac) {
    if (confirm(`Apakah Anda yakin ingin menutup / menghapus lowongan "${vac.judul_posisi}"?`)) {
      await deleteVacancy(vac.id);
    }
  }
</script>

<div class="company-dashboard-layout container">
  <!-- Stand & Company Header -->
  <div class="card stand-hero-card">
    <div class="stand-hero-content">
      <div class="stand-logo-col">
        {#if company?.id}
          <img src={company.logo_url || `/companies/${company.id}.svg?v=3`} alt="{company?.nama_perusahaan || 'Logo'}" class="company-stand-logo-img" />
        {/if}
        <span class="badge badge-stand text-sm mt-1">{company?.nomor_stand}</span>
      </div>

      <div class="stand-main-info">
        <h2 class="heading-lg company-title">{company?.nama_perusahaan}</h2>
        <p class="text-xs text-muted">{company?.bidang_industri} • PIC: {company?.kontak_pic} ({company?.email})</p>
        <p class="text-sm ind-desc mt-1">{company?.deskripsi}</p>
        <div class="stand-address-row">
          <MapPin size={14} class="stand-address-icon" />
          <span class="text-xs text-muted">{company?.alamat || 'Alamat kantor belum diisi'}</span>
          <button type="button" class="stand-address-edit-link" on:click={openAddressTab}>
            Ubah Alamat
          </button>
        </div>
      </div>

      <div class="stand-actions">
        <button class="btn btn-secondary btn-sm" on:click={handleRefresh} disabled={syncing} title="Sinkronkan data live dari Supabase">
          <RefreshCw size={14} class={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Memperbarui...' : 'Sinkron Data'}</span>
        </button>

        <button class="btn btn-amber" on:click={onOpenScanner}>
          <ScanLine size={18} />
          <span>Scan Barcode Pelamar</span>
        </button>

        <button class="btn btn-secondary btn-sm {activeTab === 'alamat' ? 'btn-active-outline' : ''}" on:click={openAddressTab}>
          <MapPin size={14} />
          <span>Edit Alamat</span>
        </button>

        <button class="btn btn-secondary btn-sm" on:click={() => editMode = !editMode}>
          <Edit size={14} />
          <span>{editMode ? 'Tutup Edit' : 'Edit Profil Stand'}</span>
        </button>
      </div>
    </div>

    <!-- Walk-in Pipeline Status Visual Tracker -->
    <div class="pipeline-tracker-box">
      <div class="pipeline-step {totalStandScans > 0 ? 'active' : ''}">
        <div class="step-num-circle">1</div>
        <div class="step-label-group">
          <span class="step-title">Check-in Stand</span>
          <span class="step-sub">{totalStandScans} Peserta Hadir</span>
        </div>
      </div>
      <div class="pipeline-connector {totalStandScans > 0 ? 'active' : ''}"></div>
      <div class="pipeline-step {totalWawancara > 0 ? 'active' : ''}">
        <div class="step-num-circle">2</div>
        <div class="step-label-group">
          <span class="step-title">Wawancara Booth</span>
          <span class="step-sub">{totalWawancara} Dijadwalkan</span>
        </div>
      </div>
      <div class="pipeline-connector {totalWawancara > 0 ? 'active' : ''}"></div>
      <div class="pipeline-step {totalDiterima > 0 ? 'active' : ''}">
        <div class="step-num-circle">3</div>
        <div class="step-label-group">
          <span class="step-title">Lolos Seleksi</span>
          <span class="step-sub">{totalDiterima} Kandidat</span>
        </div>
      </div>
    </div>

    <!-- 4 Quick Stat Banners -->
    <div class="quick-overview-bar mb-3">
      <div class="overview-item">
        <span class="text-xs text-muted">Status Stand</span>
        <span class="badge badge-terverifikasi mt-1">Stand Aktif &amp; Siap Melayani</span>
      </div>
      <div class="overview-item">
        <span class="text-xs text-muted">Zona Hall Expo</span>
        <span class="text-xs font-bold text-primary mt-1">Indoor Graha Krida Wiyata</span>
      </div>
      <div class="overview-item">
        <span class="text-xs text-muted">Kehadiran Hari Ini</span>
        <span class="text-xs font-bold text-success tabular-nums mt-1">{totalStandScans} Peserta Check-in</span>
      </div>
      <div class="overview-item">
        <span class="text-xs text-muted">Kandidat Wawancara</span>
        <span class="text-xs font-bold text-info tabular-nums mt-1">{totalWawancara} Dijadwalkan</span>
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
          <label class="input-label" for="editAlamatPerusahaan">Alamat Kantor / Perusahaan</label>
          <textarea
            id="editAlamatPerusahaan"
            class="input-field"
            rows="2"
            placeholder="Contoh: Jl. Pemuda No. 78, Kota Magelang, Jawa Tengah"
            bind:value={editAlamat}
          ></textarea>
        </div>

        <div class="input-group">
          <label class="input-label" for="editDeskripsiPerusahaan">Deskripsi Singkat Profil Perusahaan</label>
          <textarea id="editDeskripsiPerusahaan" class="input-field" rows="2" bind:value={editDeskripsi}></textarea>
        </div>

        <!-- Logo Upload Section -->
        <div class="input-group">
          <label class="input-label" for="logoFileInput">Logo Perusahaan</label>
          <div class="logo-upload-row">
            {#if logoPreview}
              <img src={logoPreview} alt="Preview Logo" class="logo-preview-thumb" />
            {:else}
              <img src="/companies/{company?.id}.svg?v=3" alt="Logo Default" class="logo-preview-thumb logo-default" />
            {/if}
            <div class="logo-upload-actions">
              <label class="btn btn-secondary btn-sm logo-file-label" for="logoFileInput">
                {logoUploading ? '⏳ Memuat...' : '📁 Pilih Gambar Baru'}
              </label>
              <input
                id="logoFileInput"
                type="file"
                accept="image/*"
                class="logo-file-input-hidden"
                on:change={handleLogoFile}
                disabled={logoUploading}
              />
              {#if logoPreview}
                <button class="btn btn-sm" style="color:#dc2626;border-color:#dc2626;" on:click={handleRemoveLogo}>
                  🗑 Hapus Logo Custom
                </button>
              {/if}
              <p class="text-xs text-muted">Maks. 500 KB. Format: JPG, PNG, SVG, WebP.</p>
            </div>
          </div>
        </div>

        <div class="form-save-row">
          <button class="btn btn-primary btn-sm" on:click={handleSaveCompanyProfile} disabled={logoUploading}>
            <Save size={14} /> {logoUploading ? 'Memuat logo...' : 'Simpan Data Stand'}
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

    <button 
      type="button" 
      class="card metric-card metric-card-interactive {activeTab === 'lowongan' ? 'active-metric' : ''}"
      on:click={() => activeTab = 'lowongan'}
      title="Klik untuk mengelola lowongan aktif"
    >
      <div class="metric-label-row">
        <span class="metric-label">Lowongan Aktif</span>
        <Edit3 size={13} class="text-muted" />
      </div>
      <span class="metric-val tabular-nums">{compVacancies.length}</span>
      <span class="text-xs text-amber font-semibold">Klik untuk kelola &amp; edit →</span>
    </button>
  </div>

  <!-- Tabs Navigation -->
  <div class="tabs-nav-bar">
    <button 
      type="button"
      class="tab-btn {activeTab === 'pelamar' ? 'active' : ''}" 
      on:click={() => activeTab = 'pelamar'}
    >
      <Users size={16} />
      <span>Daftar Pelamar Stand</span>
      <span class="tab-badge">{compApplications.length}</span>
    </button>
    <button 
      type="button"
      class="tab-btn {activeTab === 'lowongan' ? 'active' : ''}" 
      on:click={() => activeTab = 'lowongan'}
    >
      <Briefcase size={16} />
      <span>Kelola Lowongan Aktif</span>
      <span class="tab-badge">{compVacancies.length}</span>
    </button>
    <button 
      type="button"
      class="tab-btn {activeTab === 'alamat' ? 'active' : ''}" 
      on:click={openAddressTab}
    >
      <MapPin size={16} />
      <span>Edit Alamat</span>
    </button>
  </div>

  <!-- TAB 1: Table of Applicants -->
  {#if activeTab === 'pelamar'}
    <div class="card applicants-table-card animate-fade-in">
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

          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            on:click={exportApplicantsExcel}
            title="Ekspor daftar pelamar ke format Microsoft Excel (.XLSX)"
          >
            <FileSpreadsheet size={15} />
            <span>Ekspor (.XLSX)</span>
          </button>
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
  {/if}

  <!-- TAB 2: Vacancies Management -->
  {#if activeTab === 'lowongan'}
    <div class="card vacancy-management-card animate-fade-in">
      <div class="table-header-row">
        <div>
          <h3 class="heading-md">Kelola Lowongan Aktif — {company?.nama_perusahaan}</h3>
          <p class="text-xs text-muted">Buka lowongan baru, sesuaikan kuota, gaji, kualifikasi, atau tutup posisi rekrutmen secara langsung.</p>
        </div>

        <div>
          <button class="btn btn-primary" on:click={openAddVacancy}>
            <Plus size={16} />
            <span>Tambah Lowongan Baru</span>
          </button>
        </div>
      </div>

      {#if compVacancies.length === 0}
        <div class="empty-vacancies-box">
          <Briefcase size={40} class="text-muted mb-2" />
          <h4 class="heading-sm">Belum Ada Lowongan Terdaftar</h4>
          <p class="text-xs text-muted max-w-md">Perusahaan Anda belum memiliki lowongan aktif yang dapat dilamar. Klik tombol di bawah untuk membuka lowongan baru bagi para pencari kerja.</p>
          <button class="btn btn-primary btn-sm mt-3" on:click={openAddVacancy}>
            <Plus size={14} /> Buka Lowongan Pertama
          </button>
        </div>
      {:else}
        <div class="vacancies-cards-grid">
          {#each compVacancies as vac}
            {@const appCount = $applications.filter(a => a.vacancy_id === vac.id).length}
            <div class="vacancy-admin-card">
              <div class="vac-card-header">
                <div class="vac-title-row">
                  <h4 class="vac-card-title">{vac.judul_posisi}</h4>
                  <div class="vac-badges-row">
                    <span class="badge badge-primary">{vac.tipe_pekerjaan}</span>
                    <span class="badge badge-kuota">Kuota: {vac.kuota} Orang</span>
                  </div>
                </div>
              </div>

              <div class="vac-meta-grid">
                <div class="vac-meta-item">
                  <Banknote size={14} class="text-muted" />
                  <span>{vac.gaji}</span>
                </div>
                <div class="vac-meta-item">
                  <GraduationCap size={14} class="text-muted" />
                  <span>{vac.pendidikan}</span>
                </div>
                <div class="vac-meta-item">
                  <MapPin size={14} class="text-muted" />
                  <span>{vac.lokasi}</span>
                </div>
                <div class="vac-meta-item">
                  <Users size={14} class="text-primary font-bold" />
                  <span class="text-primary font-bold">{appCount} Pelamar Masuk</span>
                </div>
              </div>

              {#if vac.kualifikasi}
                <div class="vac-detail-snippet">
                  <span class="text-xs font-semibold text-muted">Kualifikasi:</span>
                  <p class="text-xs text-main">{vac.kualifikasi}</p>
                </div>
              {/if}

              {#if vac.persyaratan && vac.persyaratan.length > 0}
                <div class="vac-detail-snippet">
                  <span class="text-xs font-semibold text-muted">Persyaratan Berkas:</span>
                  <ul class="vac-req-list">
                    {#each (Array.isArray(vac.persyaratan) ? vac.persyaratan : [vac.persyaratan]) as req}
                      <li>{req}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              <div class="vac-card-actions">
                <button class="btn btn-secondary btn-sm" on:click={() => openEditVacancy(vac)}>
                  <Edit3 size={14} />
                  <span>Edit Lowongan</span>
                </button>
                <button class="btn btn-outline-danger btn-sm" on:click={() => handleDeleteVacancy(vac)}>
                  <Trash2 size={14} />
                  <span>Hapus / Tutup</span>
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- TAB 3: Edit Alamat Pemberi Kerja -->
  {#if activeTab === 'alamat'}
    <div class="card address-management-card animate-fade-in">
      <div class="table-header-row">
        <div>
          <h3 class="heading-md">Edit Alamat Pemberi Kerja — {company?.nama_perusahaan}</h3>
          <p class="text-xs text-muted">
            Perbarui alamat resmi kantor atau lokasi perusahaan Anda. Perubahan akan langsung tampil di direktori 23 mitra industri dan detail lowongan.
          </p>
        </div>
        <span class="badge badge-stand font-bold">{company?.nomor_stand}</span>
      </div>

      <div class="current-address-preview">
        <span class="preview-label">Alamat Saat Ini di Portal</span>
        <div class="preview-value-row">
          <MapPin size={15} class="stand-address-icon" />
          <span>{company?.alamat || 'Belum ada alamat yang tersimpan'}</span>
        </div>
      </div>

      {#if alamatError}
        <div class="alert-box alert-danger mb-3">
          <AlertCircle size={16} />
          <span class="text-xs">{alamatError}</span>
        </div>
      {/if}

      {#if alamatSuccess}
        <div class="alert-box alert-success mb-3">
          <CheckCircle2 size={16} />
          <span class="text-xs">{alamatSuccess}</span>
        </div>
      {/if}

      <div class="input-group">
        <label class="input-label" for="companyAddressTextarea">Alamat Lengkap Kantor / Perusahaan *</label>
        <textarea
          id="companyAddressTextarea"
          class="input-field"
          rows="3"
          placeholder="Contoh: Jl. Mayjen Bambang Soegeng No. 8, Mertoyudan, Magelang, Jawa Tengah"
          bind:value={alamatInput}
        ></textarea>
        <p class="text-xs text-muted">
          Disarankan mencantumkan nama jalan, nomor gedung/kawasan, kecamatan, dan kota/kabupaten agar mudah dikenali pelamar.
        </p>
      </div>

      <div class="address-form-actions">
        {#if (alamatInput || '').trim() !== (company?.alamat || '').trim()}
          <button
            type="button"
            class="btn btn-secondary btn-sm"
            on:click={handleResetAddress}
            disabled={alamatSaving}
          >
            Batal / Kembalikan
          </button>
        {/if}
        <button
          type="button"
          class="btn btn-primary"
          on:click={handleSaveAddress}
          disabled={alamatSaving}
        >
          <Save size={16} />
          <span>{alamatSaving ? 'Menyimpan...' : 'Simpan Alamat Perusahaan'}</span>
        </button>
      </div>
    </div>
  {/if}
</div>

<!-- Modal Form: Add / Edit Vacancy -->
{#if showVacancyModal}
  <div class="modal-backdrop" on:click={() => showVacancyModal = false} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && (showVacancyModal = false)}>
    <div class="modal-content vacancy-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div>
          <h3 class="heading-md">
            {vacancyModalMode === 'create' ? 'Tambah Lowongan Kerja Baru' : 'Edit Lowongan Kerja'}
          </h3>
          <p class="text-xs text-muted">{company?.nama_perusahaan} (Stand {company?.nomor_stand})</p>
        </div>
        <button class="btn-close" on:click={() => showVacancyModal = false} aria-label="Tutup">
          <X size={20} />
        </button>
      </div>

      <div class="modal-body">
        {#if vacModalError}
          <div class="alert-box alert-danger mb-3">
            <AlertCircle size={16} />
            <span class="text-xs">{vacModalError}</span>
          </div>
        {/if}
        {#if vacModalSuccess}
          <div class="alert-box alert-success mb-3">
            <CheckCircle2 size={16} />
            <span class="text-xs">{vacModalSuccess}</span>
          </div>
        {/if}

        <div class="grid-2">
          <div class="input-group">
            <label class="input-label" for="vacJudulInput">Judul Posisi Lowongan *</label>
            <input 
              id="vacJudulInput"
              type="text" 
              class="input-field" 
              placeholder="Contoh: Operator Produksi, Kasir, Teknisi" 
              bind:value={vacJudul}
            />
          </div>

          <div class="input-group">
            <label class="input-label" for="vacTipeSelect">Tipe Ikatan Kerja</label>
            <select id="vacTipeSelect" class="input-field" bind:value={vacTipe}>
              <option value="Penuh Waktu">Penuh Waktu (Full-time)</option>
              <option value="Kontrak">Kontrak (PKWT)</option>
              <option value="Magang">Magang / Internship</option>
              <option value="Paruh Waktu">Paruh Waktu (Part-time)</option>
            </select>
          </div>
        </div>

        <div class="grid-3">
          <div class="input-group">
            <label class="input-label" for="vacKuotaInput">Kuota Rekrutmen (Orang) *</label>
            <input 
              id="vacKuotaInput"
              type="number" 
              min="1" 
              class="input-field tabular-nums" 
              bind:value={vacKuota}
            />
          </div>

          <div class="input-group">
            <label class="input-label" for="vacGajiInput">Estimasi Gaji / Upah</label>
            <input 
              id="vacGajiInput"
              type="text" 
              class="input-field" 
              placeholder="Contoh: UMK Magelang / Rp 2.500.000" 
              bind:value={vacGaji}
            />
          </div>

          <div class="input-group">
            <label class="input-label" for="vacPendidikanInput">Pendidikan Minimal</label>
            <input 
              id="vacPendidikanInput"
              type="text" 
              class="input-field" 
              placeholder="Contoh: SMK/SMA / D3 / S1" 
              bind:value={vacPendidikan}
            />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label" for="vacLokasiInput">Lokasi Penempatan Kerja</label>
          <input 
            id="vacLokasiInput"
            type="text" 
            class="input-field" 
            placeholder="Contoh: Kota Magelang / D.I. Yogyakarta" 
            bind:value={vacLokasi}
          />
        </div>

        <div class="input-group">
          <label class="input-label" for="vacKualifikasiInput">Kualifikasi Pelamar</label>
          <textarea 
            id="vacKualifikasiInput" 
            class="input-field" 
            rows="2" 
            placeholder="Kriteria usia, keahlian khusus, pengalaman, atau soft skills..."
            bind:value={vacKualifikasi}
          ></textarea>
        </div>

        <div class="input-group">
          <label class="input-label" for="vacPersyaratanInput">Persyaratan Berkas (Satu baris per dokumen)</label>
          <textarea 
            id="vacPersyaratanInput" 
            class="input-field" 
            rows="3" 
            placeholder="CV & Pas Foto&#10;Fotokopi Ijazah / SKL&#10;Fotokopi KTP / KK"
            bind:value={vacPersyaratan}
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={() => showVacancyModal = false}>
          Batal
        </button>
        <button type="button" class="btn btn-primary" on:click={handleSaveVacancy} disabled={vacModalLoading}>
          {vacModalLoading ? 'Menyimpan...' : vacancyModalMode === 'create' ? 'Terbitkan Lowongan' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  </div>
{/if}

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

  .stand-logo-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .company-stand-logo-img {
    width: 180px;
    height: 78px;
    object-fit: contain;
    border-radius: var(--radius-md);
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    padding: 2px;
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

  .stand-address-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }

  :global(.stand-address-icon) {
    color: var(--color-amber-accent);
    flex-shrink: 0;
  }

  .stand-address-edit-link {
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-amber-accent);
    text-decoration: underline;
    text-underline-offset: 2px;
    margin-left: 4px;
    padding: 2px 4px;
  }

  .stand-address-edit-link:hover {
    color: var(--color-amber-dark);
  }

  .btn-active-outline {
    border-color: var(--color-primary);
    background-color: var(--color-surface-muted);
    color: var(--color-primary);
  }

  .stand-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
  }

  .pipeline-tracker-box {
    display: flex;
    align-items: center;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 12px 20px;
    margin-top: 18px;
    gap: 12px;
  }

  .pipeline-step {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
  }

  .pipeline-step.active {
    opacity: 1;
  }

  .step-num-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: var(--color-surface-muted);
    border: 2px solid var(--color-border-strong);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 800;
    color: var(--color-text-muted);
  }

  .pipeline-step.active .step-num-circle {
    background-color: var(--color-primary);
    border-color: var(--color-primary);
    color: #FFFFFF;
  }

  .step-label-group {
    display: flex;
    flex-direction: column;
  }

  .step-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-text-main);
  }

  .step-sub {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
  }

  .pipeline-connector {
    flex: 1;
    height: 2px;
    background-color: var(--color-border);
    margin: 0 4px;
  }

  .pipeline-connector.active {
    background-color: var(--color-primary);
  }

  .quick-overview-bar {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-top: 18px;
    padding-top: 14px;
    border-top: 1px solid var(--color-border);
  }

  .overview-item {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
  }

  .mb-3 { margin-bottom: 12px; }

  .edit-company-form {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .logo-upload-row {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-top: 6px;
  }

  .logo-preview-thumb {
    width: 80px;
    height: 56px;
    object-fit: contain;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: #f9fafb;
    padding: 4px;
    flex-shrink: 0;
  }

  .logo-default {
    opacity: 0.6;
  }

  .logo-upload-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .logo-file-label {
    cursor: pointer;
    display: inline-block;
  }

  .logo-file-input-hidden {
    display: none;
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

  .metric-card-interactive {
    text-align: left;
    cursor: pointer;
    background: #FFFFFF;
    transition: all 0.2s ease;
  }

  .metric-card-interactive:hover {
    border-color: var(--color-amber-accent);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .metric-card-interactive.active-metric {
    border-color: var(--color-amber-accent);
    background-color: #FFFBEB;
  }

  .metric-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
  .text-amber { color: var(--color-amber-accent); }

  /* ── Tabs Navigation ── */
  .tabs-nav-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 2px;
  }

  /* ── Address Management Section ── */
  .address-management-card {
    padding: 24px;
  }

  .current-address-preview {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 14px 16px;
    margin-bottom: 18px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .preview-label {
    font-size: 0.6875rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--color-text-muted);
  }

  .preview-value-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary);
    line-height: 1.45;
  }

  .address-form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .tab-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: -4px;
    border-radius: var(--radius-md) var(--radius-md) 0 0;
  }

  .tab-btn:hover {
    color: var(--color-primary);
    background-color: rgba(15, 23, 42, 0.03);
  }

  .tab-btn.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: 700;
    background-color: #FFFFFF;
  }

  .tab-badge {
    background-color: var(--color-surface-muted);
    color: var(--color-text-muted);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .tab-btn.active .tab-badge {
    background-color: var(--color-primary);
    color: #FFFFFF;
  }

  /* ── Applicant Table Card ── */
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

  /* ── Vacancy Management Section ── */
  .vacancy-management-card {
    padding: 24px;
  }

  .empty-vacancies-box {
    text-align: center;
    padding: 48px 20px;
    background-color: var(--color-surface-subtle);
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .vacancies-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
  }

  .vacancy-admin-card {
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: var(--shadow-sm);
    transition: all 0.2s ease;
  }

  .vacancy-admin-card:hover {
    border-color: var(--color-border-strong);
    box-shadow: var(--shadow-md);
  }

  .vac-card-header {
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 12px;
  }

  .vac-title-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .vac-card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-primary);
    line-height: 1.3;
  }

  .vac-badges-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .badge-kuota {
    background-color: #EFF6FF;
    color: #1D4ED8;
    border: 1px solid #BFDBFE;
    font-size: 0.6875rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
  }

  .vac-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    background-color: var(--color-surface-subtle);
    padding: 10px 12px;
    border-radius: var(--radius-md);
    font-size: 0.75rem;
  }

  .vac-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-text-main);
  }

  .vac-detail-snippet {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .vac-req-list {
    margin-left: 18px;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    line-height: 1.4;
  }

  .vac-card-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: auto;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
  }

  .btn-outline-danger {
    background-color: transparent;
    color: #BE123C;
    border: 1px solid #FECDD3;
  }

  .btn-outline-danger:hover {
    background-color: #FFF1F2;
    border-color: #FDA4AF;
  }

  /* ── Vacancy Modal ── */
  .vacancy-modal {
    max-width: 620px;
    width: 100%;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 14px;
    margin-bottom: 12px;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }

  .alert-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    font-size: 0.8125rem;
  }

  .alert-danger {
    background-color: #FFF1F2;
    border: 1px solid #FECDD3;
    color: #9F1239;
  }

  .alert-success {
    background-color: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #065F46;
  }

  .modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(15, 23, 42, 0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
  }

  .modal-content {
    background-color: #FFFFFF;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    overflow: hidden;
    border: 1px solid var(--color-border);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 18px 24px;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-body {
    padding: 20px 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 24px;
    background-color: var(--color-surface-subtle);
    border-top: 1px solid var(--color-border);
  }

  .btn-close {
    background: none;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
  }

  .btn-close:hover {
    color: var(--color-primary);
    background-color: var(--color-surface-muted);
  }

  .mt-1 { margin-top: 4px; }
  .mt-3 { margin-top: 12px; }
  .mb-2 { margin-bottom: 8px; }
  .max-w-md { max-width: 440px; }

  @media (max-width: 768px) {
    .stand-actions {
      align-items: flex-start;
      width: 100%;
    }

    .grid-2, .grid-3 {
      grid-template-columns: 1fr;
    }

    .vacancies-cards-grid {
      grid-template-columns: 1fr;
    }

    .quick-overview-bar {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
