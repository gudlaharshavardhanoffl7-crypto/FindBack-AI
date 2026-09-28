-- ============================================================================
-- FIND BACK WITH AI - MESSAGING SYSTEM SCHEMA SPECIFICATION
-- Enables direct bilateral communication between finders and owners
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.item_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
    sender_name VARCHAR(255) NOT NULL,
    sender_contact VARCHAR(255) NOT NULL,
    recipient_contact VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'read', 'replied')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for rapid queries by item and timeline
CREATE INDEX IF NOT EXISTS item_messages_item_id_idx ON public.item_messages (item_id);
CREATE INDEX IF NOT EXISTS item_messages_created_at_idx ON public.item_messages (created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.item_messages ENABLE ROW LEVEL SECURITY;

-- Allow reading and inserting messages securely
CREATE POLICY "Public messages read and insert"
ON public.item_messages FOR ALL
USING (true)
WITH CHECK (true);
