-- 1. Training & Education
CREATE TABLE IF NOT EXISTS public.resume_training (
  id SERIAL PRIMARY KEY,
  school TEXT NOT NULL,
  specialty TEXT,
  period TEXT,
  mode TEXT,
  degree TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_education (
  id SERIAL PRIMARY KEY,
  center TEXT NOT NULL,
  content TEXT,
  period TEXT,
  mode TEXT,
  certificate TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Rewards & Discipline
CREATE TABLE IF NOT EXISTS public.resume_rewards (
  id SERIAL PRIMARY KEY,
  date_str TEXT NOT NULL,
  content TEXT NOT NULL,
  authority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.resume_discipline (
  id SERIAL PRIMARY KEY,
  date_str TEXT NOT NULL,
  reason TEXT NOT NULL,
  form TEXT,
  authority TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Family Relationships
CREATE TABLE IF NOT EXISTS public.resume_family (
  id SERIAL PRIMARY KEY,
  group_type TEXT NOT NULL, -- 'Bản thân/Vợ/Con', 'Nội/Ngoại', 'Cô/Dì/Chú/Bác', 'Bên vợ'
  relationship TEXT NOT NULL, -- 'Cha', 'Mẹ', 'Vợ', 'Con', etc.
  full_name TEXT NOT NULL,
  birth_year TEXT,
  occupation TEXT,
  details TEXT, -- Residence or notes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Security Policies
ALTER TABLE public.resume_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_discipline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_family ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for resume_training" ON public.resume_training FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for resume_education" ON public.resume_education FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for resume_rewards" ON public.resume_rewards FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for resume_discipline" ON public.resume_discipline FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for resume_family" ON public.resume_family FOR ALL TO public USING (true) WITH CHECK (true);
