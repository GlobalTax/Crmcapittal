-- Phase 5: Advanced Search & Smart Filters

-- Document search indexes table for full-text search
CREATE TABLE public.document_search_indexes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  title_vector tsvector,
  content_vector tsvector,
  tags_vector tsvector,
  metadata_vector tsvector,
  combined_vector tsvector,
  last_indexed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(document_id)
);

-- Saved search queries
CREATE TABLE public.saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  search_query TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_smart BOOLEAN NOT NULL DEFAULT false,
  smart_criteria JSONB DEFAULT '{}',
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Search analytics
CREATE TABLE public.search_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  search_query TEXT NOT NULL,
  filters_used JSONB DEFAULT '{}',
  results_count INTEGER NOT NULL DEFAULT 0,
  clicked_result_id UUID,
  search_duration_ms INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT,
  ip_address INET
);

-- Smart search suggestions
CREATE TABLE public.search_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion_text TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general',
  popularity_score INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_document_search_indexes_document_id ON public.document_search_indexes(document_id);
CREATE INDEX idx_document_search_indexes_title_vector ON public.document_search_indexes USING GIN(title_vector);
CREATE INDEX idx_document_search_indexes_content_vector ON public.document_search_indexes USING GIN(content_vector);
CREATE INDEX idx_document_search_indexes_combined_vector ON public.document_search_indexes USING GIN(combined_vector);

CREATE INDEX idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX idx_saved_searches_is_public ON public.saved_searches(is_public) WHERE is_public = true;
CREATE INDEX idx_saved_searches_last_used ON public.saved_searches(last_used_at DESC);

CREATE INDEX idx_search_analytics_user_id ON public.search_analytics(user_id);
CREATE INDEX idx_search_analytics_timestamp ON public.search_analytics(timestamp DESC);
CREATE INDEX idx_search_analytics_search_query ON public.search_analytics(search_query);

CREATE INDEX idx_search_suggestions_category ON public.search_suggestions(category);
CREATE INDEX idx_search_suggestions_popularity ON public.search_suggestions(popularity_score DESC);

-- Enable RLS
ALTER TABLE public.document_search_indexes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for document_search_indexes
CREATE POLICY "Users can view search indexes for documents they can access"
ON public.document_search_indexes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.documents d
    WHERE d.id = document_search_indexes.document_id
    AND (
      d.created_by = auth.uid() OR
      public.check_document_permission(d.id, auth.uid(), 'view')
    )
  )
);

CREATE POLICY "System can manage search indexes"
ON public.document_search_indexes FOR ALL
USING (true)
WITH CHECK (true);

-- RLS Policies for saved_searches
CREATE POLICY "Users can manage their own saved searches"
ON public.saved_searches FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view public saved searches"
ON public.saved_searches FOR SELECT
USING (is_public = true OR user_id = auth.uid());

-- RLS Policies for search_analytics
CREATE POLICY "Users can view their own search analytics"
ON public.search_analytics FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert search analytics"
ON public.search_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can view all search analytics"
ON public.search_analytics FOR SELECT
USING (
  has_role_secure(auth.uid(), 'admin'::app_role) OR 
  has_role_secure(auth.uid(), 'superadmin'::app_role)
);

-- RLS Policies for search_suggestions
CREATE POLICY "Everyone can view search suggestions"
ON public.search_suggestions FOR SELECT
USING (true);

CREATE POLICY "System can manage search suggestions"
ON public.search_suggestions FOR ALL
USING (true)
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_document_search_indexes_updated_at
BEFORE UPDATE ON public.document_search_indexes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
BEFORE UPDATE ON public.saved_searches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_search_suggestions_updated_at
BEFORE UPDATE ON public.search_suggestions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update document search index
CREATE OR REPLACE FUNCTION public.update_document_search_index()
RETURNS TRIGGER AS $$
BEGIN
  -- Create or update search index when document is modified
  INSERT INTO public.document_search_indexes (
    document_id,
    title_vector,
    content_vector,
    tags_vector,
    combined_vector
  ) VALUES (
    NEW.id,
    to_tsvector('spanish', COALESCE(NEW.title, '')),
    to_tsvector('spanish', COALESCE(NEW.content, '')),
    to_tsvector('spanish', COALESCE(array_to_string(NEW.tags, ' '), '')),
    to_tsvector('spanish', 
      COALESCE(NEW.title, '') || ' ' || 
      COALESCE(NEW.content, '') || ' ' || 
      COALESCE(array_to_string(NEW.tags, ' '), '')
    )
  ) ON CONFLICT (document_id) DO UPDATE SET
    title_vector = to_tsvector('spanish', COALESCE(NEW.title, '')),
    content_vector = to_tsvector('spanish', COALESCE(NEW.content, '')),
    tags_vector = to_tsvector('spanish', COALESCE(array_to_string(NEW.tags, ' '), '')),
    combined_vector = to_tsvector('spanish', 
      COALESCE(NEW.title, '') || ' ' || 
      COALESCE(NEW.content, '') || ' ' || 
      COALESCE(array_to_string(NEW.tags, ' '), '')
    ),
    last_indexed_at = now(),
    updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to perform advanced document search
CREATE OR REPLACE FUNCTION public.search_documents_advanced(
  p_query TEXT,
  p_filters JSONB DEFAULT '{}',
  p_user_id UUID DEFAULT auth.uid(),
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  document_id UUID,
  title TEXT,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  rank REAL
) AS $$
DECLARE
  search_vector tsvector;
  date_filter_start TIMESTAMP WITH TIME ZONE;
  date_filter_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Parse search query
  search_vector := websearch_to_tsquery('spanish', p_query);
  
  -- Parse date filters if provided
  IF p_filters ? 'date_from' THEN
    date_filter_start := (p_filters->>'date_from')::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF p_filters ? 'date_to' THEN
    date_filter_end := (p_filters->>'date_to')::TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Log search analytics
  INSERT INTO public.search_analytics (
    user_id, search_query, filters_used, timestamp
  ) VALUES (
    p_user_id, p_query, p_filters, now()
  );
  
  -- Update search suggestions
  INSERT INTO public.search_suggestions (suggestion_text, last_used_at)
  VALUES (p_query, now())
  ON CONFLICT (suggestion_text) DO UPDATE SET
    popularity_score = search_suggestions.popularity_score + 1,
    last_used_at = now();
  
  -- Perform search with filters
  RETURN QUERY
  SELECT 
    d.id,
    d.title,
    d.content,
    d.tags,
    d.created_at,
    d.updated_at,
    d.created_by,
    ts_rank(dsi.combined_vector, search_vector) as rank
  FROM public.documents d
  JOIN public.document_search_indexes dsi ON d.id = dsi.document_id
  WHERE 
    (search_vector @@ dsi.combined_vector OR p_query = '')
    AND (
      d.created_by = p_user_id OR
      public.check_document_permission(d.id, p_user_id, 'view')
    )
    AND (
      NOT p_filters ? 'status' OR 
      d.status = (p_filters->>'status')::document_status
    )
    AND (
      NOT p_filters ? 'document_type' OR 
      d.document_type = (p_filters->>'document_type')::document_type
    )
    AND (
      NOT p_filters ? 'tags' OR 
      d.tags && ARRAY(SELECT jsonb_array_elements_text(p_filters->'tags'))
    )
    AND (
      date_filter_start IS NULL OR d.created_at >= date_filter_start
    )
    AND (
      date_filter_end IS NULL OR d.created_at <= date_filter_end
    )
    AND (
      NOT p_filters ? 'created_by' OR 
      d.created_by = (p_filters->>'created_by')::UUID
    )
  ORDER BY 
    CASE WHEN p_query = '' THEN 0 ELSE ts_rank(dsi.combined_vector, search_vector) END DESC,
    d.updated_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get search suggestions
CREATE OR REPLACE FUNCTION public.get_search_suggestions(
  p_partial_query TEXT DEFAULT '',
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  suggestion TEXT,
  category TEXT,
  popularity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.suggestion_text,
    ss.category,
    ss.popularity_score
  FROM public.search_suggestions ss
  WHERE 
    p_partial_query = '' OR 
    ss.suggestion_text ILIKE '%' || p_partial_query || '%'
  ORDER BY ss.popularity_score DESC, ss.last_used_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update search index when documents change
CREATE TRIGGER trigger_update_document_search_index
AFTER INSERT OR UPDATE OF title, content, tags ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_document_search_index();

-- Create initial search indexes for existing documents
INSERT INTO public.document_search_indexes (
  document_id,
  title_vector,
  content_vector,
  tags_vector,
  combined_vector
)
SELECT 
  d.id,
  to_tsvector('spanish', COALESCE(d.title, '')),
  to_tsvector('spanish', COALESCE(d.content, '')),
  to_tsvector('spanish', COALESCE(array_to_string(d.tags, ' '), '')),
  to_tsvector('spanish', 
    COALESCE(d.title, '') || ' ' || 
    COALESCE(d.content, '') || ' ' || 
    COALESCE(array_to_string(d.tags, ' '), '')
  )
FROM public.documents d
WHERE NOT EXISTS (
  SELECT 1 FROM public.document_search_indexes dsi 
  WHERE dsi.document_id = d.id
);

-- Enable realtime for new tables
ALTER TABLE public.document_search_indexes REPLICA IDENTITY FULL;
ALTER TABLE public.saved_searches REPLICA IDENTITY FULL;
ALTER TABLE public.search_analytics REPLICA IDENTITY FULL;
ALTER TABLE public.search_suggestions REPLICA IDENTITY FULL;

-- Add tables to realtime publication
SELECT public.add_table_to_realtime('document_search_indexes');
SELECT public.add_table_to_realtime('saved_searches');
SELECT public.add_table_to_realtime('search_analytics');
SELECT public.add_table_to_realtime('search_suggestions');