-- SQL script to create the 'danhba' table
CREATE TABLE IF NOT EXISTS public.danhba (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  position TEXT,
  landline TEXT,
  mobile TEXT,
  birth_year TEXT
);

-- Enable RLS
ALTER TABLE public.danhba ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for now" ON public.danhba
  FOR ALL TO public USING (true) WITH CHECK (true);

-- Comments matching Vietnamese headers
COMMENT ON COLUMN public.danhba.full_name IS 'Họ tên (HOTEN)';
COMMENT ON COLUMN public.danhba.position IS 'Chức vụ (CHUCVU)';
COMMENT ON COLUMN public.danhba.landline IS 'Điện thoại bàn (DTBAN)';
COMMENT ON COLUMN public.danhba.mobile IS 'Di động (DIDONG)';
COMMENT ON COLUMN public.danhba.birth_year IS 'Năm sinh (NAMSINH)';
