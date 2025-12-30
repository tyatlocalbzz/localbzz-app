-- Phase 4: Add columns for transcript path and internal notes
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS transcript_path TEXT,
ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN tasks.transcript_path IS 'Path to uploaded transcript file in storage bucket';
COMMENT ON COLUMN tasks.internal_notes IS 'Internal team notes (not client-facing)';
