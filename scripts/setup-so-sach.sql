-- 1. Update Personnel Table
ALTER TABLE public.nhansu ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Nhân viên';
COMMENT ON COLUMN public.nhansu.role IS 'Vai trò: Nhân viên, CTV, Người có uy tín';

-- 2. Sổ Văn Bản
CREATE TABLE IF NOT EXISTS public.doc_logs (
    id SERIAL PRIMARY KEY,
    doc_number TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT, -- Báo cáo năm, Kế hoạch, Chỉ đạo...
    issued_date DATE DEFAULT CURRENT_DATE,
    folder_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    chat_id TEXT
);

-- 3. Sổ Hoạt Động
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    method TEXT, -- Nhóm nhỏ, Nhóm, Loa đài, Zalo...
    sessions_count INTEGER DEFAULT 1,
    has_budget BOOLEAN DEFAULT FALSE,
    participants_estimated INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    chat_id TEXT
);

-- 4. Sổ Tập Huấn
CREATE TABLE IF NOT EXISTS public.training_topics (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS public.training_sessions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER REFERENCES public.training_topics(id),
    date DATE DEFAULT CURRENT_DATE,
    is_universal BOOLEAN DEFAULT FALSE, -- TRUE: hỏi ai vắng, FALSE: hỏi ai đi
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    chat_id TEXT
);

CREATE TABLE IF NOT EXISTS public.training_attendance (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES public.training_sessions(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES public.nhansu(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'Có mặt', -- Có mặt, Vắng
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sổ Kinh Phí - Cập nhật bảng pe_expenses
ALTER TABLE public.pe_expenses ADD COLUMN IF NOT EXISTS qty_approved DOUBLE PRECISION;
ALTER TABLE public.pe_expenses ADD COLUMN IF NOT EXISTS price_approved DOUBLE PRECISION;
ALTER TABLE public.pe_expenses ADD COLUMN IF NOT EXISTS total_approved DOUBLE PRECISION;
ALTER TABLE public.pe_expenses ADD COLUMN IF NOT EXISTS qty_actual DOUBLE PRECISION;
ALTER TABLE public.pe_expenses ADD COLUMN IF NOT EXISTS price_actual DOUBLE PRECISION;
ALTER TABLE public.pe_expenses ADD COLUMN IF NOT EXISTS total_actual DOUBLE PRECISION;

-- 6. Giá Đấu Thầu
CREATE TABLE IF NOT EXISTS public.tender_prices (
    id SERIAL PRIMARY KEY,
    project_code TEXT REFERENCES public.pe_projects(code),
    item_name TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all new tables
ALTER TABLE public.doc_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tender_prices ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable all for now" ON public.doc_logs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.activity_logs FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.training_topics FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.training_sessions FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.training_attendance FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.tender_prices FOR ALL TO public USING (true) WITH CHECK (true);
