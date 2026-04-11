-- CLEAN SLATE: Wipe old Thu Chi structure
DROP TABLE IF EXISTS public.thuchi;
DROP TABLE IF EXISTS public.thuchi_goals;

-- 1. Create the container for Goals/Funds
CREATE TABLE public.thuchi_goals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the transactions table with mandatory goal linkage
CREATE TABLE public.thuchi (
  id SERIAL PRIMARY KEY,
  goal_id INTEGER NOT NULL REFERENCES public.thuchi_goals(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'thu' or 'chi'
  amount BIGINT NOT NULL,
  description TEXT,
  entry_order INTEGER NOT NULL, -- Per-goal sequence number
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Policies
ALTER TABLE public.thuchi_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thuchi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for goals" ON public.thuchi_goals FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for thuchi" ON public.thuchi FOR ALL TO public USING (true) WITH CHECK (true);
