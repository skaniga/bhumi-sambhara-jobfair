<script>
  import { currentUser, applications, vacancies, applyJob } from '../supabase.js';
  import { X, Building2, MapPin, Briefcase, GraduationCap, CheckCircle, AlertCircle, Share2 } from '@lucide/svelte';

  /** @type {any} */
  export let vacancy = null;
  /** @type {any} */
  export let industry = null;
  export let onClose = () => {};
  export let onRequireAuth = () => {};

  let coverNote = '';
  let submitting = false;
  let statusMessage = '';
  let isError = false;
  let shareNotice = '';

  function handleShareWhatsApp() {
    if (!vacancy || !industry) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bme.smknegeri1magelang.sch.id';
    const text = `Lowongan *${vacancy.judul_posisi}* di ${industry.nama_perusahaan} (${industry.nomor_stand}) - Bhumi Sambhara Expo 2026. Lamar online: ${origin}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  // Check if applicant has applied to ANY vacancy at this company (not just this specific vacancy)
  $: companyVacancyIds = industry
    ? $vacancies.filter(v => v.industry_id === industry.id).map(v => v.id)
    : (vacancy ? [vacancy.id] : []);

  $: existingApplication = ($currentUser && industry)
    ? $applications.find(a => companyVacancyIds.includes(a.vacancy_id) && a.applicant_id === $currentUser.id)
    : null;

  async function handleApply() {
    if (!$currentUser) {
      onRequireAuth();
      return;
    }

    if ($currentUser.role !== 'pelamar') {
      isError = true;
      statusMessage = 'Hanya akun dengan peran Pelamar yang dapat mengirimkan lamaran pekerjaan.';
      return;
    }

    submitting = true;
    statusMessage = '';
    isError = false;

    const res = await applyJob(vacancy.id, $currentUser.id, coverNote);
    submitting = false;

    if (res.success) {
      statusMessage = 'Lamaran Anda berhasil dikirim ke HRD perusahaan! Silakan datangi booth ' + (industry?.nomor_stand || '') + ' untuk verifikasi kartu QR.';
      coverNote = '';
    } else {
      isError = true;
      statusMessage = res.error || 'Terjadi kesalahan saat memproses lamaran.';
    }
  }
</script>

{#if vacancy}
  <div class="modal-backdrop" on:click={onClose} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && onClose()}>
    <div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <div>
          <span class="badge badge-stand">{industry?.nomor_stand || 'Stand Industri'}</span>
          <h3 class="heading-md modal-title">{vacancy.judul_posisi}</h3>
          <p class="text-xs text-muted">{industry?.nama_perusahaan}</p>
        </div>
        <button class="btn-close" on:click={onClose}>
          <X size={20} />
        </button>
      </div>

      <div class="modal-body">
        <div class="meta-pills">
          <div class="pill">
            <span class="pill-label">Formasi / Pendidikan</span>
            <span class="pill-value">{vacancy.pendidikan || 'Umum'}</span>
          </div>
          <div class="pill">
            <span class="pill-label">Tipe Kerja</span>
            <span class="pill-value">{vacancy.tipe_pekerjaan}</span>
          </div>
          <div class="pill">
            <span class="pill-label">Kuota Penerimaan</span>
            <span class="pill-value tabular-nums">{vacancy.kuota} Orang</span>
          </div>
          <div class="pill">
            <span class="pill-label">Estimasi Gaji</span>
            <span class="pill-value">{vacancy.gaji || 'Ditanyakan pada saat wawancara'}</span>
          </div>
        </div>

        <div class="info-block">
          <h4 class="block-title">Kualifikasi Pelamar</h4>
          <p class="block-desc">{vacancy.kualifikasi}</p>
        </div>

        {#if vacancy.persyaratan && vacancy.persyaratan.length > 0}
          <div class="info-block">
            <h4 class="block-title">Dokumen & Berkas Pendukung</h4>
            <ul class="req-list">
              {#each vacancy.persyaratan as req}
                <li>{req}</li>
              {/each}
            </ul>
          </div>
        {/if}

        <div class="info-block">
          <h4 class="block-title">Lokasi Penempatan</h4>
          <p class="block-desc text-xs">{vacancy.lokasi}</p>
        </div>

        {#if industry?.alamat}
          <div class="info-block">
            <h4 class="block-title">Alamat Kantor Perusahaan</h4>
            <p class="block-desc text-xs address-inline">
              <MapPin size={14} class="address-inline-icon" />
              <span>{industry.alamat}</span>
            </p>
          </div>
        {/if}

        {#if statusMessage}
          <div class="alert-box {isError ? 'alert-danger' : 'alert-success'}">
            {#if isError}
              <AlertCircle size={18} />
            {:else}
              <CheckCircle size={18} />
            {/if}
            <span class="text-xs">{statusMessage}</span>
          </div>
        {/if}

        {#if existingApplication}
          <div class="applied-banner">
            <CheckCircle size={18} color="#15803D" />
            <div>
              <p class="text-xs font-semibold">✅ Lamaran ke {industry?.nama_perusahaan || 'perusahaan ini'} sudah terkirim.</p>
              <p class="text-xs text-muted">
                Status:
                <span class="badge badge-{existingApplication.status}">
                  {existingApplication.status === 'menunggu' ? 'Menunggu di Stand' :
                   existingApplication.status === 'terverifikasi_stand' ? 'Terverifikasi Hadir di Stand' :
                   existingApplication.status === 'wawancara' ? 'Panggilan Wawancara' :
                   existingApplication.status === 'diterima' ? 'Lolos Diterima' : existingApplication.status}
                </span>
              </p>
              <p class="text-xs text-muted mt-1">Silakan kunjungi booth <strong>{industry?.nomor_stand}</strong> untuk verifikasi fisik. Anda masih bisa melamar ke perusahaan lain.</p>
            </div>
          </div>
        {:else}
          <div class="apply-form-block">
            <label class="input-label" for="coverNoteInput">Catatan Tambahan untuk HRD (Opsional)</label>
            <textarea 
              id="coverNoteInput"
              class="input-field" 
              rows="3" 
              placeholder="Tuliskan ringkasan pengalaman relevan, nomor telepon, atau waktu siap wawancara..."
              bind:value={coverNote}
            ></textarea>
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" on:click={handleShareWhatsApp} title="Bagikan Lowongan ke Teman via WhatsApp">
          <Share2 size={15} /> WhatsApp
        </button>

        <button class="btn btn-secondary" on:click={onClose}>
          Tutup
        </button>

        {#if !existingApplication}
          <button 
            class="btn btn-primary" 
            on:click={handleApply} 
            disabled={submitting}
          >
            {submitting ? 'Memproses...' : 'Kirim Lamaran Sekarang'}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-title {
    color: var(--color-primary);
    margin: 4px 0 2px;
  }

  .btn-close {
    color: var(--color-text-muted);
    padding: 6px;
    border-radius: var(--radius-sm);
  }

  .btn-close:hover {
    background-color: var(--color-surface-muted);
    color: var(--color-primary);
  }

  .meta-pills {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 20px;
  }

  .pill {
    background-color: var(--color-surface-subtle);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 8px 12px;
    display: flex;
    flex-direction: column;
  }

  .pill-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-light);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pill-value {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-primary);
  }

  .info-block {
    margin-bottom: 16px;
  }

  .block-title {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-primary);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .block-desc {
    font-size: 0.875rem;
    color: var(--color-text-main);
    line-height: 1.5;
  }

  .address-inline {
    display: flex;
    align-items: flex-start;
    gap: 6px;
  }

  :global(.address-inline-icon) {
    color: var(--color-amber-accent);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .req-list {
    padding-left: 20px;
    font-size: 0.8125rem;
    color: var(--color-text-main);
    line-height: 1.6;
  }

  .apply-form-block {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .applied-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background-color: var(--color-success-bg);
    border: 1px solid #BBF7D0;
    padding: 12px 16px;
    border-radius: var(--radius-md);
    margin-top: 16px;
  }

  .alert-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--radius-md);
    margin-top: 14px;
  }

  .alert-success {
    background-color: var(--color-success-bg);
    border: 1px solid #BBF7D0;
    color: #166534;
  }

  .alert-danger {
    background-color: var(--color-danger-bg);
    border: 1px solid #FECDD3;
    color: #9F1239;
  }
</style>
