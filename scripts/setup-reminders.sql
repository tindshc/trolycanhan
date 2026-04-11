-- 1. Create Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id SERIAL PRIMARY KEY,
  event_time TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Security Policies
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for reminders" ON public.reminders FOR ALL TO public USING (true) WITH CHECK (true);

-- Index for performance on date queries
CREATE INDEX IF NOT EXISTS idx_reminders_time ON public.reminders (event_time);
