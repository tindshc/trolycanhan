-- 1. Create Meeting Types table
CREATE TABLE IF NOT EXISTS public.meeting_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id SERIAL PRIMARY KEY,
  type_id INTEGER NOT NULL REFERENCES public.meeting_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  date_str TEXT NOT NULL, -- Format "MM/YYYY" for easy display/filter
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Insert initial types
INSERT INTO public.meeting_types (name) VALUES 
('Họp chính quyền'),
('Họp chi bộ'),
('Họp cơ quan')
ON CONFLICT (name) DO NOTHING;

-- 4. Security Policies
ALTER TABLE public.meeting_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for meeting_types" ON public.meeting_types FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for meetings" ON public.meetings FOR ALL TO public USING (true) WITH CHECK (true);
