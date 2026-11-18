<script>
  import { currentUser, updateProfile, applications, vacancies, industries, standAttendances, syncFromSupabase } from '../supabase.js';
  import {
    applicantNotifications,
    markNotificationRead,
    browserNotifPermission,
    requestBrowserNotificationPermission
  } from '../notifications.js';
  import { User, QrCode, Save, Briefcase, CheckCircle, ExternalLink, Clock, Building2, RefreshCw, Check, Bell } from '@lucide/svelte';

  export let onOpenQrCard = () => {};

  let nama = $currentUser?.nama_lengkap || '';
  let nikNisn = $currentUser?.nik_nisn || '';
  let nomorWa = $currentUser?.nomor_wa || '';
  let pendidikan = $currentUser?.pendidikan_terakhir || 'SMK / SMA (Lulusan 2026)';
  let sekolah = $currentUser?.asal_sekolah_kampus || '';
  let jurusan = $currentUser?.jurusan || '';
  let skillsText = ($currentUser?.keahlian || []).join(', ');
  let cvLink = $currentUser?.link_cv_portofolio || '';
  let ringkasan = $currentUser?.ringkasan_profil || '';

  let saving = false;
  let saveMessage = '';
  let syncing = false;

  async function handleRefresh() {
    syncing = true;
    await syncFromSupabase();
    setTimeout(() => { syncing = false; }, 600);
  }

  $: if ($currentUser && !saving) {
    nama = $currentUser.nama_lengkap || '';
    nikNisn = $currentUser.nik_nisn || '';
    nomorWa = $currentUser.nomor_wa || '';
    pendidikan = $currentUser.pendidikan_terakhir || 'SMK / SMA (Lulusan 2026)';
    sekolah = $currentUser.asal_sekolah_kampus || '';
    jurusan = $currentUser.jurusan || '';
    skillsText = ($currentUser.keahlian || []).join(', ');
    cvLink = $currentUser.link_cv_portofolio || '';
    ringkasan = $currentUser.ringkasan_profil || '';
  }

  $: myApplications = $applications.filter(a => a.applicant_id === $currentUser?.id);
  $: myAttendances = $standAttendances.filter(a => a.applicant_id === $currentUser?.id);
  $: priorityNotifications = $applicantNotifications.filter(n => n.status === 'wawancara' || n.status === 'diterima');

  function getVacancy(vacId) {
    return $vacancies.find(v => v.id === vacId);
  }

  function getIndustry(indId) {
    return $industries.find(i => i.id === indId);
  }

  async function handleSaveProfile() {
    saving = true;
    saveMessage = '';

    const skillsArray = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    await updateProfile({
      nama_lengkap: nama,
      nik_nisn: nikNisn,
      nomor_wa: nomorWa,
      pendidikan_terakhir: pendidikan,
      asal_sekolah_kampus: sekolah,
      jurusan: jurusan,
      keahlian: skillsArray,
      link_cv_portofolio: cvLink,
      ringkasan_profil: ringkasan
    });

    saving = false;
    saveMessage = 'Profil Anda berhasil diperbarui!';
    setTimeout(() => { saveMessage = ''; }, 3000);
  }
</script>

<div class="profile-layout container">
  <div class="profile-header-card card">
    <div class="user-hero-row">
      <div class="user-avatar-badge">
        <User size={32} />
      </div>
      <div class="user-details">
        <div class="badge-role-row">
          <span class="badge badge-stand">Peserta Terdaftar</span>
          <span class="text-xs text-muted tabular-nums">ID: {$currentUser?.qr_code_token}</span>
        </div>
        <h2 class="heading-md user-fullname">{$currentUser?.nama_lengkap}</h2>
        <p class="text-xs text-muted">{$currentUser?.asal_sekolah_kampus || 'Belum diisi'} • {$currentUser?.jurusan || 'Umum'}</p>
      </div>

      <div class="qr-action-col">
        <button class="btn btn-secondary btn-sm" on:click={handleRefresh} disabled={syncing} title="Perbarui data dari server">
          <RefreshCw size={15} class={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Memperbarui...' : 'Sinkron Data'}</span>
        </button>
        <button class="btn btn-primary" on:click={onOpenQrCard}>
          <QrCode size={18} />
          <span>Lihat Kartu QR Saya</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Banner Notifikasi Panggilan Wawancara / Lolos Seleksi -->
  {#if priorityNotifications.length > 0}
    <div class="interview-alerts-stack">
      {#each priorityNotifications as notif}
        <div class="interview-alert-card alert-{notif.status}">
          <div class="interview-alert-icon">
            <Bell size={20} />
          </div>
          <div class="interview-alert-body">
            <div class="interview-alert-top">
              <span class="badge badge-{notif.status}">
                {notif.status === 'wawancara' ? 'PANGGILAN WAWANCARA' : 'LOLOS DITERIMA'}
              </span>
              <span class="badge badge-stand">{notif.stand}</span>
            </div>
            <h3 class="interview-alert-title">{notif.companyName} — {notif.position}</h3>
            <p class="text-xs interview-alert-msg">{notif.message}</p>
            {#if notif.note}
              <p class="text-xs interview-alert-note">Catatan HRD: {notif.note}</p>
            {/if}
          </div>
          {#if !notif.isRead}
            <button type="button" class="btn btn-secondary btn-sm" on:click={() => markNotificationRead(notif.key)}>
              <Check size={14} /> Dimengerti
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  {#if $browserNotifPermission === 'default'}
    <div class="notif-optin-strip">
      <div class="notif-optin-left">
        <Bell size={16} />
        <span class="text-xs">Aktifkan notifikasi browser agar Anda langsung mendapat pemberitahuan saat dipanggil wawancara oleh HRD stand.</span>
      </div>
      <button type="button" class="btn btn-amber btn-sm" on:click={requestBrowserNotificationPermission}>
        Aktifkan Notifikasi
      </button>
    </div>
  {/if}

  <div class="profile-columns">
    <!-- Form Data Diri -->
    <div class="card form-card">
      <div class="card-header">
        <h3 class="heading-sm">Kelola Data Diri & Portofolio</h3>
        <span class="text-xs text-muted">Data ini akan ditinjau oleh HRD</span>
      </div>

      <div class="grid-2">
        <div class="input-group">
          <label class="input-label" for="namaInput">Nama Lengkap</label>
          <input id="namaInput" type="text" class="input-field" bind:value={nama} />
        </div>

        <div class="input-group">
          <label class="input-label" for="nikInput">NIK / NISN</label>
          <input id="nikInput" type="text" class="input-field tabular-nums" bind:value={nikNisn} placeholder="3308xxxxxxxxxxxx" />
        </div>
      </div>

      <div class="grid-2">
        <div class="input-group">
          <label class="input-label" for="waInput">Nomor WhatsApp Aktif</label>
          <input id="waInput" type="text" class="input-field tabular-nums" bind:value={nomorWa} placeholder="08xxxxxxxxxx" />
        </div>

        <div class="input-group">
          <label class="input-label" for="pendidikanSelect">Pendidikan Terakhir</label>
          <select id="pendidikanSelect" class="input-field" bind:value={pendidikan}>
            <option value="SMK / SMA (Lulusan 2026)">SMK / SMA (Lulusan 2026)</option>
            <option value="SMK / SMA (Alumni)">SMK / SMA (Alumni)</option>
            <option value="D3 / Diploma">D3 / Diploma</option>
            <option value="S1 / Sarjana">S1 / Sarjana</option>
            <option value="Umum">Umum</option>
          </select>
        </div>
      </div>

      <div class="grid-2">
        <div class="input-group">
          <label class="input-label" for="sekolahInput">Asal Sekolah / Kampus</label>
          <input id="sekolahInput" type="text" class="input-field" bind:value={sekolah} placeholder="SMK Negeri 1 Magelang / UNTIDAR" />
        </div>

        <div class="input-group">
          <label class="input-label" for="jurusanInput">Kompetensi Keahlian / Jurusan</label>
          <input id="jurusanInput" type="text" class="input-field" bind:value={jurusan} placeholder="TKR / Pariwisata / RPL / Akuntansi" />
        </div>
      </div>

      <div class="input-group">
        <label class="input-label" for="skillsInput">Keahlian Utama (Pisahkan dengan tanda koma)</label>
        <input id="skillsInput" type="text" class="input-field" bind:value={skillsText} placeholder="Otomotif, Servis Injeksi, Las, Komunikasi" />
      </div>

      <div class="input-group">
        <label class="input-label" for="cvInput">Tautan Berkas CV / Portofolio (Google Drive / LinkedIn)</label>
        <input id="cvInput" type="url" class="input-field" bind:value={cvLink} placeholder="https://drive.google.com/..." />
      </div>

      <div class="input-group">
        <label class="input-label" for="ringkasanInput">Ringkasan Diri & Pengalaman Magang</label>
        <textarea id="ringkasanInput" class="input-field" rows="3" bind:value={ringkasan} placeholder="Tuliskan pengalaman magang atau motivasi kerja Anda..."></textarea>
      </div>

      {#if saveMessage}
        <div class="save-feedback">
          <CheckCircle size={16} />
          <span>{saveMessage}</span>
        </div>
      {/if}

      <div class="form-actions">
        <button class="btn btn-primary" on:click={handleSaveProfile} disabled={saving}>
          <Save size={16} />
          <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
        </button>
      </div>
    </div>

    <!-- Riwayat Lamaran & Presensi Stand Pelamar -->
    <div class="card applications-card">
      <div class="card-header">
        <h3 class="heading-sm">Lamaran & Presensi Stand ({myApplications.length})</h3>
        <span class="text-xs text-muted">Kunjungi stand untuk presensi</span>
      </div>

      {#if myAttendances.length > 0}
        <div class="attendances-box mb-3">
          <div class="attendances-title">
            <CheckCircle size={15} color="#15803D" />
            <span class="text-xs font-bold text-success">Presensi Stand Terverifikasi ({myAttendances.length}):</span>
          </div>
          <div class="attendances-list">
            {#each myAttendances as att}
              {@const ind = getIndustry(att.industry_id)}
              <div class="attendance-pill">
                <span class="badge badge-stand">{ind?.nomor_stand || 'Stand'}</span>
                <span class="text-xs font-semibold">{ind?.nama_perusahaan}</span>
                <span class="badge badge-terverifikasi text-xs">Hadir Terverifikasi</span>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      {#if myApplications.length === 0 && myAttendances.length === 0}
        <div class="empty-applications">
          <Briefcase size={36} class="text-muted" />
          <p class="text-xs text-muted mt-2">Anda belum mengirimkan lamaran pekerjaan ke 23 industri partner.</p>
        </div>
      {:else}
        <div class="apps-timeline">
          {#each myApplications as app}
            {@const vac = getVacancy(app.vacancy_id)}
            {@const ind = vac ? getIndustry(vac.industry_id) : null}
            <div class="timeline-item">
              <div class="timeline-badge-col">
                <span class="badge badge-stand">{ind?.nomor_stand || 'Stand'}</span>
              </div>
              <div class="timeline-body">
                <div class="timeline-title-row">
                  <h4 class="app-job-title">{vac?.judul_posisi || 'Posisi Lowongan'}</h4>
                  <span class="badge badge-{app.status}">
                    {app.status === 'menunggu' ? 'Menunggu Hadir di Stand' :
                     app.status === 'terverifikasi_stand' ? 'Hadir & Terverifikasi' :
                     app.status === 'wawancara' ? 'Panggilan Wawancara' :
                     app.status === 'diterima' ? 'Lolos Diterima' : app.status}
                  </span>
                </div>
                <p class="text-xs text-muted">{ind?.nama_perusahaan}</p>
                {#if app.catatan_industri}
                  <div class="app-notes">
                    <span class="text-xs font-semibold">Catatan Stand:</span>
                    <p class="text-xs">{app.catatan_industri}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .profile-layout {
    padding: 32px 20px 60px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 100%;
  }

  .user-hero-row {
    display: flex;
    align-items: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .user-avatar-badge {
    width: 60px;
    height: 60px;
    background-color: var(--color-surface-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .user-details {
    flex-grow: 1;
    min-width: 0;
    word-break: break-word;
  }

  .qr-action-col {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .badge-role-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 4px;
  }

  .user-fullname {
    color: var(--color-primary);
    line-height: 1.2;
    margin-bottom: 2px;
  }

  /* Interview & Acceptance Notification Banners */
  .interview-alerts-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .interview-alert-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 18px;
    border-radius: var(--radius-lg);
    border: 1.5px solid #FCD34D;
    border-left: 5px solid #D97706;
    background-color: #FFFBEB;
    box-shadow: var(--shadow-sm);
    flex-wrap: wrap;
  }

  .interview-alert-card.alert-diterima {
    border-color: #86EFAC;
    border-left-color: #15803D;
    background-color: #F0FDF4;
  }

  .interview-alert-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background-color: #D97706;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .alert-diterima .interview-alert-icon {
    background-color: #15803D;
  }

  .interview-alert-body {
    flex: 1;
    min-width: 0;
  }

  .interview-alert-top {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 6px;
  }

  .interview-alert-title {
    font-size: 0.9375rem;
    font-weight: 800;
    color: var(--color-primary);
    margin-bottom: 2px;
  }

  .interview-alert-msg {
    color: var(--color-text-main);
    line-height: 1.45;
  }

  .interview-alert-note {
    margin-top: 6px;
    padding: 6px 10px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: var(--radius-sm);
    color: var(--color-text-muted);
    font-style: italic;
  }

  .notif-optin-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px;
    background-color: #EFF6FF;
    border: 1px solid #BFDBFE;
    border-radius: var(--radius-md);
    color: #1E40AF;
  }

  .notif-optin-left {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 200px;
  }

  .profile-columns {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 24px;
  }

  .form-card, .applications-card {
    min-width: 0;
    max-width: 100%;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .save-feedback {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: var(--color-success-bg);
    color: #166534;
    border-radius: var(--radius-sm);
    font-size: 0.8125rem;
    margin-bottom: 12px;
  }

  .empty-applications {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 40px 20px;
  }

  .apps-timeline {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .attendances-box {
    background-color: var(--color-success-bg);
    border: 1px solid #BBF7D0;
    border-radius: var(--radius-md);
    padding: 12px 14px;
    margin-bottom: 16px;
  }

  .attendances-title {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .text-success {
    color: var(--color-success);
  }

  .attendances-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .attendance-pill {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    padding: 6px 10px;
    gap: 8px;
  }

  .timeline-item {
    display: flex;
    gap: 14px;
    padding: 14px;
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    flex-wrap: wrap;
  }

  .timeline-badge-col {
    flex-shrink: 0;
  }

  .timeline-body {
    flex-grow: 1;
    min-width: 0;
    word-break: break-word;
  }

  .timeline-title-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
    flex-wrap: wrap;
    gap: 6px;
  }

  .app-job-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .app-notes {
    margin-top: 8px;
    padding: 6px 10px;
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
  }

  .mt-2 {
    margin-top: 8px;
  }

  @media (max-width: 900px) {
    .profile-columns {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .profile-layout {
      padding: 16px 12px 60px;
      gap: 16px;
    }
    .qr-action-col {
      width: 100%;
    }
  }
</style>
