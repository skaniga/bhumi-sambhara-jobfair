<script>
  import { onMount } from 'svelte';
  import {
    currentUser,
    industries,
    vacancies,
    applications,
    allUsers,
    standAttendances,
    syncFromSupabase,
    updateCompany,
    deleteUserAccount
  } from '../supabase.js';
  import {
    Shield, Download, ScanLine, Users, CheckCircle, Briefcase, FileSpreadsheet, Search,
    RefreshCw, MapPin, Save, X, AlertCircle, CheckCircle2, Trash2, Building2
  } from '@lucide/svelte';
  import * as XLSX from 'xlsx';

  export let onOpenScanner = () => {};

  onMount(() => {
    syncFromSupabase();
  });

  const VALID_ADMIN_SUBTABS = ['stand', 'akun'];
  function loadInitialAdminSubtab() {
    if (typeof window === 'undefined') return 'stand';
    try {
      const saved = sessionStorage.getItem('bhumi_admin_subtab') || '';
      return VALID_ADMIN_SUBTABS.includes(saved) ? saved : 'stand';
    } catch {
      return 'stand';
    }
  }

  let activeAdminTab = loadInitialAdminSubtab(); // 'stand' | 'akun'
  $: if (typeof window !== 'undefined' && VALID_ADMIN_SUBTABS.includes(activeAdminTab)) {
    try {
      sessionStorage.setItem('bhumi_admin_subtab', activeAdminTab);
    } catch {}
  }

  let filterSearch = '';
  let syncing = false;

  // Filter & Delete Account Management State (BKK Admin)
  let userSearch = '';
  let userRoleFilter = 'all';
  let showDeleteUserModal = false;
  let userToDelete = null;
  let deletingUser = false;
  let deleteUserError = '';
  let deleteUserSuccess = '';

  function openDeleteUserModal(user) {
    userToDelete = user;
    deleteUserError = '';
    deleteUserSuccess = '';
    showDeleteUserModal = true;
  }

  function closeDeleteUserModal() {
    showDeleteUserModal = false;
    userToDelete = null;
    deleteUserError = '';
  }

  async function handleConfirmDeleteUser() {
    if (!userToDelete) return;
    deletingUser = true;
    deleteUserError = '';

    const deletedName = userToDelete.nama_lengkap || userToDelete.email;
    const res = await deleteUserAccount(userToDelete.id);
    deletingUser = false;

    if (res?.success) {
      showDeleteUserModal = false;
      userToDelete = null;
      deleteUserSuccess = `Akun "${deletedName}" berhasil dihapus beserta riwayat lamaran & presensinya.`;
      setTimeout(() => {
        deleteUserSuccess = '';
      }, 5000);
    } else {
      deleteUserError = res?.error || 'Gagal menghapus akun.';
    }
  }

  $: filteredUsers = $allUsers
    .filter(u => {
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      if (!matchesRole) return false;
      if (!userSearch.trim()) return true;
      const q = userSearch.trim().toLowerCase();
      return (u.nama_lengkap || '').toLowerCase().includes(q) ||
             (u.email || '').toLowerCase().includes(q) ||
             (u.nomor_wa || '').toLowerCase().includes(q) ||
             (u.nik_nisn || '').toLowerCase().includes(q) ||
             (u.asal_sekolah_kampus || '').toLowerCase().includes(q) ||
             (u.qr_code_token || '').toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

  function getUserAppCount(userId) {
    return $applications.filter(a => a.applicant_id === userId || a.user_id === userId).length;
  }

  function getUserAttendanceCount(userId) {
    return $standAttendances.filter(s => s.applicant_id === userId || s.user_id === userId).length;
  }

  function getCompanyName(companyId) {
    if (!companyId) return '-';
    const ind = $industries.find(i => i.id === companyId);
    return ind ? `${ind.nomor_stand} • ${ind.nama_perusahaan}` : '-';
  }

  // Modal Edit Alamat Pemberi Kerja (Admin)
  let showAddressModal = false;
  let editingCompany = null;
  let adminAddressInput = '';
  let adminAddressSaving = false;
  let adminAddressError = '';
  let adminAddressSuccess = '';

  function openEditAddressModal(row) {
    editingCompany = row;
    adminAddressInput = row.alamat || '';
    adminAddressError = '';
    adminAddressSuccess = '';
    showAddressModal = true;
  }

  function closeEditAddressModal() {
    showAddressModal = false;
    editingCompany = null;
    adminAddressError = '';
    adminAddressSuccess = '';
  }

  async function handleAdminSaveAddress() {
    adminAddressError = '';
    adminAddressSuccess = '';
    const trimmed = (adminAddressInput || '').trim();

    if (!trimmed) {
      adminAddressError = 'Mohon masukkan alamat lengkap kantor / perusahaan.';
      return;
    }

    if (!editingCompany?.id) return;

    adminAddressSaving = true;
    const res = await updateCompany(editingCompany.id, {
      alamat: trimmed,
      alamat_kantor: trimmed
    });
    adminAddressSaving = false;

    if (res?.success) {
      adminAddressSuccess = 'Alamat pemberi kerja berhasil diperbarui!';
      setTimeout(() => {
        closeEditAddressModal();
      }, 700);
    } else {
      adminAddressError = res?.error || 'Gagal menyimpan alamat perusahaan.';
    }
  }

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
      alamat: ind.alamat || '',
      pic: ind.kontak_pic,
      logo_url: ind.logo_url,
      totalVacs: vacs.length,
      totalPendaftar: indApps.length,
      totalTerverifikasi: verifiedApps.length,
      totalScanStand: boothScans.length
    };
  }).filter(item => {
    if (!filterSearch) return true;
    const q = filterSearch.toLowerCase();
    return item.stand.toLowerCase().includes(q) ||
           item.perusahaan.toLowerCase().includes(q) ||
           item.bidang.toLowerCase().includes(q) ||
           item.alamat.toLowerCase().includes(q);
  });

  function exportExcel() {
    // 1. Rekap Stand
    const standData = $industries.map(ind => {
      const vacs = $vacancies.filter(v => v.industry_id === ind.id);
      const vacIds = vacs.map(v => v.id);
      const indApps = $applications.filter(a => vacIds.includes(a.vacancy_id));
      const verifiedApps = indApps.filter(a => a.status === 'terverifikasi_stand' || a.status === 'wawancara' || a.status === 'diterima');
      const interviewApps = indApps.filter(a => a.status === 'wawancara');
      const acceptedApps = indApps.filter(a => a.status === 'diterima');
      const boothScans = $standAttendances.filter(s => s.industry_id === ind.id);

      return {
        "Nomor Stand": ind.nomor_stand,
        "Nama Perusahaan": ind.nama_perusahaan,
        "Bidang Industri": ind.bidang_industri,
        "Alamat Kantor": ind.alamat || '-',
        "PIC Kontak": ind.kontak_pic,
        "Jumlah Posisi": vacs.length,
        "Total Kuota Formasi": vacs.reduce((acc, v) => acc + (Number(v.kuota) || 0), 0),
        "Total Pelamar": indApps.length,
        "Terverifikasi Booth": verifiedApps.length,
        "Tahap Wawancara": interviewApps.length,
        "Diterima Kerja": acceptedApps.length,
        "Kunjungan Barcode Stand": boothScans.length
      };
    });

    // 2. Data Pelamar (Jobseekers Terdaftar)
    const applicants = $allUsers.filter(u => u.role === 'pelamar');
    const applicantsData = applicants.map((u, idx) => ({
      "No": idx + 1,
      "Nomor Registrasi (QR)": u.qr_code_token || '-',
      "Nama Lengkap": u.nama_lengkap || '-',
      "Email": u.email || '-',
      "No HP / WhatsApp": u.nomor_wa || u.no_hp || '-',
      "NIK": u.nik_nisn || u.nik || '-',
      "Asal Sekolah / Kampus": u.asal_sekolah_kampus || '-',
      "Jurusan": u.jurusan || '-',
      "Pendidikan Terakhir": u.pendidikan_terakhir || '-',
      "Total Lamaran Dikirim": $applications.filter(a => a.applicant_id === u.id || a.user_id === u.id).length
    }));

    // 3. Data Detail Seluruh Lamaran
    const applicationsData = $applications.map((app, idx) => {
      const applicant = $allUsers.find(u => u.id === (app.applicant_id || app.user_id));
      const vac = $vacancies.find(v => v.id === app.vacancy_id);
      const ind = vac ? $industries.find(i => i.id === vac.industry_id) : null;

      return {
        "No": idx + 1,
        "ID Lamaran": app.id,
        "Nomor Stand": ind?.nomor_stand || '-',
        "Perusahaan": ind?.nama_perusahaan || '-',
        "Posisi Dilamar": vac?.judul_posisi || '-',
        "Nama Pelamar": applicant?.nama_lengkap || '-',
        "Nomor HP": applicant?.nomor_wa || applicant?.no_hp || '-',
        "Email": applicant?.email || '-',
        "Asal Sekolah/Kampus": applicant?.asal_sekolah_kampus || '-',
        "Status Lamaran": app.status || 'terdaftar',
        "Tanggal Melamar": (app.waktu_melamar || app.created_at) ? new Date(app.waktu_melamar || app.created_at).toLocaleString('id-ID') : '-'
      };
    });

    // 4. Presensi Kunjungan Stand
    const attendancesData = $standAttendances.map((att, idx) => {
      const applicant = $allUsers.find(u => u.id === (att.applicant_id || att.user_id));
      const ind = $industries.find(i => i.id === att.industry_id);

      return {
        "No": idx + 1,
        "Waktu Scan": att.scanned_at ? new Date(att.scanned_at).toLocaleString('id-ID') : '-',
        "Stand": ind?.nomor_stand || '-',
        "Nama Perusahaan": ind?.nama_perusahaan || '-',
        "Nama Pelamar": applicant?.nama_lengkap || '-',
        "Nomor QR": applicant?.qr_code_token || '-',
        "Asal Sekolah/Kampus": applicant?.asal_sekolah_kampus || '-'
      };
    });

    // Build Workbook with multiple sheets
    const wb = XLSX.utils.book_new();

    const wsStand = XLSX.utils.json_to_sheet(standData);
    const wsApps = XLSX.utils.json_to_sheet(applicationsData);
    const wsApplicants = XLSX.utils.json_to_sheet(applicantsData);
    const wsAttendance = XLSX.utils.json_to_sheet(attendancesData);

    // Auto-fit column widths
    [wsStand, wsApps, wsApplicants, wsAttendance].forEach(ws => {
      const colWidths = [];
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        let maxLen = 12;
        for (let R = range.s.r; R <= range.e.r; ++R) {
          const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
          if (cell && cell.v) {
            const str = String(cell.v);
            if (str.length > maxLen) maxLen = Math.min(str.length, 40);
          }
        }
        colWidths.push({ wch: maxLen + 2 });
      }
      ws['!cols'] = colWidths;
    });

    XLSX.utils.book_append_sheet(wb, wsStand, "Rekap 23 Stand");
    XLSX.utils.book_append_sheet(wb, wsApps, "Data Lamaran");
    XLSX.utils.book_append_sheet(wb, wsApplicants, "Jobseekers Terdaftar");
    XLSX.utils.book_append_sheet(wb, wsAttendance, "Presensi Barcode Stand");

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Rekapitulasi_Bhumi_Sambhara_Jobfair_2026_${dateStr}.xlsx`);
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
          <span class="text-xs text-muted">K1 Pariwisata 2024 UNTIDAR × SMK Negeri 1 Magelang</span>
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

        <button class="btn btn-secondary" on:click={exportExcel}>
          <FileSpreadsheet size={16} />
          <span>Ekspor Data (.XLSX)</span>
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

  <!-- Admin Sub-Tab Navigation -->
  <div class="admin-tabs-bar">
    <button
      type="button"
      class="admin-tab-btn {activeAdminTab === 'stand' ? 'active' : ''}"
      on:click={() => activeAdminTab = 'stand'}
    >
      <Building2 size={16} />
      <span>Rekapitulasi 23 Stand</span>
      <span class="admin-tab-badge tabular-nums">{$industries.length}</span>
    </button>
    <button
      type="button"
      class="admin-tab-btn {activeAdminTab === 'akun' ? 'active' : ''}"
      on:click={() => activeAdminTab = 'akun'}
    >
      <Users size={16} />
      <span>Kelola & Hapus Akun</span>
      <span class="admin-tab-badge tabular-nums">{$allUsers.length}</span>
    </button>
  </div>

  <!-- TAB 1: 23 Stand Matrix Table -->
  {#if activeAdminTab === 'stand'}
  <div class="card matrix-card animate-fade-in">
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
            <th>Nama Perusahaan & Alamat</th>
            <th>Bidang Industri</th>
            <th>Lowongan Dibuka</th>
            <th>Total Pendaftar</th>
            <th>Terverifikasi Hadir</th>
            <th>Rasio Verifikasi</th>
            <th>Aksi</th>
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
                  <img src={row.logo_url || `/companies/${row.id}.svg?v=3`} alt="{row.perusahaan}" class="admin-logo-micro" />
                  <div class="admin-company-meta">
                    <span class="perusahaan-cell">{row.perusahaan}</span>
                    <span class="admin-address-sub" title={row.alamat || 'Alamat belum diisi'}>
                      <MapPin size={11} />
                      <span>{row.alamat || 'Alamat belum diisi'}</span>
                    </span>
                  </div>
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
              <td>
                <button
                  type="button"
                  class="btn btn-secondary btn-sm"
                  on:click={() => openEditAddressModal(row)}
                  title="Edit alamat kantor {row.perusahaan}"
                >
                  <MapPin size={13} />
                  <span>Edit Alamat</span>
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
  {/if}

  <!-- TAB 2: Kelola & Hapus Akun Terdaftar (Khusus BKK Admin) -->
  {#if activeAdminTab === 'akun'}
    <div class="card matrix-card animate-fade-in">
      <div class="matrix-header-row">
        <div>
          <h3 class="heading-md">Kelola & Hapus Akun Terdaftar</h3>
          <p class="text-xs text-muted">
            Akun Admin BKK dapat meninjau dan menghapus akun uji coba, duplikat, atau akun pelamar/stand yang tidak valid.
          </p>
        </div>

        <div class="account-filter-controls">
          <div class="matrix-search">
            <Search size={16} class="text-muted" />
            <input
              type="text"
              placeholder="Cari nama, email, WA, NIK..."
              bind:value={userSearch}
              class="matrix-input"
            />
          </div>

          <select class="input-field role-filter-select" bind:value={userRoleFilter}>
            <option value="all">Semua Peran ({$allUsers.length})</option>
            <option value="pelamar">Pelamar ({$allUsers.filter(u => u.role === 'pelamar').length})</option>
            <option value="pemberi_kerja">Pemberi Kerja ({$allUsers.filter(u => u.role === 'pemberi_kerja').length})</option>
            <option value="admin">Admin ({$allUsers.filter(u => u.role === 'admin').length})</option>
          </select>
        </div>
      </div>

      {#if deleteUserSuccess}
        <div class="alert-box alert-success mb-3">
          <CheckCircle2 size={16} />
          <span class="text-xs">{deleteUserSuccess}</span>
        </div>
      {/if}

      {#if filteredUsers.length === 0}
        <div class="empty-users-box">
          <Users size={32} class="text-muted" />
          <p class="text-xs text-muted mt-1">Belum ada akun terdaftar yang cocok dengan filter pencarian.</p>
        </div>
      {:else}
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Akun Pengguna</th>
                <th>Peran</th>
                <th>Kontak & Asal / Stand</th>
                <th>Aktivitas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {#each filteredUsers as user (user.id)}
                {@const isSelf = $currentUser?.id === user.id || ($currentUser?.email && user.email && $currentUser.email.toLowerCase() === user.email.toLowerCase())}
                {@const appCnt = getUserAppCount(user.id)}
                {@const attCnt = getUserAttendanceCount(user.id)}
                <tr>
                  <td>
                    <div class="user-account-cell">
                      <span class="perusahaan-cell">{user.nama_lengkap || 'Tanpa Nama'}</span>
                      <span class="text-xs text-muted">{user.email || '-'}</span>
                      {#if user.qr_code_token}
                        <span class="text-xs text-light tabular-nums">{user.qr_code_token}</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <span class="badge {user.role === 'admin' ? 'badge-terverifikasi' : user.role === 'pemberi_kerja' ? 'badge-stand' : 'badge-wawancara'}">
                      {user.role === 'admin' ? 'Admin BKK' : user.role === 'pemberi_kerja' ? 'Pemberi Kerja' : 'Pelamar'}
                    </span>
                  </td>
                  <td>
                    <div class="user-account-cell">
                      <span class="text-xs tabular-nums">WA: {user.nomor_wa || '-'}</span>
                      {#if user.role === 'pemberi_kerja'}
                        <span class="text-xs text-muted">{getCompanyName(user.company_id)}</span>
                      {:else}
                        <span class="text-xs text-muted">{user.asal_sekolah_kampus || 'Belum diisi'} {user.jurusan ? `(${user.jurusan})` : ''}</span>
                      {/if}
                    </div>
                  </td>
                  <td>
                    <div class="user-account-cell">
                      <span class="text-xs font-semibold tabular-nums">{appCnt} Lamaran</span>
                      <span class="text-xs text-muted tabular-nums">{attCnt} Scan Stand</span>
                    </div>
                  </td>
                  <td>
                    {#if isSelf}
                      <span class="text-xs text-muted">Akun Aktif</span>
                    {:else}
                      <button
                        type="button"
                        class="btn btn-outline-danger btn-sm"
                        on:click={() => openDeleteUserModal(user)}
                        title="Hapus akun {user.nama_lengkap || user.email}"
                      >
                        <Trash2 size={13} />
                        <span>Hapus Akun</span>
                      </button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Modal Konfirmasi Hapus Akun (Admin BKK) -->
{#if showDeleteUserModal && userToDelete}
  <div
    class="modal-backdrop"
    on:click={closeDeleteUserModal}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && closeDeleteUserModal()}
  >
    <div
      class="modal-content admin-address-modal"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <span class="badge badge-ditolak">Konfirmasi Hapus Akun</span>
          <h3 class="heading-md mt-1">Hapus Akun Terdaftar?</h3>
          <p class="text-xs text-muted">Tindakan ini akan menghapus data profil, lamaran, dan presensi akun ini.</p>
        </div>
        <button type="button" class="btn-close" on:click={closeDeleteUserModal} aria-label="Tutup">
          <X size={20} />
        </button>
      </div>

      <div class="modal-body">
        <div class="delete-user-summary">
          <div class="summary-line">
            <span class="text-xs text-muted">Nama:</span>
            <span class="text-sm font-bold">{userToDelete.nama_lengkap || '-'}</span>
          </div>
          <div class="summary-line">
            <span class="text-xs text-muted">Email:</span>
            <span class="text-xs font-semibold">{userToDelete.email || '-'}</span>
          </div>
          <div class="summary-line">
            <span class="text-xs text-muted">Peran:</span>
            <span class="text-xs font-semibold">{userToDelete.role}</span>
          </div>
          <div class="summary-line">
            <span class="text-xs text-muted">Data Terkait:</span>
            <span class="text-xs">{getUserAppCount(userToDelete.id)} lamaran &amp; {getUserAttendanceCount(userToDelete.id)} presensi stand</span>
          </div>
        </div>

        {#if deleteUserError}
          <div class="alert-box alert-danger mt-2">
            <AlertCircle size={16} />
            <span class="text-xs">{deleteUserError}</span>
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary btn-sm" on:click={closeDeleteUserModal} disabled={deletingUser}>
          Batal
        </button>
        <button type="button" class="btn btn-danger-solid btn-sm" on:click={handleConfirmDeleteUser} disabled={deletingUser}>
          <Trash2 size={14} />
          <span>{deletingUser ? 'Menghapus...' : 'Ya, Hapus Akun'}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Modal Edit Alamat Pemberi Kerja (Admin) -->
{#if showAddressModal && editingCompany}
  <div
    class="modal-backdrop"
    on:click={closeEditAddressModal}
    role="button"
    tabindex="0"
    on:keydown={(e) => e.key === 'Escape' && closeEditAddressModal()}
  >
    <div
      class="modal-content admin-address-modal"
      on:click|stopPropagation
      on:keydown|stopPropagation
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <div class="modal-header">
        <div>
          <span class="badge badge-stand font-bold">{editingCompany.stand}</span>
          <h3 class="heading-md mt-1">Edit Alamat Pemberi Kerja</h3>
          <p class="text-xs text-muted">{editingCompany.perusahaan}</p>
        </div>
        <button type="button" class="btn-close" on:click={closeEditAddressModal} aria-label="Tutup">
          <X size={20} />
        </button>
      </div>

      <div class="modal-body">
        {#if adminAddressError}
          <div class="alert-box alert-danger mb-3">
            <AlertCircle size={16} />
            <span class="text-xs">{adminAddressError}</span>
          </div>
        {/if}

        {#if adminAddressSuccess}
          <div class="alert-box alert-success mb-3">
            <CheckCircle2 size={16} />
            <span class="text-xs">{adminAddressSuccess}</span>
          </div>
        {/if}

        <div class="input-group">
          <label class="input-label" for="adminEditAddressInput">Alamat Lengkap Kantor / Perusahaan *</label>
          <textarea
            id="adminEditAddressInput"
            class="input-field"
            rows="3"
            placeholder="Contoh: Jl. Pemuda No. 78, Kota Magelang, Jawa Tengah"
            bind:value={adminAddressInput}
          ></textarea>
          <p class="text-xs text-muted">
            Perubahan alamat akan langsung disinkronkan ke direktori 23 mitra industri dan detail lowongan di portal.
          </p>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={closeEditAddressModal} disabled={adminAddressSaving}>
          Batal
        </button>
        <button type="button" class="btn btn-primary" on:click={handleAdminSaveAddress} disabled={adminAddressSaving}>
          <Save size={15} />
          <span>{adminAddressSaving ? 'Menyimpan...' : 'Simpan Alamat'}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

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

  .admin-company-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .admin-address-sub {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-address-modal {
    max-width: 540px;
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

  .mb-3 { margin-bottom: 12px; }

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

  .admin-tabs-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 2px;
  }

  .admin-tab-btn {
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

  .admin-tab-btn:hover {
    color: var(--color-primary);
    background-color: rgba(15, 23, 42, 0.03);
  }

  .admin-tab-btn.active {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
    font-weight: 700;
    background-color: #FFFFFF;
  }

  .admin-tab-badge {
    background-color: var(--color-surface-muted);
    color: var(--color-text-muted);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .admin-tab-btn.active .admin-tab-badge {
    background-color: var(--color-primary);
    color: #FFFFFF;
  }

  .account-filter-controls {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
  }

  .role-filter-select {
    width: auto;
    padding: 6px 12px;
    font-size: 0.8125rem;
  }

  .user-account-cell {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .empty-users-box {
    text-align: center;
    padding: 36px 16px;
    background-color: var(--color-surface-subtle);
    border: 1px dashed var(--color-border-strong);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
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

  .btn-danger-solid {
    background-color: #BE123C;
    color: #FFFFFF;
    border: 1px solid #9F1239;
  }

  .btn-danger-solid:hover {
    background-color: #9F1239;
  }

  .delete-user-summary {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .summary-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mt-2 { margin-top: 8px; }

  @media (max-width: 800px) {
    .admin-layout {
      padding: 16px 12px 60px;
      gap: 16px;
    }
    .admin-titles {
      min-width: 0;
      width: 100%;
    }
    .tag-row {
      flex-wrap: wrap;
    }
    .admin-hero-actions {
      width: 100%;
      flex-wrap: wrap;
    }
    .zone-grid {
      grid-template-columns: 1fr;
    }
    .zone-map-card,
    .matrix-card {
      padding: 16px;
    }
    .account-filter-controls {
      width: 100%;
    }
    .matrix-search {
      width: 100%;
      flex: 1 1 200px;
    }
    .matrix-input {
      width: 100%;
      min-width: 0;
    }
    .role-filter-select {
      width: 100%;
    }
  }
</style>
