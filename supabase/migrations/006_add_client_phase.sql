-- Add client phase categorization
-- Replaces package_tier with operational phases: foundations, monthly, project

-- Create the phase type
DO $$ BEGIN
    CREATE TYPE client_phase AS ENUM ('foundations', 'monthly', 'project');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add the column (default to 'monthly' for existing active clients)
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS client_phase client_phase DEFAULT 'monthly';

-- Note: Keeping package_tier for now to avoid breaking changes
-- Can be dropped later: ALTER TABLE clients DROP COLUMN package_tier;
