-- SQL script to create the 'nhansu' table in Supabase
-- This table stores healthcare personnel information

CREATE TABLE IF NOT EXISTS public.nhansu (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  department TEXT,
  education_level TEXT,
  specialization TEXT,
  professional_title TEXT,
  professional_code TEXT,
  gender TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.nhansu ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (can be restricted later)
-- Note: Service role key bypasses RLS, so this is for client-side access if needed.
CREATE POLICY "Enable all for now" ON public.nhansu
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Comment on columns for better documentation
COMMENT ON COLUMN public.nhansu.full_name IS 'Họ và tên';
COMMENT ON COLUMN public.nhansu.date_of_birth IS 'Ngày tháng năm sinh';
COMMENT ON COLUMN public.nhansu.department IS 'Tên Khoa, phòng, Trạm đang công tác';
COMMENT ON COLUMN public.nhansu.education_level IS 'Trình độ đào tạo';
COMMENT ON COLUMN public.nhansu.specialization IS 'Chuyên ngành';
COMMENT ON COLUMN public.nhansu.professional_title IS 'Chức danh nghề nghiệp hiện giữ (CDNN)';
COMMENT ON COLUMN public.nhansu.professional_code IS 'Mã chức danh nghề nghiệp (Mã CDNN)';
