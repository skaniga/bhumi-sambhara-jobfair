<script>
  import { loginUser, registerUser, resetUserPassword, updateUserPassword, industries } from '../supabase.js';
  import { X, Lock, Mail, User, Building2, AlertCircle, Eye, EyeOff, CheckCircle2, ArrowLeft, KeyRound } from '@lucide/svelte';

  export let onClose = () => {};
  export let onSuccess = () => {};
  export let initialMode = 'login'; // 'login' | 'register' | 'forgot' | 'new_password'

  let authMode = initialMode;
  let nama = '';
  let email = '';
  let password = '';
  let newPassword = '';
  let confirmPassword = '';
  let showPassword = false;
  let showNewPassword = false;
  let role = 'pelamar';
  let companyId = 'a0000001-0000-0000-0000-000000000001';
  let errorMessage = '';
  let successMessage = '';
  let loading = false;

  $: if (initialMode && authMode !== initialMode && !email && !password) {
    authMode = initialMode;
  }

  async function handleSubmit() {
    errorMessage = '';
    successMessage = '';

    if (authMode === 'new_password') {
      if (!newPassword || newPassword.length < 6) {
        errorMessage = 'Kata sandi baru minimal 6 karakter.';
        return;
      }
      if (newPassword !== confirmPassword) {
        errorMessage = 'Konfirmasi kata sandi tidak cocok.';
        return;
      }
      loading = true;
      const res = await updateUserPassword(newPassword);
      loading = false;
      if (res.success) {
        successMessage = 'Kata sandi berhasil diperbarui! Mengalihkan ke halaman masuk...';
        setTimeout(() => {
          setMode('login');
        }, 1500);
      } else {
        errorMessage = res.error || 'Gagal memperbarui kata sandi.';
      }
      return;
    }

    if (authMode === 'forgot') {
      if (!email) {
        errorMessage = 'Mohon masukkan email atau username akun Anda.';
        return;
      }
      loading = true;
      const res = await resetUserPassword(email);
      loading = false;
      if (res.success) {
        successMessage = res.message;
      } else {
        errorMessage = res.error || 'Gagal memproses pemulihan kata sandi.';
      }
      return;
    }

    if (!email || !password) {
      errorMessage = 'Mohon masukkan email dan kata sandi Anda.';
      return;
    }

    loading = true;

    if (authMode === 'register') {
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

  function setMode(mode) {
    authMode = mode;
    errorMessage = '';
    successMessage = '';
  }
</script>

<div class="modal-backdrop" on:click={onClose} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && onClose()}>
  <div class="modal-content auth-modal" on:click|stopPropagation on:keydown|stopPropagation role="dialog" aria-modal="true" tabindex="-1">
    <div class="modal-header">
      <div>
        <h3 class="heading-md auth-title">
          {#if authMode === 'register'}
            Daftar Akun Jobfair 2026
          {:else if authMode === 'forgot'}
            Lupa Kata Sandi Akun
          {:else if authMode === 'new_password'}
            Atur Ulang Kata Sandi Baru
          {:else}
            Masuk ke Portal Jobfair
          {/if}
        </h3>
        <p class="text-xs text-muted">Portal Resmi Bhumi Sambhara Expo (UNTIDAR × SMKN 1 Magelang)</p>
      </div>
      <button class="btn-close" on:click={onClose} aria-label="Tutup">
        <X size={20} />
      </button>
    </div>

    <div class="modal-body auth-body">
      {#if authMode === 'new_password'}
        <div class="forgot-notice">
          <div class="forgot-icon-wrap">
            <KeyRound size={24} class="text-amber" />
          </div>
          <p class="text-xs text-muted">
            Tautan pemulihan terverifikasi. Silakan masukkan kata sandi baru untuk akun Anda.
          </p>
        </div>

        <div class="input-group">
          <label class="input-label" for="newPassInput">Kata Sandi Baru (Min. 6 Karakter)</label>
          <div class="password-wrapper">
            <input 
              id="newPassInput"
              type={showNewPassword ? "text" : "password"} 
              class="input-field password-input" 
              placeholder="Minimal 6 karakter" 
              bind:value={newPassword}
            />
            <button 
              type="button" 
              class="password-toggle-btn"
              on:click={() => showNewPassword = !showNewPassword}
              title={showNewPassword ? 'Sembunyikan' : 'Tampilkan'}
            >
              {#if showNewPassword}<EyeOff size={18} />{:else}<Eye size={18} />{/if}
            </button>
          </div>
        </div>

        <div class="input-group">
          <label class="input-label" for="confirmPassInput">Ulangi Kata Sandi Baru</label>
          <input 
            id="confirmPassInput"
            type="password" 
            class="input-field" 
            placeholder="Ketik ulang kata sandi baru" 
            bind:value={confirmPassword}
            on:keydown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
      {/if}

      {#if authMode === 'register'}
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

      {#if authMode === 'forgot'}
        <div class="forgot-notice">
          <div class="forgot-icon-wrap">
            <KeyRound size={24} class="text-amber" />
          </div>
          <p class="text-xs text-muted">
            Masukkan alamat email akun pelamar Anda untuk menerima tautan reset kata sandi, atau masukkan Username Stand Industri (contoh: <code>HkGoldStandA3</code>).
          </p>
        </div>
      {/if}

      {#if authMode !== 'new_password'}
        <div class="input-group">
          <label class="input-label" for="authEmailInput">
            {authMode === 'register' ? 'Alamat Email' : authMode === 'forgot' ? 'Email atau Username Stand' : 'Email atau Username Stand'}
          </label>
          <input 
            id="authEmailInput"
            type="text" 
            class="input-field" 
            placeholder={authMode === 'register' ? 'nama@email.com' : 'nama@email.com / HkGoldStandA3'} 
            bind:value={email}
            on:keydown={(e) => e.key === 'Enter' && (authMode === 'forgot' ? handleSubmit() : null)}
          />
        </div>
      {/if}

      {#if authMode !== 'forgot' && authMode !== 'new_password'}
        <div class="input-group">
          <div class="password-label-row">
            <label class="input-label mb-0" for="authPasswordInput">Kata Sandi</label>
            {#if authMode === 'login'}
              <button type="button" class="forgot-link-inline" on:click={() => setMode('forgot')}>
                Lupa kata sandi?
              </button>
            {/if}
          </div>
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
      {/if}

      {#if successMessage}
        <div class="alert-box alert-success">
          <CheckCircle2 size={16} />
          <span class="text-xs">{successMessage}</span>
        </div>
      {/if}

      {#if errorMessage}
        <div class="alert-box alert-danger">
          <AlertCircle size={16} />
          <span class="text-xs">{errorMessage}</span>
        </div>
      {/if}

      <div class="toggle-mode-row">
        {#if authMode === 'forgot' || authMode === 'new_password'}
          <button type="button" class="btn-back-link" on:click={() => setMode('login')}>
            <ArrowLeft size={14} />
            <span>Kembali ke Halaman Masuk</span>
          </button>
        {:else}
          <span class="text-xs text-muted">
            {authMode === 'register' ? 'Sudah memiliki akun terdaftar?' : 'Belum memiliki akun pendaftaran?'}
          </span>
          <button type="button" class="toggle-link" on:click={() => setMode(authMode === 'register' ? 'login' : 'register')}>
            {authMode === 'register' ? 'Masuk sekarang' : 'Daftar di sini'}
          </button>
        {/if}
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-secondary" on:click={onClose}>
        Batal
      </button>
      <button class="btn btn-primary" on:click={handleSubmit} disabled={loading}>
        {loading ? 'Memproses...' : authMode === 'register' ? 'Selesaikan Pendaftaran' : authMode === 'forgot' ? 'Kirim Pemulihan' : authMode === 'new_password' ? 'Simpan Kata Sandi Baru' : 'Masuk Portal'}
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

  .password-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .forgot-link-inline {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-amber-accent);
    cursor: pointer;
  }

  .forgot-link-inline:hover {
    text-decoration: underline;
  }

  .forgot-notice {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 14px;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    margin-bottom: 14px;
  }

  .forgot-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-amber-accent);
    flex-shrink: 0;
  }

  .btn-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    color: var(--color-primary);
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    padding: 4px 0;
  }

  .btn-back-link:hover {
    text-decoration: underline;
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
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
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
    line-height: 1.4;
  }

  .alert-danger {
    background-color: var(--color-danger-bg);
    border: 1px solid #FECDD3;
    color: #9F1239;
  }

  .alert-success {
    background-color: #ECFDF5;
    border: 1px solid #A7F3D0;
    color: #065F46;
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
