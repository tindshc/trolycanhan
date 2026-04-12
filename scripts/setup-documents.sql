-- Create table for storing generated document records
CREATE TABLE IF NOT EXISTS public.document_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    doc_type TEXT NOT NULL, -- e.g., 'invitation_to_quote'
    fields JSONB NOT NULL,   -- stores all user inputs (date, service, etc.)
    content TEXT NOT NULL,  -- the final generated document text
    chat_id TEXT NOT NULL   -- Telegram chatId of the creator
);

-- Index for faster lookup by user or type
CREATE INDEX IF NOT EXISTS idx_doc_records_chat_id ON public.document_records(chat_id);
CREATE INDEX IF NOT EXISTS idx_doc_records_doc_type ON public.document_records(doc_type);

-- Enable RLS
ALTER TABLE public.document_records ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (consistent with other tables in this bot)
CREATE POLICY "Public Document Access" ON public.document_records FOR ALL USING (true);
