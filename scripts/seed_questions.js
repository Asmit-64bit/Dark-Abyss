/**
 * Abyss Sentinel Mainframe - Question Bank Seeder
 * Reads 70 curated puzzles from server/seedQuestionsData.js and verifies/seeds them into:
 * 1. Supabase database public.generated_questions (if keys and permissions allow)
 * 2. In-memory / dev server cache fallback
 * 3. SQL migration file supabase/seed_questions.sql
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { SEED_QUESTIONS } from '../server/seedQuestionsData.js';
import { generateSeedSql } from './generate_seed_sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env manually
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

async function main() {
  console.log('================================================================');
  console.log('       ABYSS SENTINEL // QUESTION BANK POPULATION ENGINE        ');
  console.log('================================================================');
  console.log(`[Loaded] Total Curated Questions: ${SEED_QUESTIONS.length}`);

  // Summary by Domain & Difficulty
  const summary = {};
  for (const q of SEED_QUESTIONS) {
    if (!summary[q.domain]) summary[q.domain] = { Easy: 0, Intermediate: 0, Advanced: 0, Expert: 0, Total: 0 };
    summary[q.domain][q.difficulty] = (summary[q.domain][q.difficulty] || 0) + 1;
    summary[q.domain].Total += 1;
  }
  console.table(summary);

  // 1. Generate SQL Migration file
  console.log('\n--- Step 1: Compiling SQL Migration ---');
  const sqlFile = generateSeedSql();
  console.log(`[SQL Ready] Migration compiled: ${sqlFile}`);

  // 2. Test Supabase Connectivity & Seed
  console.log('\n--- Step 2: Supabase Cloud Database Sync ---');
  const url = process.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    console.warn('[Notice] PUBLIC_SUPABASE_URL not configured. Questions available via in-memory server.');
    return;
  }

  // Test with service key first, then anon key
  let supabase = null;
  let activeKeyType = '';

  if (serviceKey && !serviceKey.includes('unregistered')) {
    try {
      const client = createClient(url, serviceKey, { auth: { persistSession: false } });
      const { error } = await client.from('generated_questions').select('id').limit(1);
      if (!error) {
        supabase = client;
        activeKeyType = 'Service Role (Admin)';
      }
    } catch {
      // fallback to anon key
    }
  }

  if (!supabase && anonKey) {
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const { error } = await client.from('generated_questions').select('id').limit(1);
    if (!error) {
      supabase = client;
      activeKeyType = 'Publishable (Anon)';
    }
  }

  if (!supabase) {
    console.warn('[Notice] Could not establish authenticated connection to Supabase.');
    console.log('[Action] Run the compiled migration in Supabase SQL Editor:');
    console.log(`         ${sqlFile}`);
    return;
  }

  console.log(`[Connected] Supabase connected with ${activeKeyType}`);

  // Attempt batch upsert
  let insertedCount = 0;
  let rlsRestricted = false;

  const batchSize = 10;
  for (let i = 0; i < SEED_QUESTIONS.length; i += batchSize) {
    const batch = SEED_QUESTIONS.slice(i, i + batchSize).map((q) => ({
      id: q.id,
      question: q.question,
      domain: q.domain,
      tags: q.tags,
      difficulty: q.difficulty,
      title: q.title,
      scenario: q.scenario,
      code_snippet: q.code_snippet,
      answer: q.answer,
      hint: q.hint,
      explanation: q.explanation,
      sector_level: q.sector_level,
    }));

    const { error } = await supabase.from('generated_questions').upsert(batch, { onConflict: 'id' });

    if (error) {
      if (error.code === '42501' || error.message?.includes('violates row-level security')) {
        rlsRestricted = true;
        break;
      } else {
        console.warn(`[Batch ${i / batchSize + 1}] Error: ${error.message}`);
      }
    } else {
      insertedCount += batch.length;
    }
  }

  if (rlsRestricted) {
    console.log(`\n[RLS Active] Supabase cloud table has Row-Level Security active for anon inserts.`);
    console.log(`[Direct Solution] Open your Supabase Dashboard -> SQL Editor and run:`);
    console.log(`                  ${sqlFile}`);
    console.log(`                  This will insert all ${SEED_QUESTIONS.length} questions and apply permissive policies.`);
  } else {
    console.log(`[Success] Upserted ${insertedCount} questions directly into Supabase table public.generated_questions.`);
  }

  // 3. Test Reading Questions
  const { data: readBack } = await supabase.from('generated_questions').select('id, domain, difficulty').limit(100);
  console.log(`\n[Database Status] Live rows readable in public.generated_questions: ${readBack?.length || 0}`);
  console.log('================================================================');
  console.log('                    QUESTION BANK READY                         ');
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('Fatal error running seeder:', err);
  process.exit(1);
});
