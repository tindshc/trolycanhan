-- Table for Goals/Funds (e.g., Quỹ nhà thờ, Quỹ cơ quan)
CREATE TABLE IF NOT EXISTS public.thuchi_goals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update the existing thuchi table to link to a goal
ALTER TABLE public.thuchi ADD COLUMN IF NOT EXISTS goal_id INTEGER REFERENCES public.thuchi_goals(id) ON DELETE CASCADE;

-- Enable RLS for the new table
ALTER TABLE public.thuchi_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for now" ON public.thuchi_goals FOR ALL TO public USING (true) WITH CHECK (true);
