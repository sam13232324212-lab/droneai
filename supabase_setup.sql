-- DroneEdu Expert Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create leads table for contact information
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- Create rag_docs table for RAG document storage with embeddings
CREATE TABLE IF NOT EXISTS rag_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS rag_docs_embedding_idx ON rag_docs 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Create index on source for filtering
CREATE INDEX IF NOT EXISTS rag_docs_source_idx ON rag_docs(source);

-- Create vector search function for RAG retrieval
CREATE OR REPLACE FUNCTION match_rag_docs (
  query_embedding VECTOR(768),
  match_threshold FLOAT DEFAULT 0.3,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  source TEXT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rag_docs.id,
    rag_docs.source,
    rag_docs.content,
    rag_docs.metadata,
    1 - (rag_docs.embedding <=> query_embedding) AS similarity
  FROM rag_docs
  WHERE rag_docs.embedding IS NOT NULL
    AND 1 - (rag_docs.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- Insert some seed data for CASA drone regulations
INSERT INTO rag_docs (source, content, metadata) VALUES
(
  'https://www.casa.gov.au/drones',
  'CASA (Civil Aviation Safety Authority) is Australia''s drone regulator. For commercial drone operations, you need a RePL (Remote Pilot License) and possibly a ReOC (Remote Operator''s Certificate). RePL allows you to fly drones commercially under standard conditions. ReOC is required if you plan to operate a drone business or fly outside standard conditions.',
  '{"type": "regulation", "category": "licensing", "updated": "2025-01"}'
),
(
  'https://www.casa.gov.au/drones',
  'RePL (Remote Pilot License) requirements: You must be at least 16 years old, pass a theory exam, complete practical training, and maintain a logbook. The training typically takes 2-4 weeks. Cost ranges from $2,000 to $4,000 depending on the training provider.',
  '{"type": "regulation", "category": "repl", "updated": "2025-01"}'
),
(
  'https://www.casa.gov.au/drones',
  'ReOC (Remote Operator''s Certificate) is required for drone businesses. It demonstrates your organization has safety management systems in place. Requirements include: operational manuals, safety management system, trained personnel, and insurance. Application process takes 3-6 months and costs vary from $5,000 to $15,000.',
  '{"type": "regulation", "category": "reoc", "updated": "2025-01"}'
),
(
  'https://dronecareerpro.com',
  'DroneCareerPro offers comprehensive drone training courses in Australia. RePL course: $2,995 (includes theory, practical training, and exam fees). Advanced courses available for mapping, inspection, and cinematography. Located in Melbourne, Sydney, Brisbane, and Perth.',
  '{"type": "training", "provider": "DroneCareerPro", "updated": "2025-01"}'
),
(
  'https://dronecareerpro.com',
  'DroneCareerPro career pathways: Aerial photography/videography ($50k-$150k/year), Industrial inspection ($70k-$120k/year), Surveying and mapping ($60k-$110k/year), Agriculture monitoring ($55k-$95k/year), Emergency services ($65k-$100k/year). High demand for qualified drone pilots in Australia.',
  '{"type": "career", "provider": "DroneCareerPro", "updated": "2025-01"}'
),
(
  'https://gdronesolutions.com.au',
  'GDrone Solutions Australia offers RePL training starting at $2,750. Includes 3-day intensive course, online theory modules, practical flight training, and exam support. Locations: Sydney, Melbourne, Brisbane. Job placement assistance included.',
  '{"type": "training", "provider": "GDroneSolutions", "updated": "2025-01"}'
),
(
  'CASA Safety Rules',
  'Key Australian drone safety rules: Keep drone in visual line of sight, fly below 120 meters (400 feet), keep 30 meters away from people, do not fly over populated areas without authorization, do not fly near airports (5.5km restriction), do not fly at night without approval, respect privacy and property rights.',
  '{"type": "regulation", "category": "safety", "updated": "2025-01"}'
),
(
  'Insurance Requirements',
  'Drone insurance is mandatory for commercial operations in Australia. Public liability insurance (minimum $10 million recommended) covers damage to property or injury to people. Hull insurance covers damage to your drone equipment. Annual costs range from $500 to $3,000 depending on operations.',
  '{"type": "regulation", "category": "insurance", "updated": "2025-01"}'
);

-- Grant necessary permissions (adjust as needed for your security requirements)
-- These are examples - adjust based on your actual security needs
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE rag_docs ENABLE ROW LEVEL SECURITY;

-- Example policy for leads (allows authenticated users to insert)
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT WITH CHECK (true);

-- Example policy for rag_docs (allows authenticated users to read)
CREATE POLICY "Anyone can read rag_docs" ON rag_docs
  FOR SELECT USING (true);

-- Note: Adjust these policies based on your security requirements
