-- ==============================================================================
-- ABYSS - SUPABASE DATABASE SCHEMA & RLS MIGRATION
-- Run this SQL in your Supabase Project SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create custom profiles table with email & credentials storage
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  password_hash TEXT,
  operator_name TEXT NOT NULL DEFAULT 'OPERATOR_09',
  unlocked_level INTEGER NOT NULL DEFAULT 1,
  completed_levels INTEGER[] NOT NULL DEFAULT '{}',
  best_times JSONB NOT NULL DEFAULT '{}'::jsonb,
  achievements TEXT[] NOT NULL DEFAULT '{}',
  sanity INTEGER NOT NULL DEFAULT 100 CHECK (sanity >= 0 AND sanity <= 100),
  min_sanity_recorded INTEGER NOT NULL DEFAULT 100 CHECK (min_sanity_recorded >= 0 AND min_sanity_recorded <= 100),
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0),
  points INTEGER NOT NULL DEFAULT 0 CHECK (points >= 0),
  solo_solves_count INTEGER NOT NULL DEFAULT 0 CHECK (solo_solves_count >= 0),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add columns if table was created previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS operator_name TEXT NOT NULL DEFAULT 'OPERATOR_09';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unlocked_level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS completed_levels INTEGER[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS best_times JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS achievements TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sanity INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS min_sanity_recorded INTEGER NOT NULL DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS points INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS score INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS solo_solves_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2b. Leaderboard fast indexing
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles (points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_score ON public.profiles (score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_solo_solves ON public.profiles (solo_solves_count DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2c. Merge data from physical 'public.users' table if it exists into 'public.profiles'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'users' AND table_type = 'BASE TABLE'
  ) THEN
    INSERT INTO public.profiles (
      id, email, operator_name, points, score, solo_solves_count, unlocked_level, completed_levels, achievements, sanity, min_sanity_recorded, updated_at
    )
    SELECT 
      id, 
      COALESCE(email, ''), 
      COALESCE(operator_name, 'OPERATOR_09'),
      COALESCE(points, score, 0),
      COALESCE(score, points, 0),
      COALESCE(solo_solves_count, 0),
      COALESCE(unlocked_level, 1),
      COALESCE(completed_levels, '{}'),
      COALESCE(achievements, '{}'),
      COALESCE(sanity, 100),
      COALESCE(min_sanity_recorded, 100),
      COALESCE(updated_at, now())
    FROM public.users
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
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

    DROP TABLE public.users CASCADE;
  END IF;
END $$;

-- 2d. Create unified 'public.users' view aliased directly to public.profiles
DROP VIEW IF EXISTS public.users CASCADE;
CREATE VIEW public.users AS
SELECT 
  id,
  email,
  password_hash,
  operator_name,
  points,
  score,
  solo_solves_count,
  unlocked_level,
  completed_levels,
  best_times,
  achievements,
  sanity,
  min_sanity_recorded,
  created_at,
  updated_at
FROM public.profiles;

-- 3. Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Security Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Public can view leaderboard stats" ON public.profiles;
CREATE POLICY "Public can view leaderboard stats"
ON public.profiles FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 5. Automatic Profile Creation Trigger on Sign Up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    operator_name,
    unlocked_level,
    completed_levels,
    best_times,
    achievements,
    sanity,
    min_sanity_recorded,
    points,
    score,
    solo_solves_count
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'operator_name', 'OPERATOR_09'),
    1,
    '{}',
    '{}'::jsonb,
    '{}',
    100,
    100,
    0,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 6. Generated Questions / Mainframe Puzzles Table
-- Stores generated escape room questions categorized by domain and 4 standardized
-- difficulty tiers: 'Easy', 'Intermediate', 'Advanced', 'Expert'
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.generated_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Enable RLS on generated_questions
ALTER TABLE public.generated_questions ENABLE ROW LEVEL SECURITY;

-- Policies for generated_questions
DROP POLICY IF EXISTS "Public can view generated questions" ON public.generated_questions;
CREATE POLICY "Public can view generated questions" 
ON public.generated_questions FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can insert generated questions" ON public.generated_questions;
CREATE POLICY "Anyone can insert generated questions" 
ON public.generated_questions FOR INSERT 
WITH CHECK (true);

-- Performance Indexes for search and filtration across domain & difficulty
CREATE INDEX IF NOT EXISTS idx_questions_domain ON public.generated_questions(domain);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.generated_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_domain_difficulty ON public.generated_questions(domain, difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.generated_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_sector ON public.generated_questions(sector_level);
