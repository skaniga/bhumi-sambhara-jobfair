<script>
  import { loginUser, registerUser, industries } from '../supabase.js';
  import { X, Lock, Mail, User, Building2, AlertCircle, Eye, EyeOff } from '@lucide/svelte';

  export let onClose = () => {};
  export let onSuccess = () => {};

  let isRegisterMode = false;
  let nama = '';
  let email = '';
  let password = '';
  let showPassword = false;
  let role = 'pelamar';
  let companyId = 'a0000001-0000-0000-0000-000000000001';
  let errorMessage = '';
  let loading = false;

  async function handleSubmit() {
    errorMessage = '';
    if (!email || !password) {
      errorMessage = 'Mohon masukkan email dan kata sandi Anda.';
      return;
    }

    loading = true;

    if (isRegisterMode) {
      if (!nama) {
        errorMessage = 'Mohon cantumkan nama lengkap Anda.';
        loading = false;
        return;
      }
      const res = await registerUser(nama, email, password, role, role === 'pemberi_kerja' ? companyId : null);
      loading = false;
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        errorMessage = res.error || 'Pendaftaran gagal.';
      }
    } else {
      const res = await loginUser(email, password);
      loading = false;
      if (res.success) {
        onSuccess(res.user);
        onClose();
      } else {
        errorMessage = res.error || 'Email atau kata sandi tidak cocok.';
      }
    }
  }
</script>

<div class="modal-backdrop" on:click={onClose} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && onClose()}>
  <div class="modal-content auth-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-header">
      <div>
        <h3 class="heading-md auth-title">{isRegisterMode ? 'Daftar Akun Jobfair 2026' : 'Masuk ke Portal Jobfair'}</h3>
        <p class="text-xs text-muted">Portal Resmi Bhumi Sambhara Expo (UNTIDAR x SMKN 1 Magelang)</p>
      </div>
      <button class="btn-close" on:click={onClose}>
        <X size={20} />
      </button>
    </div>

    <div class="modal-body auth-body">
      {#if isRegisterMode}
        <div class="input-group">
          <label class="input-label" for="regNamaInput">Nama Lengkap</label>
          <input 
            id="regNamaInput"
            type="text" 
            class="input-field" 
            placeholder="Contoh: Dimas Arya Pratama / Siti Nurjanah" 
            bind:value={nama} 
          />
        </div>

        <div class="input-group">
          <label class="input-label" for="regPeranSelect">Daftar Sebagai Peran</label>
          <select id="regPeranSelect" class="input-field" bind:value={role}>
            <option value="pelamar">Pelamar (Siswa / Alumni / Umum)</option>
            <option value="pemberi_kerja">Pemberi Kerja (Perwakilan Stand Industri)</option>
            <option value="admin">Panitia Acara (BKK / UNTIDAR)</option>
          </select>
        </div>

        {#if role === 'pemberi_kerja'}
          <div class="input-group">
            <label class="input-label" for="regPerusahaanSelect">Pilih Stand Industri Anda</label>
            <select id="regPerusahaanSelect" class="input-field" bind:value={companyId}>
              {#each $industries as ind}
                <option value={ind.id}>{ind.nomor_stand} • {ind.nama_perusahaan}</option>
              {/each}
            </select>
          </div>
        {/if}
      {/if}

      <div class="input-group">
        <label class="input-label" for="authEmailInput">Alamat Email</label>
        <input 
          id="authEmailInput"
          type="email" 
          class="input-field" 
          placeholder="nama@email.com" 
          bind:value={email} 
        />
      </div>

      <div class="input-group">
        <label class="input-label" for="authPasswordInput">Kata Sandi</label>
        <div class="password-wrapper">
          <input 
            id="authPasswordInput"
            type={showPassword ? "text" : "password"} 
            class="input-field password-input" 
            placeholder="••••••••" 
            bind:value={password}
            on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <button 
            type="button" 
            class="password-toggle-btn"
            on:click={() => showPassword = !showPassword}
            title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          >
            {#if showPassword}
              <EyeOff size={18} />
            {:else}
              <Eye size={18} />
            {/if}
          </button>
        </div>
      </div>

      {#if errorMessage}
        <div class="alert-box alert-danger">
          <AlertCircle size={16} />
          <span class="text-xs">{errorMessage}</span>
        </div>
      {/if}

      <div class="toggle-mode-row">
        <span class="text-xs text-muted">
          {isRegisterMode ? 'Sudah memiliki akun terdaftar?' : 'Belum memiliki akun pendaftaran?'}
        </span>
        <button class="toggle-link" on:click={() => { isRegisterMode = !isRegisterMode; errorMessage = ''; }}>
          {isRegisterMode ? 'Masuk sekarang' : 'Daftar di sini'}
        </button>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" on:click={onClose}>
        Batal
      </button>
      <button class="btn btn-primary" on:click={handleSubmit} disabled={loading}>
        {loading ? 'Memproses...' : isRegisterMode ? 'Selesaikan Pendaftaran' : 'Masuk Portal'}
      </button>
    </div>
  </div>
</div>

<style>
  .auth-modal {
    max-width: 460px;
    animation: scaleIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.15) forwards;
  }

  .auth-title {
    color: var(--color-primary);
    margin-bottom: 2px;
  }

  .btn-close {
    padding: 6px;
    color: var(--color-text-muted);
  }

  .toggle-mode-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
  }

  .toggle-link {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-amber-accent);
  }

  .toggle-link:hover {
    text-decoration: underline;
  }

  .alert-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    margin-bottom: 12px;
  }

  .alert-danger {
    background-color: var(--color-danger-bg);
    border: 1px solid #FECDD3;
    color: #9F1239;
  }

  .password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .password-input {
    width: 100%;
    padding-right: 42px;
  }

  .password-toggle-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    color: var(--color-text-muted);
    cursor: pointer;
    padding: 6px;
    border-radius: var(--radius-sm);
    transition: color 0.15s ease, background-color 0.15s ease;
  }

  .password-toggle-btn:hover {
    color: var(--color-primary);
    background-color: var(--color-bg-secondary);
  }
</style>
