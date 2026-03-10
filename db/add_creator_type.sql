-- Add creator_type column to creators table
ALTER TABLE creators ADD COLUMN IF NOT EXISTS creator_type VARCHAR(50) DEFAULT 'ustadz';

-- Add check constraint for allowed creator types
ALTER TABLE creators DROP CONSTRAINT IF EXISTS creators_creator_type_check;
ALTER TABLE creators ADD CONSTRAINT creators_creator_type_check
  CHECK (creator_type IN ('ustadz', 'ustadzah', 'organisasi', 'pembicara', 'lembaga'));

-- Update existing creators to have appropriate types
UPDATE creators SET creator_type = 'ustadz' WHERE creator_type IS NULL OR creator_type = 'ustadz';

-- Add comment for documentation
COMMENT ON COLUMN creators.creator_type IS 'Type of creator: ustadz, ustadzah, organisasi, pembicara, lembaga';
