-- Table for Projects (DUAN)
CREATE TABLE IF NOT EXISTS public.pe_projects (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table for Activities (NDHDDUAN)
CREATE TABLE IF NOT EXISTS public.pe_activities (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table for Task Types (HDCHITIET)
CREATE TABLE IF NOT EXISTS public.pe_task_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- Table for detailed Expense Records
CREATE TABLE IF NOT EXISTS public.pe_expenses (
    id SERIAL PRIMARY KEY,
    record_code TEXT NOT NULL, -- e.g. HDDA39
    year INTEGER NOT NULL,
    project_code TEXT REFERENCES public.pe_projects(code),
    activity_code TEXT REFERENCES public.pe_activities(code),
    task_code TEXT REFERENCES public.pe_task_types(code),
    qty DOUBLE PRECISION,
    price DOUBLE PRECISION,
    total DOUBLE PRECISION,
    note TEXT
);

-- Enable RLS
ALTER TABLE public.pe_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pe_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pe_task_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pe_expenses ENABLE ROW LEVEL SECURITY;

-- Allow all for now
CREATE POLICY "Enable all for now" ON public.pe_projects FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.pe_activities FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.pe_task_types FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for now" ON public.pe_expenses FOR ALL TO public USING (true) WITH CHECK (true);
