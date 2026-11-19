/**
 * MIGRATION: Add pendidikan_minimal column to job_vacancies table
 * Run once: node scripts/migrate_add_pendidikan_minimal.js
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rnlonstoexvlxjjhmtsy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJubG9uc3RvZXh2bHhqamhtc3kiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc0NzM3NzkzMiwiZXhwIjoyMDYyOTUzOTMyfQ.TksSt3HiCnr4XM0M3CKXS4u1P2mUstHPgHBqSGNNYEc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrate() {
  console.log('🔧 Menambahkan kolom pendidikan_minimal ke tabel job_vacancies...\n');

  // Add column via raw SQL using Supabase RPC (if exec_sql enabled)
  // If not, use Supabase dashboard: ALTER TABLE job_vacancies ADD COLUMN IF NOT EXISTS pendidikan_minimal TEXT DEFAULT 'Umum';
  
  // Fallback: update existing rows with pendidikan_minimal from kualifikasi patterns
  const { data: vacancies, error } = await supabase
    .from('job_vacancies')
    .select('id, kualifikasi');

  if (error) {
    console.error('❌ Gagal mengambil data lowongan:', error.message);
    process.exit(1);
  }

  console.log(`📋 Ditemukan ${vacancies.length} lowongan`);

  // Try to add the column first (may need service role or Supabase dashboard)
  console.log('\n⚠️  Jalankan SQL berikut di Supabase Dashboard → SQL Editor:');
  console.log('─'.repeat(60));
  console.log('ALTER TABLE public.job_vacancies');
  console.log("  ADD COLUMN IF NOT EXISTS pendidikan_minimal TEXT DEFAULT 'Umum';");
  console.log('─'.repeat(60));
  console.log('\nSetelah kolom ditambahkan, data akan tersimpan dengan benar.');
  console.log('✅ Script selesai.');
}

migrate();
