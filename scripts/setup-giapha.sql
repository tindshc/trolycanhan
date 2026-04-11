-- Table for Genealogy (Gia phả)
CREATE TABLE IF NOT EXISTS public.giapha (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  generation INTEGER,
  gender TEXT, -- 'Nam', 'Nữ'
  birth_day TEXT, -- Keeping as TEXT to handle "Không nhớ"
  death_day TEXT,
  parent_id INTEGER REFERENCES public.giapha(id),
  spouse_name TEXT,
  order_index INTEGER, -- 1, 2, 3...
  branch TEXT, -- Branch name
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.giapha ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for now" ON public.giapha FOR ALL TO public USING (true) WITH CHECK (true);
