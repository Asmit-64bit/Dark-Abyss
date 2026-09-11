-- ==============================================================================
-- ABYSS - SEED LEADERBOARD NPC OPERATORS & FIX CONSTRAINTS
-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- Step 1: Drop NOT NULL constraints on email and password_hash
-- This prevents Error 23502 (null value in column violates not-null constraint)
-- both for NPC operators and during user registration triggers.
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN password_hash DROP NOT NULL;

-- Step 2: Drop Foreign Key constraint on profiles.id -> auth.users.id
-- This allows NPC / demo leaderboard profiles to exist without requiring auth.users entries
DO $$
DECLARE
  fk_record RECORD;
BEGIN
  FOR fk_record IN (
    SELECT tc.constraint_name 
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public' 
      AND tc.table_name = 'profiles' 
      AND tc.constraint_type = 'FOREIGN KEY'
  ) LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS %I', fk_record.constraint_name);
    RAISE NOTICE 'Dropped Foreign Key constraint: %', fk_record.constraint_name;
  END LOOP;
END $$;

-- Step 3: Insert baseline NPC operators with valid emails and password hashes
-- Fully idempotent with ON CONFLICT (id) DO UPDATE
INSERT INTO public.profiles (
  id,
  email,
  password_hash,
  operator_name,
  points,
  score,
  solo_solves_count,
  unlocked_level,
  completed_levels,
  achievements,
  sanity,
  min_sanity_recorded,
  updated_at
) VALUES
  (
    '00000000-0000-4000-a000-000000000001',
    'dr.aris.thorne@abyss.npc',
    'npc_no_login',
    'DR_ARIS_THORNE',
    14850,
    14850,
    14,
    5,
    ARRAY[1, 2, 3, 4, 5],
    ARRAY['first_solve', 'speed_demon', 'domain_master', 'solo_legend', 'puzzle_architect', 'sanity_keeper', 'streak_5', 'completionist'],
    100,
    92,
    '2026-09-08T10:14:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000002',
    'cipher.nexus@abyss.npc',
    'npc_no_login',
    'CIPHER_NEXUS',
    12400,
    12400,
    12,
    5,
    ARRAY[1, 2, 3, 4, 5],
    ARRAY['first_solve', 'speed_demon', 'domain_master', 'solo_legend', 'puzzle_architect', 'sanity_keeper', 'streak_5'],
    100,
    85,
    '2026-09-09T14:22:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000003',
    'operator.vance@abyss.npc',
    'npc_no_login',
    'OPERATOR_VANCE',
    9850,
    9850,
    9,
    4,
    ARRAY[1, 2, 3, 4],
    ARRAY['first_solve', 'speed_demon', 'domain_master', 'solo_legend', 'puzzle_architect', 'sanity_keeper'],
    100,
    78,
    '2026-09-10T08:45:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000004',
    'null.pointer.07@abyss.npc',
    'npc_no_login',
    'NULL_POINTER_07',
    8200,
    8200,
    8,
    4,
    ARRAY[1, 2, 3, 4],
    ARRAY['first_solve', 'speed_demon', 'domain_master', 'solo_legend', 'sanity_keeper'],
    100,
    96,
    '2026-09-09T19:10:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000005',
    'sector.archivist@abyss.npc',
    'npc_no_login',
    'SECTOR_ARCHIVIST',
    6450,
    6450,
    6,
    3,
    ARRAY[1, 2, 3],
    ARRAY['first_solve', 'speed_demon', 'domain_master', 'solo_legend'],
    100,
    88,
    '2026-09-10T12:05:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000006',
    'syntax.shadow@abyss.npc',
    'npc_no_login',
    'SYNTAX_SHADOW',
    5100,
    5100,
    5,
    3,
    ARRAY[1, 2, 3],
    ARRAY['first_solve', 'speed_demon', 'domain_master', 'solo_legend'],
    100,
    71,
    '2026-09-08T22:30:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000007',
    'ghost.protocol@abyss.npc',
    'npc_no_login',
    'GHOST_PROTOCOL',
    3900,
    3900,
    4,
    2,
    ARRAY[1, 2],
    ARRAY['first_solve', 'speed_demon', 'solo_legend'],
    100,
    82,
    '2026-09-11T04:15:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000008',
    'echo.runner.99@abyss.npc',
    'npc_no_login',
    'ECHO_RUNNER_99',
    2750,
    2750,
    3,
    2,
    ARRAY[1, 2],
    ARRAY['first_solve', 'speed_demon'],
    100,
    90,
    '2026-09-10T17:50:00Z'
  ),
  (
    '00000000-0000-4000-a000-000000000009',
    'recon.sentry@abyss.npc',
    'npc_no_login',
    'RECON_SENTRY',
    1600,
    1600,
    2,
    1,
    ARRAY[1],
    ARRAY['first_solve'],
    100,
    65,
    '2026-09-11T09:00:00Z'
  ),
  (
    '00000000-0000-4000-a000-00000000000a',
    'init.runner.01@abyss.npc',
    'npc_no_login',
    'INIT_RUNNER_01',
    850,
    850,
    1,
    1,
    ARRAY[1],
    ARRAY['first_solve'],
    100,
    100,
    '2026-09-11T11:20:00Z'
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  operator_name = EXCLUDED.operator_name,
  points = EXCLUDED.points,
  score = EXCLUDED.score,
  solo_solves_count = EXCLUDED.solo_solves_count,
  unlocked_level = EXCLUDED.unlocked_level,
  completed_levels = EXCLUDED.completed_levels,
  achievements = EXCLUDED.achievements,
  sanity = EXCLUDED.sanity,
  min_sanity_recorded = EXCLUDED.min_sanity_recorded,
  updated_at = EXCLUDED.updated_at;

-- Step 4: Verify seeded rows in profiles table
SELECT id, operator_name, email, points, score, solo_solves_count, unlocked_level
FROM public.profiles
ORDER BY points DESC;
