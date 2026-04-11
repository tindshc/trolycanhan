-- Table for Income & Expenses (Thu chi)
CREATE TABLE IF NOT EXISTS public.thuchi (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- 'thu' or 'chi'
  amount BIGINT NOT NULL,
  description TEXT, -- Nội dung thu/chi
  entry_order INTEGER NOT NULL, -- The 1, 2, 3 sequence for the user
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.thuchi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all for now" ON public.thuchi FOR ALL TO public USING (true) WITH CHECK (true);
