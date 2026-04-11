-- 1. Create Books table
CREATE TABLE IF NOT EXISTS public.books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  author TEXT,
  year TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Book Sections table
CREATE TABLE IF NOT EXISTS public.book_sections (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g. "III. Các chính sách cốt lõi"
  content TEXT,
  order_index INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1, -- 1 for #, 2 for ##, 3 for ###, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Security Policies
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for books" ON public.books FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for book_sections" ON public.book_sections FOR ALL TO public USING (true) WITH CHECK (true);
