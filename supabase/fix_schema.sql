-- ============================================================================
-- FIND BACK WITH AI - DEFINITIVE DATABASE REPAIR & RLS MIGRATION
-- Fixes error 42703 (column "user_id" does not exist) safely without data loss
-- ============================================================================

-- 1. Ensure the pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Safely add missing architectural columns to public.items without modifying existing columns
ALTER TABLE public.items 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(64);

-- 3. Relax legacy not-null constraints so modern web and mobile reports can be submitted seamlessly
ALTER TABLE public.items 
  ALTER COLUMN zone_id DROP NOT NULL,
  ALTER COLUMN reporter_email DROP NOT NULL,
  ALTER COLUMN reporter_name DROP NOT NULL;

-- 4. Backfill new columns from legacy columns for all existing records so no data is lost
UPDATE public.items 
SET 
  location_name = COALESCE(location_name, location_detail),
  contact_email = COALESCE(contact_email, reporter_email),
  contact_phone = COALESCE(contact_phone, reporter_phone)
WHERE location_name IS NULL OR contact_email IS NULL OR contact_phone IS NULL;

-- 5. Upgrade embedding column to vector(768) to support Gemini text-embedding-004
DROP INDEX IF EXISTS public.items_embedding_idx;
ALTER TABLE public.items 
  ALTER COLUMN embedding TYPE vector(768);

-- Create HNSW cosine similarity index for lightning fast vector searches
CREATE INDEX IF NOT EXISTS items_embedding_idx ON public.items 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Spatial and status indexes
CREATE INDEX IF NOT EXISTS items_user_id_idx ON public.items (user_id);
CREATE INDEX IF NOT EXISTS items_type_idx ON public.items (type);
CREATE INDEX IF NOT EXISTS items_status_idx ON public.items (status);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON public.items (created_at DESC);

-- 6. Clean up existing policies to prevent conflicts, invalid references, or duplicate policy errors
DROP POLICY IF EXISTS "Public items are viewable by everyone" ON public.items;
DROP POLICY IF EXISTS "Users can report items" ON public.items;
DROP POLICY IF EXISTS "Users and guests can report items" ON public.items;
DROP POLICY IF EXISTS "Users can update own items" ON public.items;
DROP POLICY IF EXISTS "Users can delete own items" ON public.items;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.items;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.items;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.items;
DROP POLICY IF EXISTS "Enable update for users based on email" ON public.items;

-- 7. Ensure Row Level Security is active
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- 8. Apply production Row Level Security policies

-- A. SELECT: Public items viewable by everyone (both authenticated users and guests)
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT 
USING (true);

-- B. INSERT: Both authenticated members and anonymous guests can submit lost/found reports
CREATE POLICY "Users and guests can report items" 
ON public.items FOR INSERT 
WITH CHECK (
  (auth.uid() IS NULL AND user_id IS NULL)
  OR
  (auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL))
);

-- C. UPDATE: Only the verified owner of the item can update their listing
CREATE POLICY "Users can update own items" 
ON public.items FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
)
WITH CHECK (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- D. DELETE: Only the verified owner of the item can delete their listing
CREATE POLICY "Users can delete own items" 
ON public.items FOR DELETE 
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);

-- 9. Matches Table & Policies
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lost_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    found_item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'dismissed', 'returned')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_item_pair UNIQUE (lost_item_id, found_item_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Matches are viewable by everyone" ON public.matches;
CREATE POLICY "Matches are viewable by everyone" ON public.matches FOR SELECT USING (true);

-- 10. Vector Similarity Search Function
CREATE OR REPLACE FUNCTION public.match_items (
    query_embedding vector(768),
    match_threshold DOUBLE PRECISION DEFAULT 0.55,
    match_count INT DEFAULT 10,
    filter_type VARCHAR(16) DEFAULT 'found'
)
RETURNS TABLE (
    id UUID,
    type VARCHAR(16),
    title VARCHAR(255),
    category VARCHAR(64),
    description TEXT,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name VARCHAR(255),
    status VARCHAR(32),
    similarity DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        items.id,
        items.type::VARCHAR(16),
        items.title::VARCHAR(255),
        items.category::VARCHAR(64),
        items.description,
        items.image_url,
        items.latitude,
        items.longitude,
        items.location_name,
        items.status::VARCHAR(32),
        (1 - (items.embedding <=> query_embedding)) AS similarity,
        items.created_at
    FROM public.items
    WHERE 
        items.status = 'active'
        AND items.type = filter_type
        AND items.embedding IS NOT NULL
        AND (1 - (items.embedding <=> query_embedding)) >= match_threshold
    ORDER BY (items.embedding <=> query_embedding) ASC
    LIMIT match_count;
END;
$$;
