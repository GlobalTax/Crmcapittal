-- Add external_id and source_table fields to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS source_table TEXT;

-- Add external_id and source_table fields to deals table  
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS external_id TEXT,
ADD COLUMN IF NOT EXISTS source_table TEXT;

-- Create unique indexes to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_external_id_source 
ON companies(external_id, source_table) 
WHERE external_id IS NOT NULL AND source_table IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_deals_external_id_source 
ON deals(external_id, source_table) 
WHERE external_id IS NOT NULL AND source_table IS NOT NULL;

-- Create regular indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_external_id ON companies(external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_external_id ON deals(external_id) WHERE external_id IS NOT NULL;