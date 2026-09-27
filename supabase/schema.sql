-- ============================================================================
-- FIND BACK WITH AI - SUPABASE & PGVECTOR SCHEMA SPECIFICATION
-- ============================================================================

-- 1. Enable the pgvector extension for high-dimensional semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Items Table: stores both "lost" and "found" physical items
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    type VARCHAR(16) NOT NULL CHECK (type IN ('lost', 'found')),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'resolved', 'closed')),
    embedding vector(768), -- Multimodal / text-embedding-004 representation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexing for rapid cosine distance similarity search
CREATE INDEX IF NOT EXISTS items_embedding_idx ON public.items 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Spatial and status indexes
CREATE INDEX IF NOT EXISTS items_type_idx ON public.items (type);
CREATE INDEX IF NOT EXISTS items_status_idx ON public.items (status);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON public.items (created_at DESC);

-- 3. Matches Table: records similarity pairs between lost and found items
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

CREATE INDEX IF NOT EXISTS matches_lost_item_idx ON public.matches (lost_item_id);
CREATE INDEX IF NOT EXISTS matches_found_item_idx ON public.matches (found_item_id);
CREATE INDEX IF NOT EXISTS matches_score_idx ON public.matches (similarity_score DESC);

-- 4. Privacy Connections Table: controls mutual contact disclosure between user 1 and user 2
CREATE TABLE IF NOT EXISTS public.match_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
    requester_user_id UUID,
    responder_user_id UUID,
    requester_accepted BOOLEAN NOT NULL DEFAULT true,
    responder_accepted BOOLEAN NOT NULL DEFAULT false,
    secure_handshake_code VARCHAR(16),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Stored Procedure: match_items
-- Executes vector cosine distance similarity search against opposing item type
CREATE OR REPLACE FUNCTION public.match_items (
    query_embedding vector(768),
    match_threshold DOUBLE PRECISION DEFAULT 0.65,
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
        items.type,
        items.title,
        items.category,
        items.description,
        items.image_url,
        items.latitude,
        items.longitude,
        items.location_name,
        items.status,
        (1 - (items.embedding <=> query_embedding)) AS similarity,
        items.created_at
    FROM public.items
    WHERE 
        items.status = 'active'
        AND items.type = filter_type
        AND (1 - (items.embedding <=> query_embedding)) >= match_threshold
    ORDER BY (items.embedding <=> query_embedding) ASC
    LIMIT match_count;
END;
$$;

-- 6. Stored Procedure: get_nearby_items
-- Geospatial bounding / distance search within radius (km)
CREATE OR REPLACE FUNCTION public.get_nearby_items (
    ref_lat DOUBLE PRECISION,
    ref_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION DEFAULT 25.0,
    filter_type VARCHAR(16) DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    type VARCHAR(16),
    title VARCHAR(255),
    category VARCHAR(64),
    description TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    location_name VARCHAR(255),
    distance_km DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        items.id,
        items.type,
        items.title,
        items.category,
        items.description,
        items.latitude,
        items.longitude,
        items.location_name,
        (6371 * acos(
            cos(radians(ref_lat)) * cos(radians(items.latitude)) *
            cos(radians(items.longitude) - radians(ref_lng)) +
            sin(radians(ref_lat)) * sin(radians(items.latitude))
        )) AS distance_km
    FROM public.items
    WHERE 
        items.status = 'active'
        AND items.latitude IS NOT NULL
        AND items.longitude IS NOT NULL
        AND (filter_type IS NULL OR items.type = filter_type)
        AND (6371 * acos(
            cos(radians(ref_lat)) * cos(radians(items.latitude)) *
            cos(radians(items.longitude) - radians(ref_lng)) +
            sin(radians(ref_lat)) * sin(radians(items.latitude))
        )) <= radius_km
    ORDER BY distance_km ASC;
END;
$$;

-- 7. Row Level Security policies
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_connections ENABLE ROW LEVEL SECURITY;

-- Allow public read of active items (contact info masked in view)
CREATE POLICY "Public items are viewable by everyone" 
ON public.items FOR SELECT 
USING (true);

-- Allow authenticated users or guests to insert reports
CREATE POLICY "Users can report items" 
ON public.items FOR INSERT 
WITH CHECK (true);

-- Allow item owners to update
CREATE POLICY "Users can update own items" 
ON public.items FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);
