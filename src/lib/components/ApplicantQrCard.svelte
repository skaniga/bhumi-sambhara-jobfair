<script>
  import { onMount } from 'svelte';
  import { currentUser } from '../supabase.js';
  import QRCode from 'qrcode';
  import { X, QrCode, Download, Printer, User, Award, CheckCircle } from '@lucide/svelte';

  export let onClose = () => {};

  let qrCanvas;
  let qrDataUrl = '';

  onMount(async () => {
    if ($currentUser && $currentUser.qr_code_token) {
      const payload = JSON.stringify({
        source: "BHUMI_SAMBHARA_JOBFAIR_2026",
        applicant_id: $currentUser.id,
        nama: $currentUser.nama_lengkap,
        token: $currentUser.qr_code_token,
        sekolah: $currentUser.asal_sekolah_kampus || "SMK/Umum"
      });

      try {
        qrDataUrl = await QRCode.toDataURL(payload, {
          width: 220,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        });
      } catch (err) {
        console.error('QR Gen error:', err);
      }
    }
  });

  function handlePrint() {
    window.print();
  }
</script>

<div class="modal-backdrop" on:click={onClose} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && onClose()}>
  <div class="modal-content id-card-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-header">
      <div class="header-titles">
        <h3 class="heading-sm">Kartu Peserta Resmi Jobfair</h3>
        <p class="text-xs text-muted">ID Digital untuk Verifikasi di 20 Stand Booth</p>
      </div>
      <button class="btn-close" on:click={onClose}>
        <X size={20} />
      </button>
    </div>

    <div class="modal-body id-card-body">
      <div class="jobfair-id-pass">
        <div class="pass-ribbon">
          <span class="ribbon-text">K1 PARIWISATA UNTIDAR X SMKN 1 MAGELANG</span>
        </div>

        <div class="pass-header">
          <div class="pass-logo-badge">BSJ 2026</div>
          <div class="pass-event-info">
            <h4 class="pass-title">BHUMI SAMBHARA EXPO</h4>
            <span class="pass-sub">Graha Krida Wiyata • 19 Nov 2026</span>
          </div>
        </div>

        <div class="pass-divider"></div>

        <div class="pass-main">
          <div class="qr-box">
            {#if qrDataUrl}
              <img src={qrDataUrl} alt="QR Code Peserta" class="qr-image" />
            {:else}
              <div class="qr-placeholder">
                <QrCode size={48} />
              </div>
            {/if}
            <span class="qr-token-label tabular-nums">{$currentUser?.qr_code_token || 'TOKEN-ACTIVE'}</span>
          </div>

          <div class="applicant-meta">
            <div class="meta-item">
              <span class="meta-label">Nama Pelamar</span>
              <span class="meta-val font-bold">{$currentUser?.nama_lengkap || 'Peserta Expo'}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">NIK / NISN</span>
              <span class="meta-val tabular-nums">{$currentUser?.nik_nisn || '3308011204040003'}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Asal Lembaga</span>
              <span class="meta-val">{$currentUser?.asal_sekolah_kampus || 'SMK Negeri 1 Magelang'}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Jurusan / Kompetensi</span>
              <span class="meta-val">{$currentUser?.jurusan || 'Teknik Kendaraan Ringan'}</span>
            </div>

            <div class="meta-item">
              <span class="meta-label">Status Akses</span>
              <span class="badge badge-terverifikasi">
                <CheckCircle size={12} /> Peserta Terdaftar
              </span>
            </div>
          </div>
        </div>

        <div class="pass-footer">
          <p class="text-xs text-muted">
            Tunjukkan kode QR ini ke meja HRD di masing-masing stand industri untuk pencatatan presensi dan verifikasi berkas lamaran.
          </p>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" on:click={onClose}>
        Tutup
      </button>
      <button class="btn btn-primary" on:click={handlePrint}>
        <Printer size={16} />
        <span>Cetak Kartu Peserta</span>
      </button>
    </div>
  </div>
</div>

<style>
  .id-card-modal {
    max-width: 520px;
  }

  .id-card-body {
    background-color: var(--color-surface-subtle);
    padding: 24px;
  }

  .jobfair-id-pass {
    background-color: #FFFFFF;
    border: 2px solid var(--color-primary);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
  }

  .pass-ribbon {
    background-color: var(--color-primary);
    color: #FFFFFF;
    text-align: center;
    padding: 6px 12px;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .pass-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background-color: #FFFFFF;
  }

  .pass-logo-badge {
    background-color: var(--color-amber-accent);
    color: #FFFFFF;
    font-size: 0.8125rem;
    font-weight: 800;
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    letter-spacing: 0.04em;
  }

  .pass-title {
    font-size: 1rem;
    font-weight: 800;
    color: var(--color-primary);
    line-height: 1.2;
  }

  .pass-sub {
    font-size: 0.75rem;
    color: var(--color-text-muted);
  }

  .pass-divider {
    height: 1px;
    background: repeating-linear-gradient(to right, var(--color-border) 0, var(--color-border) 6px, transparent 6px, transparent 12px);
  }

  .pass-main {
    padding: 20px;
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .qr-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    background-color: #FFFFFF;
    padding: 10px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    flex-shrink: 0;
  }

  .qr-image {
    width: 140px;
    height: 140px;
    display: block;
  }

  .qr-placeholder {
    width: 140px;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-surface-muted);
    color: var(--color-text-light);
  }

  .qr-token-label {
    font-size: 0.6875rem;
    color: var(--color-text-muted);
    font-weight: 600;
  }

  .applicant-meta {
    display: flex;
    flex-direction: column;
    gap: 10px;
    flex-grow: 1;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text-light);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .meta-val {
    font-size: 0.8125rem;
    color: var(--color-text-main);
  }

  .font-bold {
    font-weight: 700;
    color: var(--color-primary);
  }

  .pass-footer {
    background-color: var(--color-surface-subtle);
    padding: 12px 20px;
    border-top: 1px solid var(--color-border);
  }

  .btn-close {
    padding: 6px;
    color: var(--color-text-muted);
  }

  .btn-close:hover {
    color: var(--color-primary);
  }

  @media (max-width: 500px) {
    .pass-main {
      flex-direction: column;
    }
  }

  @media print {
    :global(body *) {
      visibility: hidden;
    }
    .jobfair-id-pass, .jobfair-id-pass * {
      visibility: visible;
    }
    .jobfair-id-pass {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
  }
</style>
