<script>
  import { onMount, onDestroy } from 'svelte';
  import { Html5Qrcode } from 'html5-qrcode';
  import { allUsers, currentUser, recordStandScan, updateApplicationStatus, applications, vacancies, lookupApplicant, industries } from '../supabase.js';
  import { X, Camera, CheckCircle, AlertCircle, User, Briefcase, Search, Scan } from '@lucide/svelte';

  export let onClose = () => {};
  /** @type {any} */
  export let currentIndustry = null;

  let selectedAdminStandId = currentIndustry?.id || $currentUser?.company_id || ($industries[0]?.id || 'a0000001-0000-0000-0000-000000000001');
  $: targetIndustry = currentIndustry || $industries.find(i => i.id === selectedAdminStandId) || $industries[0];

  let scannerElementId = 'qr-reader-region';
  /** @type {any} */
  let html5QrCode = null;
  let isScanning = false;
  let manualInput = '';
  /** @type {any} */
  let scannedApplicant = null;
  let verificationSuccess = false;
  let verificationMessage = '';
  let errorMessage = '';

  function playSuccessFeedback() {
    try {
      if (typeof window !== 'undefined') {
        // Haptic feedback if supported (mobile devices)
        if ('vibrate' in navigator) {
          navigator.vibrate([80, 40, 80]);
        }
        // Web Audio API beep synth (crisp confirmation tone)
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.12);
        }
      }
    } catch (e) {
      // Audio or vibration not critical, fail silently
    }
  }

  onMount(async () => {
    try {
      html5QrCode = new Html5Qrcode(scannerElementId);
      await startScanning();
    } catch (e) {
      console.warn('Scanner init notice:', e);
      errorMessage = 'Kamera tidak aktif atau izin belum diberikan. Anda dapat memasukkan kode QR / token peserta secara manual.';
    }
  });

  onDestroy(() => {
    stopScanning();
  });

  async function startScanning() {
    if (!html5QrCode) return;
    try {
      isScanning = true;
      errorMessage = '';
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const side = Math.max(150, Math.min(240, Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.72)));
            return { width: side, height: side };
          }
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (error) => {
          // ignore stream frame errors
        }
      );
    } catch (err) {
      console.warn('Start camera failed:', err);
      isScanning = false;
      errorMessage = 'Tidak dapat mengakses perangkat kamera. Silakan ketik token pelamar secara manual di bawah.';
    }
  }

  async function stopScanning() {
    if (html5QrCode && isScanning) {
      try {
        await html5QrCode.stop();
        isScanning = false;
      } catch (err) {
        console.warn('Stop camera err:', err);
      }
    }
  }

  async function handleScanSuccess(rawText) {
    let token = rawText.trim();
    try {
      const parsed = JSON.parse(rawText);
      if (parsed.token) token = parsed.token;
      if (parsed.applicant_id) token = parsed.applicant_id;
    } catch (e) {
      // plain text token
    }

    playSuccessFeedback();
    const found = await lookupApplicant(token);
    if (found) {
      selectApplicant(found);
    } else {
      errorMessage = `Kode token atau NIK "${token}" tidak terdaftar dalam database peserta expo.`;
    }
  }

  function handleManualSubmit() {
    if (!manualInput.trim()) return;
    handleScanSuccess(manualInput.trim());
    manualInput = '';
  }

  function selectApplicant(user) {
    scannedApplicant = user;
    errorMessage = '';
    verificationSuccess = false;
    verificationMessage = '';
    stopScanning();
  }

  async function resetScan() {
    scannedApplicant = null;
    verificationSuccess = false;
    verificationMessage = '';
    errorMessage = '';
    setTimeout(() => {
      startScanning();
    }, 150);
  }

  async function handleVerifyPresence() {
    if (!scannedApplicant) return;
    const indId = targetIndustry?.id || ($currentUser?.company_id || $industries[0]?.id);
    const verifierId = $currentUser ? $currentUser.id : null;

    const res = await recordStandScan(indId, scannedApplicant.id, 'Verifikasi kehadiran fisik di stand booth.', verifierId);
    if (res.success) {
      verificationSuccess = true;
      verificationMessage = 'Kehadiran dan verifikasi di stand berhasil dicatat ke sistem!';
    }
  }

  async function handleCallInterview() {
    if (!scannedApplicant) return;
    const indId = targetIndustry?.id || ($currentUser?.company_id || $industries[0]?.id);
    const compVacancies = $vacancies.filter(v => v.industry_id === indId).map(v => v.id);
    const note = `Dipanggil wawancara langsung di meja booth ${targetIndustry?.nomor_stand || ''}.`.trim();

    // Find existing application or create walk-in application first
    let app = $applications.find(a => a.applicant_id === scannedApplicant.id && compVacancies.includes(a.vacancy_id));
    if (!app) {
      await recordStandScan(indId, scannedApplicant.id, note, $currentUser?.id || null);
      app = $applications.find(a => a.applicant_id === scannedApplicant.id && compVacancies.includes(a.vacancy_id));
    }

    if (app) {
      await updateApplicationStatus(app.id, 'wawancara', note, $currentUser?.id);
    }

    verificationSuccess = true;
    verificationMessage = `Panggilan wawancara dikirim! Notifikasi langsung diteruskan ke akun ${scannedApplicant.nama_lengkap}.`;
  }
</script>

<div class="modal-backdrop" on:click={onClose} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && onClose()}>
  <div class="modal-content scanner-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-header">
      <div class="scanner-header-info">
        <h3 class="heading-sm">Scanner QR Barcode Pelamar</h3>
        {#if $currentUser?.role === 'admin'}
          <div class="admin-scanner-select-row">
            <label class="text-xs text-muted scanner-select-label" for="scannerStandSelect">
              Target Stand Booth:
            </label>
            <select 
              id="scannerStandSelect" 
              class="input-field scanner-stand-select" 
              bind:value={selectedAdminStandId}
            >
              {#each $industries as ind}
                <option value={ind.id}>{ind.nomor_stand} • {ind.nama_perusahaan}</option>
              {/each}
            </select>
          </div>
        {:else}
          <p class="text-xs text-muted scanner-stand-text">
            Stand: <strong>{targetIndustry?.nomor_stand || 'Stand Industri'}</strong> • {targetIndustry?.nama_perusahaan || 'Pemberi Kerja'}
          </p>
        {/if}
      </div>
      <button class="btn-close" on:click={onClose} aria-label="Tutup">
        <X size={20} />
      </button>
    </div>

    <div class="modal-body scanner-body">
      {#if !scannedApplicant}
        <div class="camera-viewport-wrap">
          <div id={scannerElementId} class="camera-stream"></div>
          {#if !isScanning}
            <div class="camera-fallback">
              <Camera size={36} class="text-muted" />
              <p class="text-xs text-muted mt-2">Kamera dalam mode siap</p>
            </div>
          {/if}
        </div>

        {#if errorMessage}
          <div class="alert-box alert-warning">
            <AlertCircle size={16} />
            <span class="text-xs">{errorMessage}</span>
          </div>
        {/if}

        <div class="manual-input-section">
          <label class="input-label" for="manualTokenInput">Atau Masukkan Token Pelamar Secara Manual:</label>
          <div class="input-row">
            <input 
              id="manualTokenInput"
              type="text" 
              class="input-field" 
              placeholder="Masukkan kode token QR atau NIK pelamar..." 
              bind:value={manualInput}
              on:keydown={(e) => e.key === 'Enter' && handleManualSubmit()}
            />
            <button class="btn btn-primary" on:click={handleManualSubmit}>
              <Search size={16} /> Cari
            </button>
          </div>
        </div>
      {:else}
        <!-- Applicant Verified Card -->
        <div class="scanned-result-card">
          <div class="result-top">
            <div class="user-avatar-box">
              <User size={28} />
            </div>
            <div class="user-details">
              <span class="badge badge-terverifikasi">Data Pelamar Terbaca</span>
              <h4 class="heading-sm user-title">{scannedApplicant.nama_lengkap}</h4>
              <p class="text-xs text-muted">{scannedApplicant.asal_sekolah_kampus} • {scannedApplicant.jurusan}</p>
            </div>
          </div>

          <div class="user-specs-grid">
            <div class="spec-row">
              <span class="spec-label">NIK / NISN</span>
              <span class="spec-val tabular-nums">{scannedApplicant.nik_nisn || '-'}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">No. WhatsApp</span>
              <span class="spec-val tabular-nums">{scannedApplicant.nomor_wa || '-'}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Pendidikan</span>
              <span class="spec-val">{scannedApplicant.pendidikan_terakhir || '-'}</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">Token QR</span>
              <span class="spec-val tabular-nums">{scannedApplicant.qr_code_token}</span>
            </div>
          </div>

          {#if scannedApplicant.ringkasan_profil}
            <div class="summary-box">
              <span class="spec-label">Ringkasan Diri:</span>
              <p class="text-xs text-muted">{scannedApplicant.ringkasan_profil}</p>
            </div>
          {/if}

          {#if verificationSuccess}
            <div class="alert-box alert-success mt-3">
              <CheckCircle size={18} />
              <span class="text-xs font-semibold">{verificationMessage || 'Kehadiran dan Verifikasi di Stand Berhasil Dicatat ke Sistem!'}</span>
            </div>
          {/if}

          <div class="action-buttons-row">
            <button class="btn btn-secondary" on:click={resetScan}>
              Scan Pelamar Lain
            </button>

            <button class="btn btn-amber" on:click={handleCallInterview}>
              Panggil Wawancara
            </button>

            <button class="btn btn-primary" on:click={handleVerifyPresence} disabled={verificationSuccess}>
              <CheckCircle size={16} />
              <span>{verificationSuccess ? 'Sudah Terverifikasi' : 'Verifikasi Hadir di Stand'}</span>
            </button>
          </div>
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" on:click={onClose}>
        Selesai
      </button>
    </div>
  </div>
</div>

<style>
  .scanner-modal {
    max-width: min(540px, calc(100vw - 20px));
    width: 100%;
    overflow-x: hidden;
  }

  .scanner-header-info {
    flex: 1;
    min-width: 0;
  }

  .admin-scanner-select-row {
    margin-top: 6px;
    width: 100%;
    min-width: 0;
  }

  .scanner-select-label {
    display: block;
    margin-bottom: 2px;
  }

  .scanner-stand-select {
    font-size: 0.8125rem;
    padding: 6px 10px;
    width: 100%;
    max-width: 100%;
  }

  .scanner-stand-text {
    word-break: break-word;
  }

  .scanner-body {
    min-width: 0;
    overflow-x: hidden;
  }

  .camera-viewport-wrap {
    background-color: var(--color-primary);
    border-radius: var(--radius-md);
    overflow: hidden;
    position: relative;
    min-height: 220px;
    width: 100%;
    max-width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .camera-stream {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  :global(#qr-reader-region),
  :global(#qr-reader-region > div),
  :global(#qr-reader-region video),
  :global(#qr-reader-region canvas),
  :global(#qr-reader-region img) {
    max-width: 100% !important;
    width: 100% !important;
    box-sizing: border-box !important;
  }

  :global(#qr-reader-region video) {
    height: auto !important;
    display: block !important;
    object-fit: cover !important;
  }

  .camera-fallback {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #FFFFFF;
    text-align: center;
    padding: 12px;
  }

  .manual-input-section {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  .input-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    width: 100%;
    min-width: 0;
  }

  .input-row .input-field {
    flex: 1;
    min-width: 0;
  }

  .scanned-result-card {
    background-color: #FFFFFF;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 18px;
    min-width: 0;
    max-width: 100%;
  }

  .result-top {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
    min-width: 0;
  }

  .user-details {
    min-width: 0;
    flex: 1;
    word-break: break-word;
  }

  .user-avatar-box {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    background-color: var(--color-surface-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .user-title {
    margin: 4px 0 2px;
    color: var(--color-primary);
    word-break: break-word;
  }

  .user-specs-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    background-color: var(--color-surface-subtle);
    padding: 12px;
    border-radius: var(--radius-md);
    margin-bottom: 14px;
  }

  .spec-row {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .spec-label {
    font-size: 0.6875rem;
    color: var(--color-text-light);
    text-transform: uppercase;
    font-weight: 600;
  }

  .spec-val {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-main);
    word-break: break-word;
  }

  .summary-box {
    padding: 10px;
    background-color: var(--color-surface-subtle);
    border-radius: var(--radius-sm);
    margin-bottom: 14px;
    word-break: break-word;
  }

  .action-buttons-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
    justify-content: flex-end;
  }

  .alert-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    margin-top: 12px;
    word-break: break-word;
  }

  .alert-warning {
    background-color: var(--color-warning-bg);
    color: var(--color-warning);
    border: 1px solid #FDE68A;
  }

  .alert-success {
    background-color: var(--color-success-bg);
    color: #166534;
    border: 1px solid #BBF7D0;
  }

  .mt-3 {
    margin-top: 12px;
  }

  .btn-close {
    padding: 6px;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    .input-row {
      flex-direction: column;
    }
    .input-row .btn {
      width: 100%;
    }
    .user-specs-grid {
      grid-template-columns: 1fr;
    }
    .scanned-result-card {
      padding: 14px;
    }
    .action-buttons-row {
      flex-direction: column;
    }
    .action-buttons-row .btn {
      width: 100%;
      white-space: normal;
    }
  }
</style>
