import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_QUESTIONS } from '../server/seedQuestionsData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

function escapeArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "'{}'::text[]";
  const items = arr.map((item) => `'${String(item).replace(/'/g, "''")}'`);
  return `ARRAY[${items.join(', ')}]::text[]`;
}

export function generateSeedSql() {
  const outputPath = path.resolve(__dirname, '../supabase/seed_questions.sql');

  let sql = `-- ==============================================================================
-- Abyss Sentinel Mainframe - Master Question Bank Migration
-- Generated at: ${new Date().toISOString()}
-- Total Puzzles: ${SEED_QUESTIONS.length}
-- Covers all 5 Curriculum Domains, 4 Difficulty Tiers, and Sectors 1-5 (Slots 1-14)
-- ==============================================================================

-- 1. Ensure Table Exists
CREATE TABLE IF NOT EXISTS public.generated_questions (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'Programming Fundamentals',
  tags TEXT[] NOT NULL DEFAULT '{}',
  difficulty TEXT NOT NULL DEFAULT 'Easy' CHECK (difficulty IN ('Easy', 'Intermediate', 'Advanced', 'Expert')),
  title TEXT,
  scenario TEXT,
  code_snippet TEXT,
  answer TEXT[] NOT NULL DEFAULT '{}',
  hint TEXT,
  explanation TEXT,
  sector_level INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely allow TEXT or UUID id compatibility
DO $$ 
BEGIN 
  BEGIN
    ALTER TABLE public.generated_questions ALTER COLUMN id TYPE TEXT;
  EXCEPTION 
    WHEN others THEN NULL;
  END;
END $$;

-- 2. Configure Permissive Row Level Security Policies
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view generated questions" ON public.generated_questions;
CREATE POLICY "Public can view generated questions" 
ON public.generated_questions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can insert generated questions" ON public.generated_questions;
CREATE POLICY "Anyone can insert generated questions" 
ON public.generated_questions FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update generated questions" ON public.generated_questions;
CREATE POLICY "Anyone can update generated questions" 
ON public.generated_questions FOR UPDATE 
USING (true);

-- 3. Optimized Query Indexes
CREATE INDEX IF NOT EXISTS idx_questions_domain ON public.generated_questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.generated_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_domain_difficulty ON public.generated_questions(domain, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_sector ON public.generated_questions(sector_level);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.generated_questions USING GIN(tags);

-- 4. Seed Questions Population
`;

  for (const q of SEED_QUESTIONS) {
    const idSql = escapeSql(q.id);
    const questionSql = escapeSql(q.question);
    const domainSql = escapeSql(q.domain);
    const tagsSql = escapeArray(q.tags);
    const diffSql = escapeSql(q.difficulty);
    const titleSql = escapeSql(q.title);
    const scenarioSql = escapeSql(q.scenario);
    const snippetSql = escapeSql(q.code_snippet);
    const answerSql = escapeArray(q.answer);
    const hintSql = escapeSql(q.hint);
    const explSql = escapeSql(q.explanation);
    const sectorSql = Number(q.sector_level) || 1;

    sql += `INSERT INTO public.generated_questions (
  id, question, domain, tags, difficulty, title, scenario, code_snippet, answer, hint, explanation, sector_level
) VALUES (
  ${idSql}, ${questionSql}, ${domainSql}, ${tagsSql}, ${diffSql}, ${titleSql}, ${scenarioSql}, ${snippetSql}, ${answerSql}, ${hintSql}, ${explSql}, ${sectorSql}
)
ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  domain = EXCLUDED.domain,
  tags = EXCLUDED.tags,
  difficulty = EXCLUDED.difficulty,
  title = EXCLUDED.title,
  scenario = EXCLUDED.scenario,
  code_snippet = EXCLUDED.code_snippet,
  answer = EXCLUDED.answer,
  hint = EXCLUDED.hint,
  explanation = EXCLUDED.explanation,
  sector_level = EXCLUDED.sector_level;

`;
  }

  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`[SQL Generator] Successfully generated ${outputPath} with ${SEED_QUESTIONS.length} questions.`);
  return outputPath;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSeedSql();
}
